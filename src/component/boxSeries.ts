import Component from './component';
import { RectModel, ClipRectAreaModel } from '@t/components/series';
import { ChartState, ChartType, SeriesData, BoxType } from '@t/store/store';
import {
  BoxSeriesType,
  BoxSeriesDataType,
  BarChartOptions,
  ColumnChartOptions,
  Rect,
} from '@t/options';
import { first, includes, hasNegative, deepCopyArray, last } from '@src/helpers/utils';
import { TooltipData } from '@t/components/tooltip';
import { LineModel } from '@t/components/axis';
import { makeTickPixelPositions } from '@src/helpers/calculator';
import { getRGBA, getAlpha } from '@src/helpers/color';
import { isRangeData, isRangeValue } from '@src/helpers/range';
import { getLimitOnAxis } from '@src/helpers/axes';

type DrawModels = {
  clipRect?: ClipRectAreaModel[];
  series: RectModel[];
  hoveredSeries?: RectModel[];
  connector?: LineModel[];
};

export type SeriesRawData = BoxSeriesType<BoxSeriesDataType>[];

type RenderOptions = {
  min: number;
  max: number;
  diverging: boolean;
  ratio: number;
};

const BOX = {
  BAR: 'bar',
  COLUMN: 'column',
};

const PADDING = {
  TB: 15, // top & bottom
  LR: 24, // left & right
};

function isLeftBottomSide(seriesIndex: number) {
  return !!(seriesIndex % 2);
}

function calibrateDrawingValue(value: BoxSeriesDataType, min: number, max: number): number {
  if (isRangeValue(value)) {
    const [start, end] = value;

    return end - start;
  }

  if (value >= 0) {
    if (max < value) {
      value = max;
    }

    if (min > 0) {
      value -= min;
    }
  } else {
    if (value < min) {
      value = min;
    }

    if (max < 0) {
      value -= max;
    }

    value = Math.abs(value);
  }

  return value;
}

export function isBoxSeries(seriesName: ChartType): seriesName is BoxType {
  return includes(Object.values(BOX), seriesName);
}

export default class BoxSeries extends Component {
  models: DrawModels = { series: [] };

  drawModels!: DrawModels;

  responders!: RectModel[];

  activatedResponders: this['responders'] = [];

  padding = PADDING.TB;

  isBar = true;

  name = BOX.BAR;

  valueAxis = 'xAxis';

  labelAxis = 'yAxis';

  anchorSizeKey = 'height';

  offsetSizeKey = 'width';

  hoverThickness = 4;

  axisThickness = 1;

  plot!: Rect;

  basePosition = this.hoverThickness;

  isRangeData = false;

  initialize({ name }: { name: BoxType }) {
    this.type = 'series';
    this.name = name;
    this.isBar = name === BOX.BAR;
    this.padding = this.isBar ? PADDING.TB : PADDING.LR;
    this.valueAxis = this.isBar ? 'xAxis' : 'yAxis';
    this.labelAxis = this.isBar ? 'yAxis' : 'xAxis';
    this.anchorSizeKey = this.isBar ? 'height' : 'width';
    this.offsetSizeKey = this.isBar ? 'width' : 'height';
  }

  update(delta: number) {
    if (!this.drawModels) {
      return;
    }

    const offsetKey = this.isBar ? 'x' : 'y';
    const { clipRect, series, connector } = this.drawModels;

    if (this.isRangeData) {
      const modelSeries = this.models.series;

      series.forEach((drawModel, index) => {
        const targetModel = modelSeries[index];
        const offsetSize = targetModel[this.offsetSizeKey] * delta;

        drawModel[this.offsetSizeKey] = offsetSize;

        if (!this.isBar) {
          drawModel[offsetKey] =
            targetModel[offsetKey] + targetModel[this.offsetSizeKey] - offsetSize;
        }
      });

      return;
    }

    if (clipRect) {
      clipRect[0][this.offsetSizeKey] = this.rect[this.offsetSizeKey] * delta;
      clipRect[0][offsetKey] = this.basePosition * (1 - delta);
    }

    if (connector) {
      const modelConnector = this.models.connector!;

      connector.forEach((drawModel, index) => {
        const alpha = getAlpha(modelConnector[index].strokeStyle!) * delta;

        drawModel.strokeStyle = getRGBA(drawModel.strokeStyle!, alpha);
      });
    }
  }

