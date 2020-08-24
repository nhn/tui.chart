import Component from './component';
import { BoxPlotChartOptions, BoxPlotSeriesType } from '@t/options';
import { ChartState } from '@t/store/store';
import {
  BoxPlotSeriesModels,
  BoxPlotResponderModel,
  CircleStyle,
  CircleResponderModel,
  RectModel,
  CircleModel,
  BoxPlotSeriesModel,
} from '@t/components/series';
import { getActiveSeriesMap } from '@src/helpers/legend';
import { deepCopyArray } from '@src/helpers/utils';
import { TooltipData } from '@t/components/tooltip';
import { getRGBA } from '@src/helpers/color';

type RenderOptions = {
  ratio: number;
  tickDistance: number;
  boxWidth: number;
};

type ResponderModels = Array<BoxPlotResponderModel | CircleResponderModel>;

const seriesOpacity = {
  INACTIVE: 0.2,
  ACTIVE: 1,
};

const PADDING = 24;

export default class BoxPlotSeries extends Component {
  models: BoxPlotSeriesModels = { dot: [], series: [], selectedSeries: [] };

  drawModels!: BoxPlotSeriesModels;

  responders!: ResponderModels;

  activatedResponders: this['responders'] = [];

  initialize() {
    this.type = 'series';
    this.name = 'boxPlotSeries';
  }

