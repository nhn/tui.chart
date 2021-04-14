import Component from './component';
import { Rect, ScatterChartOptions, ScatterSeriesType } from '@t/options';
import { ChartState, LabelAxisData, ValueEdge } from '@t/store/store';
import { getCoordinateXValue, getCoordinateYValue } from '@src/helpers/coordinate';
import { getRGBA } from '@src/helpers/color';
import { getValueRatio } from '@src/helpers/calculator';
import { TooltipData, TooltipDataValue } from '@t/components/tooltip';
import { deepCopy, deepMergedCopy, isNumber, isString, pick } from '@src/helpers/utils';
import { getActiveSeriesMap } from '@src/helpers/legend';
import { getValueAxisName } from '@src/helpers/axes';
import {
  CircleResponderModel,
  ScatterSeriesModel,
  ScatterSeriesModels,
} from '@t/components/series';
import { getNearestResponder, RespondersThemeType } from '@src/helpers/responders';
import { ScatterChartSeriesTheme } from '@t/theme';
import { SelectSeriesHandlerParams } from '@src/charts/chart';
import { message } from '@src/message';
import { isAvailableSelectSeries } from '@src/helpers/validation';

export default class ScatterSeries extends Component {
  theme!: Required<ScatterChartSeriesTheme>;

  models: ScatterSeriesModels = { series: [] };

  drawModels!: ScatterSeriesModels;

  responders!: CircleResponderModel[];

  activatedResponders: CircleResponderModel[] = [];

  rect!: Rect;

  initialize() {
    this.type = 'series';
    this.name = 'scatter';
    this.eventBus.on('selectSeries', this.selectSeries);
    this.eventBus.on('showTooltip', this.showTooltip);
    this.eventBus.on('hideTooltip', this.onMouseoutComponent);
  }

  initUpdate(delta: number) {
    this.drawModels.series.forEach((model, index) => {
      model.size = (this.models.series[index] as ScatterSeriesModel).size * delta;
    });
  }

  render(chartState: ChartState<ScatterChartOptions>) {
    const { layout, series, scale, legend, options, theme, axes } = chartState;
    if (!series.scatter) {
      throw new Error(message.noDataError(this.name));
    }

    const scatterData = series.scatter.data;

    this.theme = theme.series.scatter as Required<ScatterChartSeriesTheme>;
    this.rect = layout.plot;
    this.activeSeriesMap = getActiveSeriesMap(legend);
    this.selectable = this.getSelectableOption(options);

    const limit = (axes.xAxis as LabelAxisData)?.labelRange ?? scale.xAxis!.limit; // labelRange is created only for line scatter charts
    const seriesModel = this.renderScatterPointsModel(
      scatterData,
      limit,
      scale[getValueAxisName(options, this.name, 'yAxis')].limit
    );
    const tooltipModel = this.makeTooltipModel(scatterData);

    this.models.series = seriesModel;
    if (!this.drawModels) {
      this.drawModels = deepCopy(this.models);
    }

    this.responders = seriesModel.map((m, index) => ({
      ...m,
      type: 'circle',
      detectionSize: 0,
      radius: this.theme.size / 2,
      color: m.fillColor,
      style: [{ strokeStyle: m.borderColor, lineWidth: m.borderWidth }],
      data: tooltipModel[index],
    }));
  }

  renderScatterPointsModel(
    seriesRawData: ScatterSeriesType[],
    xAxisLimit: ValueEdge,
    yAxisLimit: ValueEdge
  ): ScatterSeriesModel[] {
    return seriesRawData.flatMap(({ data, name, color: seriesColor, iconType }, seriesIndex) => {
      const models: ScatterSeriesModel[] = [];
      const active = this.activeSeriesMap![name];
      const color = getRGBA(seriesColor, active ? 1 : 0.3);

      data.forEach((datum, index) => {
        const rawXValue = getCoordinateXValue(datum!);
        const xValue = isString(rawXValue) ? Number(new Date(rawXValue)) : Number(rawXValue);
        const yValue = getCoordinateYValue(datum!);

        const xValueRatio = getValueRatio(xValue, xAxisLimit);
        const yValueRatio = getValueRatio(yValue, yAxisLimit);

        const x = xValueRatio * this.rect.width;
        const y = (1 - yValueRatio) * this.rect.height;

        models.push({
          x,
          y,
          type: 'scatterSeries',
          iconType,
          seriesIndex,
          name,
          borderColor: color,
          index,
          ...pick(this.theme, 'borderWidth', 'size', 'fillColor'),
        });
      });

      return models;
    });
  }

