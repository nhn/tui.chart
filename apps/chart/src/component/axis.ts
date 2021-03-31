import Component from './component';
import { ChartState, Options, ViewAxisLabel, AxisData, ScaleData } from '@t/store/store';
import { makeTickPixelPositions, crispPixel } from '@src/helpers/calculator';
import { TickModel, LineModel, AxisModels, LabelModel } from '@t/components/axis';
import { TICK_SIZE } from '@src/brushes/axis';
import { includes } from '@src/helpers/utils';
import { getAxisTheme } from '@src/helpers/axes';
import { AxisTheme } from '@t/theme';
import { getTitleFontString } from '@src/helpers/style';

type CoordinateKey = 'x' | 'y';

interface RenderOptions {
  relativePositions: number[];
  tickInterval: number;
  needRotateLabel?: boolean;
  radian?: number;
  offsetY?: number;
}

export enum AxisType {
  X = 'xAxis',
  Y = 'yAxis',
  SECONDARY_Y = 'secondaryYAxis',
  CIRCULAR = 'circularAxis',
  VERTICAL = 'verticalAxis',
}

function getOffsetAndAnchorKey(
  hasBasedYAxis: boolean
): { offsetKey: CoordinateKey; anchorKey: CoordinateKey } {
  return {
    offsetKey: hasBasedYAxis ? 'y' : 'x',
    anchorKey: hasBasedYAxis ? 'x' : 'y',
  };
}

export default class Axis extends Component {
  models: AxisModels = { label: [], tick: [], axisLine: [] };

  drawModels!: AxisModels;

  yAxisComponent!: boolean;

  theme!: Required<AxisTheme>;

  axisSize = 0;

  initialize({ name }: { name: AxisType }) {
    this.type = 'axis';
    this.name = name;
    this.yAxisComponent = includes([AxisType.Y, AxisType.SECONDARY_Y], name);
  }

  render({ layout, axes, theme, scale }: ChartState<Options>) {
    if (axes.centerYAxis || !axes[this.name]) {
      return;
    }

    this.theme = getAxisTheme(theme, this.name) as Required<AxisTheme>;
    this.rect = layout[this.name];
    this.axisSize = this.yAxisComponent ? this.rect.height : this.rect.width;

    const { viewLabels } = axes[this.name];

    const { offsetKey, anchorKey } = getOffsetAndAnchorKey(this.yAxisComponent);

    const renderOptions: RenderOptions = this.makeRenderOptions(
      axes[this.name],
      scale?.[this.name]
    );

    const hasOnlyAxisLine = this.hasOnlyAxisLine();

    if (!hasOnlyAxisLine) {
      this.models.label = this.renderLabelModels(viewLabels, offsetKey, anchorKey, renderOptions);

      this.models.tick = this.renderTickModels(offsetKey, anchorKey, renderOptions);
    }

    this.models.axisLine = [this.renderAxisLineModel()];

    if (!this.drawModels) {
      this.drawModels = {
        tick: [],
        label: [],
        axisLine: this.models.axisLine,
      };

      ['tick', 'label'].forEach((type) => {
        this.drawModels[type] = this.models[type].map((m) => {
          const drawModel = { ...m };

          if (this.yAxisComponent) {
            drawModel.y = 0;
          } else {
            drawModel.x = 0;
          }

          return drawModel;
        });
      });
    }
  }

  renderAxisLineModel(): LineModel {
    const zeroPixel = crispPixel(0);
    let lineModel: LineModel;
    const { color: strokeStyle, width: lineWidth } = this.theme;

    if (this.yAxisComponent) {
      const x = this.getYAxisXPoint();

      lineModel = {
        type: 'line',
        x,
        y: zeroPixel,
        x2: x,
        y2: crispPixel(this.axisSize),
        strokeStyle,
        lineWidth,
      };
    } else {
      lineModel = {
        type: 'line',
        x: zeroPixel,
        y: zeroPixel,
        x2: crispPixel(this.axisSize),
        y2: zeroPixel,
        strokeStyle,
        lineWidth,
      };
    }

    return lineModel;
  }

  renderTickModels(
    offsetKey: CoordinateKey,
    anchorKey: CoordinateKey,
    renderOptions: RenderOptions
  ): TickModel[] {
    const tickAnchorPoint = this.yAxisComponent ? this.getYAxisXPoint() : crispPixel(0);
    const { tickInterval, relativePositions } = renderOptions;
    const tickSize = includes([AxisType.SECONDARY_Y, AxisType.X], this.name)
      ? TICK_SIZE
      : -TICK_SIZE;

    return relativePositions.reduce<TickModel[]>((positions, position, index) => {
      return index % tickInterval
        ? positions
        : [
            ...positions,
            {
              type: 'tick',
              isYAxis: this.yAxisComponent,
              tickSize,
              [offsetKey]: crispPixel(position),
              [anchorKey]: tickAnchorPoint,
              strokeStyle: this.theme.color,
              lineWidth: this.theme.width,
            } as TickModel,
          ];
    }, []);
  }

  renderLabelModels(
    labels: ViewAxisLabel[],
    offsetKey: CoordinateKey,
    anchorKey: CoordinateKey,
    renderOptions: RenderOptions
  ): LabelModel[] {
    const { needRotateLabel, radian, offsetY } = renderOptions;
    const labelTheme = this.theme.label;
    const font = getTitleFontString(labelTheme);
    const textAlign = this.getLabelTextAlign(needRotateLabel);
    const style = ['default', { textAlign, font, fillStyle: labelTheme.color }];
    const labelAnchorPoint = this.yAxisComponent ? this.getYAxisAnchorPoint() : offsetY;

    return labels.map(
      ({ text, offsetPos }) =>
        ({
          type: 'label',
          text,
          style,
          radian,
          [offsetKey]: crispPixel(offsetPos),
          [anchorKey]: labelAnchorPoint,
        } as LabelModel)
    );
  }

  makeRenderOptions(axisData: AxisData, scale?: ScaleData): RenderOptions {
    const { tickCount, tickInterval } = axisData;
    const sizeRatio = scale?.sizeRatio ?? 1;
    const positionRatio = scale?.positionRatio ?? 0;

    const relativePositions = makeTickPixelPositions(
      this.axisSize * sizeRatio,
      tickCount,
      this.axisSize * positionRatio
    );

    if (this.yAxisComponent) {
      return {
        relativePositions,
        tickInterval,
      };
    }
    const { needRotateLabel, radian, offsetY } = axisData;

    return {
      relativePositions,
      tickInterval,
      needRotateLabel,
      radian,
      offsetY,
    };
  }

  getYAxisAnchorPoint() {
    return this.isRightSide() ? crispPixel(this.rect.width) : crispPixel(0);
  }

  getLabelTextAlign(needRotateLabel?: boolean) {
    const yAxisTextAlign = this.isRightSide() ? 'right' : 'left';
    const xAxisTextAlign = needRotateLabel ? 'left' : 'center';

    return this.yAxisComponent ? yAxisTextAlign : xAxisTextAlign;
  }

  private isRightSide() {
    return this.name === AxisType.SECONDARY_Y;
  }

  private getYAxisXPoint() {
    return this.isRightSide() ? crispPixel(0) : crispPixel(this.rect.width);
  }

  private hasOnlyAxisLine() {
    return (
      (this.yAxisComponent && !this.rect.width) || (this.name === AxisType.X && !this.rect.height)
    );
  }
}
