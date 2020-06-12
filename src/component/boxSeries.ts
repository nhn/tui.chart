import Component from './component';
import { RectModel, ClipRectAreaModel } from '@t/components/series';
import { ChartState, ChartType, BoxType, AxisData } from '@t/store/store';
import {
  BoxSeriesType,
  BoxSeriesDataType,
  BarChartOptions,
  ColumnChartOptions,
  Rect,
  RangeDataType,
} from '@t/options';
import {
  first,
  includes,
  hasNegative,
  deepCopyArray,
  last,
  hasNegativeOnly,
  hasPositiveOnly,
} from '@src/helpers/utils';
import { TooltipData } from '@t/components/tooltip';
import { LineModel } from '@t/components/axis';
import { makeTickPixelPositions } from '@src/helpers/calculator';
import { getRGBA, getAlpha } from '@src/helpers/color';
import { isRangeData, isRangeValue } from '@src/helpers/range';
import { getLimitOnAxis } from '@src/helpers/axes';
import { AxisType } from './axis';
import { calibrateDrawingValue } from '@src/helpers/boxSeriesCalculator';

type DrawModels = {
  clipRect?: ClipRectAreaModel[];
  series: RectModel[];
  hoveredSeries?: RectModel[];
  connector?: LineModel[];
};

type RenderOptions = {
  tickDistance: number;
  min: number;
  max: number;
  diverging: boolean;
  ratio: number;
  positiveOnly: boolean;
  negativeOnly: boolean;
  hasNegativeValue: boolean;
};

const BOX = {
  BAR: 'bar',
  COLUMN: 'column',
};

const PADDING = {
  TB: 15, // top & bottom
  LR: 24, // left & right
};

export function isLeftBottomSide(seriesIndex: number) {
  return !!(seriesIndex % 2);
}