  render<T extends BarChartOptions | ColumnChartOptions>(chartState: ChartState<T>) {
    const { layout, series, theme, axes, categories, stackSeries, options } = chartState;

    if (stackSeries && stackSeries[this.name]) {
      return;
    }

    this.plot = layout.plot;
    this.rect = this.makeSeriesRect(layout.plot);

    const { colors } = theme.series;
    const seriesData = series[this.name]!;
    const { tickDistance } = axes[this.labelAxis];
    const { labels, tickCount } = axes[this.valueAxis];
    const diverging = !!options.series?.diverging;
    const { min, max } = getLimitOnAxis(labels, diverging);
    const renderOptions: RenderOptions = {
      min,
      max,
      diverging,
      ratio: this.getValueRatio(min, max, diverging),
    };

    this.basePosition = this.getBasePosition(labels, tickCount);

    const seriesModels: RectModel[] = this.renderSeriesModel(
      seriesData,
      colors,
      labels,
      tickDistance,
      renderOptions
    );

    const tooltipData: TooltipData[] = this.makeTooltipData(seriesData, colors, categories);
    const hoveredSeries = this.renderHighlightSeriesModel(seriesModels);

    this.models.clipRect = [this.renderClipRectAreaModel()];
    this.models.series = seriesModels;
    this.models.hoveredSeries = hoveredSeries;

    if (!this.drawModels) {
      this.drawModels = {
        clipRect: this.models.clipRect,
        series: deepCopyArray(seriesModels),
        hoveredSeries: [],
      };
    }

    this.responders = hoveredSeries.map((m, index) => ({
      ...m,
      data: tooltipData[index],
    }));
  }

  protected renderClipRectAreaModel(): ClipRectAreaModel {
    return {
      type: 'clipRectArea',
      x: 0,
      y: 0,
      width: this.rect.width,
      height: this.rect.height,
    };
  }

  protected makeSeriesRect(layout: Rect) {
    const { x, y, width, height } = layout;

    return {
      x: x - this.hoverThickness,
      y: y - this.hoverThickness,
      width: width + (this.hoverThickness + this.axisThickness) * 2,
      height: height + (this.hoverThickness + this.axisThickness) * 2,
    };
  }

  renderSeriesModel(
    seriesData: SeriesData<BoxType>,
    colors: string[],
    valueLabels: string[],
    tickDistance: number,
    renderOptions: RenderOptions
  ): RectModel[] {
    const seriesRawData = seriesData.data;
    const { min, max, diverging, ratio } = renderOptions;
    const validDiverging = diverging && seriesRawData.length === 2;
    const columnWidth = this.getColumnWidth(tickDistance, seriesRawData.length, validDiverging);

    return seriesRawData.flatMap(({ data }, seriesIndex) => {
      const seriesPos = (diverging ? 0 : seriesIndex) * columnWidth + this.padding;
      const color = colors[seriesIndex];

      this.isRangeData = isRangeData(data);

      return data.map((value, index) => {
        const dataStart = seriesPos + index * tickDistance + this.hoverThickness;
        const barLength = this.getBarLength(value, min, max, ratio);
        const startPosition = this.getStartPosition(
          barLength,
          value,
          valueLabels,
          seriesIndex,
          renderOptions
        );

        return {
          type: 'rect',
          color,
          ...this.getAdjustedRect(dataStart, startPosition, barLength, columnWidth),
        };
      });
    });
  }

  protected renderHighlightSeriesModel(seriesModel): RectModel[] {
    return seriesModel.map((data) => {
      const { x, y, width, height, color } = data;
      const shadowOffset = this.hoverThickness / 2;
      const style = [
        {
          shadowColor: 'rgba(0, 0, 0, 0.3)',
          shadowOffsetX: shadowOffset,
          shadowOffsetY: this.isBar ? shadowOffset : -1 * shadowOffset,
          shadowBlur: this.hoverThickness + shadowOffset,
        },
      ];

      return {
        type: 'rect',
        color,
        x,
        y,
        width,
        height,
        style,
        thickness: this.hoverThickness,
      };
    });
  }

