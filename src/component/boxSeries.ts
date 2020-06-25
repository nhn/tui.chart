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
  DataLabels,
} from '@t/options';
import {
  first,
  includes,
  hasNegative,
  deepCopyArray,
  last,
  hasNegativeOnly,
  hasPositiveOnly,
  isNull,
  isNumber,
} from '@src/helpers/utils';
import { TooltipData } from '@t/components/tooltip';
import { LineModel, LabelModel } from '@t/components/axis';
import { makeTickPixelPositions } from '@src/helpers/calculator';
import { getRGBA, getAlpha } from '@src/helpers/color';
import { isRangeData, isRangeValue } from '@src/helpers/range';
import { getLimitOnAxis } from '@src/helpers/axes';
import { AxisType } from './axis';
import { getTextWidth, getTextHeight } from '@src/helpers/calculator';
import { calibrateDrawingValue } from '@src/helpers/boxSeriesCalculator';
import { labelStyle } from '@src/brushes/basic';
import { getDataLabelsOptions, DefaultDataLabelOptions } from '@src/store/dataLabels';

export enum SeriesDirection {
  POSITIVE,
  NEGATIVE,
  BOTH,
}

type DrawModels = {
  clipRect?: ClipRectAreaModel[];
  series: RectModel[];
  hoveredSeries?: RectModel[];
  connector?: LineModel[];
  label?: LabelModel[];
};

