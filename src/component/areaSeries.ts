import Component from './component';
import {
  AreaPointsModel,
  BoundResponderModel,
  CircleModel,
  CircleResponderModel,
  LinePointsModel,
  PointModel,
  AreaSeriesModels,
} from '@t/components/series';
import {
  AreaChartOptions,
  AreaSeriesDataType,
  AreaSeriesType,
  LineTypeSeriesOptions,
  RangeDataType,
} from '@t/options';
import { ClipRectAreaModel } from '@t/components/series';
import { ChartState, Legend, StackSeriesData, ValueEdge } from '@t/store/store';
import { crispPixel, getValueRatio, setSplineControlPoint } from '@src/helpers/calculator';
import { TooltipData } from '@t/components/tooltip';
import { getRGBA } from '@src/helpers/color';
import { deepCopyArray, deepMergedCopy, first, last, range, sum } from '@src/helpers/utils';
import { isRangeData } from '@src/helpers/range';

type DrawModels = LinePointsModel | AreaPointsModel | ClipRectAreaModel | CircleModel;

interface RenderOptions {
  pointOnColumn: boolean;
  options: LineTypeSeriesOptions;
  tickDistance: number;
  tickCount: number;
  areaStackSeries?: StackSeriesData<'area'>;
  pairModel?: boolean;
}

type DatumType = number | RangeDataType;

type ChartType = 'range' | 'normal' | 'stack';

export default class AreaSeries extends Component {
  models: AreaSeriesModels = { rect: [], hoveredSeries: [], series: [] };

  drawModels!: AreaSeriesModels;

  responders!: CircleResponderModel[] | BoundResponderModel[];

  activatedResponders: this['responders'] = [];

  tooltipCircleMap?: Record<number, CircleResponderModel[]>;

  linePointsModel!: LinePointsModel[];

  baseValueYPosition!: number;

  chartType: ChartType = 'normal';

  initialize() {
    this.type = 'series';
    this.name = 'areaSeries';
  }

  initUpdate(delta: number) {
    if (!this.drawModels) {
      return;
    }

    this.drawModels.rect[0].width = this.models.rect[0].width * delta;
  }

  getBaseValueYPosition(limit: ValueEdge) {
    const baseValue = limit.min >= 0 ? limit.min : Math.min(limit.max, 0);
    const intervalSize = this.rect.height / (limit.max - limit.min);

    return (limit.max - baseValue) * intervalSize;
  }

  getStackValue(areaStackSeries: StackSeriesData<'area'>, seriesIndex: number, index: number) {
    const { type } = areaStackSeries.stack;
    const { values, sum: sumValue } = areaStackSeries.stackData[index];
    const stackedValue = sum(values.slice(0, seriesIndex + 1));

    return type === 'percent' ? (stackedValue * 100) / sumValue : stackedValue;
  }

  public render(chartState: ChartState<AreaChartOptions>) {
    const {
      layout,
      series,
      scale,
      options,
      axes,
      categories = [],
      legend,
      dataLabels,
      stackSeries,
    } = chartState;
    if (!series.area) {
      throw new Error("There's no area data!");
    }

    let areaStackSeries;

    if (stackSeries && stackSeries.area) {
      this.chartType = 'stack';
      areaStackSeries = stackSeries.area;
    }
    this.rect = layout.plot;

    const { limit } = scale.yAxis;
    const { tickDistance, pointOnColumn, tickCount } = axes.xAxis!;
    const areaData = series.area.data;
    this.baseValueYPosition = this.getBaseValueYPosition(limit);

    if (isRangeData(first(areaData)?.data)) {
      this.chartType = 'range';
    }

    const renderOptions: RenderOptions = {
      pointOnColumn,
      options: options.series || {},
      tickDistance,
      tickCount,
      areaStackSeries,
    };

    this.linePointsModel = this.renderLinePointsModel(areaData, limit, renderOptions, legend);

    const areaSeriesModel = this.renderAreaPointsModel();
    const seriesCircleModel = this.renderCircleModel();
    const tooltipDataArr = this.makeTooltipData(areaData, categories);

    this.models = {
      rect: [this.renderClipRectAreaModel()],
      series: areaSeriesModel,
      hoveredSeries: [],
    };

    if (!this.drawModels) {
      this.drawModels = {
        rect: [this.renderClipRectAreaModel(true)],
        series: deepCopyArray(areaSeriesModel),
        hoveredSeries: [],
      };
    }

    if (dataLabels.visible) {
      this.store.dispatch('appendDataLabels', this.getDataLabels(areaSeriesModel));
    }

    if (this.chartType === 'stack') {
      this.tooltipCircleMap = seriesCircleModel.reduce<Record<string, CircleResponderModel[]>>(
        (acc, cur, dataIndex) => {
          const index = cur.index!;
          const tooltipModel = { ...cur, data: tooltipDataArr[dataIndex] };
          if (!acc[index]) {
            acc[index] = [];
          }
          acc[index].push(tooltipModel);

          return acc;
        },
        {}
      );
    }

    this.responders =
      this.chartType === 'stack'
        ? this.makeBoundResponderModel(renderOptions)
        : this.makeDefaultResponderModel(seriesCircleModel, tooltipDataArr);
  }

