import Component from './component';
import { BoxPlotChartOptions, BoxPlotSeriesType } from '@t/options';
import { ChartState } from '@t/store/store';
import {
  BoxPlotSeriesModels,
  BoxPlotModel,
  BoxPlotResponderModel,
  CircleModel,
  CircleStyle,
  CircleResponderModel,
  RectModel,
} from '@t/components/series';
import { getActiveSeriesMap } from '@src/helpers/legend';
import { getRGBA } from '@src/helpers/color';
import { deepCopyArray } from '@src/helpers/utils';
import { TooltipData } from '@t/components/tooltip';
import { LineModel } from '@t/components/axis';

type RenderOptions = {
  ratio: number;
  tickDistance: number;
  boxWidth: number;
};

type ResponderModel = Array<BoxPlotResponderModel | CircleResponderModel>;

const seriesOpacity = {
  INACTIVE: 0.2,
  ACTIVE: 1,
};

const PADDING = 24;

export default class BoxPlotSeries extends Component {
  models: BoxPlotSeriesModels = { dot: [], rect: [], line: [], selectedSeries: [] };

  drawModels!: BoxPlotSeriesModels;

  responders!: ResponderModel;

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
      boxWidth: (tickDistance - PADDING * (2 + (seriesLength - 1))) / seriesLength,
    };

    const lineModels = this.renderLine(boxPlotData, renderOptions);
    const rectModels = this.renderRect(boxPlotData, renderOptions);
    const dotModels = this.renderOutlier(boxPlotData, renderOptions);
    const hoveredSeries = this.renderHoveredSeriesModel(rectModels, dotModels);

    this.models.rect = rectModels;
    this.models.line = lineModels;
    this.models.dot = dotModels;

    if (!this.drawModels) {
      this.drawModels = {
        rect: rectModels.map((m) => ({
          ...m,
          height: 0,
        })),
        line: deepCopyArray(lineModels),
        dot: deepCopyArray(dotModels),
        selectedSeries: [],
      };
    }

    const tooltipDataArr = this.makeTooltipModel(boxPlotData, categories);

    this.responders = hoveredSeries.map((m, index) => ({
      ...m,
      data: tooltipDataArr[index],
    })) as ResponderModel;
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

  renderHoveredSeriesModel(rectModels: BoxPlotModel[], dotModels: CircleModel[]) {
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

    const boxPlotModels = rectModels.map((data) => ({
      ...data,
      thickness: HOVER_THICKNESS,
      style,
    }));

    const outlierModels = dotModels.map((data) => ({
      ...data,
      color: (data.style![0] as CircleStyle).strokeStyle,
    }));

    return [...boxPlotModels, ...outlierModels];
  }

  makeTooltipModel(seriesData: BoxPlotSeriesType[], categories: string[]): TooltipData[] {
    const tooltipData: TooltipData[] = [];

    seriesData.forEach(({ outliers, data, name, color }) => {
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
        const [dataIndex, value] = datum;

        tooltipData.push({
          label: name,
          color: color!,
          value,
          category: categories[dataIndex],
        });
      });
    });

    return tooltipData;
  }

  renderRect(seriesData: BoxPlotSeriesType[], renderOptions: RenderOptions): RectModel[] {
    const { ratio, boxWidth } = renderOptions;

    return seriesData.flatMap(({ data, name, color }, seriesIndex) =>
      data.map((datum, dataIndex) => {
        const [, lowerQuartile, , highQuartile] = datum;
        const startX = this.getStartX(seriesIndex, dataIndex, renderOptions);

        return {
          type: 'rect',
          color: this.getSeriesColor(name, color!),
          name,
          x: startX,
          y: this.getYPos(highQuartile, ratio),
          width: boxWidth,
          height: (highQuartile - lowerQuartile) * ratio,
        };
      })
    );
  }

  renderLine(seriesData: BoxPlotSeriesType[], renderOptions: RenderOptions): LineModel[] {
    const { ratio, boxWidth } = renderOptions;
    const lineModels: LineModel[] = [];

    seriesData.forEach(({ data, name, color }, seriesIndex) => {
      const seriesColor = this.getSeriesColor(name, color!);
      data.forEach((datum, dataIndex) => {
        const [minimum, , median, , maximum] = datum;
        const startX = this.getStartX(seriesIndex, dataIndex, renderOptions);

        // whisker
        lineModels.push({
          type: 'line',
          lineWidth: 1,
          strokeStyle: seriesColor,
          x: startX + boxWidth / 2,
          y: this.getYPos(minimum, ratio),
          x2: startX + boxWidth / 2,
          y2: this.getYPos(maximum, ratio),
        });

        // maximum
        lineModels.push({
          type: 'line',
          lineWidth: 1,
          strokeStyle: seriesColor,
          x: startX + boxWidth / 2 / 2,
          y: this.getYPos(maximum, ratio),
          x2: startX + boxWidth / 2 / 2 + boxWidth / 2,
          y2: this.getYPos(maximum, ratio),
        });

        // minimum
        lineModels.push({
          type: 'line',
          lineWidth: 1,
          strokeStyle: seriesColor,
          x: startX + boxWidth / 2 / 2,
          y: this.getYPos(minimum, ratio),
          x2: startX + boxWidth / 2 / 2 + boxWidth / 2,
          y2: this.getYPos(minimum, ratio),
        });

        // median
        lineModels.push({
          type: 'line',
          lineWidth: 1,
          strokeStyle: '#ffffff',
          x: startX,
          y: this.getYPos(median, ratio),
          x2: startX + boxWidth,
          y2: this.getYPos(median, ratio),
        });
      });
    });

    return lineModels;
  }

  renderOutlier(seriesData: BoxPlotSeriesType[], renderOptions: RenderOptions): CircleModel[] {
    const { ratio, boxWidth } = renderOptions;

    return seriesData.flatMap(({ outliers, name, color }, seriesIndex) =>
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
}
