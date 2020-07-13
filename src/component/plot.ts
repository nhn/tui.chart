import Component from './component';
import {
  ChartState,
  Options,
  PlotLine,
  Axes,
  AxisData,
  PlotBand,
  YCenterAxis,
} from '@t/store/store';
import { crispPixel, makeTickPixelPositions } from '@src/helpers/calculator';
import Painter from '@src/painter';
import { LineModel } from '@t/components/axis';
import { PlotModels } from '@t/components/plot';
import { RectModel } from '@t/components/series';

export default class Plot extends Component {
  models: PlotModels = { plot: [], line: [], band: [] };

  initialize() {
    this.type = 'plot';
  }

  renderLines(lines: PlotLine[], axes: Axes): LineModel[] {
    return lines.map(({ value, color, vertical }) => {
      const { labels, tickCount } = vertical ? (axes.xAxis as AxisData) : (axes.yAxis as AxisData);
      const size = vertical ? this.rect.width : this.rect.height;
      const positions = makeTickPixelPositions(size, tickCount);
      const index = labels.findIndex((label) => Number(label) === value);
      const position = positions[index];

      return this.makeLineModel(vertical, vertical ? position : size - position, color);
    });
  }

  renderBands(bands: PlotBand[], axes: Axes): RectModel[] {
    // TODO: return Bands models
    return [];
  }

  renderGridLineModels(
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

  renderGridsIfCenterYAxis(axes: Axes, yCenterAxis: Required<YCenterAxis>): LineModel[] {
    const { xAxisHalfSize, secondStartX, yAxisHeight } = yCenterAxis;

    // vertical
    const xAxisTickCount = axes?.xAxis?.tickCount!;
    const verticalLines = [
      ...this.renderGridLineModels(makeTickPixelPositions(xAxisHalfSize, xAxisTickCount), true),
      ...this.renderGridLineModels(
        makeTickPixelPositions(xAxisHalfSize, xAxisTickCount, secondStartX),
        true
      ),
    ];

    // horizontal
    const yAxisTickCount = axes?.yAxis?.tickCount!;
    const horizontalLines = [
      ...this.renderGridLineModels(
        makeTickPixelPositions(yAxisHeight, yAxisTickCount),
        false,
        xAxisHalfSize
      ),
      ...this.renderGridLineModels(
        makeTickPixelPositions(yAxisHeight, yAxisTickCount),
        false,
        xAxisHalfSize,
        secondStartX
      ),
    ];

    return [...verticalLines, ...horizontalLines];
  }

  renderGrids(axes: Axes, yCenterAxis: YCenterAxis): LineModel[] {
    return yCenterAxis?.visible
      ? this.renderGridsIfCenterYAxis(axes, yCenterAxis as Required<YCenterAxis>)
      : [
          ...this.renderGridLineModels(this.getTickPixelPositions(false, axes), false),
          ...this.renderGridLineModels(this.getTickPixelPositions(true, axes), true),
        ];
  }

  getTickPixelPositions(vertical: boolean, axes: Axes) {
    const size = vertical ? this.rect.width : this.rect.height;
    const { tickCount } = vertical ? axes.xAxis! : axes.yAxis!;

    return makeTickPixelPositions(size, tickCount);
  }

  render(state: ChartState<Options>) {
    const { layout, axes, plot, yCenterAxis } = state;
    this.rect = layout.plot;

    this.models.plot = this.renderGrids(axes, yCenterAxis);

    if (state.plot) {
      const { lines, bands } = plot;

      this.models.line = this.renderLines(lines, axes);
      this.models.band = this.renderBands(bands, axes);
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
