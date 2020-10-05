import Component from './component';
import {
  AreaPointsModel,
  CircleModel,
  CircleResponderModel,
  LinePointsModel,
  PointModel,
  AreaSeriesModels,
  RectResponderModel,
  MouseEventType,
} from '@t/components/series';
import {
  AreaChartOptions,
  AreaSeriesDataType,
  AreaSeriesType,
  LineChartOptions,
  LineTypeEventDetectType,
  LineAreaChartOptions,
  LineAreaChartSeriesOptions,
  LineTypeSeriesOptions,
  Point,
  RangeDataType,
} from '@t/options';
import { ClipRectAreaModel } from '@t/components/series';
import { ChartState, Series, StackSeriesData, ValueEdge } from '@t/store/store';
import { getValueRatio, setSplineControlPoint } from '@src/helpers/calculator';
import { TooltipData } from '@t/components/tooltip';
import { getRGBA } from '@src/helpers/color';
import {
  deepCopy,
  deepCopyArray,
  deepMergedCopy,
  first,
  last,
  range,
  sum,
} from '@src/helpers/utils';
import { isRangeData } from '@src/helpers/range';
import { getActiveSeriesMap } from '@src/helpers/legend';
import { isModelExistingInRect } from '@src/helpers/coordinate';
import { DEFAULT_LINE_WIDTH } from '@src/component/lineSeries';
import {
  getNearestResponder,
  makeRectResponderModel,
  makeTooltipCircleMap,
} from '@src/helpers/responders';
import { getValueAxisName } from '@src/helpers/axes';
import { getDataLabelsOptions } from '@src/helpers/dataLabels';
import { PointDataLabel } from '@t/components/dataLabels';

interface RenderOptions {
  pointOnColumn: boolean;
  options: LineTypeSeriesOptions;
  tickDistance: number;
  tickCount: number;
  areaStackSeries?: StackSeriesData<'area'>;
  pairModel?: boolean;
}

type DatumType = number | RangeDataType<number>;

const seriesOpacity = {
  INACTIVE: 0.2,
  ACTIVE: 1,
};

export default class AreaSeries extends Component {
  models: AreaSeriesModels = { rect: [], series: [], dot: [] };

  drawModels!: AreaSeriesModels;

  responders!: CircleResponderModel[] | RectResponderModel[];

  activatedResponders: this['responders'] = [];

  eventDetectType: LineTypeEventDetectType = 'nearest';

  tooltipCircleMap!: Record<number, CircleResponderModel[]>;

  linePointsModel!: LinePointsModel[];

  baseValueYPosition!: number;

  isStackChart = false;

  isRangeChart = false;

  startIndex!: number;

