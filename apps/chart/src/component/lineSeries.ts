import Component from './component';
import {
  CircleModel,
  CircleResponderModel,
  PointModel,
  LineSeriesModels,
  RectResponderModel,
  MouseEventType,
} from '@t/components/series';
import {
  LineChartOptions,
  LineTypeSeriesOptions,
  CoordinateDataType,
  LineScatterChartOptions,
  LineTypeEventDetectType,
  Point,
  LineAreaChartOptions,
} from '@t/options';
import { ClipRectAreaModel, LinePointsModel } from '@t/components/series';
import { ChartState, Scale, Series, LabelAxisData } from '@t/store/store';
import { LineSeriesType } from '@t/options';
import { getValueRatio, setSplineControlPoint, getXPosition } from '@src/helpers/calculator';
import { TooltipData } from '@t/components/tooltip';
import {
  getCoordinateDataIndex,
  getCoordinateXValue,
  getCoordinateYValue,
  isCoordinateSeries,
} from '@src/helpers/coordinate';
import { getRGBA } from '@src/helpers/color';
import { includes, isNull } from '@src/helpers/utils';
import { getActiveSeriesMap } from '@src/helpers/legend';
import {
  getNearestResponder,
  makeRectResponderModel,
  makeRectResponderModelForCoordinateType,
  makeTooltipCircleMap,
  RectResponderInfoForCoordinateType,
  RespondersThemeType,
} from '@src/helpers/responders';
import { getValueAxisName } from '@src/helpers/axes';
import { getDataLabelsOptions } from '@src/helpers/dataLabels';
import { PointDataLabel } from '@t/components/dataLabels';
import { DotTheme, LineChartSeriesTheme } from '@t/theme';
import { SelectSeriesInfo } from '@t/charts';
import { message } from '@src/message';
import { isAvailableSelectSeries, isAvailableShowTooltipInfo } from '@src/helpers/validation';

type DatumType = CoordinateDataType | number | null;
type ResponderTypes = CircleResponderModel[] | RectResponderModel[];

export default class LineSeries extends Component {
  models: LineSeriesModels = { rect: [], series: [], dot: [] };

  drawModels!: LineSeriesModels;

  responders!: ResponderTypes;

  theme!: Required<LineChartSeriesTheme>;

  activatedResponders: ResponderTypes = [];

  eventDetectType: LineTypeEventDetectType = 'nearest';

  tooltipCircleMap!: Record<string, CircleResponderModel[]>;

  startIndex!: number;

  yAxisName = 'yAxis';

  initialize() {
    this.type = 'series';
    this.name = 'line';
    this.eventBus.on('selectSeries', this.selectSeries);
    this.eventBus.on('showTooltip', this.showTooltip);
    this.eventBus.on('hideTooltip', this.onMouseoutComponent);
  }

  initUpdate(delta: number) {
    this.drawModels.rect[0].width = this.models.rect[0].width * delta;
  }

  private setEventDetectType(series: Series, options?: LineChartOptions) {
    if (series.area || series.column) {
      this.eventDetectType = 'grouped';
    }

    if (options?.series?.eventDetectType) {
      this.eventDetectType = options.series.eventDetectType;
    }

    if (series.scatter) {
      this.eventDetectType = 'near';
    }
  }

  render(
    chartState: ChartState<LineChartOptions | LineScatterChartOptions | LineAreaChartOptions>,
    computed
  ) {
    const { viewRange } = computed;
    const { layout, series, scale, axes, legend, theme } = chartState;
    if (!series.line) {
      throw new Error(message.noDataError(this.name));
    }

    const categories = (chartState.categories as string[]) ?? [];
    const rawCategories = (chartState.rawCategories as string[]) ?? [];
    const options = { ...chartState.options };
    if (options?.series && 'line' in options.series) {
      options.series = { ...options.series, ...options.series.line };
    }

    this.setEventDetectType(series, options);

    const labelAxisData = axes.xAxis as LabelAxisData;
    const seriesOptions = (options.series ?? {}) as LineTypeSeriesOptions;

    const lineSeriesData = series.line.data;

    this.theme = theme.series.line as Required<LineChartSeriesTheme>;
    this.rect = layout.plot;
    this.activeSeriesMap = getActiveSeriesMap(legend);
    this.startIndex = viewRange?.[0] ?? 0;
    this.selectable = this.getSelectableOption(options);
    this.yAxisName = getValueAxisName(options, this.name, 'yAxis');

    const lineSeriesModel = this.renderLinePointsModel(
      lineSeriesData,
      scale,
      labelAxisData,
      seriesOptions,
      categories
    );
    const { dotSeriesModel, responderModel } = this.renderCircleModel(
      lineSeriesModel,
      seriesOptions
    );
    const tooltipDataArr = this.makeTooltipData(lineSeriesData, categories);
    this.tooltipCircleMap = makeTooltipCircleMap(responderModel, tooltipDataArr);

    this.models = {
      rect: [this.renderClipRectAreaModel()],
      series: lineSeriesModel,
      dot: dotSeriesModel,
    };

    if (!this.drawModels) {
      this.drawModels = {
        ...this.models,
        rect: [this.renderClipRectAreaModel(true)],
      };
    }

    if (getDataLabelsOptions(options, this.name).visible) {
      this.renderDataLabels(this.getDataLabels(lineSeriesModel));
    }

    const coordinateType = isCoordinateSeries(series);
    this.responders = this.getResponders({
      labelAxisData,
      responderModel,
      tooltipDataArr,
      categories,
      rawCategories,
      coordinateType,
    });
  }

