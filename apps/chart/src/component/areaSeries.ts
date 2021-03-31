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
  BezierPoint,
} from '@t/options';
import { ClipRectAreaModel } from '@t/components/series';
import { ChartState, LabelAxisData, Series, StackSeriesData, ValueEdge } from '@t/store/store';
import { getValueRatio, setSplineControlPoint } from '@src/helpers/calculator';
import { TooltipData } from '@t/components/tooltip';
import { getRGBA } from '@src/helpers/color';
import {
  deepCopy,
  deepMergedCopy,
  getFirstValidValue,
  isNull,
  isUndefined,
  range,
  sum,
} from '@src/helpers/utils';
import { isRangeData } from '@src/helpers/range';
import { getActiveSeriesMap } from '@src/helpers/legend';
import {
  getNearestResponder,
  makeRectResponderModel,
  makeTooltipCircleMap,
  RespondersThemeType,
} from '@src/helpers/responders';
import { getValueAxisName } from '@src/helpers/axes';
import { getDataLabelsOptions } from '@src/helpers/dataLabels';
import { PointDataLabel } from '@t/components/dataLabels';
import { AreaChartSeriesTheme, DotTheme } from '@t/theme';
import { SelectSeriesInfo } from '@t/charts';
import { message } from '@src/message';
import { isAvailableSelectSeries, isAvailableShowTooltipInfo } from '@src/helpers/validation';

interface RenderOptions {
  pointOnColumn: boolean;
  options: LineTypeSeriesOptions;
  tickDistance: number;
  tickCount: number;
  areaStackSeries?: StackSeriesData<'area'>;
  pairModel?: boolean;
}

type DatumType = number | RangeDataType<number> | null;

const seriesOpacity = {
  INACTIVE: 0.06,
  ACTIVE: 1,
};

export default class AreaSeries extends Component {
  models: AreaSeriesModels = { rect: [], series: [], dot: [] };

  drawModels!: AreaSeriesModels;

  theme!: Required<AreaChartSeriesTheme>;

  responders!: CircleResponderModel[] | RectResponderModel[];

  activatedResponders: CircleResponderModel[] | RectResponderModel[] = [];

  eventDetectType: LineTypeEventDetectType = 'nearest';

  tooltipCircleMap!: Record<string, CircleResponderModel[]>;

  linePointsModel!: LinePointsModel[];

  baseYPosition!: number;

  isStackChart = false;

  isRangeChart = false;

  isSplineChart = false;

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

