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
} from '@src/helpers/coordinate';
import { getRGBA } from '@src/helpers/color';
import { deepCopyArray, pick, includes } from '@src/helpers/utils';
import { getActiveSeriesMap } from '@src/helpers/legend';
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
  labelDistance?: number;
}

export const DEFAULT_LINE_SERIES_DOT_RADIUS = 3;
export const DEFAULT_LINE_SERIES_HOVER_DOT_RADIUS = DEFAULT_LINE_SERIES_DOT_RADIUS + 2;
export const DEFAULT_LINE_SERIES_WIDTH = 2;

type DatumType = CoordinateDataType | number;
type ResponderTypes = CircleResponderModel[] | RectResponderModel[];

export default class LineSeries extends Component {
  models: LineSeriesModels = { rect: [], series: [], dot: [] };

  drawModels!: LineSeriesModels;

  responders!: ResponderTypes;

  activatedResponders: this['responders'] = [];

  eventDetectType: LineTypeEventDetectType = 'nearest';

  tooltipCircleMap!: Record<number, CircleResponderModel[]>;

  startIndex!: number;

  yAxisName = 'yAxis';

  initialize() {
    this.type = 'series';
    this.name = 'line';
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
    chartState: ChartState<LineChartOptions | LineScatterChartOptions | LineAreaChartOptions>
  ) {
    const { layout, series, scale, axes, legend, zoomRange } = chartState;
    if (!series.line) {
      throw new Error("There's no line data!");
    }

    const categories = (chartState.categories as string[]) ?? [];
    const options = { ...chartState.options };
    if (options?.series && 'line' in options.series) {
      options.series = { ...options.series, ...options.series.line };
    }

    this.setEventDetectType(series, options);

    const labelAxisData = axes.xAxis as LabelAxisData;
    const { tickDistance, pointOnColumn, labelDistance } = labelAxisData;
    const lineSeriesData = series.line.data;

    const renderLineOptions: RenderOptions = {
      pointOnColumn,
      options: (options.series || {}) as LineTypeSeriesOptions,
      tickDistance,
      labelDistance,
    };

    this.rect = layout.plot;
    this.activeSeriesMap = getActiveSeriesMap(legend);
    this.startIndex = zoomRange ? zoomRange[0] : 0;
    this.selectable = this.getSelectableOption(options);
    this.yAxisName = getValueAxisName(options, this.name, 'yAxis');

    const lineSeriesModel = this.renderLinePointsModel(
      lineSeriesData,
      scale,
      renderLineOptions,
      categories
    );
    const seriesCircleModel = this.renderCircleModel(lineSeriesModel);
    const tooltipDataArr = this.makeTooltipData(lineSeriesData, categories);
    const dotSeriesModel = this.renderDotSeriesModel(seriesCircleModel, renderLineOptions);
    this.tooltipCircleMap = makeTooltipCircleMap(seriesCircleModel, tooltipDataArr);

    this.models = {
      rect: [this.renderClipRectAreaModel()],
      series: lineSeriesModel,
      dot: dotSeriesModel,
    };

    if (!this.drawModels) {
      this.drawModels = {
        rect: [this.renderClipRectAreaModel(true)],
        series: deepCopyArray(lineSeriesModel),
        dot: deepCopyArray(dotSeriesModel),
      };
    }

    if (getDataLabelsOptions(options, this.name).visible) {
      this.renderDataLabels(this.getDataLabels(lineSeriesModel));
    }

    this.responders = this.getResponders(labelAxisData, seriesCircleModel, tooltipDataArr);
  }

  private getResponders(
    axisData: LabelAxisData,
    seriesCircleModel: CircleModel[],
    tooltipDataArr: TooltipData[]
  ): ResponderTypes {
    let res: ResponderTypes;

    if (this.eventDetectType === 'near') {
      res = this.makeNearTypeResponderModel(seriesCircleModel, tooltipDataArr);
    } else if (this.eventDetectType === 'point') {
      res = this.makeNearTypeResponderModel(seriesCircleModel, tooltipDataArr, 0);
    } else {
      res = makeRectResponderModel(this.rect, axisData);
    }

    return res;
  }

  makeNearTypeResponderModel(
    seriesCircleModel: CircleModel[],
    tooltipDataArr: TooltipData[],
    detectionSize?: number
  ) {
    return seriesCircleModel.map((m, index) => ({
      ...m,
      data: tooltipDataArr[index],
      detectionSize,
    }));
  }

  makeTooltipData(lineSeriesData: LineSeriesType[], categories: string[]) {
    return lineSeriesData.flatMap(({ rawData, name, color }) => {
      return rawData.map((datum: DatumType, dataIdx) => ({
        label: name,
        color,
        value: getCoordinateYValue(datum),
        category: categories[getCoordinateDataIndex(datum, categories, dataIdx, this.startIndex)],
      }));
    });
  }

  renderDotSeriesModel(
    seriesCircleModel: CircleModel[],
    { options }: RenderOptions
  ): CircleModel[] {
    return options?.showDot
      ? seriesCircleModel.map((m) => ({
          ...m,
          radius: DEFAULT_LINE_SERIES_DOT_RADIUS,
          style: [{ lineWidth: 0, strokeStyle: m.color }],
        }))
      : [];
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
    renderOptions: RenderOptions,
    categories: string[]
  ): LinePointsModel[] {
    const {
      options: { spline, lineWidth },
    } = renderOptions;
    const yAxisLimit = scale[this.yAxisName].limit;
    const xAxisLimit = scale?.xAxis?.limit;

    return seriesRawData.map(({ rawData, name, color: seriesColor }, seriesIndex) => {
      const points: PointModel[] = [];
      const active = this.activeSeriesMap![name];
      const color = getRGBA(seriesColor, active ? 1 : 0.3);

      rawData.forEach((datum, idx) => {
        const value = getCoordinateYValue(datum);
        const yValueRatio = getValueRatio(value, yAxisLimit);
        const y = (1 - yValueRatio) * this.rect.height;
        const x = getXPosition(
          pick(renderOptions, 'pointOnColumn', 'tickDistance', 'labelDistance') as LabelAxisData,
          this.rect.width,
          xAxisLimit,
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
        lineWidth: lineWidth ?? DEFAULT_LINE_SERIES_WIDTH,
        color,
        points,
        seriesIndex,
        name,
      };
    });
  }

  renderCircleModel(lineSeriesModel: LinePointsModel[]): CircleModel[] {
    return lineSeriesModel.flatMap(({ points, color, name }, seriesIndex) =>
      points.map(({ x, y }, index) => ({
        type: 'circle',
        x,
        y,
        radius: DEFAULT_LINE_SERIES_HOVER_DOT_RADIUS,
        color,
        style: ['default', 'hover'],
        seriesIndex,
        name,
        index,
      }))
    );
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

  onMousemoveNearType(responders: CircleResponderModel[]) {
    this.eventBus.emit('renderHoveredSeries', {
      models: responders,
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

  onMouseoutComponent() {
    this.eventBus.emit('seriesPointHovered', { models: [], name: this.name });
    this.eventBus.emit('renderHoveredSeries', {
      models: [],
      name: this.name,
      eventDetectType: this.eventDetectType,
    });

    this.eventBus.emit('needDraw');
  }
}