  private getResponders({
    labelAxisData,
    responderModel,
    tooltipDataArr,
    categories,
    rawCategories,
    coordinateType,
  }: {
    labelAxisData: LabelAxisData;
    responderModel: CircleModel[];
    tooltipDataArr: TooltipData[];
    categories: string[];
    rawCategories: string[];
    coordinateType: boolean;
  }): ResponderTypes {
    if (this.eventDetectType === 'near') {
      return this.makeNearTypeResponderModel(responderModel, tooltipDataArr, rawCategories);
    }
    if (this.eventDetectType === 'point') {
      return this.makeNearTypeResponderModel(responderModel, tooltipDataArr, rawCategories, 0);
    }
    if (coordinateType) {
      const rectResponderInfo = this.getRectResponderInfoForCoordinateType(
        responderModel,
        rawCategories
      );

      return makeRectResponderModelForCoordinateType(rectResponderInfo, this.rect);
    }

    return makeRectResponderModel(this.rect, labelAxisData, categories);
  }

  makeNearTypeResponderModel(
    seriesCircleModel: CircleModel[],
    tooltipDataArr: TooltipData[],
    categories: string[],
    detectionSize?: number
  ) {
    return seriesCircleModel.map((m, index) => ({
      ...m,
      data: tooltipDataArr[index],
      detectionSize,
      label: categories[m.index!],
    }));
  }

