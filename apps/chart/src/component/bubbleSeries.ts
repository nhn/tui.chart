import { CircleModel, CircleResponderModel, CircleSeriesModels } from '@t/components/series';
import {
  BaseOptions,
  BubbleChartOptions,
  BubbleSeriesDataType,
  BubbleSeriesType,
  Rect,
} from '@t/options';
import { ChartState, Scale } from '@t/store/store';
import { getCoordinateXValue, getCoordinateYValue } from '@src/helpers/coordinate';
import { getRGBA } from '@src/helpers/color';
import { getValueRatio } from '@src/helpers/calculator';
import { TooltipData, TooltipDataValue } from '@t/components/tooltip';
import { deepCopy, deepMergedCopy, isNull, isNumber, isString } from '@src/helpers/utils';
import { getActiveSeriesMap } from '@src/helpers/legend';
import { getNearestResponder, RespondersThemeType } from '@src/helpers/responders';
import Component from './component';
import { BubbleChartSeriesTheme } from '@t/theme';
import { SelectSeriesHandlerParams } from '@src/charts/chart';
import { message } from '@src/message';

const MINIMUM_RADIUS = 0.5;
const MINIMUM_DETECTING_AREA_RADIUS = 1;

export function getMaxRadius(bubbleData: BubbleSeriesType[]) {
  return bubbleData.reduce((acc, cur) => {
    const NonNullData = cur.data.filter((datum) => !isNull(datum)) as BubbleSeriesDataType[];

    return Math.max(acc, ...NonNullData.map(({ r }) => r));
  }, 0);
}

export default class BubbleSeries extends Component {
  models: CircleSeriesModels = { series: [] };

  drawModels!: CircleSeriesModels;

  responders!: CircleResponderModel[];

  activatedResponders: CircleResponderModel[] = [];

  theme!: Required<BubbleChartSeriesTheme>;

  rect!: Rect;

  maxRadius = -1;

  maxValue = -1;

  initialize() {
    this.type = 'series';
    this.name = 'bubble';
    this.eventBus.on('selectSeries', this.selectSeries);
    this.eventBus.on('showTooltip', this.showTooltip);
    this.eventBus.on('hideTooltip', this.onMouseoutComponent);
  }

  initUpdate(delta: number) {
    this.drawModels.series.forEach((model, index) => {
      model.radius = (this.models.series[index] as CircleModel).radius * delta;
    });
  }

  render(chartState: ChartState<BaseOptions>) {
    const { layout, series, scale, axes, circleLegend, legend, options, theme } = chartState;
    const { plot } = layout;

    if (!series.bubble) {
      throw new Error(message.noDataError(this.name));
    }

    const { xAxis, yAxis } = axes;
    const bubbleData = series.bubble.data;

    this.theme = theme.series.bubble as Required<BubbleChartSeriesTheme>;
    this.rect = plot;
    this.activeSeriesMap = getActiveSeriesMap(legend);
    this.selectable = this.getSelectableOption(options);

    const xAxisTickSize = this.rect.width / xAxis!.tickCount;
    const yAxisTickSize = this.rect.height / yAxis!.tickCount;

    this.maxRadius = circleLegend.radius
      ? circleLegend.radius
      : Math.min(xAxisTickSize, yAxisTickSize);
    this.maxValue = getMaxRadius(bubbleData);

    const seriesModel = this.renderBubblePointsModel(bubbleData, scale);
    const tooltipModel = this.makeTooltipModel(bubbleData);

    this.models.series = seriesModel;
    if (!this.drawModels) {
      this.drawModels = deepCopy(this.models);
    }
    this.responders = seriesModel.map((m, index) => ({
      ...m,
      type: 'circle',
      detectionSize: 0,
      radius: m.radius + MINIMUM_DETECTING_AREA_RADIUS,
      color: getRGBA(m.color, 0.85),
      data: tooltipModel[index],
      index,
    }));
  }

