import Component from './component';
import { ChartState, Options, Axes, AxisData } from '@t/store/store';
import { crispPixel, makeTickPixelPositions } from '@src/helpers/calculator';
import Painter from '@src/painter';
import { LineModel } from '@t/components/axis';
import { PlotModels } from '@t/components/plot';
import { RectModel } from '@t/components/series';
import { PlotLine, PlotBand } from '@t/options';

function getLabelPosition(axisData: AxisData, size: number, value: number | string) {
  const { labels, tickCount } = axisData;
  const positions = makeTickPixelPositions(size, tickCount);
  const index = labels.findIndex((label) => label === String(value));

  return positions[index];
}
export default class Plot extends Component {
  models: PlotModels = { plot: [], line: [], band: [] };

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

  renderLines(axes: Axes, lines: PlotLine[] = []): LineModel[] {
    return lines.map(({ value, color, vertical }) => {
      const { axisData, offsetSize } = this.getAxisAndSize(vertical!, axes);
      const position = getLabelPosition(axisData, offsetSize, value);

      return this.makeLineModel(vertical!, vertical ? position : offsetSize - position, color);
    });
  }

  renderBands(axes: Axes, bands: PlotBand[] = []): RectModel[] {
    return bands.map(({ range, color }) => {
      const { axisData, offsetSize, anchorSize } = this.getAxisAndSize(true, axes);
      const [start, end] = range.map((value) => getLabelPosition(axisData, offsetSize, value));

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
    return relativePositions.map((position) => {
      return this.makeLineModel(
        vertical,
        position,
        'rgba(0, 0, 0, 0.05)',
        size ?? this.rect.width,
        startPosistion ?? 0
      );
    });
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
    const { layout, axes, plot } = state;
    this.rect = layout.plot;

    if (state.plot) {
      const { lines, bands } = plot;

      this.models.line = this.renderLines(axes, lines);
      this.models.band = this.renderBands(axes, bands);
    }

    this.models.plot = this.renderPlots(axes);
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
