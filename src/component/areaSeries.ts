import Component from './component';
import {
  AreaPointsModel,
  CircleModel,
  CircleResponderModel,
  LinePointsModel,
  PointModel,
} from '@t/components/series';
import {
  AreaChartOptions,
  AreaSeriesDataType,
  AreaSeriesType,
  LineTypeSeriesOptions,
  RangeDataType,
} from '@t/options';
import { ClipRectAreaModel } from '@t/components/series';
import { ChartState, Legend, ValueEdge } from '@t/store/store';
import { getValueRatio, setSplineControlPoint } from '@src/helpers/calculator';
import { TooltipData } from '@t/components/tooltip';
import { getRGBA } from '@src/helpers/color';
import { deepCopyArray, deepMergedCopy, first, last } from '@src/helpers/utils';
import { isRangeData } from '@src/helpers/range';

type DrawModels = LinePointsModel | AreaPointsModel | ClipRectAreaModel | CircleModel;

interface AreaSeriesDrawModels {
  rect: ClipRectAreaModel[];
  series: AreaPointsModel[];
  hoveredSeries: (CircleModel | LinePointsModel)[];
}

interface RenderOptions {
  pointOnColumn: boolean;
  options: LineTypeSeriesOptions;
  tickDistance: number;
  pairModel?: boolean;
}

type DatumType = number | RangeDataType;

export default class AreaSeries extends Component {
  models: AreaSeriesDrawModels = { rect: [], hoveredSeries: [], series: [] };

  drawModels!: AreaSeriesDrawModels;

  responders!: CircleResponderModel[];

  activatedResponders: this['responders'] = [];

  linePointsModel!: LinePointsModel[];

  isRangeData = false;

  initialize() {
    this.type = 'series';
    this.name = 'areaSeries';
  }

  initUpdate(delta: number) {
    this.drawModels.rect[0].width = this.models.rect[0].width * delta;
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
    } = chartState;
    if (!series.area) {
      throw new Error("There's no area data!");
    }

    const { yAxis } = scale;
    const { tickDistance, pointOnColumn } = axes.xAxis!;
    const areaData = series.area.data;
    const bottomYPoint = layout.xAxis.y - layout.xAxis.height + 10; // padding

    const renderOptions: RenderOptions = {
      pointOnColumn,
      options: options.series || {},
      tickDistance,
    };

    this.rect = layout.plot;
    this.isRangeData = isRangeData(first(areaData)?.data);
    this.linePointsModel = this.renderLinePointsModel(areaData, yAxis.limit, renderOptions, legend);

    const areaSeriesModel = this.renderAreaPointsModel(bottomYPoint);
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

    const tooltipDataLength = tooltipDataArr.length;
    this.responders = seriesCircleModel.map((m, dataIndex) => ({
      ...m,
      data: tooltipDataArr[dataIndex % tooltipDataLength],
    }));
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
        const value = this.isRangeData ? `${datum[0]} ~ ${datum[1]}` : (datum as number);
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
    if (this.isRangeData) {
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
    const { pointOnColumn, options, tickDistance, pairModel } = renderOptions;
    const { data, name, color: seriesColor } = series;
    const points: PointModel[] = [];
    const { active } = legend.data.find(({ label }) => label === name)!;
    const color = getRGBA(seriesColor, active ? 1 : 0.1);

    data.forEach((datum, idx) => {
      const value = this.getLinePointModelValue(datum, pairModel);
      const valueRatio = getValueRatio(value, limit);
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

    if (this.isRangeData) {
      const renderOptionsForPair = deepMergedCopy(renderOptions, { pairModel: true });
      const pair = seriesRawData.map((series, seriesIndex) =>
        this.getLinePointModel(series, seriesIndex, legend, limit, renderOptionsForPair)
      );

      linePointsModels.push(...pair);
    }

    return linePointsModels;
  }

  addBottomPoints(points: PointModel[], bottomYPoint: number) {
    const firstPoint = first(points);
    const lastPoint = last(points);

    if (!firstPoint || !lastPoint) {
      return points;
    }

    return [...points, { x: lastPoint.x, y: bottomYPoint }, { x: firstPoint.x, y: bottomYPoint }];
  }

  combineLinePointsModel() {
    if (!this.isRangeData) {
      return this.linePointsModel;
    }

    const combinedLinePointsModel: LinePointsModel[] = [];
    const mid = this.linePointsModel.length / 2;

    for (let i = 0; i < mid; i += 1) {
      combinedLinePointsModel.push({
        ...this.linePointsModel[i],
        points: [
          ...this.linePointsModel[i].points,
          ...deepCopyArray(this.linePointsModel[mid + i].points).reverse(),
        ],
      });
    }

    return combinedLinePointsModel;
  }

  renderAreaPointsModel(bottomYPoint: number): AreaPointsModel[] {
    return this.combineLinePointsModel().map((m) => ({
      ...m,
      points: this.isRangeData ? m.points : this.addBottomPoints(m.points, bottomYPoint),
      type: 'areaPoints',
      lineWidth: 0,
      color: 'rgba(0, 0, 0, 0)', // make area border transparent
      fillColor: m.color,
    }));
  }

  renderCircleModel(): CircleModel[] {
    return this.linePointsModel.flatMap(({ points, color, seriesIndex }) =>
      points.map(({ x, y }) => ({
        type: 'circle',
        x,
        y,
        radius: 7,
        color,
        style: ['default', 'hover'],
        seriesIndex,
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

  onMousemove({ responders }: { responders: CircleResponderModel[] }) {
    if (this.activatedResponders.length) {
      this.applyAreaOpacity(1);
    }

    if (responders.length) {
      this.applyAreaOpacity(0.5);
    }

    const pairCircleModels: CircleResponderModel[] = [];
    if (this.isRangeData) {
      responders.forEach((circle) => {
        const pairCircleModel = this.responders
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

    this.eventBus.emit('seriesPointHovered', this.activatedResponders);
    this.eventBus.emit('needDraw');
  }

  getDataLabels(seriesModels: AreaPointsModel[]) {
    return seriesModels.flatMap(({ points }) =>
      points.map((point) => ({ type: 'point', ...point }))
    );
  }
}
