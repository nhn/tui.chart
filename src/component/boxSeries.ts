import Component from './component';
import { RectModel, ClipRectAreaModel } from '@t/components/series';
import { ChartState, ChartType, SeriesData, BoxType, AxisData } from '@t/store/store';
import {
  BoxSeriesType,
  BoxSeriesDataType,
  BarChartOptions,
  ColumnChartOptions,
  Rect
} from '@t/options';
import { first, includes, hasNegative, deepCopyArray } from '@src/helpers/utils';
import { TooltipData } from '@t/components/tooltip';
import { LineModel } from '@t/components/axis';
import { makeTickPixelPositions } from '@src/helpers/calculator';
import { getRGBA, getAlpha } from '@src/helpers/color';
import { isRangeData, isRangeValue } from '@src/helpers/range';

type DrawModels = ClipRectAreaModel | RectModel | LineModel;

export type SeriesRawData = BoxSeriesType<BoxSeriesDataType>[];

type RenderOptions = {
  diverging: boolean;
};

const BOX = {
  BAR: 'bar',
  COLUMN: 'column'
};

const PADDING = {
  TB: 15, // top & bottom
  LR: 24 // left & right
};

function isLeftBottomSide(seriesIndex: number) {
  return !!(seriesIndex % 2);
}

export function isBoxSeries(seriesName: ChartType): seriesName is BoxType {
  return includes(Object.values(BOX), seriesName);
}

export default class BoxSeries extends Component {
  models!: DrawModels[];

  drawModels!: DrawModels[];

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
    if (!this.models) {
      return;
    }

    const offsetKey = this.isBar ? 'x' : 'y';

    if (this.isRangeData) {
      this.drawModels.forEach((drawModel, index) => {
        if (drawModel.type === 'rect') {
          const offsetSize = this.models[index][this.offsetSizeKey] * delta;

          drawModel[this.offsetSizeKey] = offsetSize;

          if (!this.isBar) {
            drawModel[offsetKey] =
              this.models[index][offsetKey] +
              this.models[index][this.offsetSizeKey] -
              offsetSize +
              this.hoverThickness;
          }
        }
      });

      return;
    }

    if (this.drawModels[0].type === 'clipRectArea') {
      this.drawModels[0][this.offsetSizeKey] = this.rect[this.offsetSizeKey] * delta;
      this.drawModels[0][offsetKey] = this.basePosition * (1 - delta);
    }

    this.drawModels.forEach((drawModel, index) => {
      if (drawModel.type === 'line' && delta) {
        const alpha = getAlpha((this.models[index] as LineModel).strokeStyle!) * delta;

        drawModel.strokeStyle = getRGBA(drawModel.strokeStyle!, alpha);
      }
    });
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
    const renderOptions: RenderOptions = {
      diverging: !!options.series?.diverging
    };
    const valueAxis = axes[this.valueAxis];
    const seriesModels: RectModel[] = this.renderSeriesModel(
      seriesData,
      colors,
      valueAxis,
      tickDistance,
      renderOptions
    );

    this.basePosition = this.getBasePosition(valueAxis);

    const tooltipData: TooltipData[] = this.makeTooltipData(seriesData, colors, categories);

    const rectModel = this.renderHighlightSeriesModel(seriesModels);

    this.models = [this.renderClipRectAreaModel(), ...seriesModels];
    this.drawModels = deepCopyArray(this.models);