type RenderOptions = {
  tickDistance: number;
  min: number;
  max: number;
  diverging: boolean;
  ratio: number;
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

  overflowedSize = 0;

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
      this.drawModels.clipRect = this.models.clipRect;

      const target = this.models.series;

      series.forEach((current, index) => {
        const targetModel = target[index];

        if (delta === 0) {
          current[this.offsetSizeKey] = 0;
        }

        const offsetSize =
          current[this.offsetSizeKey] +
          (targetModel[this.offsetSizeKey] - current[this.offsetSizeKey]) * delta;

        current[this.offsetSizeKey] = offsetSize;

        if (!this.isBar) {
          current[offsetKey] =
            targetModel[offsetKey] + targetModel[this.offsetSizeKey] - offsetSize;
        }
      });

      return;
    }

    if (clipRect) {
      const current = clipRect[0];
      const key = this.offsetSizeKey;
      const target = this.models.clipRect![0];
      const offsetSize = current[key] + (target[key] - current[key]) * delta;

      current[key] = offsetSize;
      current[offsetKey] = Math.max(
        this.basePosition - (offsetSize * this.basePosition) / target[key],
        0
      );
    }

    if (connector) {
      const target = this.models.connector!;

      connector.forEach((current, index) => {
        const alpha = getAlpha(target[index].strokeStyle!) * delta;

        current.strokeStyle = getRGBA(current.strokeStyle!, alpha);
      });
    }
  }
  /*
  update(delta) {
    const offsetKey = this.isBar ? 'x' : 'y';
    const { series } = this.drawModels;

    if (series) {
      this.drawModels.clipRect = this.models.clipRect;

      const target = this.models.series;

      series.forEach((current, index) => {
        const targetModel = target[index];

        if (delta === 0) {
          current[this.offsetSizeKey] = 0;
        }

        const offsetSizeKey = this.offsetSizeKey;

        const offsetSize =
          current[offsetSizeKey] + (targetModel[offsetSizeKey] - current[offsetSizeKey]) * delta;

        current[offsetSizeKey] = offsetSize;

        if (targetModel[offsetKey] < this.basePosition) {
          current[offsetKey] = targetModel[offsetKey] + targetModel[offsetSizeKey] - offsetSize;
        }
      });
    }
  }
  */

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
      hasNegativeValue: hasNegative(labels),
    };
  }

  render<T extends BarChartOptions | ColumnChartOptions>(chartState: ChartState<T>) {
    const { layout, series, axes, categories, stackSeries, options } = chartState;

    if (stackSeries && stackSeries[this.name]) {
      return;
    }

    this.plot = layout.plot;
    this.rect = this.makeSeriesRect(layout.plot);

    this.overflowedSize = this.getOverflowedSize();

    const seriesData = series[this.name].data;
    const renderOptions = this.makeRenderOptions(axes, options);

    this.basePosition = this.getBasePosition(axes[this.valueAxis]);

    const seriesModels: RectModel[] = this.renderSeriesModel(seriesData, renderOptions);

    const tooltipData: TooltipData[] = this.makeTooltipData(seriesData, renderOptions, categories);

    const hoveredSeries = this.renderHoveredSeriesModel(seriesModels);
    const clipRect = this.renderClipRectAreaModel();

    this.models = {
      clipRect: [clipRect],
      series: seriesModels,
    };

    if (!this.drawModels) {
      this.drawModels = {
        clipRect: [
          {
            type: 'clipRectArea',
            width: this.isBar ? 0 : clipRect.width,
            height: this.isBar ? clipRect.height : 0,
            x: this.isBar ? 0 : clipRect.x,
            y: this.isBar ? clipRect.y : 0,
          },
        ],
        series: deepCopyArray(seriesModels),
      };
    }

    const dataLabelOptions = options.series?.dataLabels;

    if (dataLabelOptions && dataLabelOptions.visible) {
      const dataLabelData = this.getDataLabels(seriesModels, dataLabelOptions);

      this.store.dispatch('appendDataLabels', dataLabelData);
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
    seriesData: BoxSeriesType<number | (RangeDataType & number)>[],
    renderOptions: RenderOptions
  ): RectModel[] {
    const { diverging, tickDistance } = renderOptions;
    const validDiverging = diverging && seriesData.length === 2;
    const columnWidth = this.getColumnWidth(tickDistance, seriesData.length, validDiverging);
    const seriesModels: RectModel[] = [];

    seriesData.forEach(({ data, color }, seriesIndex) => {
      const seriesPos = (diverging ? 0 : seriesIndex) * columnWidth + this.padding;
      this.isRangeData = isRangeData(data);

      data.forEach((value, index) => {
        const dataStart = seriesPos + index * tickDistance + this.hoverThickness;
        const barLength = this.makeBarLength(value, renderOptions);

        if (isNumber(barLength)) {
          const startPosition = this.getStartPosition(barLength, value, seriesIndex, renderOptions);

          seriesModels.push({
            type: 'rect',
            color,
            value,
            ...this.getAdjustedRect(dataStart, startPosition, barLength, columnWidth),
          });
        }
      });
    });

    return seriesModels;
  }

  protected renderHoveredSeriesModel(seriesModel: RectModel[]): RectModel[] {
    return seriesModel.map((data) => {
      return this.makeHoveredSeriesModel(data);
    });
  }

  makeHoveredSeriesModel(data: RectModel): RectModel {
    const { x, y, width, height, color } = data!;
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
  }

  onMousemove({ responders }: { responders: RectModel[] }) {
    this.drawModels.hoveredSeries = responders;
    this.activatedResponders = responders;

    this.eventBus.emit('seriesPointHovered', this.activatedResponders);
    this.eventBus.emit('needDraw');
  }

  private makeTooltipData(
    seriesData: BoxSeriesType<BoxSeriesDataType>[],
    renderOptions: RenderOptions,
    categories?: string[]
  ): TooltipData[] {
    const tooltipData: TooltipData[] = [];

    seriesData.forEach(({ data, name, color }) => {
      data.forEach((value, dataIndex) => {
        const barLength = this.makeBarLength(value, renderOptions);

        if (isNumber(barLength)) {
          tooltipData.push({
            label: name,
            color,
            value: this.getTooltipValue(value),
            category: categories?.[dataIndex],
          });
        }
      });
    });

    return tooltipData;
  }

  private getTooltipValue(value: BoxSeriesDataType) {
    return isRangeValue(value) ? `${value[0]} ~ ${value[1]}` : value;
  }

  protected getBasePosition({ labels, tickCount }: AxisData): number {
    const valueLabels = this.isBar ? labels : [...labels].reverse();
    const zeroValueIndex = valueLabels.findIndex((label) => Number(label) === 0);
    const tickPositions = makeTickPixelPositions(this.getOffsetSize(), tickCount);
    const hasZeroOnAxis = zeroValueIndex > -1;
    const seriesDirection = this.getSeriesDirection(valueLabels);

    return (
      (hasZeroOnAxis
        ? tickPositions[zeroValueIndex]
        : this.getTickPositionIfNotZero(tickPositions, seriesDirection)) + this.hoverThickness
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
    if (isNull(value)) {
      return null;
    }

    const { min, max, ratio } = renderOptions;
    const calculatedValue = calculateBarLength(value, min, max);

    return Math.max(this.getBarLength(calculatedValue, ratio), 2);
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
  ): number {
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

  protected getSeriesDirection(labels: string[]) {
    let result = SeriesDirection.BOTH;

    if (hasPositiveOnly(labels)) {
      result = SeriesDirection.POSITIVE;
    } else if (hasNegativeOnly(labels)) {
      result = SeriesDirection.NEGATIVE;
    }

    return result;
  }

  protected getTickPositionIfNotZero(tickPositions: number[], direction: SeriesDirection) {
    const firstTickPosition = Number(first(tickPositions));
    const lastTickPosition = Number(last(tickPositions));
    let tickPos = 0;

    if (direction === SeriesDirection.POSITIVE) {
      tickPos = this.isBar ? firstTickPosition : lastTickPosition;
    } else if (direction === SeriesDirection.NEGATIVE) {
      tickPos = this.isBar ? lastTickPosition : firstTickPosition;
    }

    return tickPos;
  }

  getOverflowedSize() {
    return this.getOffsetSize() + this.hoverThickness;
  }

  makeDefaultDataLabelOptions(): DefaultDataLabelOptions {
    const { font, fillStyle } = labelStyle['default'];

    return {
      visible: false,
      anchor: 'end',
      align: 'end',
      offset: 5,
      style: {
        font,
        color: fillStyle,
        textBgColor: 'rgba(255, 255, 255, 0)',
        textStrokeColor: 'rgba(255, 255, 255, 0)',
      },
    };
  }

  getDataLabels(seriesModels: RectModel[], dataLabelOptions: DataLabels) {
    const options: Required<DataLabels> = getDataLabelsOptions(
      dataLabelOptions,
      this.makeDefaultDataLabelOptions()
    );

    return seriesModels.map((data) =>
      this.isBar ? this.makeBarLabelInfo(data, options) : this.makeColumnLabelInfo(data, options)
    );
  }

  makeBarLabelInfo(data: RectModel, dataLabelOptions: Required<DataLabels>) {
    const {
      anchor,
      align,
      offset,
      style: { font, color, textBgColor, textStrokeColor },
      formatter,
    } = dataLabelOptions;

    const { width, height, value } = data;
    const text = formatter(value!);
    let { x, y } = data;
    let textAlign = 'center';
    const textBaseline = 'middle';

    y = data.y + height / 2;

    if (anchor === 'start') {
      x = data.x;
      textAlign = 'start';
    } else if (anchor === 'end') {
      x = data.x + width;
      textAlign = 'center';
    } else {
      x = data.x + width / 2;
      textAlign = 'center';
    }

    if (includes(['end', 'right'], align)) {
      textAlign = 'start';
      x += offset;
    } else if (includes(['start', 'left'], align)) {
      textAlign = 'end';
      x -= offset;
    }

    // adjust the position automatically, when outside and overflowing
    if (
      anchor === 'end' &&
      includes(['end', 'right'], align) &&
      this.overflowedSize &&
      this.overflowedSize < x + getTextWidth(text, font!)
    ) {
      x = data.x + width - offset;
      textAlign = 'end';
    }

    const style = { font, fillStyle: color, textAlign, textBaseline };
    x -= this.hoverThickness;
    y -= this.hoverThickness;

    return {
      x,
      y,
      text,
      style,
      bgColor: textBgColor,
      textStrokeColor,
    };
  }

  makeColumnLabelInfo(data: RectModel, dataLabelOptions: Required<DataLabels>) {
    const {
      anchor,
      align,
      offset,
      style: { font, color, textBgColor, textStrokeColor },
      formatter,
    } = dataLabelOptions;

    const { width, height, value } = data;
    const text = formatter(value!);
    let { x, y } = data;
    const textAlign = 'center';
    let textBaseline = 'middle';

    x = data.x + width / 2;

    if (anchor === 'start') {
      y = data.y + data.height;
    } else if (anchor === 'end') {
      y = data.y;
    } else {
      y = data.y + data.height / 2;
    }

    if (includes(['top', 'end'], align)) {
      y -= offset;
      textBaseline = 'bottom';
    } else if (includes(['bottom', 'start'], align)) {
      y += offset;
      textBaseline = 'top';
    }

    // adjust the position automatically, when outside and overflowing
    if (
      anchor === 'end' &&
      includes(['end', 'top'], align) &&
      this.overflowedSize &&
      this.overflowedSize < height + getTextHeight(font!)
    ) {
      y = data.y + offset;
      textBaseline = 'top';
    }

    const style = { font, fillStyle: color, textAlign, textBaseline };
    x -= this.hoverThickness;
    y -= this.hoverThickness;

    return {
      x,
      y,
      text,
      style,
      bgColor: textBgColor,
      textStrokeColor,
    };
  }
}
