import { ScatterChartOptions, ScatterSeriesType } from '@t/options';
import { ChartState, ValueEdge } from '@t/store/store';
import { getCoordinateXValue, getCoordinateYValue } from '@src/helpers/coordinate';
import { getRGBA } from '@src/helpers/color';
import CircleSeries from '@src/component/circleSeries';
import { getValueRatio } from '@src/helpers/calculator';
import { TooltipData, TooltipDataValue } from '@t/components/tooltip';
import { deepCopy, isString } from '@src/helpers/utils';
import { getActiveSeriesMap } from '@src/helpers/legend';
import { getValueAxisName } from '@src/helpers/axes';
import { CircleResponderModel, ScatterSeriesModel } from '@t/components/series';
import { getNearestResponder } from '@src/helpers/responders';
import { ScatterChartSeriesTheme } from '@t/theme';

export default class ScatterSeries extends CircleSeries {
  theme!: Required<ScatterChartSeriesTheme>;

  initialize() {
    this.type = 'series';
    this.name = 'scatter';
  }

  render(chartState: ChartState<ScatterChartOptions>) {
    const { layout, series, scale, legend, options, theme } = chartState;
    if (!series.scatter) {
      throw new Error("There's no scatter data!");
    }

    const scatterData = series.scatter.data;

    this.theme = theme.series.scatter as Required<ScatterChartSeriesTheme>;
    this.rect = layout.plot;
    this.activeSeriesMap = getActiveSeriesMap(legend);
    this.selectable = this.getSelectableOption(options);

    const seriesModel = this.renderScatterPointsModel(
      scatterData,
      scale.xAxis.limit,
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
      radius: 6,
      color: 'rgba(0,0,0,0)',
      style: [{ strokeStyle: 'rgba(0,0,0,0)' }],
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
      const color = getRGBA(seriesColor, active ? 0.9 : 0.3);

      data.forEach((datum, index) => {
        const rawXValue = getCoordinateXValue(datum);
        const xValue = isString(rawXValue) ? Number(new Date(rawXValue)) : Number(rawXValue);
        const yValue = getCoordinateYValue(datum);

        const xValueRatio = getValueRatio(xValue, xAxisLimit);
        const yValueRatio = getValueRatio(yValue, yAxisLimit);

        const x = xValueRatio * this.rect.width;
        const y = (1 - yValueRatio) * this.rect.height;

        models.push({
          x,
          y,
          type: 'scatterSeries',
          iconType,
          radius: 6,
          seriesIndex,
          name,
          borderColor: color,
          index,
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
          x: getCoordinateXValue(datum),
          y: getCoordinateYValue(datum),
        } as TooltipDataValue; // @TODO: tooltip format

        tooltipData.push({ label: name, color, value });
      });

      return tooltipData;
    });
  }

  private getClosestModel(closestResponder: CircleResponderModel[]) {
    if (!closestResponder.length) {
      return [];
    }

    const closestModel = (this.models.series as ScatterSeriesModel[]).find(
      ({ index, seriesIndex }) =>
        index === closestResponder[0].index && seriesIndex === closestResponder[0].seriesIndex
    );

    if (closestModel) {
      // @TODO: 색칠
      closestModel.fillColor = 'rgb(255,255,255)';
    }

    return closestModel ? [closestModel] : [];
  }

  onMousemove({ responders, mousePosition }) {
    const closestResponder = getNearestResponder(responders, mousePosition, this.rect);
    const closestModel = this.getClosestModel(closestResponder);

    this.eventBus.emit('renderHoveredSeries', { models: closestModel, name: this.name });
    this.activatedResponders = closestResponder;

    this.eventBus.emit('seriesPointHovered', { models: this.activatedResponders, name: this.name });
    this.eventBus.emit('needDraw');
  }
}
