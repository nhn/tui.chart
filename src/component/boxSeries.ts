import Component from './component';
import {
  RectModel,
  ClipRectAreaModel,
  BoxSeriesModels,
  StackTotalModel,
  RectResponderModel,
} from '@t/components/series';
import { ChartState, ChartType, BoxType, AxisData, CenterYAxisData } from '@t/store/store';
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
import { RectDirection, RectDataLabel } from '@src/store/dataLabels';
import { getActiveSeriesMap } from '@src/helpers/legend';

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

export const PADDING = {
  vertical: 15, // top & bottom
  horizontal: 24, // left & right
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

  responders!: RectResponderModel[];

  activatedResponders: this['responders'] = [];

  isBar = true;

  name = BOX.BAR;

  valueAxis = 'xAxis';

  labelAxis = 'yAxis';

  anchorSizeKey = 'height';

  offsetSizeKey = 'width';

  hoverThickness = 4;

  basePosition = 0;

  leftBasePosition = 0;

  rightBasePosition = 0;

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

    this.rect = layout.plot;
    this.activeSeriesMap = getActiveSeriesMap(legend);

    const seriesData = series[this.name].data;

    if (axes.centerYAxis) {
      this.valueAxis = 'centerYAxis';
    }

    const { labels } = axes[this.valueAxis];
    const { tickDistance } = axes[this.labelAxis];
    const diverging = !!options.series?.diverging;
    const { min, max } = getLimitOnAxis(labels);

    this.basePosition = this.getBasePosition(axes[this.valueAxis]);

    let offsetSize: number = this.getOffsetSize();
    const { centerYAxis } = axes;

    if (diverging) {
      const [left, right] = this.getDivergingBasePosition(centerYAxis!);

      this.basePosition = this.getOffsetSize() / 2;
      this.leftBasePosition = left;
      this.rightBasePosition = right;

      offsetSize = this.getOffsetSizeWithDiverging(centerYAxis!);
    }

    const renderOptions: RenderOptions = {
      min,
      max,
      tickDistance,
      diverging,
      ratio: this.getValueRatio(min, max, offsetSize),
      hasNegativeValue: hasNegative(labels),
      seriesDirection: this.getSeriesDirection(labels),
      padding: this.getPadding(tickDistance),
    };

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
        clipRect: [this.initClipRect(clipRect)],
        series: deepCopyArray(seriesModels),
      };
    }

    if (dataLabels.visible) {
      const dataLabelData = seriesModels.map((data) => this.makeDataLabel(data, centerYAxis));

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

  private initClipRect(clipRect: ClipRectAreaModel): ClipRectAreaModel {
    return {
      type: 'clipRectArea',
      width: this.isBar ? 0 : clipRect.width,
      height: this.isBar ? clipRect.height : 0,
      x: this.isBar ? 0 : clipRect.x,
      y: this.isBar ? clipRect.y : 0,
    };
  }

  renderSeriesModel(
    seriesData: BoxSeriesType<number | (RangeDataType & number)>[],
    renderOptions: RenderOptions
  ): RectModel[] {
    const { tickDistance, diverging, padding } = renderOptions;
    const validDiverging = diverging && seriesData.length === 2;
    const columnWidth = this.getColumnWidth(renderOptions, seriesData.length, validDiverging);
    const seriesModels: RectModel[] = [];

    seriesData.forEach(({ data, color: seriesColor, name }, seriesIndex) => {
      const seriesPos = (diverging ? 0 : seriesIndex) * columnWidth + padding;
      const isLBSideWithDiverging = diverging && isLeftBottomSide(seriesIndex);

      this.isRangeData = isRangeData(data);

      data.forEach((value, index) => {
        const dataStart = seriesPos + index * tickDistance;
        const barLength = this.makeBarLength(value, renderOptions);
        const active = this.activeSeriesMap![name];
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
            name,
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

    return {
      type: 'rect',
      color,
      x,
      y,
      width,
      height,
      style: ['shadow'],
      thickness: this.hoverThickness,
    };
  }

  onMousemove({ responders }: { responders: RectModel[] }) {
    this.eventBus.emit('renderHoveredSeries', responders);
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

  protected getBasePosition({ labels, tickCount, zeroPosition }: AxisData): number {
    const valueLabels = this.isBar ? labels : [...labels].reverse();
    const tickPositions = makeTickPixelPositions(this.getOffsetSize(), tickCount);
    const seriesDirection = this.getSeriesDirection(valueLabels);

    return zeroPosition
      ? zeroPosition
      : this.getTickPositionIfNotZero(tickPositions, seriesDirection);
  }

  getDivergingBasePosition(centerYAxis: CenterYAxisData) {
    let leftZeroPosition: number, rightZeroPosition: number;

    if (centerYAxis) {
      leftZeroPosition = centerYAxis.xAxisHalfSize;
      rightZeroPosition = centerYAxis.secondStartX;
    } else {
      const divergingZeroPosition = this.getOffsetSize() / 2;

      leftZeroPosition = rightZeroPosition = divergingZeroPosition;
    }

    return [leftZeroPosition, rightZeroPosition];
  }

  protected getOffsetSize(): number {
    return this.rect[this.offsetSizeKey];
  }

  getValueRatio(min: number, max: number, size: number) {
    return size / (max - min);
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

    return this.isBar ? startPosition : this.getOffsetSize() - startPosition - barLength;
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
        ? this.getStartPosOnLeftBottomSide(barLength, diverging)
        : this.getStartPosOnRightTopSide(barLength, diverging);
    } else if (seriesDirection === SeriesDirection.POSITIVE) {
      startPos = this.getStartPosOnRightTopSide(barLength);
    } else if (seriesDirection === SeriesDirection.NEGATIVE) {
      startPos = this.getStartPosOnLeftBottomSide(barLength);
    } else {
      startPos =
        value < 0
          ? this.getStartPosOnLeftBottomSide(barLength)
          : this.getStartPosOnRightTopSide(barLength);
    }

    return startPos;
  }

  private getStartPosOnRightTopSide(barLength: number, diverging = false) {
    let pos: number;

    if (diverging) {
      pos = this.isBar ? this.rightBasePosition : this.rightBasePosition - barLength;
    } else {
      pos = this.isBar ? this.basePosition : this.basePosition - barLength;
    }

    return pos;
  }

  private getStartPosOnLeftBottomSide(barLength: number, diverging = false) {
    let pos: number;

    if (diverging) {
      pos = this.isBar ? this.leftBasePosition - barLength : this.leftBasePosition;
    } else {
      pos = this.isBar ? this.basePosition - barLength : this.basePosition;
    }

    return pos;
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

  makeDataLabel(rect: RectModel, centerYAxis?: CenterYAxisData): RectDataLabel {
    return {
      ...rect,
      direction: this.getDataLabelDirection(rect, centerYAxis),
      plot: {
        x: 0,
        y: 0,
        size: this.getOffsetSize(),
      },
    };
  }

  getDataLabelDirection(
    rect: RectModel | StackTotalModel,
    centerYAxis?: CenterYAxisData
  ): RectDirection {
    let direction: RectDirection;

    if (isRangeValue(rect.value!)) {
      direction = this.isBar ? 'right' : 'top';
    } else if (this.isBar) {
      const basePos = centerYAxis ? this.leftBasePosition : this.basePosition;
      direction = rect.x < basePos ? 'left' : 'right';
    } else {
      direction = rect.y >= this.basePosition ? 'bottom' : 'top';
    }

    return direction;
  }

  getPadding(tickDistance: number) {
    const defaultValue = this.isBar ? PADDING.vertical : PADDING.horizontal;

    return Math.min(defaultValue, Math.floor(tickDistance * 0.3));
  }

  getOffsetSizeWithDiverging(centerYAxis: CenterYAxisData) {
    return centerYAxis ? centerYAxis.xAxisHalfSize : this.getOffsetSize() / 2;
  }
}
