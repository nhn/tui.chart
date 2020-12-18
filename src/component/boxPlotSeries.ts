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
import { getBoxTypeSeriesPadding } from '@src/helpers/boxStyle';
import { BoxPlotChartSeriesTheme, BoxPlotLineTypeTheme, BoxPlotDotTheme } from '@t/theme';
import { isNumber } from '@src/helpers/utils';
import { crispPixel } from '@src/helpers/calculator';
import { SelectSeriesHandlerParams, SelectSeriesInfo } from '@src/charts/chart';
import { message } from '@src/message';

type RenderOptions = {
  ratio: number;
  tickDistance: number;
  barWidth: number;
  minMaxBarWidth: number;
};

type BoxPlotModelData = Array<BoxPlotModel | CircleModel>;

type TooltipRectMap = Record<string, BoxPlotResponderTypes[]>;

const MIN_BAR_WIDTH = 5;

function getPadding(tickDistance: number, barWidth: number, seriesLength: number) {
  return (tickDistance - barWidth * seriesLength) / (seriesLength + 1);
}

export default class BoxPlotSeries extends Component {
  models: BoxPlotSeriesModels = { series: [] };

  drawModels!: BoxPlotSeriesModels;

  responders!: BoxPlotResponderTypes[];

  activatedResponders: this['responders'] = [];

  eventDetectType: BoxTypeEventDetectType = 'point';

  tooltipRectMap!: TooltipRectMap;

  theme!: Required<BoxPlotChartSeriesTheme>;

  initialize() {
    this.type = 'series';
    this.name = 'boxPlot';
    this.eventBus.on('selectSeries', this.selectSeries);
    this.eventBus.on('showTooltip', this.showTooltip);
    this.eventBus.on('hideTooltip', this.onMouseoutComponent);
  }

  render(state: ChartState<BoxPlotChartOptions>): void {
    const { layout, axes, series, scale, legend, options, theme } = state;

    if (!series.boxPlot) {
      throw new Error(message.noDataError(this.name));
    }

    if (options?.series?.eventDetectType) {
      this.eventDetectType = options.series.eventDetectType;
    }

    this.theme = theme.series.boxPlot as Required<BoxPlotChartSeriesTheme>;
    this.rect = layout.plot;
    this.activeSeriesMap = getActiveSeriesMap(legend);
    this.selectable = this.getSelectableOption(options);

    const categories = state.categories as string[];
    const { tickDistance } = axes.xAxis;
    const { min, max } = scale.yAxis.limit;
    const boxPlotData = series.boxPlot.data;
    const seriesLength = boxPlotData.length;

    const renderOptions = {
      ratio: this.rect.height / (max - min),
      tickDistance,
      ...this.getBarWidths(tickDistance, seriesLength),
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
      };
    }

    const tooltipData = this.makeTooltipModel(boxPlotData, categories);
    this.tooltipRectMap = this.makeTooltipRectMap(boxPlotModelData, tooltipData);

