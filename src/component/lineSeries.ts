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
import { ChartState, Scale, Series } from '@t/store/store';
import { LineSeriesType } from '@t/options';
import { getValueRatio, setSplineControlPoint, getXPosition } from '@src/helpers/calculator';
import { TooltipData } from '@t/components/tooltip';
import {
  getCoordinateDataIndex,
  getCoordinateXValue,
  getCoordinateYValue,
} from '@src/helpers/coordinate';
import { getRGBA } from '@src/helpers/color';
import { deepCopyArray, pick } from '@src/helpers/utils';
import { getActiveSeriesMap } from '@src/helpers/legend';
import {
  getNearestResponder,
  makeRectResponderModel,
  makeTooltipCircleMap,
} from '@src/helpers/responders';
import { getDataLabelsOptions } from '@src/store/dataLabels';

interface RenderOptions {
  pointOnColumn: boolean;
  options: LineTypeSeriesOptions;
  tickDistance: number;
  labelDistance?: number;
}

export const DEFAULT_LINE_WIDTH = 3;

type DatumType = CoordinateDataType | number;

export default class LineSeries extends Component {
  models: LineSeriesModels = { rect: [], series: [], dot: [], selectedSeries: [] };

  drawModels!: LineSeriesModels;

  responders!: CircleResponderModel[] | RectResponderModel[];

  activatedResponders: this['responders'] = [];

  eventType: LineTypeEventDetectType = 'nearest';

  tooltipCircleMap!: Record<number, CircleResponderModel[]>;

  startIndex!: number;

  isComboChart = false;

  initialize() {
    this.type = 'series';
    this.name = 'line';
  }

  initUpdate(delta: number) {
    this.drawModels.rect[0].width = this.models.rect[0].width * delta;
  }

  private setEventType(series: Series, options?: LineChartOptions) {
    if (series.area || series.column) {
      this.eventType = 'grouped';
    }

    if (options?.series?.eventDetectType) {
      this.eventType = options.series.eventDetectType;
    }

    if (series.scatter) {
      this.eventType = 'near';
    }
  }

  render(
    chartState: ChartState<LineChartOptions | LineScatterChartOptions | LineAreaChartOptions>
  ) {
    const { layout, series, scale, axes, categories = [], legend, zoomRange } = chartState;
    if (!series.line) {
      throw new Error("There's no line data!");
    }

    const options = { ...chartState.options };
    if (options?.series && 'line' in options.series) {
      options.series = { ...options.series, ...options.series.line };
    }

    this.setEventType(series, options);

    const { tickDistance, pointOnColumn, labelDistance } = axes.xAxis!;
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
      selectedSeries: [],
    };

    if (!this.drawModels) {
      this.drawModels = {
        rect: [this.renderClipRectAreaModel(true)],
        series: deepCopyArray(lineSeriesModel),
        dot: deepCopyArray(dotSeriesModel),
        selectedSeries: [],
      };
    }

    if (getDataLabelsOptions(options, this.name).visible) {
      this.store.dispatch('appendDataLabels', {
        data: this.getDataLabels(lineSeriesModel),
        name: this.name,
      });
    }

    this.responders =
      this.eventType === 'near'
        ? this.makeNearTypeResponderModel(seriesCircleModel, tooltipDataArr)
        : makeRectResponderModel(this.rect, axes.xAxis);
  }

  makeNearTypeResponderModel(seriesCircleModel: CircleModel[], tooltipDataArr: TooltipData[]) {
    return seriesCircleModel.map((m, index) => ({
      ...m,
      data: tooltipDataArr[index],
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
          radius: 6,
          style: ['default'],
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
    const yAxisLimit = scale.yAxis.limit;
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
          pick(renderOptions, 'pointOnColumn', 'tickDistance', 'labelDistance'),
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
        lineWidth: lineWidth ?? DEFAULT_LINE_WIDTH,
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
        radius: 7,
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
    const models = this.tooltipCircleMap[index];

    return this.eventType === 'grouped'
      ? models
      : getNearestResponder(models, mousePositions!, this.rect);
  }

  onMousemoveNearType(responders: CircleResponderModel[]) {
    this.eventBus.emit('renderHoveredSeries', {
      models: responders,
      name: this.name,
      eventType: this.eventType,
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
    if (this.eventType === 'near') {
      this.onMousemoveNearType(responders as CircleResponderModel[]);
    } else if (this.eventType === 'nearest') {
      this.onMousemoveNearestType(responders as RectResponderModel[], mousePosition);
    } else {
      this.onMousemoveGroupedType(responders as RectResponderModel[]);
    }

    this.eventBus.emit('seriesPointHovered', { models: this.activatedResponders, name: this.name });
    this.eventBus.emit('needDraw');
  }

  getDataLabels(seriesModels: LinePointsModel[]): PointModel[] {
    return seriesModels.flatMap(({ points, name }) =>
      points.map((point) => ({ type: 'point', ...point, name }))
    );
  }

  onClick({ responders, mousePosition }: MouseEventType) {
    if (this.selectable) {
      if (this.eventType === 'near') {
        this.drawModels.selectedSeries = responders as CircleResponderModel[];
      } else {
        this.drawModels.selectedSeries = this.getCircleModelsFromRectResponders(
          responders as RectResponderModel[],
          mousePosition
        );
      }
      this.eventBus.emit('needDraw');
    }
  }

  onMouseoutComponent() {
    this.eventBus.emit('seriesPointHovered', { models: [], name: this.name });
    this.eventBus.emit('renderHoveredSeries', {
      models: [],
      name: this.name,
      eventType: this.eventType,
    });

    this.eventBus.emit('needDraw');
  }
}
