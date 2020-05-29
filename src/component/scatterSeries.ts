import { CircleModel } from '@t/components/series';
import { ScatterChartOptions, ScatterSeriesType } from '@t/options';
import { ChartState, Scale, SeriesTheme } from '@t/store/store';
import {
  getCoordinateXValue,
  getCoordinateYValue
} from '@src/helpers/coordinate';
import { getRGBA } from '@src/helpers/color';
import CircleSeries from '@src/component/circleSeries';
import { getValueRatio } from '@src/helpers/calculator';

interface RenderOptions {
  theme: SeriesTheme;
}

export default class ScatterSeries extends CircleSeries {
  initialize() {
    this.type = 'series';
    this.name = 'scatterSeries';
  }

  render(chartState: ChartState<ScatterChartOptions>) {
    const { layout, series, scale, theme, categories = [] } = chartState;
    if (!series.scatter) {
      throw new Error("There's no scatter data!");
    }

    const scatterData = series.scatter.data;
    const renderOptions: RenderOptions = {
      theme: theme.series
    };

    this.rect = layout.plot;

    const seriesModel = this.renderScatterPointsModel(
      scatterData,
      scale,
      renderOptions
    );
    const tooltipModel = this.makeTooltipModel(
      scatterData,
      categories,
      renderOptions
    );

    this.models = [this.renderClipRectAreaModel(), ...seriesModel];
    this.responders = seriesModel.map((m, index) => ({
      ...m,
      type: 'circle',
      detectionRadius: 0,
      radius: 7,
      color: getRGBA(m.color, 1),
      style: ['default', 'hover'],
      data: tooltipModel[index]
    }));
  }

  renderScatterPointsModel(
    seriesRawData: ScatterSeriesType[],
    scale: Scale,
    renderOptions: RenderOptions
  ): CircleModel[] {
    const { theme } = renderOptions;
    const { colors } = theme;
    const {
      xAxis: { limit: xAxisLimit },
      yAxis: { limit: yAxisLimit }
    } = scale;

    return seriesRawData.flatMap(({ data }, seriesIndex) => {
      const circleModels: CircleModel[] = [];

      data.forEach(datum => {
        const xValue = getCoordinateXValue(datum);
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
          color: getRGBA(colors[seriesIndex], 0.9),
          seriesIndex
        });
      });

      return circleModels;
    });
  }
}
