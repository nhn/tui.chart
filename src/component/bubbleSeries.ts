import { CircleModel } from '@t/components/series';
import { BaseOptions, BubbleSeriesType } from '@t/options';
import { ChartState, Scale, SeriesTheme } from '@t/store/store';
import { getCoordinateXValue, getCoordinateYValue } from '@src/helpers/coordinate';
import { getRGBA } from '@src/helpers/color';
import CircleSeries from '@src/component/circleSeries';
import { getValueRatio } from '@src/helpers/calculator';
import { TooltipData } from '@t/components/tooltip';
import { deepCopy } from '@src/helpers/utils';

interface RenderOptions {
  theme: SeriesTheme;
}

const MINIMUM_DETECTING_AREA_RADIUS = 1;

export default class BubbleSeries extends CircleSeries {
  maxRadius = -1;

  maxValue = -1;

  initialize() {
    this.type = 'series';
    this.name = 'bubbleSeries';
  }

  setMaxValue(bubbleData: BubbleSeriesType[]) {
    bubbleData.forEach(({ data }) => {
      this.maxValue = Math.max(this.maxValue, ...data.map(({ r }) => r));
    });
  }

  render(chartState: ChartState<BaseOptions>) {
    const { layout, series, scale, theme, categories = [], axes } = chartState;
    if (!series.bubble) {
      throw new Error("There's no bubble data!");
    }

    const { xAxis, yAxis } = axes;
    const bubbleData = series.bubble.data;
    const renderOptions: RenderOptions = {
      theme: theme.series,
    };

    this.rect = layout.plot;

    const xAxisTickSize = this.rect.width / xAxis!.tickCount;
    const yAxisTickSize = this.rect.height / yAxis!.tickCount;

    this.maxRadius = Math.min(xAxisTickSize, yAxisTickSize);
    this.setMaxValue(bubbleData);

    const seriesModel = this.renderBubblePointsModel(bubbleData, renderOptions, scale);
    const tooltipModel = this.makeTooltipModel(bubbleData, categories, renderOptions);

    this.models.series = seriesModel;
    if (!this.drawModels) {
      this.drawModels = deepCopy(this.models);
    }
    this.responders = seriesModel.map((m, index) => ({
      ...m,
      type: 'circle',
      detectionRadius: 0,
      radius: m.radius + MINIMUM_DETECTING_AREA_RADIUS,
      color: getRGBA(m.color, 0.85),
      style: ['default', 'hover', { lineWidth: 2 }],
      data: tooltipModel[index],
    }));
  }

  renderBubblePointsModel(
    seriesRawData: BubbleSeriesType[],
    renderOptions: RenderOptions,
    scale: Scale
  ): CircleModel[] {
    const { theme } = renderOptions;
    const { colors } = theme;
    const {
      xAxis: { limit: xAxisLimit },
      yAxis: { limit: yAxisLimit },
    } = scale;

    return seriesRawData.flatMap(({ data }, seriesIndex) => {
      const circleModels: CircleModel[] = [];

      data.forEach((datum) => {
        const xValue = getCoordinateXValue(datum);
        const yValue = getCoordinateYValue(datum);

        const xValueRatio = getValueRatio(xValue, xAxisLimit);
        const yValueRatio = getValueRatio(yValue, yAxisLimit);

        const x = xValueRatio * this.rect.width;
        const y = (1 - yValueRatio) * this.rect.height;
        const radius = (datum.r / this.maxValue) * this.maxRadius;
        const color = getRGBA(colors[seriesIndex], 0.7);

        circleModels.push({
          x,
          y,
          type: 'circle',
          radius,
          color,
          style: ['default', { strokeStyle: getRGBA(color, 0.3) }],
          seriesIndex,
        });
      });

      return circleModels;
    });
  }

  makeTooltipModel(
    circleData: BubbleSeriesType[],
    categories: string[],
    renderOptions: RenderOptions
  ) {
    const { theme } = renderOptions;

    return [...circleData].flatMap(({ data, name }, index) => {
      const tooltipData: TooltipData[] = [];

      data.forEach((datum) => {
        const { r } = datum;
        tooltipData.push({
          label: name,
          color: theme.colors[index],
          value: { x: getCoordinateXValue(datum), y: getCoordinateYValue(datum), r },
        });
      });

      return tooltipData;
    });
  }
}
