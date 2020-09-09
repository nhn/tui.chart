import Component from './component';
import { BoxPlotSeriesType, BoxPlotChartOptions, BoxTypeEventDetectType } from '@t/options';
import { ChartState } from '@t/store/store';
import {
  BoxPlotSeriesModels,
  BoxPlotResponderModel,
  RectModel,
  CircleModel,
  BoxPlotSeriesModel,
  BoxPlotModel,
  RectResponderModel,
  BoxPlotResponderTypes,
} from '@t/components/series';
import { getActiveSeriesMap } from '@src/helpers/legend';
import { TooltipData } from '@t/components/tooltip';
import { getRGBA } from '@src/helpers/color';
import { LineModel } from '@t/components/axis';
import { BOX_SERIES_PADDING, BOX_HOVER_THICKNESS } from '@src/helpers/boxStyle';

type RenderOptions = {
  ratio: number;
  tickDistance: number;
  boxWidth: number;
};

type BoxPlotModelData = Array<BoxPlotModel | CircleModel>;

const seriesOpacity = {
  INACTIVE: 0.2,
  ACTIVE: 1,
};

const MIN_BAR_WIDTH = 5;

export default class BoxPlotSeries extends Component {
  models: BoxPlotSeriesModels = { series: [], selectedSeries: [] };

  drawModels!: BoxPlotSeriesModels;

  responders!: BoxPlotResponderTypes[];

  activatedResponders: this['responders'] = [];

  eventType: BoxTypeEventDetectType = 'nearest';

  tooltipRectMap!: Record<string, BoxPlotResponderTypes[]>;

  initialize() {
    this.type = 'series';
    this.name = 'boxPlot';
  }

  render(state: ChartState<BoxPlotChartOptions>): void {
    const { layout, axes, series, scale, legend, options, categories = [] } = state;

    if (!series.boxPlot) {
      throw new Error("There's no boxPlot data!");
    }

    if (options?.series?.eventDetectType) {
      this.eventType = options.series.eventDetectType;
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
      boxWidth: Math.max(
        (tickDistance - BOX_SERIES_PADDING.horizontal * (2 + (seriesLength - 1))) / seriesLength,
        MIN_BAR_WIDTH
      ),
    };

    const boxPlotModelData = this.makeBoxPlots(boxPlotData, renderOptions);
    const seriesModels = this.renderSeriesModels(boxPlotModelData);

    this.models.series = seriesModels;

    if (!this.drawModels) {
      this.drawModels = {
        series: seriesModels.map((m) => {
          const model = { ...m };

          if (m.type === 'rect') {
            (model as RectModel).y = m.y + m.height;
            (model as RectModel).height = 0;
          }

          return model;
        }),
        selectedSeries: [],
      };
    }

    const tooltipDataArr = this.makeTooltipModel(boxPlotData, categories);
    this.tooltipRectMap = this.makeTooltipRectMap(boxPlotModelData, tooltipDataArr);

    this.responders =
      this.eventType === 'grouped'
        ? this.makeGroupedResponderModel(boxPlotModelData)
        : this.makeDefaultResponderModel(boxPlotModelData, tooltipDataArr);
  }

  makeTooltipRectMap(boxPlotModelData: BoxPlotModelData, tooltipDataArr: TooltipData[]) {
    const result: Record<string, BoxPlotResponderTypes[]> = {};

    boxPlotModelData.forEach((m, tooltipIndex) => {
      const { index, name } = m;
      const propName = `${name}-${index}`;

      if (!result[propName]) {
        result[propName] = [];
      }

      result[propName].push({
        ...this.makeHoveredModel(m),
        data: tooltipDataArr[tooltipIndex],
      } as BoxPlotResponderModel);
    });

    return result;
  }

  makeGroupedResponderModel(boxPlotModelData: BoxPlotModelData) {
    const { height: rectHeight } = this.rect;
    const result: RectResponderModel[] = [];

    boxPlotModelData.forEach((m) => {
      const { type, index, name } = m;
      const propName = `${name}-${index}`;

      if (type === 'boxPlot' && !result[propName]) {
        const { x, width } = (m as BoxPlotModel).rect;

        result.push({
          type: 'rect',
          x,
          y: 0,
          width,
          height: rectHeight,
          name: propName,
        });
      }
    });

    return result;
  }

  makeDefaultResponderModel(boxPlotModelData: BoxPlotModelData, tooltipDataArr: TooltipData[]) {
    return boxPlotModelData.map((m, index) => ({
      ...this.makeHoveredModel(m),
      data: tooltipDataArr[index],
    }));
  }