    this.responders = rectModel.map((m, index) => ({
      ...m,
      data: tooltipData[index]
    }));
  }

  renderClipRectAreaModel(): ClipRectAreaModel {
    return {
      type: 'clipRectArea',
      x: 0,
      y: 0,
      width: this.rect.width,
      height: this.rect.height
    };
  }

  protected makeSeriesRect(layout: Rect) {
    const { x, y, width, height } = layout;

    return {
      x: x - this.hoverThickness,
      y: y - this.hoverThickness,
      width: width + this.hoverThickness * 2,
      height: height + this.hoverThickness * 2
    };
  }

  renderSeriesModel(
    seriesData: SeriesData<BoxType>,
    colors: string[],
    valueAxis: AxisData,
    tickDistance: number,
    renderOptions: RenderOptions
  ): RectModel[] {
    const seriesRawData = seriesData.data;
    const { labels } = valueAxis;
    const { diverging } = renderOptions;
    const validDiverging = diverging && seriesRawData.length === 2;
    const columnWidth = this.getColumnWidth(tickDistance, seriesRawData.length, validDiverging);

    return seriesRawData.flatMap(({ data }, seriesIndex) => {
      const seriesPos = (diverging ? 0 : seriesIndex) * columnWidth + this.padding;
      const color = colors[seriesIndex];

      this.isRangeData = isRangeData(data);

      return data.map((value, index) => {
        const dataStart = seriesPos + index * tickDistance + this.hoverThickness;
        const barLength = this.getBarLength(value, labels, diverging);
        const startPosition = this.getStartPosition(value, valueAxis, seriesIndex, diverging);

        return {
          type: 'rect',
          color,
          ...this.getAdjustedRect(dataStart, startPosition, barLength, columnWidth)
        };
      });
    });
  }

  protected renderHighlightSeriesModel(seriesModel): RectModel[] {
    return seriesModel.map(data => {
      const { x, y, width, height, color } = data;
      const shadowOffset = this.hoverThickness / 2;
      const style = [
        {
          shadowColor: 'rgba(0, 0, 0, 0.3)',
          shadowOffsetX: shadowOffset,
          shadowOffsetY: this.isBar ? shadowOffset : -1 * shadowOffset,
          shadowBlur: this.hoverThickness + shadowOffset
        }
      ];

      return {
        type: 'rect',
        color,
        x,
        y,
        width,
        height,
        style,
        thickness: this.hoverThickness
      };
    });
  }

  onMousemove({ responders }: { responders: RectModel[] }) {
    this.activatedResponders.forEach((responder: RectModel) => {
      const index = this.models.findIndex(model => model === responder);
      this.models.splice(index, 1);
    });

    this.models = [...this.models, ...responders];

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
        category: categories?.[dataIdx]
      }))
    );
  }

  private getTooltipValue(value) {
    return isRangeValue(value) ? `${value[0]} ~ ${value[1]}` : value;
  }

  protected getBasePosition(valueAxis: AxisData): number {
    const labels = this.isBar ? valueAxis.labels : [...valueAxis.labels].reverse();
    const { tickCount } = valueAxis;
    const zeroValueIndex = labels.findIndex(label => Number(label) === 0);
    const tickPositions = makeTickPixelPositions(this.getOffsetSize(), tickCount);

    return tickPositions[zeroValueIndex] + this.hoverThickness;
  }

  protected getOffsetSize(): number {
    return this.plot[this.offsetSizeKey];
  }

  getValueRatio(valueLabels: string[], diverging = false) {
    const values = valueLabels.map(value => Number(value));
    const multiple = diverging ? 2 : 1;

    return this.getOffsetSize() / ((Math.max(...values) - Math.min(...values)) * multiple);
  }

  getBarLength(value: BoxSeriesDataType, labels: string[], diverging = false) {
    const ratio = this.getValueRatio(labels, diverging);
    const rangeData = isRangeValue(value);

    if (typeof value === 'number' && hasNegative(labels)) {
      if (value < 0) {
        value = Math.abs(value);
      }
    }

    if (rangeData) {
      const [start, end] = value;

      value = end - start;
    }

    return (value as number) * ratio;
  }

  getStartPosition(
    value: BoxSeriesDataType,
    valueAxis: AxisData,
    seriesIndex: number,
    diverging = false
  ) {
    const { labels } = valueAxis;
    const basePosition = this.getBasePosition(valueAxis);
    const barLength = this.getBarLength(value, labels, diverging);

    if (isRangeValue(value)) {
      const [start] = value;
      const min = first(labels) as number;
      const ratio = this.getValueRatio(labels, diverging);
      const startPosition = (start - min) * ratio;

      return this.isBar ? startPosition : this.getOffsetSize() - startPosition - barLength;
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
      height: this.isBar ? columnWidth : barLength
    };
  }

  getColumnWidth(tickDistance: number, seriesLength: number, validDiverging = false) {
    seriesLength = validDiverging ? 1 : seriesLength;

    return (tickDistance - this.padding * 2) / seriesLength;
  }
}