  makeDefaultResponderModel(
    seriesCircleModel: CircleModel[],
    tooltipDataArr: TooltipData[]
  ): CircleResponderModel[] {
    const tooltipDataLength = tooltipDataArr.length;

    return seriesCircleModel.map((m, dataIndex) => ({
      ...m,
      data: tooltipDataArr[dataIndex % tooltipDataLength],
    }));
  }

  makeBoundResponderModel(renderOptions: RenderOptions): BoundResponderModel[] {
    const { pointOnColumn, tickCount, tickDistance } = renderOptions;
    const { height, x, y } = this.rect;
    const halfDetectAreaIndex = pointOnColumn ? [] : [0, tickCount];

    const halfWidth = tickDistance / 2;

    return range(0, tickCount).map((index) => {
      const half = halfDetectAreaIndex.includes(index);
      const width = half ? halfWidth : tickDistance;
      let startX = x;

      if (index !== 0) {
        startX += pointOnColumn ? tickDistance * index : halfWidth + tickDistance * (index - 1);
      }

      return { type: 'bound', y, height, x: startX, width, index };
    });
  }

  renderClipRectAreaModel(isDrawModel?: boolean): ClipRectAreaModel {
    return {
      type: 'clipRectArea',
      x: 0,
      y: 0,
      width: isDrawModel ? 0 : this.rect.width,
      height: this.rect.height,
    };
  }

  makeTooltipData(areaData: AreaSeriesType[], categories: string[]) {
    return areaData.flatMap(({ data, name, color }) => {
      const tooltipData: TooltipData[] = [];

      data.forEach((datum: DatumType, dataIdx) => {
        const value = this.chartType === 'range' ? `${datum[0]} ~ ${datum[1]}` : (datum as number);
        tooltipData.push({
          label: name,
          color,
          value,
          category: categories[dataIdx],
        });
      });

      return tooltipData;
    });
  }

  getLinePointModelValue(datum: AreaSeriesDataType, pairModel?: boolean) {
    if (this.chartType === 'range') {
      return pairModel ? datum[0] : datum[1];
    }

    return datum;
  }

  getLinePointModel(
    series: AreaSeriesType,
    seriesIndex: number,
    legend: Legend,
    limit: ValueEdge,
    renderOptions: RenderOptions
  ): LinePointsModel {
    const { pointOnColumn, options, tickDistance, pairModel, areaStackSeries } = renderOptions;
    const { data, name, color: seriesColor } = series;
    const points: PointModel[] = [];
    const { active } = legend.data.find(({ label }) => label === name)!;
    const color = getRGBA(seriesColor, active ? 1 : 0.1);

    data.forEach((datum, idx) => {
      const value = this.getLinePointModelValue(datum, pairModel);
      const stackedValue =
        this.chartType === 'stack' ? this.getStackValue(areaStackSeries!, seriesIndex, idx) : value;
      const valueRatio = getValueRatio(stackedValue, limit);
      const x = tickDistance * idx + (pointOnColumn ? tickDistance / 2 : 0);
      const y = (1 - valueRatio) * this.rect.height;

      points.push({ x, y, value });
    });

    // @TODO: range spline 처리 필요
    if (options?.spline) {
      setSplineControlPoint(points);
    }

    return {
      type: 'linePoints',
      lineWidth: 6,
      color,
      points,
      seriesIndex,
    };
  }

  renderLinePointsModel(
    seriesRawData: AreaSeriesType[],
    limit: ValueEdge,
    renderOptions: RenderOptions,
    legend: Legend
  ): LinePointsModel[] {
    const linePointsModels = seriesRawData.map((series, seriesIndex) =>
      this.getLinePointModel(series, seriesIndex, legend, limit, renderOptions)
    );

    if (this.chartType === 'range') {
      const renderOptionsForPair = deepMergedCopy(renderOptions, {
        pairModel: true,
      });
      const pair = seriesRawData.map((series, seriesIndex) =>
        this.getLinePointModel(series, seriesIndex, legend, limit, renderOptionsForPair)
      );

      linePointsModels.push(...pair);
    }

    return linePointsModels;
  }

  addBottomPoints(points: PointModel[], baseValueYPosition: number) {
    const firstPoint = first(points);
    const lastPoint = last(points);

    if (!firstPoint || !lastPoint) {
      return points;
    }

    return [
      ...points,
      { x: lastPoint.x, y: baseValueYPosition },
      { x: firstPoint.x, y: baseValueYPosition },
    ];
  }