  initialize() {
    this.type = 'series';
    this.name = 'area';
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

  private setEventDetectType(series: Series, options?: LineChartOptions) {
    if (options?.series?.eventDetectType) {
      this.eventDetectType = options.series.eventDetectType;
    }

    if (series.line || this.isStackChart) {
      this.eventDetectType = 'grouped';
    }
  }

  getAreaOptions(options: AreaChartOptions | LineAreaChartOptions) {
    const newOptions = { ...options };
    if ((newOptions.series as LineAreaChartSeriesOptions)?.area) {
      newOptions.series = {
        ...newOptions.series,
        ...(newOptions.series as LineAreaChartSeriesOptions).area,
      };
    }

    return newOptions;
  }

  public render(chartState: ChartState<AreaChartOptions | LineAreaChartOptions>) {
    const { layout, series, scale, axes, legend, stackSeries, zoomRange } = chartState;

    if (!series.area) {
      throw new Error("There's no area data!");
    }

    let areaStackSeries;
    const options = this.getAreaOptions(chartState.options);
    const categories = chartState.categories as string[];

    this.rect = layout.plot;
    this.activeSeriesMap = getActiveSeriesMap(legend);
    this.startIndex = zoomRange ? zoomRange[0] : 0;
    this.selectable = this.getSelectableOption(options);

    const { limit } = scale[getValueAxisName(options, this.name, 'yAxis')];
    const { tickDistance, pointOnColumn, tickCount } = axes.xAxis!;
    const areaData = series.area.data;
    this.baseValueYPosition = this.getBaseValueYPosition(limit);

    if (stackSeries?.area) {
      this.isStackChart = true;
      areaStackSeries = stackSeries.area;
    } else if (isRangeData(first(areaData)?.data)) {
      this.isRangeChart = true;
    }

    this.setEventDetectType(series, options);

    const renderOptions: RenderOptions = {
      pointOnColumn,
      options: options.series || {},
      tickDistance,
      tickCount,
      areaStackSeries,
    };

    this.linePointsModel = this.renderLinePointsModel(areaData, limit, renderOptions);

    const areaSeriesModel = this.renderAreaPointsModel(renderOptions.options);
    const seriesCircleModel = this.renderCircleModel();
    const circleDotModel = this.renderDotSeriesModel(seriesCircleModel, renderOptions);
    const tooltipDataArr = this.makeTooltipData(areaData, categories);

    this.models = deepCopy({
      rect: [this.renderClipRectAreaModel()],
      series: areaSeriesModel,
      dot: circleDotModel,
    });

    if (!this.drawModels) {
      this.drawModels = {
        rect: [this.renderClipRectAreaModel(true)],
        series: deepCopyArray(areaSeriesModel),
        dot: deepCopyArray(circleDotModel),
      };
    }

    if (getDataLabelsOptions(options, this.name).visible) {
      this.renderDataLabels(this.getDataLabels(areaSeriesModel));
    }

    this.tooltipCircleMap = makeTooltipCircleMap(seriesCircleModel, tooltipDataArr);

    this.responders =
      this.eventDetectType === 'near'
        ? this.makeNearTypeResponderModel(seriesCircleModel, tooltipDataArr)
        : makeRectResponderModel(this.rect, axes.xAxis!);
  }

  renderDotSeriesModel(
    seriesCircleModel: CircleModel[],
    { options }: RenderOptions
  ): CircleModel[] {
    return options?.showDot
      ? seriesCircleModel.map((m) => ({
          ...m,
          radius: 6,
          style: ['default'],
        }))
      : [];
  }

  makeNearTypeResponderModel(
    seriesCircleModel: CircleModel[],
    tooltipDataArr: TooltipData[]
  ): CircleResponderModel[] {
    const tooltipDataLength = tooltipDataArr.length;

    return seriesCircleModel.map((m, dataIndex) => ({
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
    return areaData.flatMap(({ rawData, name, color }) => {
      const tooltipData: TooltipData[] = [];

      rawData.forEach((datum: DatumType, dataIdx) => {
        const value = this.isRangeChart ? `${datum[0]} ~ ${datum[1]}` : (datum as number);
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
    if (this.isRangeChart) {
      return pairModel ? datum[0] : datum[1];
    }

    return datum;
  }

  getLinePointModel(
    series: AreaSeriesType,
    seriesIndex: number,
    limit: ValueEdge,
    renderOptions: RenderOptions
  ): LinePointsModel {
    const { pointOnColumn, options, tickDistance, pairModel, areaStackSeries } = renderOptions;
    const { rawData, name, color: seriesColor } = series;
    const points: PointModel[] = [];
    const active = this.activeSeriesMap![name];
    const color = getRGBA(seriesColor, active ? seriesOpacity.ACTIVE : seriesOpacity.INACTIVE);

    rawData.forEach((datum, idx) => {
      const value = this.getLinePointModelValue(datum, pairModel);
      const stackedValue = this.isStackChart
        ? this.getStackValue(areaStackSeries!, seriesIndex, idx)
        : value;
      const valueRatio = getValueRatio(stackedValue, limit);
      const x = tickDistance * (idx - this.startIndex) + (pointOnColumn ? tickDistance / 2 : 0);
      const y = (1 - valueRatio) * this.rect.height;

      // @TODO: zoomable 어색한 부분 이후에 line 항상 떠있게 하면서 수정하면 해결 됨. 해당 조건 제거 필요
      if (isModelExistingInRect(this.rect, { x, y })) {
        points.push({ x, y, value });
      }
    });

    if (pairModel) {
      points.reverse();
    }

    if (options?.spline) {
      setSplineControlPoint(points);
    }

    return {
      type: 'linePoints',
      lineWidth: options?.lineWidth ?? DEFAULT_LINE_WIDTH,
      color,
      points,
      seriesIndex,
      name,
    };
  }

  renderLinePointsModel(
    seriesRawData: AreaSeriesType[],
    limit: ValueEdge,
    renderOptions: RenderOptions
  ): LinePointsModel[] {
    const linePointsModels = seriesRawData.map((series, seriesIndex) =>
      this.getLinePointModel(series, seriesIndex, limit, renderOptions)
    );

    if (this.isRangeChart) {
      const renderOptionsForPair = deepMergedCopy(renderOptions, { pairModel: true });
      const pair = seriesRawData.map((series, seriesIndex) =>
        this.getLinePointModel(series, seriesIndex, limit, renderOptionsForPair)
      );

      linePointsModels.push(...pair);
    }

    return linePointsModels;
  }

  addBottomPoints(points: PointModel[]) {
    const firstPoint = first(points);
    const lastPoint = last(points);

    if (!firstPoint || !lastPoint) {
      return points;
    }

    return [
      ...points,
      { x: lastPoint.x, y: this.baseValueYPosition },
      { x: firstPoint.x, y: this.baseValueYPosition },
    ];
  }

  getCombinedPoints(start: number, end: number, options: LineTypeSeriesOptions) {
    const startPoints = start >= 0 ? this.linePointsModel[start].points : [];
    const endPoints = this.linePointsModel[end].points;
    let points;

    if (this.isStackChart) {
      if (end === 0) {
        points = this.addBottomPoints(endPoints);
      } else {
        const reversedLinePointsModel = deepCopyArray(endPoints).reverse();
        if (options?.spline) {
          setSplineControlPoint(reversedLinePointsModel);
        }

        points = [...startPoints, ...reversedLinePointsModel];
      }
    } else {
      points = [...startPoints, ...endPoints];
    }

    return points;
  }

  getCombinedLinePointsModel(options: LineTypeSeriesOptions): LinePointsModel[] {
    if (!this.isRangeChart && !this.isStackChart) {
      return this.linePointsModel.map((m) => ({
        ...m,
        points: this.addBottomPoints(m.points),
      }));
    }

    const len = this.isRangeChart ? this.linePointsModel.length / 2 : this.linePointsModel.length;

    return range(0, len).reduce<LinePointsModel[]>((acc, i) => {
      const start = this.isRangeChart ? i : i - 1;
      const end = this.isRangeChart ? len + i : i;
      const points = this.getCombinedPoints(start, end, options);

      return [...acc, { ...this.linePointsModel[i], points }];
    }, []);
  }

  renderAreaPointsModel(options: LineTypeSeriesOptions): AreaPointsModel[] {
    return this.getCombinedLinePointsModel(options).map((m) => ({
      ...m,
      type: 'areaPoints',
      lineWidth: 0,
      color: 'rgba(0, 0, 0, 0)', // make area border transparent
      fillColor: m.color,
    }));
  }

  renderCircleModel(): CircleModel[] {
    return this.linePointsModel.flatMap(({ points, color, seriesIndex, name }) =>
      points.map(({ x, y }, index) => ({
        type: 'circle',
        x,
        y,
        radius: 7,
        color,
        style: ['default', 'hover'],
        seriesIndex,
        index,
        name,
      }))
    );
  }

  isAvailableApplyOpacity(opacity: number, name: string) {
    return (
      (opacity === seriesOpacity.ACTIVE && this.activeSeriesMap![name]) ||
      opacity === seriesOpacity.INACTIVE
    );
  }

  applyAreaOpacity(opacity: number) {
    this.drawModels.series.forEach((model) => {
      if (this.isAvailableApplyOpacity(opacity, model.name!)) {
        model.fillColor = getRGBA(model.fillColor, opacity);
      }
    });

    this.drawModels.dot.forEach((model) => {
      if (this.isAvailableApplyOpacity(opacity, model.name!)) {
        model.color = getRGBA(model.color, opacity);
      }
    });
  }

  getPairCircleModel(circleModels: CircleResponderModel[]) {
    const pairCircleModels: CircleResponderModel[] = [];

    circleModels.forEach((circle) => {
      const { index, seriesIndex, y } = circle;
      const pairCircleModel = this.tooltipCircleMap[index!].find(
        (model) => model.seriesIndex === seriesIndex && model.y !== y
      )!;
      pairCircleModels.push(pairCircleModel);
    });

    return pairCircleModels;
  }

  getLinePointsModels(circleModels: CircleResponderModel[]) {
    return circleModels.reduce<LinePointsModel[]>(
      (acc, { seriesIndex }) => [
        ...acc,
        ...this.linePointsModel.filter((model) => model.seriesIndex === seriesIndex),
      ],
      []
    );
  }

  getCircleModelsFromRectResponders(responders: RectResponderModel[], mousePositions?: Point) {
    if (!responders.length) {
      return [];
    }

    const index = responders[0].index!;
    // @TODO: getLinePointsModel 에서 isModelExistingInRect 제거 시 해당 코드로 수정 필요
    // const index = responders[0].index! + this.startIndex;
    const models = this.tooltipCircleMap[index] ?? [];

    return this.eventDetectType === 'grouped'
      ? models
      : getNearestResponder(models, mousePositions!, this.rect);
  }

  onMousemoveGroupedType(responders: RectResponderModel[]) {
    const circleModels = this.getCircleModelsFromRectResponders(responders);

    this.eventBus.emit('renderHoveredSeries', {
      models: circleModels,
      name: this.name,
      eventDetectType: this.eventDetectType,
    });
    this.activatedResponders = circleModels;
  }

  onMousemoveNearestType(responders: RectResponderModel[], mousePositions: Point) {
    const circleModels = this.getCircleModelsFromRectResponders(responders, mousePositions);

    this.onMousemoveNearType(circleModels);
  }

  onMousemoveNearType(responders: CircleResponderModel[]) {
    let pairCircleModels: CircleResponderModel[] = [];
    if (this.isRangeChart) {
      pairCircleModels = this.getPairCircleModel(responders);
    }
    const linePoints = this.getLinePointsModels(responders);
    const hoveredSeries = [...linePoints, ...responders, ...pairCircleModels];

    this.applyAreaOpacity(hoveredSeries.length ? seriesOpacity.INACTIVE : seriesOpacity.ACTIVE);
    this.eventBus.emit('renderHoveredSeries', {
      models: hoveredSeries,
      name: this.name,
      eventDetectType: this.eventDetectType,
    });
    this.activatedResponders = responders;
  }

  onMousemove({ responders, mousePosition }: MouseEventType) {
    if (this.eventDetectType === 'nearest') {
      this.onMousemoveNearestType(responders as RectResponderModel[], mousePosition);
    } else if (this.eventDetectType === 'near') {
      this.onMousemoveNearType(responders as CircleResponderModel[]);
    } else {
      this.onMousemoveGroupedType(responders as RectResponderModel[]);
    }

    this.eventBus.emit('seriesPointHovered', { models: this.activatedResponders, name: this.name });
    this.eventBus.emit('needDraw');
  }

  onMouseoutComponent() {
    this.eventBus.emit('seriesPointHovered', { models: [], name: this.name });
    this.eventBus.emit('renderHoveredSeries', {
      models: [],
      name: this.name,
      eventDetectType: this.eventDetectType,
    });
    this.applyAreaOpacity(seriesOpacity.ACTIVE);

    this.eventBus.emit('needDraw');
  }

  getDataLabels(seriesModels: AreaPointsModel[]): PointDataLabel[] {
    return seriesModels.flatMap(({ points, name }) =>
      points.map((point) => ({ type: 'point', ...point, name }))
    );
  }

  onClick({ responders, mousePosition }: MouseEventType) {
    if (this.selectable) {
      let models;
      if (this.eventDetectType === 'near') {
        models = responders as CircleResponderModel[];
      } else {
        models = this.getCircleModelsFromRectResponders(
          responders as RectResponderModel[],
          mousePosition
        );
      }
      this.eventBus.emit('renderSelectedSeries', { models, name: this.name });
      this.eventBus.emit('needDraw');
    }
  }
}
