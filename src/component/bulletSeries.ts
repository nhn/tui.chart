import Component from './component';
import { ChartState } from '@t/store/store';
import { BulletSeriesModels, RectResponderModel, RectModel } from '@t/components/series';
import { getActiveSeriesMap } from '@src/helpers/legend';
import { getRGBA } from '@src/helpers/color';
import { BulletChartOptions, BulletSeriesType, Size } from '@t/options';
import { isLabelAxisOnYAxis, getAxisName, getSizeKey } from '@src/helpers/axes';
import { PADDING } from '@src/component/boxSeries';
type RenderOptions = {
  ratio: number;
  tickDistance: number;
  vertical: boolean;
  zeroPosition: number;
};

const seriesOpacity = {
  INACTIVE: 0.2,
  ACTIVE: 1,
};

export function isBulletSeries(seriesName: string) {
  return seriesName === 'bullet';
}

export default class BulletSeries extends Component {
  models: BulletSeriesModels = { series: [], selectedSeries: [] };

  drawModels!: BulletSeriesModels;

  responders!: RectResponderModel[];

  activatedResponders: this['responders'] = [];

  initialize() {
    this.type = 'series';
    this.name = 'bulletSeries';
  }

  render(state: ChartState<BulletChartOptions>): void {
    const { layout, axes, series, scale, legend, options } = state;

    if (!series.bullet) {
      throw new Error("There's no bullet data!");
    }

    this.rect = layout.plot;
    this.activeSeriesMap = getActiveSeriesMap(legend);
    this.selectable = this.getSelectableOption(options);

    const labelAxisOnYAxis = isLabelAxisOnYAxis(series, options);
    const { labelAxisName, valueAxisName } = getAxisName(labelAxisOnYAxis);
    const { valueSizeKey } = getSizeKey(labelAxisOnYAxis);
    const { tickDistance } = axes[labelAxisName];
    const { zeroPosition } = axes[valueAxisName];
    const { min, max } = scale[valueAxisName].limit;
    const bulletData = series.bullet.data;

    const renderOptions = {
      ratio: this.rect[valueSizeKey] / (max - min),
      tickDistance,
      vertical: !!options?.series?.vertical,
      zeroPosition,
    };

    const seriesModels = this.renderSeries(bulletData, renderOptions);
    this.models.series = seriesModels;

    console.log(seriesModels);

    if (!this.drawModels) {
      this.drawModels = {
        series: seriesModels.map((m) => ({
          ...m,
          height: 0,
        })),
        selectedSeries: [],
      };
    }

    /*
    const BoxPlotModelData = this.makeBoxPlots(boxPlotData, renderOptions);
    const seriesModels = this.renderSeriesModels(BoxPlotModelData);

    this.models.series = seriesModels;

    if (!this.drawModels) {
      this.drawModels = {
        series: seriesModels.map((m) => {
          const model = { ...m };

          if (m.type === 'rect') {
            (model as RectModel).height = 0;
          }

          return model;
        }),
        selectedSeries: [],
      };
    }

    const tooltipDataArr = this.makeTooltipModel(boxPlotData, categories);

    this.responders = BoxPlotModelData.map((m, index) => {
      const point = m.type === 'boxPlot' ? { x: m.rect.x, y: m.rect.y } : { x: m.x, y: m.y };

      return {
        ...m,
        ...point,
        data: tooltipDataArr[index],
      };
    });
    */
  }

  onMousemove({ responders }) {
    this.eventBus.emit('renderHoveredSeries', responders);

    this.activatedResponders = responders;

    this.eventBus.emit('seriesPointHovered', this.activatedResponders);

    this.eventBus.emit('needDraw');
  }

  onClick({ responders }) {
    if (this.selectable) {
      this.drawModels.selectedSeries = responders;
      this.eventBus.emit('needDraw');
    }
  }