  onMousemove({ responders }: { responders: RectModel[] }) {
    this.drawModels.hoveredSeries = responders;
    this.activatedResponders = responders;

    this.eventBus.emit('seriesPointHovered', this.activatedResponders);
    this.eventBus.emit('needDraw');
  }

  private makeTooltipData(
    seriesData: SeriesData<BoxType>,
    colors: string[],
    categories?: string[]
  ): TooltipData[] {
    const seriesRawData = seriesData.data;

    return seriesRawData.flatMap(({ name, data }, index) =>
      data.map((value, dataIdx) => ({
        label: name,
        color: colors[index],
        value: this.getTooltipValue(value),
        category: categories?.[dataIdx],
      }))
    );
  }

  private getTooltipValue(value) {
    return isRangeValue(value) ? `${value[0]} ~ ${value[1]}` : value;
  }

  protected getBasePosition(valueLabels: string[], tickCount: number): number {
    const labels = this.isBar ? valueLabels : [...valueLabels].reverse();
    const zeroValueIndex = labels.findIndex((label) => Number(label) === 0);
    const tickPositions = makeTickPixelPositions(this.getOffsetSize(), tickCount);

    let basePosition = 0;

    if (zeroValueIndex < 0) {
      const hasPositiveOnly = labels.every((label) => Number(label) >= 0);
      const hasNegativeOnly = labels.every((label) => Number(label) <= 0);

      if (hasPositiveOnly) {
        basePosition = Number(first(tickPositions));
      }

      if (hasNegativeOnly) {
        basePosition = Number(last(tickPositions));
      }
    } else {
      basePosition = tickPositions[zeroValueIndex];
    }

    return basePosition + this.hoverThickness;
  }

  protected getOffsetSize(): number {
    return this.plot[this.offsetSizeKey];
  }

  getValueRatio(min: number, max: number, diverging = false) {
    const multiple = diverging ? 2 : 1;

    return this.getOffsetSize() / ((max - min) * multiple);
  }

  getBarLength(value: BoxSeriesDataType, min: number, max: number, ratio: number) {
    return calibrateDrawingValue(value, min, max) * ratio;
  }

  getStartPosition(
    barLength: number,
    value: BoxSeriesDataType,
    labels: string[],
    seriesIndex: number,
    renderOptions: RenderOptions
  ) {
    const basePosition = this.basePosition;
    const { min, ratio, diverging } = renderOptions;

    if (isRangeValue(value)) {
      const [start] = value;
      const startPosition = (start - min) * ratio;

      return this.isBar
        ? startPosition
        : this.getOffsetSize() - startPosition - barLength + this.hoverThickness;
    }

    const divergingSeries = diverging && isLeftBottomSide(seriesIndex);
    const negativeValue = hasNegative(labels) && value < 0;

    if (negativeValue) {
      return this.isBar ? basePosition - barLength : basePosition;
    }

    if (divergingSeries) {
      return this.isBar ? basePosition - barLength + this.axisThickness : basePosition;
    }

    return this.isBar ? basePosition + this.axisThickness : basePosition - barLength;
  }

  protected getAdjustedRect(
    seriesPosition: number,
    dataPosition: number,
    barLength: number,
    columnWidth: number
  ): Rect {
    barLength = Math.max(barLength, 1);

    return {
      x: this.isBar ? dataPosition : seriesPosition,
      y: this.isBar ? seriesPosition : dataPosition,
      width: this.isBar ? barLength : columnWidth,
      height: this.isBar ? columnWidth : barLength,
    };
  }

  getColumnWidth(tickDistance: number, seriesLength: number, validDiverging = false) {
    seriesLength = validDiverging ? 1 : seriesLength;

    return (tickDistance - this.padding * 2) / seriesLength;
  }
}