function calculateBarLength(value: BoxSeriesDataType, min: number, max: number) {
  if (isRangeValue(value)) {
    let [start, end] = value;

    if (start < min) {
      start = min;
    }

    if (end > max) {
      end = max;
    }

    return end - start;
  }

  return calibrateDrawingValue(value, min, max);
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

  initUpdate(delta: number) {
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

  makeRenderOptions(
    axes: Partial<Record<AxisType, AxisData>>,
    options: BarChartOptions | ColumnChartOptions
  ): RenderOptions {
    const { labels } = axes[this.valueAxis];
    const { tickDistance } = axes[this.labelAxis];
    const diverging = !!options.series?.diverging;
    const { min, max } = getLimitOnAxis(labels, diverging);

    return {
      min,
      max,
      tickDistance,
      diverging,
      ratio: this.getValueRatio(min, max, diverging),
      positiveOnly: hasPositiveOnly(labels),
      negativeOnly: hasNegativeOnly(labels),
      hasNegativeValue: hasNegative(labels),
    };
  }

  render<T extends BarChartOptions | ColumnChartOptions>(chartState: ChartState<T>) {
    const { layout, series, theme, axes, categories, stackSeries, options } = chartState;

    if (stackSeries && stackSeries[this.name]) {
      return;
    }

    this.plot = layout.plot;
    this.rect = this.makeSeriesRect(layout.plot);

    const { colors } = theme.series;
    const seriesData = series[this.name].data;
    const renderOptions = this.makeRenderOptions(axes, options);
    this.basePosition = this.getBasePosition(
      axes[this.valueAxis],
      renderOptions.positiveOnly,
      renderOptions.negativeOnly
    );

    const seriesModels: RectModel[] = this.renderSeriesModel(seriesData, colors, renderOptions);

    const tooltipData: TooltipData[] = this.makeTooltipData(seriesData, colors, categories);
    const hoveredSeries = this.renderHighlightSeriesModel(seriesModels);

    this.models.clipRect = [this.renderClipRectAreaModel()];
    this.models.series = seriesModels;

    if (!this.drawModels) {
      this.drawModels = {
        clipRect: this.models.clipRect,
        series: deepCopyArray(seriesModels),
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
    seriesData: BoxSeriesType<BoxSeriesDataType>[],
    colors: string[],
    renderOptions: RenderOptions
  ): RectModel[] {
    const { diverging, tickDistance } = renderOptions;
    const validDiverging = diverging && seriesData.length === 2;
    const columnWidth = this.getColumnWidth(tickDistance, seriesData.length, validDiverging);

    return seriesData.flatMap(({ data }, seriesIndex) => {
      const seriesPos = (diverging ? 0 : seriesIndex) * columnWidth + this.padding;
      const color = colors[seriesIndex];

      this.isRangeData = isRangeData(data);

      return data.map((value, index) => {
        const dataStart = seriesPos + index * tickDistance + this.hoverThickness;
        const barLength = this.makeBarLength(value, renderOptions);
        const startPosition = this.getStartPosition(barLength, value, seriesIndex, renderOptions);

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
    seriesData: BoxSeriesType<BoxSeriesDataType>[],
    colors: string[],
    categories?: string[]
  ): TooltipData[] {
    return seriesData.flatMap(({ name, data }, index) =>
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

  protected getBasePosition(
    { labels, tickCount }: AxisData,
    positiveOnly: boolean,
    negativeOnly: boolean
  ): number {
    const valueLabels = this.isBar ? labels : [...labels].reverse();
    const zeroValueIndex = valueLabels.findIndex((label) => Number(label) === 0);
    const tickPositions = makeTickPixelPositions(this.getOffsetSize(), tickCount);
    const hasZeroOnAxis = zeroValueIndex > -1;

    return (
      (hasZeroOnAxis
        ? tickPositions[zeroValueIndex]
        : this.getTickPositionIfNotZero(tickPositions, positiveOnly, negativeOnly)) +
      this.hoverThickness
    );
  }

  protected getOffsetSize(): number {
    return this.plot[this.offsetSizeKey];
  }

  getValueRatio(min: number, max: number, diverging = false) {
    const multiple = diverging ? 2 : 1;

    return this.getOffsetSize() / ((max - min) * multiple);
  }

  private makeBarLength(value: BoxSeriesDataType, renderOptions: RenderOptions) {
    const { min, max, ratio } = renderOptions;
    const calculatedValue = calculateBarLength(value, min, max);

    return this.getBarLength(calculatedValue, ratio);
  }

  protected getBarLength(value: number, ratio: number) {
    return value < 0 ? Math.abs(value) * ratio : value * ratio;
  }

  getStartPositionWithRangeValue(
    value: RangeDataType,
    barLength: number,
    renderOptions: RenderOptions
  ) {
    const { min, ratio } = renderOptions;
    let [start] = value;

    if (start < min) {
      start = min;
    }
    const startPosition = (start - min) * ratio;

    return this.isBar
      ? startPosition + this.hoverThickness
      : this.getOffsetSize() - startPosition - barLength + this.hoverThickness;
  }

  getStartPosition(
    barLength: number,
    value: BoxSeriesDataType,
    seriesIndex: number,
    renderOptions: RenderOptions
  ) {
    const basePosition = this.basePosition;
    const { diverging, hasNegativeValue } = renderOptions;

    if (isRangeValue(value)) {
      return this.getStartPositionWithRangeValue(value, barLength, renderOptions);
    }

    const divergingSeries = diverging && isLeftBottomSide(seriesIndex);
    const negativeValue = hasNegativeValue && value < 0;

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
    barLength = Math.max(barLength, 2);

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

  protected getTickPositionIfNotZero(
    tickPositions: number[],
    positiveOnly: boolean,
    negativeOnly: boolean
  ) {
    const firstTickPosition = Number(first(tickPositions));
    const lastTickPosition = Number(last(tickPositions));

    if (positiveOnly) {
      return this.isBar ? firstTickPosition : lastTickPosition;
    }
    if (negativeOnly) {
      return this.isBar ? lastTickPosition : firstTickPosition;
    }

    return 0;
  }
}
