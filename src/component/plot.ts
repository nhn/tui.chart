import Component from './component';
import { ChartState, Options, Axes, AxisData, ValueEdge } from '@t/store/store';
import { crispPixel, makeTickPixelPositions, getValueRatio } from '@src/helpers/calculator';
import Painter from '@src/painter';
import { LineModel } from '@t/components/axis';
import { PlotModels } from '@t/components/plot';
import { RectModel } from '@t/components/series';
import { PlotLine, PlotBand, PlotRangeType, PlotXPointType } from '@t/options';
import { isValueAfterLastCategory } from '@src/helpers/coordinate';
import { isString, isNumber } from '@src/helpers/utils';

type XPositionParam = {
  axisData: AxisData;
  offsetSize: number;
  value: number | string;
  xAxisLimit: ValueEdge;
  categories: string[];
  startIndex: number;
};

function getDataIndex(value: PlotXPointType, categories: string[], startIndex = 0) {
  let index = categories.findIndex((category) => category === String(value));

  if (~~index && isNumber(value)) {
    index = index - startIndex;
  } else if (index === -1 && isValueAfterLastCategory(value, categories)) {
    index = categories.length;
  }

  return index;
}

function getXPosition({
  axisData,
  offsetSize,
  value,
  xAxisLimit,
  categories,
  startIndex = 0,
}: XPositionParam) {
  const { pointOnColumn, tickDistance, labelDistance } = axisData;
  let x;

  if (xAxisLimit) {
    const xValue = isString(value) ? Number(new Date(value)) : Number(value);
    const xValueRatio = getValueRatio(xValue, xAxisLimit);

    x =
      xValueRatio * (offsetSize - (pointOnColumn ? labelDistance! : 0)) +
      (pointOnColumn ? labelDistance! / 2 : 0);
  } else {
    const dataIndex = getDataIndex(value, categories, startIndex);

    x = tickDistance * dataIndex + (pointOnColumn ? tickDistance / 2 : 0);
  }

  return x > 0 ? Math.min(offsetSize, x) : 0;
}
export default class Plot extends Component {
  models: PlotModels = { plot: [], line: [], band: [] };

  startIndex = 0;

  initialize() {
    this.type = 'plot';
  }

  getAxisAndSize(vertical: boolean, axes: Axes) {
    return {
      axisData: vertical ? axes.xAxis : axes.yAxis,
      offsetSize: vertical ? this.rect.width : this.rect.height,
      anchorSize: vertical ? this.rect.height : this.rect.width,
    };
  }

  renderLines(
    axes: Axes,
    xAxisLimit: ValueEdge,
    categories: string[],
    lines: PlotLine[] = []
  ): LineModel[] {
    return lines.map(({ value, color, vertical }) => {
      const { axisData, offsetSize } = this.getAxisAndSize(vertical!, axes);
      const position = getXPosition({
        axisData,
        offsetSize,
        value,
        xAxisLimit,
        categories,
        startIndex: this.startIndex,
      });

      return this.makeLineModel(vertical!, vertical ? position : offsetSize - position, color);
    });
  }

  renderBands(
    axes: Axes,
    xAxisLimit: ValueEdge,
    categories: string[],
    bands: PlotBand[] = []
  ): RectModel[] {
    const { axisData, offsetSize, anchorSize } = this.getAxisAndSize(true, axes);

    return bands.map(({ range, color }: PlotBand) => {
      const [start, end] = (range as PlotRangeType).map((value) =>
        getXPosition({
          axisData,
          offsetSize,
          value,
          xAxisLimit,
          categories,
          startIndex: this.startIndex,
        })
      );

      return {
        type: 'rect',
        x: crispPixel(start),
        y: crispPixel(0),
        width: end - start,
        height: anchorSize,
        color,
      };
    });
  }

  renderPlotLineModels(
    relativePositions: number[],
    vertical: boolean,
    size?: number,
    startPosistion?: number
  ): LineModel[] {
    return relativePositions.map((position) =>
      this.makeLineModel(
        vertical,
        position,
        'rgba(0, 0, 0, 0.05)',
        size ?? this.rect.width,
        startPosistion ?? 0
      )
    );
  }

  renderPlotsForCenterYAxis(axes: Axes): LineModel[] {
    const { xAxisHalfSize, secondStartX, yAxisHeight } = axes.centerYAxis!;

    // vertical
    const xAxisTickCount = axes.xAxis.tickCount!;
    const verticalLines = [
      ...this.renderPlotLineModels(makeTickPixelPositions(xAxisHalfSize, xAxisTickCount), true),
      ...this.renderPlotLineModels(
        makeTickPixelPositions(xAxisHalfSize, xAxisTickCount, secondStartX),
        true
      ),
    ];

    // horizontal
    const yAxisTickCount = axes.yAxis.tickCount!;
    const horizontalLines = [
      ...this.renderPlotLineModels(
        makeTickPixelPositions(yAxisHeight, yAxisTickCount),
        false,
        xAxisHalfSize
      ),
      ...this.renderPlotLineModels(
        makeTickPixelPositions(yAxisHeight, yAxisTickCount),
        false,
        xAxisHalfSize,
        secondStartX
      ),
    ];

    return [...verticalLines, ...horizontalLines];
  }

  renderPlots(axes: Axes): LineModel[] {
    const vertical = true;

    return axes.centerYAxis
      ? this.renderPlotsForCenterYAxis(axes)
      : [
          ...this.renderPlotLineModels(this.getTickPixelPositions(!vertical, axes), !vertical),
          ...this.renderPlotLineModels(this.getTickPixelPositions(vertical, axes), vertical),
        ];
  }

  getTickPixelPositions(vertical: boolean, axes: Axes) {
    const {
      offsetSize,
      axisData: { tickCount },
    } = this.getAxisAndSize(vertical, axes);

    return makeTickPixelPositions(offsetSize, tickCount);
  }

  render(state: ChartState<Options>) {
    const { layout, axes, plot, scale, zoomRange, categories = [] } = state;
    this.rect = layout.plot;
    this.startIndex = zoomRange ? zoomRange[0] : 0;

    if (!plot) {
      return;
    }

    const { lines, bands, showLine } = plot;
    const xAxisLimit = scale?.xAxis?.limit;

    this.models.line = this.renderLines(axes, xAxisLimit, categories, lines);
    this.models.band = this.renderBands(axes, xAxisLimit, categories, bands);

    if (showLine) {
      this.models.plot = this.renderPlots(axes);
    }
  }

  makeLineModel(
    vertical: boolean,
    position: number,
    color: string,
    sizeWidth?: number,
    xPos = 0
  ): LineModel {
    const x = vertical ? crispPixel(position) : crispPixel(xPos);
    const y = vertical ? crispPixel(0) : crispPixel(position);
    const width = vertical ? 0 : sizeWidth ?? this.rect.width;
    const height = vertical ? this.rect.height : 0;

    return {
      type: 'line',
      x,
      y,
      x2: x + width,
      y2: y + height,
      strokeStyle: color,
    };
  }

  beforeDraw(painter: Painter) {
    painter.ctx.strokeStyle = 'rgba(0, 0, 0, 0.05)';
    painter.ctx.lineWidth = 1;
  }
}
