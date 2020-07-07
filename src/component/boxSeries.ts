import Component from './component';
import {
  RectModel,
  ClipRectAreaModel,
  BoxSeriesModels,
  StackTotalModel,
} from '@t/components/series';
import { ChartState, ChartType, BoxType, AxisData, Legend } from '@t/store/store';
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
  isNull,
  isNumber,
} from '@src/helpers/utils';
import { TooltipData } from '@t/components/tooltip';
import { makeTickPixelPositions } from '@src/helpers/calculator';
import { getRGBA, getAlpha } from '@src/helpers/color';
import { isRangeData, isRangeValue } from '@src/helpers/range';
import { getLimitOnAxis } from '@src/helpers/axes';
import { calibrateDrawingValue } from '@src/helpers/boxSeriesCalculator';
import { AxisType } from '@src/component/axis';
import { RectDirection, RectDataLabel } from '@src/store/dataLabels';
export enum SeriesDirection {
  POSITIVE,
  NEGATIVE,
  BOTH,
}

type RenderOptions = {
  tickDistance: number;
  min: number;
  max: number;
  diverging: boolean;
  ratio?: number;
  hasNegativeValue: boolean;
  seriesDirection: SeriesDirection;
  padding: number;
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
  models: BoxSeriesModels = { series: [] };

  drawModels!: BoxSeriesModels;

  responders!: RectModel[];

  activatedResponders: this['responders'] = [];

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

  offsetKey = 'x';

  initialize({ name }: { name: BoxType }) {
    this.type = 'series';
    this.name = name;
    this.isBar = name === BOX.BAR;
    this.offsetKey = this.isBar ? 'x' : 'y';
    this.valueAxis = this.isBar ? 'xAxis' : 'yAxis';
    this.labelAxis = this.isBar ? 'yAxis' : 'xAxis';
    this.anchorSizeKey = this.isBar ? 'height' : 'width';
    this.offsetSizeKey = this.isBar ? 'width' : 'height';
  }

  initUpdate(delta: number) {
    if (!this.drawModels) {
      return;
    }

    if (this.isRangeData) {
      this.initUpdateRangeData(delta);

      return;
    }

    this.initUpdateClipRect(delta);

    this.initUpdateConnector(delta);
  }

  initUpdateRangeData(delta: number) {
    const { series } = this.drawModels;
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
        current[this.offsetKey] =
          targetModel[this.offsetKey] + targetModel[this.offsetSizeKey] - offsetSize;
      }
    });
  }

  initUpdateClipRect(delta: number) {
    const { clipRect } = this.drawModels;

    if (!clipRect) {
      return;
    }

    const current = clipRect[0];
    const key = this.offsetSizeKey;
    const target = this.models.clipRect![0];
    const offsetSize = current[key] + (target[key] - current[key]) * delta;

    current[key] = offsetSize;
    current[this.offsetKey] = Math.max(
      this.basePosition - (offsetSize * this.basePosition) / target[key],
      0
    );
  }

  initUpdateConnector(delta: number) {
    const { connector } = this.drawModels;

    if (!connector) {
      return;
    }

    const target = this.models.connector!;

    connector.forEach((current, index) => {
      const alpha = getAlpha(target[index].strokeStyle!) * delta;

      current.strokeStyle = getRGBA(current.strokeStyle!, alpha);
    });
  }

  makeRenderOptions(
    axes: Partial<Record<AxisType, AxisData>>,
    options: BarChartOptions | ColumnChartOptions
  ): RenderOptions {
    const { labels } = axes[this.valueAxis];
    const { tickDistance } = axes[this.labelAxis];
    const diverging = !!options.series?.diverging;
    const { min, max } = getLimitOnAxis(labels);

    return {
      min,
      max,
      tickDistance,
      diverging,
      ratio: this.getValueRatio(min, max, diverging),
      hasNegativeValue: hasNegative(labels),
      seriesDirection: this.getSeriesDirection(labels),
      padding: this.getPadding(tickDistance),
    };
  }

  render<T extends BarChartOptions | ColumnChartOptions>(chartState: ChartState<T>) {
    const {
      layout,
      series,
      axes,
      categories,
      stackSeries,
      options,
      dataLabels,
      legend,
    } = chartState;

    if (stackSeries && stackSeries[this.name]) {
      return;
    }

    this.plot = layout.plot;
    this.rect = this.makeSeriesRect(layout.plot);

    const seriesData = series[this.name].data;
    const renderOptions = this.makeRenderOptions(axes, options);

    this.basePosition = this.getBasePosition(axes[this.valueAxis]);

    const seriesModels: RectModel[] = this.renderSeriesModel(seriesData, renderOptions, legend);

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

    if (dataLabels.visible) {
      const dataLabelData = seriesModels.map((data) => this.makeDataLabel(data));

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
    renderOptions: RenderOptions,
    legend: Legend
  ): RectModel[] {
    const { tickDistance, diverging, padding } = renderOptions;
    const validDiverging = diverging && seriesData.length === 2;
    const columnWidth = this.getColumnWidth(renderOptions, seriesData.length, validDiverging);
    const seriesModels: RectModel[] = [];

    seriesData.forEach(({ data, color: seriesColor }, seriesIndex) => {
      const seriesPos = (diverging ? 0 : seriesIndex) * columnWidth + padding;
      const isLBSideWithDiverging = diverging && isLeftBottomSide(seriesIndex);
      
      this.isRangeData = isRangeData(data);

      data.forEach((value, index) => {
        const dataStart = seriesPos + index * tickDistance + this.hoverThickness;
        const barLength = this.makeBarLength(value, renderOptions);
        const { active } = legend.data.find(({ label }) => label === name)!;
        const color = getRGBA(seriesColor, active ? 1 : 0.2);

        if (isNumber(barLength)) {
          const startPosition = this.getStartPosition(
            barLength,
            value,
            renderOptions,
            isLBSideWithDiverging
          );

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

  private getTooltipValue(value: BoxSeriesDataType): string | number {
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

  makeBarLength(
    value: BoxSeriesDataType,
    renderOptions: Pick<RenderOptions, 'min' | 'max' | 'ratio'>
  ) {
    if (isNull(value)) {
      return null;
    }
    const { min, max, ratio } = renderOptions;
    const calculatedValue = calculateBarLength(value, min, max);

    return Math.max(this.getBarLength(calculatedValue, ratio!), 2);
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
    const startPosition = (start - min) * ratio!;

    return this.isBar
      ? startPosition + this.hoverThickness
      : this.getOffsetSize() - startPosition - barLength + this.hoverThickness;
  }

  getStartPosition(
    barLength: number,
    value: BoxSeriesDataType,
    renderOptions: RenderOptions,
    isLBSideWithDiverging: boolean
  ): number {
    const { diverging, seriesDirection } = renderOptions;
    let startPos: number;

    if (isRangeValue(value)) {
      startPos = this.getStartPositionWithRangeValue(value, barLength, renderOptions);
    } else if (diverging) {
      startPos = isLBSideWithDiverging
        ? this.getStartPosOnLeftBottomSide(barLength, seriesDirection)
        : this.getStartPosOnRightTopSide(barLength, diverging);
    } else if (seriesDirection === SeriesDirection.POSITIVE) {
      startPos = this.getStartPosOnRightTopSide(barLength);
    } else if (seriesDirection === SeriesDirection.NEGATIVE) {
      startPos = this.getStartPosOnLeftBottomSide(barLength, seriesDirection);
    } else {
      startPos =
        value < 0
          ? this.getStartPosOnLeftBottomSide(barLength, seriesDirection)
          : this.getStartPosOnRightTopSide(barLength);
    }

    return startPos;
  }

  private getStartPosOnRightTopSide(barLength: number, diverging = false) {
    let pos: number;

    if (diverging) {
      pos = this.isBar
        ? this.basePosition - this.axisThickness
        : this.basePosition - barLength + this.axisThickness;
    } else {
      pos = this.isBar ? this.basePosition + this.axisThickness : this.basePosition - barLength;
    }

    return pos;
  }

  private getStartPosOnLeftBottomSide(barLength: number, seriesDirection: SeriesDirection) {
    return this.isBar
      ? this.basePosition - barLength
      : this.basePosition + (seriesDirection === SeriesDirection.NEGATIVE ? this.axisThickness : 0);
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

  getColumnWidth(renderOptions: RenderOptions, seriesLength: number, validDiverging = false) {
    const { tickDistance, padding } = renderOptions;
    seriesLength = validDiverging ? 1 : seriesLength;

    return (tickDistance - padding * 2) / seriesLength;
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

  makeDataLabel(rect: RectModel): RectDataLabel {
    return {
      ...rect,
      direction: this.getDataLabelDirection(rect),
      plot: {
        x: this.hoverThickness,
        y: this.hoverThickness,
        size: this.plot[this.offsetSizeKey],
      },
    };
  }

  getDataLabelDirection(rect: RectModel | StackTotalModel): RectDirection {
    let direction: RectDirection = 'right';

    if (this.isBar) {
      direction = !isRangeValue(rect.value!) && rect.x < this.basePosition ? 'left' : 'right';
    } else {
      direction = !isRangeValue(rect.value!) && rect.y >= this.basePosition ? 'bottom' : 'top';
    }

    return direction;
  }

  getPadding(tickDistance: number) {
    const defaultValue = this.isBar ? PADDING.TB : PADDING.LR;

    return Math.min(defaultValue, Math.floor(tickDistance * 0.3));
  }
}