    this.responders =
      this.eventDetectType === 'grouped'
        ? this.makeGroupedResponderModel(boxPlotModelData)
        : this.makeDefaultResponderModel(boxPlotModelData, tooltipData);
  }

  makeTooltipRectMap(boxPlotModelData: BoxPlotModelData, tooltipData: TooltipData[]) {
    const result: TooltipRectMap = {};

    boxPlotModelData.forEach((m, tooltipIndex) => {
      const propName = `${m.name}-${m.index}`;

      if (!result[propName]) {
        result[propName] = [];
      }

      result[propName].push({
        ...this.makeHoveredModel(m),
        data: tooltipData[tooltipIndex],
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
      color: getRGBA(m.color, 1),
    }));
  }

  makeHoveredModel(model: BoxPlotModel | CircleModel) {
    const point =
      model.type === 'boxPlot' ? { x: model.rect.x, y: model.rect.y } : { x: model.x, y: model.y };
    const hoveredModel = { ...model };

    if (model.type === 'boxPlot') {
      ['lowerWhisker', 'upperWhisker', 'maximum', 'minimum', 'median'].forEach((prop) => {
        model[prop].detectionSize = 3;
      });
    }

    return {
      ...hoveredModel,
      ...point,
      color: getRGBA(hoveredModel.color, 1),
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
    console.log(responders);

    if (this.eventDetectType === 'grouped') {
      const models = this.getResponderModelFromMap(responders);
      this.eventBus.emit('renderHoveredSeries', {
        models,
        name: this.name,
        eventDetectType: this.eventDetectType,
      });
      this.activatedResponders = models;
    } else {
      this.eventBus.emit('renderHoveredSeries', {
        models: this.getRespondersWithTheme(responders, 'hover'),
        name: this.name,
        eventDetectType: this.eventDetectType,
      });

      this.activatedResponders = responders;
    }

    this.eventBus.emit('seriesPointHovered', { models: this.activatedResponders, name: this.name });

    this.eventBus.emit('needDraw');
  }

  onClick({ responders }) {
    if (this.selectable) {
      let models;
      if (this.eventDetectType === 'grouped') {
        models = this.getResponderModelFromMap(responders);
      } else {
        models = this.getRespondersWithTheme(responders, 'select');
      }

      this.eventBus.emit('renderSelectedSeries', {
        models,
        name: this.name,
        eventDetectType: this.eventDetectType,
      });
      this.eventBus.emit('needDraw');
    }
  }

  renderSeriesModels(boxPlots: BoxPlotModelData): BoxPlotSeriesModel[] {
    const seriesModels: BoxPlotSeriesModel[] = [];

    boxPlots.forEach((model) => {
      const { type, name } = model;

      if (type === 'boxPlot') {
        ['maximum', 'minimum', 'rect', 'median', 'upperWhisker', 'lowerWhisker'].forEach((prop) => {
          seriesModels.push({
            name,
            ...model[prop],
          });
        });
      } else {
        seriesModels.push({
          ...model,
        } as CircleModel);
      }
    });

    return seriesModels;
  }

  makeBoxPlots(seriesData: BoxPlotSeriesType[], renderOptions: RenderOptions): BoxPlotModelData {
    const { ratio, barWidth } = renderOptions;
    const boxPlotModels: BoxPlotModelData = [];
    const seriesLength = seriesData.length;
    const { dot } = this.theme;

    seriesData.forEach(({ outliers = [], data, name, color }, seriesIndex) => {
      const seriesColor = this.getSeriesColor(name, color!);

      data.forEach((datum, dataIndex) => {
        const startX = this.getStartX(seriesIndex, dataIndex, renderOptions, seriesLength);
        const rect = this.getRect(datum, startX, seriesColor, renderOptions);

        boxPlotModels.push({
          type: 'boxPlot',
          color: seriesColor,
          name,
          rect,
          median: this.getMedian(datum, startX, seriesColor, renderOptions),
          minimum: this.getMinimum(datum, startX, seriesColor, renderOptions),
          maximum: this.getMaximum(datum, startX, seriesColor, renderOptions),
          ...this.getWhisker(datum, startX, seriesColor, renderOptions, rect),
          index: dataIndex,
        });
      });

      const { color: dotColor, radius, borderColor, borderWidth, useSeriesColor } = dot as Required<
        BoxPlotDotTheme
      >;
      outliers.forEach((datum) => {
        const [dataIndex, value] = datum;
        const startX = this.getStartX(seriesIndex, dataIndex, renderOptions, seriesLength);

        boxPlotModels.push({
          type: 'circle',
          name,
          x: startX + barWidth / 2,
          y: this.getYPos(value, ratio),
          radius: radius!,
          style: [{ strokeStyle: borderColor, lineWidth: borderWidth }],
          color: useSeriesColor ? seriesColor : dotColor,
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

  getStartX(
    seriesIndex: number,
    dataIndex: number,
    renderOptions: RenderOptions,
    seriesLength: number
  ) {
    const { tickDistance, barWidth } = renderOptions;
    const padding = getPadding(tickDistance, barWidth, seriesLength);

    return dataIndex * tickDistance + (seriesIndex + 1) * padding + barWidth * seriesIndex;
  }

  getYPos(value: number, ratio: number, lineWidth?: number) {
    return isNumber(lineWidth)
      ? crispPixel(this.rect.height - value * ratio, lineWidth)
      : this.rect.height - value * ratio;
  }

  onMouseoutComponent = () => {
    this.eventBus.emit('seriesPointHovered', { models: [], name: this.name });
    this.eventBus.emit('renderHoveredSeries', {
      models: [],
      name: this.name,
      eventDetectType: this.eventDetectType,
    });

    this.eventBus.emit('needDraw');
  };

  getBarWidths(tickDistance: number, seriesLength: number) {
    const { barWidth: barThemeWidth, barWidthRatios } = this.theme;
    const { barRatio, minMaxBarRatio } = barWidthRatios;
    const defaultBarWidth = Math.max(
      (tickDistance - getBoxTypeSeriesPadding(tickDistance) * (2 + (seriesLength - 1))) /
        seriesLength,
      MIN_BAR_WIDTH
    );
    const barWidth = isNumber(barThemeWidth) ? barThemeWidth : defaultBarWidth;

    return {
      barWidth: barWidth * barRatio!,
      minMaxBarWidth: barWidth * minMaxBarRatio!,
    };
  }

  getRespondersWithTheme(responders: BoxPlotResponderTypes[], type: 'hover' | 'select') {
    const {
      color,
      rect,
      dot,
      line,
      shadowColor,
      shadowOffsetX,
      shadowOffsetY,
      shadowBlur,
    } = this.theme[type];
    const { whisker, median, maximum, minimum } = line as Required<BoxPlotLineTypeTheme>;
    const { color: dotColor, radius, borderColor, borderWidth, useSeriesColor } = dot as Required<
      BoxPlotDotTheme
    >;

    return responders.map((m) => {
      const seriesColor = m.color;
      let model;

      if (m.type === 'circle') {
        model = {
          ...m,
          radius,
          color: useSeriesColor ? seriesColor : dotColor,
          style: [{ strokeStyle: borderColor ?? seriesColor, lineWidth: borderWidth }],
        };
      } else {
        model = {
          ...m,
          rect: {
            ...(m as BoxPlotModel).rect,
            color: color ?? (m as BoxPlotModel).color,
            thickness: rect!.borderWidth,
            borderColor: rect!.borderColor,
            style: [{ shadowColor, shadowOffsetX, shadowOffsetY, shadowBlur }],
          },
          upperWhisker: {
            ...(m as BoxPlotModel).upperWhisker,
            strokeStyle: whisker.color ?? seriesColor,
            lineWidth: whisker.lineWidth,
          },
          lowerWhisker: {
            ...(m as BoxPlotModel).lowerWhisker,
            strokeStyle: whisker.color ?? seriesColor,
            lineWidth: whisker.lineWidth,
          },
          median: {
            ...(m as BoxPlotModel).median,
            strokeStyle: median.color ?? seriesColor,
            lineWidth: median.lineWidth,
          },
          maximum: {
            ...(m as BoxPlotModel).maximum,
            strokeStyle: maximum.color ?? seriesColor,
            lineWidth: maximum.lineWidth,
          },
          minimum: {
            ...(m as BoxPlotModel).minimum,
            strokeStyle: minimum.color ?? seriesColor,
            lineWidth: minimum.lineWidth,
          },
        };
      }

      return model;
    });
  }

  getRect(
    datum: number[],
    startX: number,
    seriesColor: string,
    { barWidth, ratio }: RenderOptions
  ): RectModel {
    const { rect } = this.theme;
    const [, lowerQuartile, , highQuartile] = datum;

    return {
      type: 'rect',
      x: startX,
      y: this.getYPos(highQuartile, ratio),
      width: barWidth,
      height: (highQuartile - lowerQuartile) * ratio,
      thickness: rect.borderWidth!,
      borderColor: rect.borderColor!,
      color: seriesColor,
    };
  }

  getWhisker(
    datum: number[],
    startX: number,
    seriesColor: string,
    { barWidth, ratio }: RenderOptions,
    { height: rectHeight, y: rectY }: RectModel
  ): Record<'upperWhisker' | 'lowerWhisker', LineModel> {
    const [minimum, , , , maximum] = datum;
    const { lineWidth, color } = this.theme.line.whisker!;
    const x = crispPixel(startX + barWidth / 2, lineWidth);

    return {
      upperWhisker: {
        type: 'line',
        x,
        y: this.getYPos(maximum, ratio, lineWidth),
        x2: x,
        y2: rectY,
        strokeStyle: color ?? seriesColor,
        lineWidth: lineWidth,
      },
      lowerWhisker: {
        type: 'line',
        x,
        y: this.getYPos(minimum, ratio, lineWidth),
        x2: x,
        y2: crispPixel(rectY + rectHeight, lineWidth),
        strokeStyle: color ?? seriesColor,
        lineWidth: lineWidth,
      },
    };
  }

  getMedian(
    datum: number[],
    startX: number,
    seriesColor: string,
    { barWidth, ratio }: RenderOptions
  ): LineModel {
    const median = datum[2];
    const { lineWidth, color } = this.theme.line.median!;

    return {
      type: 'line',
      x: crispPixel(startX, lineWidth),
      y: this.getYPos(median, ratio, lineWidth),
      x2: crispPixel(startX + barWidth, lineWidth),
      y2: this.getYPos(median, ratio, lineWidth),
      strokeStyle: color ?? seriesColor,
      lineWidth: lineWidth,
    };
  }

  getMinimum(
    datum: number[],
    startX: number,
    seriesColor: string,
    { barWidth, ratio, minMaxBarWidth }: RenderOptions
  ): LineModel {
    const minimum = datum[0];
    const { lineWidth, color } = this.theme.line.minimum!;

    return {
      type: 'line',
      x: crispPixel(startX + (barWidth - minMaxBarWidth) / 2, lineWidth),
      y: this.getYPos(minimum, ratio, lineWidth),
      x2: crispPixel(startX + (barWidth - minMaxBarWidth) / 2 + minMaxBarWidth, lineWidth),
      y2: this.getYPos(minimum, ratio, lineWidth),
      strokeStyle: color ?? seriesColor,
      lineWidth: lineWidth,
    };
  }

  getMaximum(
    datum: number[],
    startX: number,
    seriesColor: string,
    { barWidth, ratio, minMaxBarWidth }: RenderOptions
  ): LineModel {
    const maximum = datum[4];
    const { lineWidth, color } = this.theme.line.maximum!;

    return {
      type: 'line',
      x: crispPixel(startX + (barWidth - minMaxBarWidth) / 2, lineWidth),
      y: this.getYPos(maximum, ratio, lineWidth),
      x2: crispPixel(startX + (barWidth - minMaxBarWidth) / 2 + minMaxBarWidth, lineWidth),
      y2: this.getYPos(maximum, ratio, lineWidth),
      strokeStyle: color ?? seriesColor,
      lineWidth: lineWidth,
    };
  }

  getSeriesColor(seriesName: string, seriesColor: string) {
    const { select, areaOpacity } = this.theme;
    const active = this.activeSeriesMap![seriesName];
    const selected = Object.values(this.activeSeriesMap!).some((elem) => !elem);
    const selectedOpacity = active ? select.areaOpacity! : select.restSeries!.areaOpacity!;
    const opacity = selected ? selectedOpacity : areaOpacity;

    return getRGBA(seriesColor, opacity);
  }

  selectSeries = ({
    index,
    seriesIndex,
    state,
  }: SelectSeriesHandlerParams<BoxPlotChartOptions>) => {
    if (!isNumber(index) || !isNumber(seriesIndex)) {
      return;
    }

    const { name } = state.series.boxPlot![seriesIndex];
    const models = this.getRespondersWithTheme(this.tooltipRectMap[`${name}-${index}`], 'select');

    this.eventBus.emit('renderSelectedSeries', {
      models,
      name: this.name,
      eventDetectType: this.eventDetectType,
    });
    this.eventBus.emit('needDraw');
  };

  showTooltip = ({ index, seriesIndex, state }: SelectSeriesHandlerParams<BoxPlotChartOptions>) => {
    if (!isNumber(index) || !isNumber(seriesIndex)) {
      return;
    }

    const { name } = state.series.boxPlot![seriesIndex];
    const models = this.getRespondersWithTheme(this.tooltipRectMap[`${name}-${index}`], 'hover');

    this.eventBus.emit('renderHoveredSeries', {
      models,
      name: this.name,
      eventDetectType: this.eventDetectType,
    });

    this.activatedResponders = models;
    this.eventBus.emit('seriesPointHovered', { models: this.activatedResponders, name: this.name });
    this.eventBus.emit('needDraw');
  };
}