  getBaseYPosition(limit: ValueEdge) {
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
    const rawCategories = (chartState.rawCategories as string[]) ?? [];

    this.theme = theme.series.area as Required<AreaChartSeriesTheme>;
    this.rect = layout.plot;
    this.activeSeriesMap = getActiveSeriesMap(legend);
    this.startIndex = viewRange?.[0] ?? 0;
    this.selectable = this.getSelectableOption(options);
    this.isSplineChart = options.series?.spline ?? false;

    const { limit } = scale[getValueAxisName(options, this.name, 'yAxis')];
    const { tickDistance, pointOnColumn, tickCount } = axes.xAxis!;
    const areaData = series.area.data;
    this.baseYPosition = this.getBaseYPosition(limit);

    if (stackSeries?.area) {
      this.isStackChart = true;
      areaStackSeries = stackSeries.area;
    } else if (isRangeData(getFirstValidValue(areaData)?.data)) {
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
    const areaSeriesModel = this.renderAreaPointsModel();
    const showDot = !!options.series?.showDot;
    const { dotSeriesModel, responderModel } = this.renderCircleModel(showDot);
    const tooltipDataArr = this.makeTooltipData(areaData, rawCategories as string[]);

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

    this.responders = this.getResponders(
      responderModel,
      tooltipDataArr,
      categories,
      rawCategories,
      axes.xAxis as LabelAxisData
    );
  }

  private getResponders(
    responderModel: CircleModel[],
    tooltipDataArr: TooltipData[],
    categories: string[],
    rawCategories: string[],
    axisData: LabelAxisData
  ) {
    if (this.eventDetectType === 'near') {
      return this.makeNearTypeResponderModel(responderModel, tooltipDataArr, rawCategories);
    }
    if (this.eventDetectType === 'point') {
      return this.makeNearTypeResponderModel(responderModel, tooltipDataArr, rawCategories, 0);
    }

    return makeRectResponderModel(this.rect, axisData, categories);
  }

  makeNearTypeResponderModel(
    seriesCircleModel: CircleModel[],
    tooltipDataArr: TooltipData[],
    categories: string[],
    detectionSize?: number
  ): CircleResponderModel[] {
    const tooltipDataLength = tooltipDataArr.length;

    return seriesCircleModel.map((m, dataIndex) => ({
      ...m,
      data: tooltipDataArr[dataIndex % tooltipDataLength],
      detectionSize,
      label: categories[m.index!],
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
    return areaData.flatMap(({ rawData, name, color }, seriesIndex) => {
      const tooltipData: TooltipData[] = [];

      rawData.forEach((datum: DatumType, index) => {
        if (!isNull(datum)) {
          const value = this.isRangeChart ? `${datum[0]} ~ ${datum[1]}` : (datum as number);
          tooltipData.push({
            label: name,
            color,
            value,
            category: categories[index],
            seriesIndex,
            index,
          });
        }
      });

      return tooltipData;
    });
  }

  getLinePointModelValue(datum: Omit<AreaSeriesDataType, 'null'>, pairModel?: boolean) {
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
    const { pointOnColumn, tickDistance, pairModel, areaStackSeries } = renderOptions;
    const { rawData, name, color: seriesColor } = series;
    const active = this.activeSeriesMap![name];
    const points: (PointModel | null)[] = [];
    const color = getRGBA(seriesColor, active ? seriesOpacity.ACTIVE : seriesOpacity.INACTIVE);
    const { lineWidth, dashSegments } = this.theme;

    rawData.forEach((datum, idx) => {
      if (isNull(datum)) {
        points.push(null);

        return;
      }
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
      points.reverse(); // for range spline
    }

    if (this.isSplineChart) {
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

  getCombinedPoints(start: number, end: number) {
    const startPoints = start >= 0 ? this.linePointsModel[start].points : [];
    const reversedEndPoints = [...this.linePointsModel[end].points].reverse();

    return [...startPoints, ...reversedEndPoints];
  }

  renderRangeAreaSeries(linePointsModel: LinePointsModel[]) {
    const model: AreaPointsModel[] = [];

    linePointsModel.forEach((m) => {
      let areaPoints: BezierPoint[] = [];
      const { points } = m;
      points.slice(0, points.length / 2 + 1).forEach((point, i) => {
        const lastPoint = i === points.length / 2 - 1;
        const nullPoint = isNull(point);

        if (!nullPoint) {
          areaPoints.push(point!);
        }

        if (areaPoints.length && (lastPoint || nullPoint)) {
          const pairPoints = areaPoints
            .map((areaPoint, idx) => {
              const curIdx =
                points.length / 2 + i - areaPoints.length + idx + (!nullPoint && lastPoint ? 1 : 0);

              return points[curIdx];
            })
            .reverse();

          model.push({
            ...m,
            type: 'areaPoints',
            lineWidth: 0,
            color: 'rgba(0, 0, 0, 0)', // make area border transparent
            fillColor: this.getAreaOpacity(m.name!, m.color!),
            points: [...areaPoints, ...pairPoints],
          });

          areaPoints = [];
        }
      });
    });

    return model;
  }

  renderAreaSeries(linePointsModel: LinePointsModel[]) {
    const model: AreaPointsModel[] = [];
    const bottomYPoint: number[] = [];

    linePointsModel.forEach((m) => {
      let areaPoints: BezierPoint[] = [];
      const curBottomYPoint = [...bottomYPoint];
      const { points } = m;
      points.forEach((point, i) => {
        const lastPoint = i === points.length - 1;
        const nullPoint = isNull(point);

        if (!isNull(point)) {
          areaPoints.push(point);
        }

        if (areaPoints.length && (nullPoint || lastPoint)) {
          const pairPoints = areaPoints
            .map((areaPoint, idx) => {
              const curIdx = i - areaPoints.length + idx + (!nullPoint && lastPoint ? 1 : 0);
              const bottom = isUndefined(curBottomYPoint[curIdx])
                ? this.baseYPosition
                : curBottomYPoint[curIdx];

              if (this.isStackChart) {
                bottomYPoint[curIdx] = areaPoint.y;
              }

              return { x: areaPoint.x, y: bottom };
            })
            .reverse();

          if (this.isStackChart && this.isSplineChart) {
            setSplineControlPoint(pairPoints); // set spline for new stack pair points
          }

          model.push({
            ...m,
            type: 'areaPoints',
            lineWidth: 0,
            color: 'rgba(0, 0, 0, 0)', // make area border transparent
            fillColor: this.getAreaOpacity(m.name!, m.color!),
            points: [...areaPoints, ...pairPoints],
          });

          areaPoints = [];
        }
      });
    });

    return model;
  }

  getCombinedLinePointsModel(): LinePointsModel[] {
    if (!this.isRangeChart) {
      return this.linePointsModel;
    }

    const len = this.linePointsModel.length / 2;

    return range(0, len).reduce<LinePointsModel[]>((acc, i) => {
      const start = i;
      const end = len + i;
      const points = this.getCombinedPoints(start, end);

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

  renderAreaPointsModel(): AreaPointsModel[] {
    const combinedLinePointsModel = this.getCombinedLinePointsModel();

    return this.isRangeChart
      ? this.renderRangeAreaSeries(combinedLinePointsModel)
      : this.renderAreaSeries(combinedLinePointsModel);
  }

  renderCircleModel(
    showDot: boolean
  ): { dotSeriesModel: CircleModel[]; responderModel: CircleModel[] } {
    const dotSeriesModel: CircleModel[] = [];
    const responderModel: CircleModel[] = [];
    const { dot: dotTheme } = this.theme;

    this.linePointsModel.forEach(({ points, color, seriesIndex, name }, modelIndex) => {
      const isPairLinePointsModel =
        this.isRangeChart && modelIndex >= this.linePointsModel.length / 2;
      const active = this.activeSeriesMap![name!];
      points.forEach((point, index) => {
        if (isNull(point)) {
          return;
        }
        const model = {
          type: 'circle',
          ...point,
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

        responderModel.push(...this.getResponderSeriesWithTheme([model], 'hover', color));
      });
    });

    return { dotSeriesModel, responderModel };
  }

  getPairCircleModel(circleModels: CircleResponderModel[]) {
    const pairCircleModels: CircleResponderModel[] = [];

    circleModels.forEach((circle) => {
      const { seriesIndex, y, data } = circle;
      const { category } = data;

      const pairCircleModel = this.tooltipCircleMap[category!].find(
        (model) => model.seriesIndex === seriesIndex && model.y !== y
      )!;
      pairCircleModels.push(pairCircleModel);
    });

    return pairCircleModels;
  }

  getCircleModelsFromRectResponders(responders: RectResponderModel[], mousePositions?: Point) {
    if (!responders.length || !responders[0].label) {
      return [];
    }

    const models = this.tooltipCircleMap[responders[0].label] ?? [];

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

    this.activatedResponders = this.isRangeChart
      ? circleModels.slice(0, circleModels.length / 2) // for rendering unique tooltip data
      : circleModels;
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
    } else if (['near', 'point'].includes(this.eventDetectType)) {
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
      points.map((point) =>
        isNull(point)
          ? ({} as PointDataLabel)
          : {
              type: 'point',
              ...point,
              name,
              theme: {
                ...dataLabelTheme,
                color: dataLabelTheme.useSeriesColor ? getRGBA(fillColor, 1) : dataLabelTheme.color,
              },
            }
      )
    );
  }

  private getResponderSeriesWithTheme<T extends CircleModel | CircleResponderModel>(
    models: T[],
    type: RespondersThemeType,
    seriesColor?: string
  ) {
    const { radius, color, borderWidth, borderColor } = this.theme[type].dot as DotTheme;

    return models.map((model) => {
      const modelColor = color ?? model.color ?? seriesColor;

      return {
        ...model,
        radius,
        color: modelColor,
        style: [{ lineWidth: borderWidth, strokeStyle: borderColor ?? getRGBA(modelColor, 0.5) }],
      };
    });
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
        models: this.getResponderSeriesWithTheme(models, 'select'),
        name: this.name,
      });
      this.eventBus.emit('needDraw');
    }
  }

  private getResponderCategoryByIndex(index: number) {
    const responder = Object.values(this.tooltipCircleMap)
      .flatMap((val) => val)
      .find((model) => model.index === index);

    return responder?.data?.category;
  }

  selectSeries = (info: SelectSeriesInfo) => {
    const { index, seriesIndex } = info;

    if (!isAvailableSelectSeries(info, 'area')) {
      return;
    }

    const category = this.getResponderCategoryByIndex(index!);
    if (!category) {
      throw new Error(message.SELECT_SERIES_API_INDEX_ERROR);
    }

    const model = this.tooltipCircleMap[category][seriesIndex!];
    if (!model) {
      throw new Error(message.SELECT_SERIES_API_INDEX_ERROR);
    }

    const models = this.getResponderSeriesWithTheme([model], 'select');
    this.eventBus.emit('renderSelectedSeries', { models, name: this.name });
    this.eventBus.emit('needDraw');
  };

  showTooltip = (info: SelectSeriesInfo) => {
    const { index, seriesIndex } = info;

    if (!isAvailableShowTooltipInfo(info, this.eventDetectType, 'area')) {
      return;
    }

    const category = this.getResponderCategoryByIndex(index!);
    if (!category) {
      return;
    }

    const models =
      this.eventDetectType === 'grouped'
        ? this.tooltipCircleMap[category]
        : [this.tooltipCircleMap[category][seriesIndex!]];

    if (!models.length) {
      return;
    }

    this.onMousemoveNearType(models);

    this.eventBus.emit('seriesPointHovered', { models: this.activatedResponders, name: this.name });
    this.eventBus.emit('needDraw');
  };
}