  renderSeries(bulletData: BulletSeriesType[], renderOptions: RenderOptions): RectModel[] {
    const { tickDistance, ratio, vertical, zeroPosition } = renderOptions;
    const seriesLength = bulletData.length;
    const padding = vertical ? PADDING.horizontal : PADDING.vertical;
    const barWidth = Math.max(
      (tickDistance - padding * (2 + (seriesLength - 1))) / seriesLength,
      tickDistance * 0.6
    );

    const bulletWidth = barWidth * 0.5;
    const seriesModels: RectModel[] = [];
    const qualitativeDefaultColors = ['#666666', '#999999', '#bbbbbb'];

    bulletData.forEach(({ data, ranges, markers, name, color }, seriesIndex) => {
      const seriesColor = this.getSeriesColor(name, color!);

      // ranges
      ranges.forEach((range, rangeIndex) => {
        const [start, end] = range;
        const barLength = (end - start) * ratio;
        const rangeStartX = seriesIndex * tickDistance + (tickDistance - barWidth) / 2;

        seriesModels.push({
          type: 'rect',
          name,
          color: qualitativeDefaultColors[rangeIndex],
          x: vertical ? rangeStartX : start * ratio + zeroPosition,
          y: vertical ? zeroPosition - end * ratio : rangeStartX,
          ...this.getRectSize(vertical, barWidth, barLength),
        });
      });

      // bullet
      const bulletLength = data * ratio;
      const bulletStartX = seriesIndex * tickDistance + (tickDistance - bulletWidth) / 2;

      seriesModels.push({
        type: 'rect',
        name,
        color: seriesColor,
        x: vertical ? bulletStartX : zeroPosition,
        y: vertical ? zeroPosition - bulletLength : bulletStartX,
        ...this.getRectSize(vertical, bulletWidth, bulletLength),
      });

      // markers
      const markerWidth = barWidth * 0.8;
      const markerLength = 4;
      const markerStartX = seriesIndex * tickDistance + (tickDistance - markerWidth) / 2;

      markers.forEach((marker) => {
        const dataPosition = marker * ratio - markerLength / 2;

        seriesModels.push({
          type: 'rect',
          name,
          color: seriesColor,
          x: vertical ? markerStartX : dataPosition + zeroPosition,
          y: vertical ? zeroPosition - dataPosition : markerStartX,
          ...this.getRectSize(vertical, markerWidth, markerLength),
        });
      });
    });

    return seriesModels;
  }
  /*
  renderSeriesModels(boxPlots: BoxPlotModelData): BoxPlotSeriesModel[] {
    const seriesModels: BoxPlotSeriesModel[] = [];

    boxPlots.forEach((model) => {
      const { color, type, name } = model;

      if (type === 'boxPlot') {
        ['rect', 'whisker', 'maximum', 'minimum', 'median'].forEach((prop) => {
          if (prop === 'rect') {
            seriesModels.push({
              type: 'rect',
              color,
              name,
              ...model[prop],
              style: [],
              thickness: 0,
            } as RectModel);
          } else {
            seriesModels.push({
              type: 'line',
              name,
              ...model[prop],
              strokeStyle: prop === 'median' ? '#ffffff' : color,
              lineWidth: 1,
            } as LineModel);
          }
        });
      } else {
        seriesModels.push({
          ...model,
          color: '#ffffff',
        } as CircleModel);
      }
    });

    return seriesModels;
  }

  makeBoxPlots(seriesData: BoxPlotSeriesType[], renderOptions: RenderOptions): BoxPlotModelData {
    const { ratio, boxWidth } = renderOptions;
    const HOVER_THICKNESS = 4;
    const boxPlotModels: BoxPlotModelData = [];

    seriesData.forEach(({ outliers = [], data, name, color }, seriesIndex) => {
      const seriesColor = this.getSeriesColor(name, color!);

      data.forEach((datum, dataIndex) => {
        const [minimum, lowerQuartile, median, highQuartile, maximum] = datum;
        const startX = this.getStartX(seriesIndex, dataIndex, renderOptions);

        boxPlotModels.push({
          type: 'boxPlot',
          color: seriesColor,
          name,
          rect: {
            x: startX,
            y: this.getYPos(highQuartile, ratio),
            width: boxWidth,
            height: (highQuartile - lowerQuartile) * ratio,
            style: ['shadow'],
            thickness: HOVER_THICKNESS,
          },
          median: {
            x: startX,
            y: this.getYPos(median, ratio),
            x2: startX + boxWidth,
            y2: this.getYPos(median, ratio),
            detectionDistance: 3,
          },
          whisker: {
            x: startX + boxWidth / 2,
            y: this.getYPos(minimum, ratio),
            x2: startX + boxWidth / 2,
            y2: this.getYPos(maximum, ratio),
            detectionDistance: 3,
          },
          minimum: {
            x: startX + boxWidth / 2 / 2,
            y: this.getYPos(minimum, ratio),
            x2: startX + boxWidth / 2 / 2 + boxWidth / 2,
            y2: this.getYPos(minimum, ratio),
            detectionDistance: 3,
          },
          maximum: {
            x: startX + boxWidth / 2 / 2,
            y: this.getYPos(maximum, ratio),
            x2: startX + boxWidth / 2 / 2 + boxWidth / 2,
            y2: this.getYPos(maximum, ratio),
            detectionDistance: 3,
          },
        });
      });

      outliers.forEach((datum) => {
        const [dataIndex, value] = datum;
        const startX = this.getStartX(seriesIndex, dataIndex, renderOptions);

        boxPlotModels.push({
          type: 'circle',
          name,
          x: startX + boxWidth / 2,
          y: this.getYPos(value, ratio),
          radius: 4,
          style: [{ strokeStyle: seriesColor, lineWidth: 2 }],
          color: seriesColor,
        });
      });
    });

    return boxPlotModels;
  }

  makeTooltipModel(seriesData: BoxPlotSeriesType[], categories: string[]): TooltipData[] {
    const tooltipData: TooltipData[] = [];

    seriesData.forEach(({ outliers = [], data, name, color }) => {
      data.forEach((datum, dataIndex) => {
        const [minimum, lowerQuartile, median, highQuartile, maximum] = datum;

        tooltipData.push({
          label: name,
          color: color!,
          value: [
            {
              title: 'Maximum',
              value: maximum,
            },
            {
              title: 'Upper Quartile',
              value: highQuartile,
            },
            {
              title: 'Median',
              value: median,
            },
            {
              title: 'Lower Quartile',
              value: lowerQuartile,
            },
            {
              title: 'Minimum',
              value: minimum,
            },
          ],
          category: categories[dataIndex],
        });
      });

      outliers.forEach((datum) => {
        const [dataIndex, dataValue] = datum;

        tooltipData.push({
          label: name,
          color: color!,
          value: [{ title: 'Outlier', value: dataValue }],
          category: categories[dataIndex],
        });
      });
    });

    return tooltipData;
  }
  */

  getSeriesColor(name: string, seriesColor: string) {
    const active = this.activeSeriesMap![name];

    return getRGBA(seriesColor, active ? seriesOpacity.ACTIVE : seriesOpacity.INACTIVE);
  }

  getRectSize(vertical: boolean, barWidth: number, barLength: number): Size {
    return {
      width: vertical ? barWidth : barLength,
      height: vertical ? barLength : barWidth,
    };
  }
}
