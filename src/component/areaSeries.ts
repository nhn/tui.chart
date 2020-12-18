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
  isNumber,
  isUndefined,
  last,
  range,
  sum,
} from '@src/helpers/utils';
import { isRangeData } from '@src/helpers/range';
import { getActiveSeriesMap } from '@src/helpers/legend';
import {
  getNearestResponder,
  makeRectResponderModel,
  makeTooltipCircleMap,
} from '@src/helpers/responders';
import { getValueAxisName } from '@src/helpers/axes';
import { getDataLabelsOptions } from '@src/helpers/dataLabels';
import { PointDataLabel } from '@t/components/dataLabels';
import { AreaChartSeriesTheme, DotTheme } from '@t/theme';
import { SelectSeriesHandlerParams, ShowTooltipSeriesInfo } from '@src/charts/chart';
import { message } from '@src/message';

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
  INACTIVE: 0.06,
  ACTIVE: 1,
};

export default class AreaSeries extends Component {
  models: AreaSeriesModels = { rect: [], series: [], dot: [] };

  drawModels!: AreaSeriesModels;

  theme!: Required<AreaChartSeriesTheme>;

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
    this.eventBus.on('selectSeries', this.selectSeries);
    this.eventBus.on('showTooltip', this.showTooltip);
    this.eventBus.on('hideTooltip', this.onMouseoutComponent);
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