  makeHoveredModel(m: BoxPlotModel | CircleModel) {
    const point = m.type === 'boxPlot' ? { x: m.rect.x, y: m.rect.y } : { x: m.x, y: m.y };
    const model = { ...m };

    if (m.type === 'boxPlot') {
      ['rect', 'whisker', 'maximum', 'minimum', 'median'].forEach((prop) => {
        if (prop === 'rect') {
          model[prop].style = ['shadow'];
          model[prop].thickness = BOX_HOVER_THICKNESS;
        } else {
          model[prop].detectionSize = 3;
        }
      });
    }

    return {
      ...model,
      ...point,
    };
  }

  getResponderModelFromMap(responders: BoxPlotResponderTypes[]) {
    if (!responders.length) {
      return [];
    }
    const propName = responders[0].name!;

    return this.tooltipRectMap[propName];
  }

  onMousemove({ responders }) {
    if (this.eventType === 'grouped') {
      const models = this.getResponderModelFromMap(responders);
      this.eventBus.emit('renderHoveredSeries', {
        models,
        name: this.name,
        eventType: this.eventType,
      });
      this.activatedResponders = models;
    } else {
      this.eventBus.emit('renderHoveredSeries', {
        models: responders,
        name: this.name,
        eventType: this.eventType,
      });

      this.activatedResponders = responders;
    }

    this.eventBus.emit('seriesPointHovered', { models: this.activatedResponders, name: this.name });

    this.eventBus.emit('needDraw');
  }

  onClick({ responders }) {
    if (this.selectable) {
      if (this.eventType === 'grouped') {
        this.drawModels.selectedSeries = this.getResponderModelFromMap(responders);
      } else {
        this.drawModels.selectedSeries = responders;
      }

      this.eventBus.emit('needDraw');
    }
  }

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
        seriesModels.push({ ...model, color: '#ffffff' } as CircleModel);
      }
    });

    return seriesModels;
  }

  makeBoxPlots(seriesData: BoxPlotSeriesType[], renderOptions: RenderOptions): BoxPlotModelData {
    const { ratio, boxWidth } = renderOptions;
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
          },
          median: {
            x: startX,
            y: this.getYPos(median, ratio),
            x2: startX + boxWidth,
            y2: this.getYPos(median, ratio),
          },
          whisker: {
            x: startX + boxWidth / 2,
            y: this.getYPos(minimum, ratio),
            x2: startX + boxWidth / 2,
            y2: this.getYPos(maximum, ratio),
          },
          minimum: {
            x: startX + boxWidth / 2 / 2,
            y: this.getYPos(minimum, ratio),
            x2: startX + boxWidth / 2 / 2 + boxWidth / 2,
            y2: this.getYPos(minimum, ratio),
          },
          maximum: {
            x: startX + boxWidth / 2 / 2,
            y: this.getYPos(maximum, ratio),
            x2: startX + boxWidth / 2 / 2 + boxWidth / 2,
            y2: this.getYPos(maximum, ratio),
          },
          index: dataIndex,
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
          index: dataIndex,
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
            { title: 'Maximum', value: maximum },
            { title: 'Upper Quartile', value: highQuartile },
            { title: 'Median', value: median },
            { title: 'Lower Quartile', value: lowerQuartile },
            { title: 'Minimum', value: minimum },
          ],
          category: categories[dataIndex],
          templateType: 'boxPlot',
        });
      });

      outliers.forEach((datum) => {
        const [dataIndex, dataValue] = datum;

        tooltipData.push({
          label: name,
          color: color!,
          value: [{ title: 'Outlier', value: dataValue }],
          category: categories[dataIndex],
          templateType: 'boxPlot',
        });
      });
    });

    return tooltipData;
  }

  getSeriesColor(name: string, seriesColor: string) {
    const active = this.activeSeriesMap![name];

    return getRGBA(seriesColor, active ? seriesOpacity.ACTIVE : seriesOpacity.INACTIVE);
  }

  getStartX(seriesIndex: number, dataIndex: number, renderOptions: RenderOptions) {
    const { tickDistance, boxWidth } = renderOptions;

    return (
      seriesIndex * boxWidth +
      BOX_SERIES_PADDING.horizontal +
      dataIndex * tickDistance +
      (seriesIndex ? BOX_SERIES_PADDING.horizontal : 0)
    );
  }

  getYPos(value: number, ratio: number) {
    return this.rect.height - value * ratio;
  }

  onMouseoutComponent() {
    this.eventBus.emit('seriesPointHovered', { models: [], name: this.name });
    this.eventBus.emit('renderHoveredSeries', {
      models: [],
      name: this.name,
      eventType: this.eventType,
    });

    this.eventBus.emit('needDraw');
  }
}