  combineLinePointsModel() {
    if (this.chartType === 'normal') {
      return this.linePointsModel;
    }

    const combinedLinePointsModel: LinePointsModel[] = [];
    let len;

    if (this.chartType === 'range') {
      len = this.linePointsModel.length / 2;
      for (let i = 0; i < len; i += 1) {
        combinedLinePointsModel.push({
          ...this.linePointsModel[i],
          points: [
            ...this.linePointsModel[i].points,
            ...deepCopyArray(this.linePointsModel[len + i].points).reverse(),
          ],
        });
      }
    } else {
      // @TODO: refactor
      len = this.linePointsModel.length;
      for (let i = 0; i < len; i += 1) {
        combinedLinePointsModel.push({
          ...this.linePointsModel[i],
          points:
            i === 0
              ? this.addBottomPoints(this.linePointsModel[i].points, this.baseValueYPosition)
              : [
                  ...this.linePointsModel[i - 1].points,
                  ...[...this.linePointsModel[i].points].reverse(),
                ],
        });
      }
    }

    return combinedLinePointsModel;
  }

  renderAreaPointsModel(): AreaPointsModel[] {
    return this.combineLinePointsModel().map((m) => ({
      ...m,
      points:
        this.chartType === 'range'
          ? m.points
          : this.addBottomPoints(m.points, this.baseValueYPosition),
      type: 'areaPoints',
      lineWidth: 0,
      color: 'rgba(0, 0, 0, 0)', // make area border transparent
      fillColor: m.color,
    }));
  }

  renderCircleModel(): CircleModel[] {
    return this.linePointsModel.flatMap(({ points, color, seriesIndex }) =>
      points.map(({ x, y }, index) => ({
        type: 'circle',
        x,
        y,
        radius: 7,
        color,
        style: ['default', 'hover'],
        seriesIndex,
        index,
      }))
    );
  }

  isAreaPointsModel(model: DrawModels): model is AreaPointsModel {
    return model.type === 'areaPoints';
  }

  applyAreaOpacity(opacity: number) {
    this.drawModels.series.filter(this.isAreaPointsModel).forEach((model) => {
      model.fillColor = getRGBA(model.fillColor, opacity);
    });
  }

  renderGuideLineModel(circleModels: CircleResponderModel[]): LineModel[] {
    const x = crispPixel(circleModels[0].x);

    return [
      {
        type: 'line',
        x,
        y: 0,
        x2: x,
        y2: this.rect.height,
        strokeStyle: '#ddd',
        lineWidth: 1,
      },
    ];
  }

  onMouseMoveStackType(responders: BoundResponderModel[]) {
    let circleModels: CircleResponderModel[] = [];
    let guideLine: LineModel[] = [];

    if (responders.length) {
      const index = responders[0].index!;
      circleModels = this.tooltipCircleMap![index];
      guideLine = this.renderGuideLineModel(circleModels);
    }

    this.drawModels.hoveredSeries = [...guideLine, ...circleModels];
    this.activatedResponders = circleModels;
  }

  onMouseMoveDefault(responders: CircleResponderModel[]) {
    if (this.activatedResponders.length) {
      this.applyAreaOpacity(1);
    }

    if (responders.length) {
      this.applyAreaOpacity(0.5);
    }

    const pairCircleModels: CircleResponderModel[] = [];
    if (this.chartType === 'range') {
      responders.forEach((circle) => {
        const pairCircleModel = (this.responders as CircleResponderModel[])
          .filter((responder) => responder.seriesIndex === circle.seriesIndex)
          .find((responder) => responder.x === circle.x && responder.y !== circle.y)!;
        pairCircleModels.push(pairCircleModel);
      });
    }

    const linePoints = responders.reduce<LinePointsModel[]>(
      (acc, { seriesIndex }) => [
        ...acc,
        ...this.linePointsModel.filter((model) => model.seriesIndex === seriesIndex),
      ],
      []
    );

    this.drawModels.hoveredSeries = [...linePoints, ...responders, ...pairCircleModels];
    this.activatedResponders = responders;
  }

  onMousemove({ responders }: { responders: CircleResponderModel[] | BoundResponderModel[] }) {
    if (this.chartType === 'stack') {
      this.onMouseMoveStackType(responders as BoundResponderModel[]);
    } else {
      this.onMouseMoveDefault(responders as CircleResponderModel[]);
    }

    this.eventBus.emit('seriesPointHovered', this.activatedResponders);
    this.eventBus.emit('needDraw');
  }

  getDataLabels(seriesModels: AreaPointsModel[]) {
    return seriesModels.flatMap(({ points }) =>
      points.map((point) => ({ type: 'point', ...point }))
    );
  }
}