  renderBubblePointsModel(seriesRawData: BubbleSeriesType[], scale: Scale): CircleModel[] {
    const xAxisLimit = scale.xAxis!.limit;
    const yAxisLimit = scale.yAxis!.limit;

    const { borderWidth, borderColor } = this.theme;

    return seriesRawData.flatMap(({ data, name, color: seriesColor }, seriesIndex) => {
      const circleModels: CircleModel[] = [];
      const active = this.activeSeriesMap![name];
      const color = getRGBA(seriesColor, active ? 0.8 : 0.1);
      const nonNullData = data.filter((datum) => !isNull(datum)) as BubbleSeriesDataType[];

      nonNullData.forEach((datum) => {
        const rawXValue = getCoordinateXValue(datum);
        const xValue = isString(rawXValue) ? Number(new Date(rawXValue)) : Number(rawXValue);
        const yValue = getCoordinateYValue(datum);

        const xValueRatio = getValueRatio(xValue, xAxisLimit);
        const yValueRatio = getValueRatio(yValue, yAxisLimit);

        const x = xValueRatio * this.rect.width;
        const y = (1 - yValueRatio) * this.rect.height;
        const radius = Math.max(MINIMUM_RADIUS, (datum.r / this.maxValue) * this.maxRadius);

        circleModels.push({
          x,
          y,
          type: 'circle',
          radius,
          color,
          style: ['default'],
          seriesIndex,
          name,
          borderWidth,
          borderColor,
        });
      });

      return circleModels;
    });
  }

  makeTooltipModel(circleData: BubbleSeriesType[]) {
    return [...circleData].flatMap(({ data, name, color }) => {
      const tooltipData: TooltipData[] = [];
      const nonNullData = data.filter((datum) => !isNull(datum)) as BubbleSeriesDataType[];

      nonNullData.forEach((datum) => {
        const { r, label } = datum;
        tooltipData.push({
          label: `${name}/${label}`,
          color,
          value: {
            x: getCoordinateXValue(datum),
            y: getCoordinateYValue(datum),
            r,
          } as TooltipDataValue,
        });
      });

      return tooltipData;
    });
  }

  private getResponderAppliedTheme(responders: CircleResponderModel[], type: RespondersThemeType) {
    return responders.map((responder) => deepMergedCopy(responder, this.theme[type]));
  }

  onMouseoutComponent = () => {
    this.eventBus.emit('seriesPointHovered', { models: [], name: this.name });
    this.eventBus.emit('renderHoveredSeries', {
      models: [],
      name: this.name,
    });

    this.eventBus.emit('needDraw');
  };

  onMousemove({ responders, mousePosition }) {
    const closestResponder = getNearestResponder(responders, mousePosition, this.rect);
    const responderWithTheme = this.getResponderAppliedTheme(closestResponder, 'hover');

    this.eventBus.emit('renderHoveredSeries', { models: responderWithTheme, name: this.name });
    this.activatedResponders = closestResponder;

    this.eventBus.emit('seriesPointHovered', { models: this.activatedResponders, name: this.name });
    this.eventBus.emit('needDraw');
  }

  onClick({ responders, mousePosition }) {
    if (this.selectable) {
      const closestResponder = getNearestResponder(responders, mousePosition, this.rect);
      const responderWithTheme = this.getResponderAppliedTheme(closestResponder, 'select');

      this.eventBus.emit('renderSelectedSeries', {
        models: responderWithTheme,
        name: this.name,
      });

      this.eventBus.emit('needDraw');
    }
  }

  selectSeries = ({ index, seriesIndex, state }: SelectSeriesHandlerParams<BubbleChartOptions>) => {
    if (!isNumber(index) || !isNumber(seriesIndex)) {
      return;
    }

    const { name } = state.series.bubble!.data[index];
    const model = this.responders.filter(({ name: dataName }) => dataName === name)[seriesIndex];

    if (!model) {
      throw new Error(message.SELECT_SERIES_API_INDEX_ERROR);
    }

    const models = this.getResponderAppliedTheme([model], 'select');
    this.eventBus.emit('renderSelectedSeries', { models, name: this.name });
    this.eventBus.emit('needDraw');
  };

  showTooltip = (info: SelectSeriesHandlerParams<BubbleChartOptions>) => {
    const { index, seriesIndex, state } = info;

    if (!isNumber(index) || !isNumber(seriesIndex)) {
      return;
    }

    const { name } = state.series.bubble!.data[seriesIndex];
    const models = [this.responders.filter(({ name: dataName }) => dataName === name)[index]];

    if (!models.length) {
      return;
    }

    this.eventBus.emit('renderHoveredSeries', { models, name: this.name });
    this.activatedResponders = models;

    this.eventBus.emit('seriesPointHovered', { models: this.activatedResponders, name: this.name });
    this.eventBus.emit('needDraw');
  };
}
