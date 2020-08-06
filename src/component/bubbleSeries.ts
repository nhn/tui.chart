import { CircleModel } from '@t/components/series';
import { BaseOptions, BubbleSeriesType } from '@t/options';
import { ChartState, Scale } from '@t/store/store';
import { getCoordinateXValue, getCoordinateYValue } from '@src/helpers/coordinate';
import { getRGBA } from '@src/helpers/color';
import CircleSeries from '@src/component/circleSeries';
import { getValueRatio } from '@src/helpers/calculator';
import { TooltipData, TooltipDataValue } from '@t/components/tooltip';
import { deepCopy, isString } from '@src/helpers/utils';
import { getActiveSeriesMap } from '@src/helpers/legend';

const MINIMUM_RADIUS = 0.5;
const MINIMUM_DETECTING_AREA_RADIUS = 1;

export function getMaxRadius(bubbleData: BubbleSeriesType[]) {
  return bubbleData.reduce((acc, cur) => {
    return Math.max(acc, ...cur.data.map(({ r }) => r));
  }, 0);
}

export default class BubbleSeries extends CircleSeries {
  maxRadius = -1;

  maxValue = -1;

  initialize() {
    this.type = 'series';
    this.name = 'bubbleSeries';
  }

  render(chartState: ChartState<BaseOptions>) {
    const { layout, series, scale, axes, circleLegend, legend, options } = chartState;
    const { plot } = layout;

    if (!series.bubble) {
      throw new Error("There's no bubble data!");
    }

    const { xAxis, yAxis } = axes;
    const bubbleData = series.bubble.data;

    this.rect = plot;
    this.activeSeriesMap = getActiveSeriesMap(legend);
    this.selectable = options?.series?.selectable ?? false;

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
      detectionRadius: 0,
      radius: m.radius + MINIMUM_DETECTING_AREA_RADIUS,
      color: getRGBA(m.color, 0.85),
      style: ['default', 'hover', { lineWidth: 2 }],
      data: tooltipModel[index],
    }));
  }

  renderBubblePointsModel(seriesRawData: BubbleSeriesType[], scale: Scale): CircleModel[] {
    const {
      xAxis: { limit: xAxisLimit },
      yAxis: { limit: yAxisLimit },
    } = scale;

    return seriesRawData.flatMap(({ data, name, color: seriesColor }, seriesIndex) => {
      const circleModels: CircleModel[] = [];
      const active = this.activeSeriesMap![name];
      const color = getRGBA(seriesColor, active ? 0.8 : 0.1);

      data.forEach((datum) => {
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
          style: ['default', { strokeStyle: color }],
          seriesIndex,
        });
      });

      return circleModels;
    });
  }

  makeTooltipModel(circleData: BubbleSeriesType[]) {
    return [...circleData].flatMap(({ data, name, color }) => {
      const tooltipData: TooltipData[] = [];

      data.forEach((datum) => {
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
}