  render(state: ChartState<BoxPlotChartOptions>): void {
    const { layout, axes, series, scale, legend, options, categories = [] } = state;

    if (!series.boxPlot) {
      throw new Error("There's no boxplot data!");
    }

    this.rect = layout.plot;
    this.activeSeriesMap = getActiveSeriesMap(legend);
    this.selectable = this.getSelectableOption(options);

    const { tickDistance } = axes.xAxis;
    const { min, max } = scale.yAxis.limit;
    const boxPlotData = series.boxPlot.data;
    const seriesLength = boxPlotData.length;

    const renderOptions = {
      ratio: this.rect.height / (max - min),
      tickDistance,
      boxWidth: Math.max((tickDistance - PADDING * (2 + (seriesLength - 1))) / seriesLength, 5),
    };

    const seriesModels = this.renderBoxPlot(boxPlotData, renderOptions);
    const dotModels = this.renderOutlier(boxPlotData, renderOptions);
    const hoveredSeries = this.renderHoveredBoxPlot(boxPlotData, renderOptions);
    this.models.series = seriesModels;
    this.models.dot = dotModels;

    if (!this.drawModels) {
      this.drawModels = {
        series: seriesModels.map((m) => {
          const model = { ...m };

          if (m.type === 'rect') {
            (model as RectModel).height = 0;
          }

          return model;
        }),
        dot: deepCopyArray(dotModels),
        selectedSeries: [],
      };
    }

    const tooltipDataArr = this.makeTooltipModel(boxPlotData, categories);

    this.responders = hoveredSeries.map((m, index) => ({
      ...m,
      data: tooltipDataArr[index],
    })) as BoxPlotResponderModel[];
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

  renderHoveredBoxPlot(
    seriesData: BoxPlotSeriesType[],
    renderOptions: RenderOptions
  ): ResponderModels {
    const { ratio, boxWidth } = renderOptions;
    const HOVER_THICKNESS = 4;
    const hoveredSeries: ResponderModels = [];

    seriesData.forEach(({ outliers = [], data, name, color }, seriesIndex) => {
      const seriesColor = this.getSeriesColor(name, color!);

      data.forEach((datum, dataIndex) => {
        const [minimum, lowerQuartile, median, highQuartile, maximum] = datum;
        const startX = this.getStartX(seriesIndex, dataIndex, renderOptions);

        hoveredSeries.push({
          type: 'boxPlot',
          x: startX,
          y: this.getYPos(highQuartile, ratio),
          rect: {
            x: startX,
            y: this.getYPos(highQuartile, ratio),
            width: boxWidth,
            height: (highQuartile - lowerQuartile) * ratio,
            color: seriesColor,
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
        } as BoxPlotResponderModel);
      });

      outliers.forEach((datum) => {
        const [dataIndex, value] = datum;
        const startX = this.getStartX(seriesIndex, dataIndex, renderOptions);

        hoveredSeries.push({
          type: 'circle',
          name,
          x: startX + boxWidth / 2,
          y: this.getYPos(value, ratio),
          radius: 4,
          style: [{ strokeStyle: seriesColor, lineWidth: 2 }],
          color: seriesColor,
        } as CircleResponderModel);
      });
    });

    return hoveredSeries;
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

  renderBoxPlot(
    seriesData: BoxPlotSeriesType[],
    renderOptions: RenderOptions
  ): BoxPlotSeriesModel[] {
    const { ratio, boxWidth } = renderOptions;
    const seriesModels: BoxPlotSeriesModel[] = [];

    seriesData.forEach(({ data, name, color }, seriesIndex) => {
      const seriesColor = this.getSeriesColor(name, color!);
      data.forEach((datum, dataIndex) => {
        const [minimum, lowerQuartile, median, highQuartile, maximum] = datum;
        const startX = this.getStartX(seriesIndex, dataIndex, renderOptions);

        seriesModels.push({
          type: 'rect',
          color: seriesColor,
          name,
          x: startX,
          y: this.getYPos(highQuartile, ratio),
          width: boxWidth,
          height: (highQuartile - lowerQuartile) * ratio,
        });

        // whisker
        seriesModels.push({
          type: 'line',
          lineWidth: 1,
          strokeStyle: seriesColor,
          x: startX + boxWidth / 2,
          y: this.getYPos(minimum, ratio),
          x2: startX + boxWidth / 2,
          y2: this.getYPos(maximum, ratio),
          name,
        });

        // maximum
        seriesModels.push({
          type: 'line',
          lineWidth: 1,
          strokeStyle: seriesColor,
          x: startX + boxWidth / 2 / 2,
          y: this.getYPos(maximum, ratio),
          x2: startX + boxWidth / 2 / 2 + boxWidth / 2,
          y2: this.getYPos(maximum, ratio),
          name,
        });

        // minimum
        seriesModels.push({
          type: 'line',
          lineWidth: 1,
          strokeStyle: seriesColor,
          x: startX + boxWidth / 2 / 2,
          y: this.getYPos(minimum, ratio),
          x2: startX + boxWidth / 2 / 2 + boxWidth / 2,
          y2: this.getYPos(minimum, ratio),
          name,
        });

        // median
        seriesModels.push({
          type: 'line',
          lineWidth: 1,
          strokeStyle: '#ffffff',
          x: startX,
          y: this.getYPos(median, ratio),
          x2: startX + boxWidth,
          y2: this.getYPos(median, ratio),
          name,
        });
      });
    });

    return seriesModels;
  }

  renderOutlier(seriesData: BoxPlotSeriesType[], renderOptions: RenderOptions): CircleModel[] {
    const { ratio, boxWidth } = renderOptions;

    return seriesData.flatMap(({ outliers = [], name, color }, seriesIndex) =>
      outliers.map((datum) => {
        const [dataIndex, value] = datum;
        const startX = this.getStartX(seriesIndex, dataIndex, renderOptions);

        return {
          type: 'circle',
          color: '#ffffff',
          name,
          x: startX + boxWidth / 2,
          y: this.getYPos(value, ratio),
          radius: 4,
          style: [{ strokeStyle: this.getSeriesColor(name, color!), lineWidth: 2 }],
        };
      })
    );
  }

  getSeriesColor(name: string, seriesColor: string) {
    const active = this.activeSeriesMap![name];

    return getRGBA(seriesColor, active ? seriesOpacity.ACTIVE : seriesOpacity.INACTIVE);
  }

  getStartX(seriesIndex: number, dataIndex: number, renderOptions: RenderOptions) {
    const { tickDistance, boxWidth } = renderOptions;

    return (
      seriesIndex * boxWidth + PADDING + dataIndex * tickDistance + (seriesIndex ? PADDING : 0)
    );
  }

  getYPos(value: number, ratio: number) {
    return this.rect.height - value * ratio;
  }

  renderHoveredSeriesModel(seriesModels: BoxPlotSeriesModel[], dotModels: CircleModel[]) {
    const HOVER_THICKNESS = 4;
    const shadowOffset = HOVER_THICKNESS / 2;
    const style = [
      {
        shadowColor: 'rgba(0, 0, 0, 0.3)',
        shadowOffsetX: shadowOffset,
        shadowOffsetY: shadowOffset * -1,
        shadowBlur: HOVER_THICKNESS + shadowOffset,
      },
    ];

    const boxPlots = seriesModels.map((m) => {
      const model = { ...m };

      if (m.type === 'rect') {
        (model as RectModel).style = style;
        (model as RectModel).thickness = HOVER_THICKNESS;
      }

      return model;
    });

    const outliers = dotModels.map((m) => ({
      ...m,
      color: (m.style![0] as CircleStyle).strokeStyle,
    }));

    return [...boxPlots, ...outliers];
  }
}