  makeTooltipModel(circleData: ScatterSeriesType[]) {
    return [...circleData].flatMap(({ data, name, color }) => {
      const tooltipData: TooltipData[] = [];

      data.forEach((datum) => {
        const value = {
          x: getCoordinateXValue(datum!),
          y: getCoordinateYValue(datum!),
        } as TooltipDataValue;

        tooltipData.push({ label: name, color, value });
      });

      return tooltipData;
    });
  }

  private getClosestModel(closestResponder: CircleResponderModel[]) {
    if (!closestResponder.length) {
      return [];
    }

    const model = this.models.series.find(
      ({ index, seriesIndex }) =>
        isNumber(index) &&
        isNumber(seriesIndex) &&
        index === closestResponder[0].index &&
        seriesIndex === closestResponder[0].seriesIndex
    );

    return model ? [model] : [];
  }

  private getResponderAppliedTheme<T extends ScatterSeriesModel | CircleResponderModel>(
    closestModel: T[],
    type: RespondersThemeType
  ) {
    const { fillColor, size } = this.theme[type];

    return closestModel.map((m) =>
      deepMergedCopy(m, { ...this.theme[type], color: fillColor, radius: size! / 2 })
    );
  }

  onMousemove({ responders, mousePosition }) {
    const closestResponder = getNearestResponder(responders, mousePosition, this.rect);
    let closestModel = this.getClosestModel(closestResponder);
    closestModel = this.getResponderAppliedTheme(closestModel, 'hover');

    this.eventBus.emit('renderHoveredSeries', { models: closestModel, name: this.name });
    this.activatedResponders = closestResponder;

    this.eventBus.emit('seriesPointHovered', { models: this.activatedResponders, name: this.name });
    this.eventBus.emit('needDraw');
  }

  onClick({ responders, mousePosition }) {
    if (this.selectable) {
      const closestResponder = getNearestResponder(responders, mousePosition, this.rect);
      let closestModel = this.getClosestModel(closestResponder);
      closestModel = this.getResponderAppliedTheme(closestModel, 'select');

      this.eventBus.emit('renderSelectedSeries', {
        models: closestModel,
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
    });

    this.eventBus.emit('needDraw');
  };

  getModelsForSelectInfo = (info: SelectSeriesHandlerParams<ScatterChartOptions>) => {
    const { index, seriesIndex, state } = info;

    if (!isNumber(index) || !isNumber(seriesIndex) || !isAvailableSelectSeries(info, 'scatter')) {
      return;
    }

    const { name } = state.series.scatter!.data[seriesIndex];

    return [this.responders.filter(({ name: dataName }) => dataName === name)[index]];
  };

  selectSeries = (info: SelectSeriesHandlerParams<ScatterChartOptions>) => {
    const models = this.getModelsForSelectInfo(info);
    if (!models) {
      return;
    }

    if (!models.length) {
      throw new Error(message.SELECT_SERIES_API_INDEX_ERROR);
    }

    this.eventBus.emit('renderSelectedSeries', {
      models: this.getResponderAppliedTheme(models, 'select'),
      name: this.name,
    });
    this.eventBus.emit('needDraw');
  };

  showTooltip = (info: SelectSeriesHandlerParams<ScatterChartOptions>) => {
    const models = this.getModelsForSelectInfo(info);
    if (!models) {
      return;
    }

    this.eventBus.emit('renderHoveredSeries', { models, name: this.name });
    this.activatedResponders = models;

    this.eventBus.emit('seriesPointHovered', { models: this.activatedResponders, name: this.name });
    this.eventBus.emit('needDraw');
  };
}
