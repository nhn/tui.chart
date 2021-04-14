import Component from './component';
import { ChartState, Options, Axes, ValueEdge, LabelAxisData, Scale } from '@t/store/store';
import { crispPixel, makeTickPixelPositions, getXPosition } from '@src/helpers/calculator';
import Painter from '@src/painter';
import { LineModel } from '@t/components/axis';
import { PlotModels } from '@t/components/plot';
import { RectModel } from '@t/components/series';
import { PlotLine, PlotBand, PlotRangeType } from '@t/options';
import { PlotTheme, LineTheme } from '@t/theme';
import { pick } from '@src/helpers/utils';

type XPositionParam = {
  axisData: LabelAxisData;
  offsetSize: number;
  value: number | string;
  xAxisLimit?: ValueEdge;
  categories: string[];
  startIndex: number;
};

function getValidIndex(index: number, startIndex = 0) {
  return ~~index ? index - startIndex : index;
}

function validXPosition({ axisData, offsetSize, value, startIndex = 0 }: XPositionParam) {
  const dataIndex = getValidIndex(value as number, startIndex);
  const x = getXPosition(axisData, offsetSize, value, dataIndex);

  return x > 0 ? Math.min(offsetSize, x) : 0;
}

function getPlotAxisData(vertical: boolean, axes: Axes) {
  return vertical ? axes.xAxis : axes.yAxis;
}
export default class Plot extends Component {
  models: PlotModels = { plot: [], line: [], band: [] };

  startIndex = 0;

  theme!: Required<PlotTheme>;

  initialize() {
    this.type = 'plot';
  }

  getPlotAxisSize(vertical: boolean) {
    return {
      offsetSize: vertical ? this.rect.width : this.rect.height,
      anchorSize: vertical ? this.rect.height : this.rect.width,
    };
  }

  renderLines(axes: Axes, categories: string[], lines: PlotLine[] = []): LineModel[] {
    return lines.map(({ value, color }) => {
      const { offsetSize } = this.getPlotAxisSize(true);
      const position = validXPosition({
        axisData: getPlotAxisData(true, axes) as LabelAxisData,
        offsetSize,
        value,
        categories,
        startIndex: this.startIndex,
      });

      return this.makeLineModel(true, position, { color });
    });
  }

  renderBands(axes: Axes, categories: string[], bands: PlotBand[] = []): RectModel[] {
    const { offsetSize, anchorSize } = this.getPlotAxisSize(true);

    return bands.map(({ range, color }: PlotBand) => {
      const [start, end] = (range as PlotRangeType).map((value) =>
        validXPosition({
          axisData: getPlotAxisData(true, axes) as LabelAxisData,
          offsetSize,
          value,
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
    options: { size?: number; startPosition?: number; axes?: Axes } = {}
  ): LineModel[] {
    const { size, startPosition, axes } = options;

    const { lineColor: color, lineWidth, dashSegments } = this.theme[
      vertical ? 'vertical' : 'horizontal'
    ] as Required<LineTheme>;
    const tickInterval = (vertical ? axes?.xAxis : axes?.yAxis)?.tickInterval || 1;

    return relativePositions
      .filter((_, idx) => !(idx % tickInterval))
      .map((position) =>
        this.makeLineModel(
          vertical,
          position,
          { color, lineWidth, dashSegments },
          size ?? this.rect.width,
          startPosition ?? 0
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
    const yAxisTickPixelPositions = makeTickPixelPositions(yAxisHeight, yAxisTickCount);
    const horizontalLines = [
      ...this.renderPlotLineModels(yAxisTickPixelPositions, false, { size: xAxisHalfSize }),
      ...this.renderPlotLineModels(yAxisTickPixelPositions, false, {
        size: xAxisHalfSize,
        startPosition: secondStartX,
      }),
    ];

    return [...verticalLines, ...horizontalLines];
  }

  renderPlots(axes: Axes, scale?: Scale): LineModel[] {
    const vertical = true;

    return axes.centerYAxis
      ? this.renderPlotsForCenterYAxis(axes)
      : [
          ...this.renderPlotLineModels(this.getHorizontalTickPixelPositions(axes), !vertical, {
            axes,
          }),
          ...this.renderPlotLineModels(this.getVerticalTickPixelPositions(axes, scale), vertical, {
            axes,
          }),
        ];
  }

  getVerticalTickPixelPositions(axes: Axes, scale?: Scale) {
    const { offsetSize } = this.getPlotAxisSize(true);
    const axisData = getPlotAxisData(true, axes);
    if ((axisData as LabelAxisData)?.labelRange) {
      const sizeRatio = scale?.xAxis?.sizeRatio ?? 1;
      const positionRatio = scale?.xAxis?.positionRatio ?? 0;
      const axisSizeAppliedRatio = offsetSize * sizeRatio;
      const additional = offsetSize * positionRatio;

      return makeTickPixelPositions(axisSizeAppliedRatio, axisData.tickCount, additional);
    }

    return makeTickPixelPositions(offsetSize, axisData.tickCount);
  }

  getHorizontalTickPixelPositions(axes: Axes) {
    const { offsetSize } = this.getPlotAxisSize(false);
    const axisData = getPlotAxisData(false, axes);

    return makeTickPixelPositions(offsetSize, axisData.tickCount);
  }

  renderPlotBackgroundRect(): RectModel {
    return {
      type: 'rect',
      x: 0,
      y: 0,
      ...pick(this.rect, 'width', 'height'),
      color: this.theme.backgroundColor,
    };
  }

  render(state: ChartState<Options>) {
    const { layout, axes, plot, zoomRange, theme, scale } = state;

    if (!plot) {
      return;
    }

    this.rect = layout.plot;
    this.startIndex = zoomRange?.[0] ?? 0;
    this.theme = theme.plot! as Required<PlotTheme>;

    const categories = (state.categories as string[]) ?? [];
    const { lines, bands, visible } = plot;

    this.models.line = this.renderLines(axes, categories, lines);
    this.models.band = this.renderBands(axes, categories, bands);

    if (visible) {
      this.models.plot = [this.renderPlotBackgroundRect(), ...this.renderPlots(axes, scale)];
    }
  }

  makeLineModel(
    vertical: boolean,
    position: number,
    {
      color,
      dashSegments = [],
      lineWidth = 1,
    }: { color: string; dashSegments?: number[]; lineWidth?: number },
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
      lineWidth,
      dashSegments,
    };
  }

  beforeDraw(painter: Painter) {
    painter.ctx.strokeStyle = 'rgba(0, 0, 0, 0.05)';
    painter.ctx.lineWidth = 1;
  }
}