  public render(chartState: ChartState<AreaChartOptions | LineAreaChartOptions>, computed) {
    const { viewRange } = computed;
    const { layout, series, scale, axes, legend, stackSeries, theme } = chartState;

    if (!series.area) {
      throw new Error(message.noDataError(this.name));
    }

    let areaStackSeries;
    const options = this.getAreaOptions(chartState.options);
    const categories = chartState.categories as string[];

    this.theme = theme.series.area as Required<AreaChartSeriesTheme>;
    this.rect = layout.plot;
    this.activeSeriesMap = getActiveSeriesMap(legend);
    this.startIndex = viewRange ? viewRange[0] : 0;
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
    const showDot = !!options.series?.showDot;
    const { dotSeriesModel, responderModel } = this.renderCircleModel(showDot);
    const tooltipDataArr = this.makeTooltipData(areaData, categories);

    this.models = deepCopy({
      rect: [this.renderClipRectAreaModel()],
      series: [...this.linePointsModel, ...areaSeriesModel],
      dot: dotSeriesModel,
    });

    if (!this.drawModels) {
      this.drawModels = {
        ...this.models,
        rect: [this.renderClipRectAreaModel(true)],
      };
    }

    if (getDataLabelsOptions(options, this.name).visible) {
      this.renderDataLabels(this.getDataLabels(areaSeriesModel));
    }

    this.tooltipCircleMap = makeTooltipCircleMap(responderModel, tooltipDataArr);

    this.responders =
      this.eventDetectType === 'near'
        ? this.makeNearTypeResponderModel(responderModel, tooltipDataArr)
        : makeRectResponderModel(this.rect, axes.xAxis!);
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
    const active = this.activeSeriesMap![name];
    const points: PointModel[] = [];
    const color = getRGBA(seriesColor, active ? seriesOpacity.ACTIVE : seriesOpacity.INACTIVE);
    const { lineWidth, dashSegments } = this.theme;

    rawData.forEach((datum, idx) => {
      const value = this.getLinePointModelValue(datum, pairModel);
      const stackedValue = this.isStackChart
        ? this.getStackValue(areaStackSeries!, seriesIndex, idx)
        : value;
      const valueRatio = getValueRatio(stackedValue, limit);
      const x = tickDistance * (idx - this.startIndex) + (pointOnColumn ? tickDistance / 2 : 0);
      const y = (1 - valueRatio) * this.rect.height;

      points.push({ x, y, value });
    });

    if (pairModel) {
      points.reverse();
    }

    if (options?.spline) {
      setSplineControlPoint(points);
    }

    return {
      type: 'linePoints',
      lineWidth,
      dashSegments,
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

  private getAreaOpacity(name: string, color: string) {
    const { select, areaOpacity } = this.theme;
    const active = this.activeSeriesMap![name];
    const selected = Object.values(this.activeSeriesMap!).some((elem) => !elem);

    return selected
      ? getRGBA(color, active ? select.areaOpacity! : select.restSeries!.areaOpacity!)
      : getRGBA(color, areaOpacity);
  }

  renderAreaPointsModel(options: LineTypeSeriesOptions): AreaPointsModel[] {
    return this.getCombinedLinePointsModel(options).map((m) => ({
      ...m,
      type: 'areaPoints',
      lineWidth: 0,
      color: 'rgba(0, 0, 0, 0)', // make area border transparent
      fillColor: this.getAreaOpacity(m.name!, m.color!),
    }));
  }

  renderCircleModel(
    showDot: boolean
  ): { dotSeriesModel: CircleModel[]; responderModel: CircleModel[] } {
    const dotSeriesModel: CircleModel[] = [];
    const responderModel: CircleModel[] = [];
    const { hover, dot: dotTheme } = this.theme;
    const hoverDotTheme = hover.dot!;

    this.linePointsModel.forEach(({ points, color, seriesIndex, name }, modelIndex) => {
      const isPairLinePointsModel =
        this.isRangeChart && modelIndex >= this.linePointsModel.length / 2;
      const active = this.activeSeriesMap![name!];
      points.forEach(({ x, y }, index) => {
        const model = {
          type: 'circle',
          x,
          y,
          seriesIndex,
          name,
          index: isPairLinePointsModel ? points.length - index - 1 : index,
        } as CircleModel;
        if (showDot) {
          dotSeriesModel.push({
            ...model,
            radius: dotTheme.radius!,
            color: getRGBA(color, active ? 1 : 0.3),
            style: [
              { lineWidth: dotTheme.borderWidth, strokeStyle: dotTheme.borderColor ?? color },
            ],
          });
        }
        responderModel.push({
          ...model,
          radius: hoverDotTheme.radius!,
          color: hoverDotTheme.color ?? getRGBA(color, 1),
          style: ['default', 'hover'],
        });
      });
    });

    return { dotSeriesModel, responderModel };
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

  getCircleModelsFromRectResponders(responders: RectResponderModel[], mousePositions?: Point) {
    if (!responders.length) {
      return [];
    }
    const index = responders[0].index! + this.startIndex;
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
    const hoveredSeries = [...responders, ...pairCircleModels];

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

  onMouseoutComponent = () => {
    this.eventBus.emit('seriesPointHovered', { models: [], name: this.name });
    this.eventBus.emit('renderHoveredSeries', {
      models: [],
      name: this.name,
      eventDetectType: this.eventDetectType,
    });

    this.eventBus.emit('needDraw');
  };

  getDataLabels(seriesModels: AreaPointsModel[]): PointDataLabel[] {
    const dataLabelTheme = this.theme.dataLabels;

    return seriesModels.flatMap(({ points, name, fillColor }) =>
      points.map((point) => ({
        type: 'point',
        ...point,
        name,
        theme: {
          ...dataLabelTheme,
          color: dataLabelTheme.useSeriesColor ? getRGBA(fillColor, 1) : dataLabelTheme.color,
        },
      }))
    );
  }

  private getSelectedSeriesWithTheme(models: CircleResponderModel[]) {
    const { radius, color, borderWidth, borderColor } = this.theme.select.dot as DotTheme;

    return models.map((model) => ({
      ...model,
      radius,
      color: color ?? model.color,
      style: ['hover', { lineWidth: borderWidth, strokeStyle: borderColor }],
    }));
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
      this.eventBus.emit('renderSelectedSeries', {
        models: this.getSelectedSeriesWithTheme(models),
        name: this.name,
      });
      this.eventBus.emit('needDraw');
    }
  }

  selectSeries = (info: SelectSeriesHandlerParams<AreaChartOptions>) => {
    const { index, seriesIndex, chartType } = info;

    if (
      !isNumber(index) ||
      !isNumber(seriesIndex) ||
      (!isUndefined(chartType) && chartType !== 'area')
    ) {
      return;
    }

    const model = this.tooltipCircleMap[index][seriesIndex];

    if (!model) {
      throw new Error(message.SELECT_SERIES_API_INDEX_ERROR);
    }

    this.eventBus.emit('renderSelectedSeries', {
      models: [model],
      name: this.name,
    });
    this.eventBus.emit('needDraw');
  };

  showTooltip = (info: ShowTooltipSeriesInfo) => {
    const { index, seriesIndex, chartType } = info;

    if (
      !isNumber(index) ||
      (this.eventDetectType !== 'grouped' && !isNumber(seriesIndex)) ||
      (!isUndefined(chartType) && chartType !== 'area')
    ) {
      return;
    }

    const models =
      this.eventDetectType === 'grouped'
        ? this.tooltipCircleMap[index!]
        : [this.tooltipCircleMap[index!][seriesIndex!]];

    if (!models.length) {
      return;
    }

    this.onMousemoveNearType(models);

    this.eventBus.emit('seriesPointHovered', { models: this.activatedResponders, name: this.name });
    this.eventBus.emit('needDraw');
  };
}