  makeTooltipData(lineSeriesData: LineSeriesType[], categories: string[]) {
    return lineSeriesData.flatMap(({ rawData, name, color }, seriesIndex) => {
      return rawData.map((datum: DatumType, index) =>
        isNull(datum)
          ? ({} as TooltipData)
          : {
              label: name,
              color,
              value: getCoordinateYValue(datum),
              category:
                categories[getCoordinateDataIndex(datum, categories, index, this.startIndex)],
              seriesIndex,
              index,
            }
      );
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

  renderLinePointsModel(
    seriesRawData: LineSeriesType[],
    scale: Scale,
    axisData: LabelAxisData,
    options: LineTypeSeriesOptions,
    categories: string[]
  ): LinePointsModel[] {
    const { spline } = options;
    const yAxisLimit = scale[this.yAxisName].limit;
    const { lineWidth, dashSegments } = this.theme;

    return seriesRawData.map(({ rawData, name, color: seriesColor }, seriesIndex) => {
      const points: (PointModel | null)[] = [];
      const active = this.activeSeriesMap![name];

      rawData.forEach((datum, idx) => {
        if (isNull(datum)) {
          return points.push(null);
        }

        const value = getCoordinateYValue(datum);
        const yValueRatio = getValueRatio(value, yAxisLimit);
        const y = (1 - yValueRatio) * this.rect.height;
        const x = getXPosition(
          axisData,
          this.rect.width,
          getCoordinateXValue(datum as CoordinateDataType),
          getCoordinateDataIndex(datum, categories, idx, this.startIndex)
        );
        points.push({ x, y, value });
      });

      if (spline) {
        setSplineControlPoint(points);
      }

      return {
        type: 'linePoints',
        points,
        seriesIndex,
        name,
        color: getRGBA(seriesColor, active ? 1 : 0.3),
        lineWidth,
        dashSegments,
      };
    });
  }

  getRectResponderInfoForCoordinateType(circleModel: CircleModel[], categories: string[]) {
    const duplicateCheckMap = {};
    const modelInRange = circleModel.filter(({ x }) => x >= 0 && x <= this.rect.width);

    return modelInRange.reduce<RectResponderInfoForCoordinateType[]>((acc, model) => {
      const { index, x } = model;
      if (!duplicateCheckMap[x]) {
        const label = categories[index!];

        duplicateCheckMap[x] = true;
        acc.push({ x, label });
      }

      return acc;
    }, []);
  }

  renderCircleModel(
    lineSeriesModel: LinePointsModel[],
    options: LineTypeSeriesOptions
  ): { dotSeriesModel: CircleModel[]; responderModel: CircleModel[] } {
    const dotSeriesModel = [] as CircleModel[];
    const responderModel = [] as CircleModel[];
    const showDot = !!options.showDot;
    const { hover, dot: dotTheme } = this.theme;
    const hoverDotTheme = hover.dot!;

    lineSeriesModel.forEach(({ color, name, points }, seriesIndex) => {
      const active = this.activeSeriesMap![name!];
      points.forEach((point, index) => {
        if (isNull(point)) {
          return;
        }
        const { x, y } = point;
        const model = { type: 'circle', x, y, seriesIndex, name, index } as CircleModel;
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
          style: ['default'],
        });
      });
    });

    return { dotSeriesModel, responderModel };
  }

  getCircleModelsFromRectResponders(
    responders: RectResponderModel[],
    mousePositions?: Point
  ): CircleResponderModel[] {
    if (!responders.length || !responders[0].label) {
      return [];
    }

    const models = this.tooltipCircleMap[responders[0]?.label] ?? [];

    return this.eventDetectType === 'grouped'
      ? models
      : getNearestResponder(models, mousePositions!, this.rect);
  }

  onMousemoveNearType(responders: CircleResponderModel[]) {
    this.eventBus.emit('renderHoveredSeries', {
      models: this.getResponderSeriesWithTheme(responders, 'hover'),
      name: this.name,
      eventDetectType: this.eventDetectType,
    });
    this.activatedResponders = responders;
  }

  onMousemoveNearestType(responders: RectResponderModel[], mousePositions: Point) {
    const circleModels = this.getCircleModelsFromRectResponders(responders, mousePositions);

    this.onMousemoveNearType(circleModels);
  }

  onMousemoveGroupedType(responders: RectResponderModel[]) {
    const circleModels = this.getCircleModelsFromRectResponders(responders);

    this.onMousemoveNearType(circleModels);
  }

  onMousemove({ responders, mousePosition }: MouseEventType) {
    if (this.eventDetectType === 'nearest') {
      this.onMousemoveNearestType(responders as RectResponderModel[], mousePosition);
    } else if (includes(['near', 'point'], this.eventDetectType)) {
      this.onMousemoveNearType(responders as CircleResponderModel[]);
    } else {
      this.onMousemoveGroupedType(responders as RectResponderModel[]);
    }

    this.eventBus.emit('seriesPointHovered', { models: this.activatedResponders, name: this.name });
    this.eventBus.emit('needDraw');
  }

  getDataLabels(seriesModels: LinePointsModel[]): PointDataLabel[] {
    const dataLabelTheme = this.theme.dataLabels;

    return seriesModels.flatMap(({ points, name, color }) =>
      points.map((point) =>
        isNull(point)
          ? ({} as PointDataLabel)
          : {
              type: 'point',
              ...point,
              name,
              theme: {
                ...dataLabelTheme,
                color: dataLabelTheme.useSeriesColor ? color : dataLabelTheme.color,
              },
            }
      )
    );
  }

  private getResponderSeriesWithTheme(models: CircleResponderModel[], type: RespondersThemeType) {
    const { radius, color, borderWidth, borderColor } = this.theme[type].dot as DotTheme;

    return models.map((model) => {
      const modelColor = color ?? model.color;

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

  onMouseoutComponent = () => {
    this.eventBus.emit('seriesPointHovered', { models: [], name: this.name });
    this.eventBus.emit('renderHoveredSeries', {
      models: [],
      name: this.name,
      eventDetectType: this.eventDetectType,
    });

    this.eventBus.emit('needDraw');
  };

  private getResponderCategoryByIndex(index: number) {
    const responder = Object.values(this.tooltipCircleMap)
      .flatMap((val) => val)
      .find((model) => model.index === index);

    return responder?.data?.category;
  }

  selectSeries = (info: SelectSeriesInfo) => {
    const { index, seriesIndex } = info;

    if (!isAvailableSelectSeries(info, 'line')) {
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

    if (!isAvailableShowTooltipInfo(info, this.eventDetectType, 'line')) {
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

    if (!models?.length) {
      return;
    }

    this.onMousemoveNearType(models);

    this.eventBus.emit('seriesPointHovered', { models: this.activatedResponders, name: this.name });
    this.eventBus.emit('needDraw');
  };
}
