import { CircleModel } from '@t/components/series';
import { ScatterChartOptions, ScatterSeriesType } from '@t/options';
import { ChartState, Scale } from '@t/store/store';
import { getCoordinateXValue, getCoordinateYValue } from '@src/helpers/coordinate';
import { getRGBA } from '@src/helpers/color';
import CircleSeries from '@src/component/circleSeries';
import { getValueRatio } from '@src/helpers/calculator';
import { TooltipData, TooltipDataValue } from '@t/components/tooltip';
import { deepCopy, isString } from '@src/helpers/utils';
import { getActiveSeriesMap } from '@src/helpers/legend';

export default class ScatterSeries extends CircleSeries {
  initialize() {
    this.type = 'series';
    this.name = 'scatter';
  }

  render(chartState: ChartState<ScatterChartOptions>) {
    const { layout, series, scale, legend, options } = chartState;
    if (!series.scatter) {
      throw new Error("There's no scatter data!");
    }

    const scatterData = series.scatter.data;

    this.rect = layout.plot;
    this.activeSeriesMap = getActiveSeriesMap(legend);
    this.selectable = this.getSelectableOption(options);

    const seriesModel = this.renderScatterPointsModel(scatterData, scale);
    const tooltipModel = this.makeTooltipModel(scatterData);

    this.models.series = seriesModel;
    if (!this.drawModels) {
      this.drawModels = deepCopy(this.models);
    }
    this.responders = seriesModel.map((m, index) => ({
      ...m,
      type: 'circle',
      detectionRadius: 0,
      radius: 7,
      color: getRGBA(m.color, 1),
      style: ['default', 'hover'],
      data: tooltipModel[index],
    }));
  }

  renderScatterPointsModel(seriesRawData: ScatterSeriesType[], scale: Scale): CircleModel[] {
    const {
      xAxis: { limit: xAxisLimit },
      yAxis: { limit: yAxisLimit },
    } = scale;

    return seriesRawData.flatMap(({ data, name, color: seriesColor }, seriesIndex) => {
      const circleModels: CircleModel[] = [];
      const active = this.activeSeriesMap![name];
      const color = getRGBA(seriesColor, active ? 0.9 : 0.3);

      data.forEach((datum) => {
        const rawXValue = getCoordinateXValue(datum);
        const xValue = isString(rawXValue) ? Number(new Date(rawXValue)) : Number(rawXValue);
        const yValue = getCoordinateYValue(datum);

        const xValueRatio = getValueRatio(xValue, xAxisLimit);
        const yValueRatio = getValueRatio(yValue, yAxisLimit);

        const x = xValueRatio * this.rect.width;
        const y = (1 - yValueRatio) * this.rect.height;

        circleModels.push({
          x,
          y,
          type: 'circle',
          radius: 7,
          style: ['default'],
          color,
          seriesIndex,
          name,
        });
      });

      return circleModels;
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
}
