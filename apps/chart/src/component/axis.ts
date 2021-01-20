import Component from './component';
import Painter from '@src/painter';
import { ChartState, Options } from '@t/store/store';
import {
  makeTickPixelPositions,
  crispPixel,
  getAxisLabelAnchorPoint,
} from '@src/helpers/calculator';
import { LabelModel, TickModel, LineModel, AxisModels } from '@t/components/axis';
import { TICK_SIZE } from '@src/brushes/axis';
import { includes, pick } from '@src/helpers/utils';
import { getAxisTheme } from '@src/helpers/axes';
import { AxisTheme } from '@t/theme';
import { getTitleFontString } from '@src/helpers/style';

export enum AxisType {
  X = 'xAxis',
  Y = 'yAxis',
  SECONDARY_Y = 'secondaryYAxis',
}

type CoordinateKey = 'x' | 'y';

interface RenderOptions {
  pointOnColumn: boolean;
  tickDistance: number;
  tickInterval: number;
  labelInterval: number;
  labelDistance: number;
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

  initialize({ name }: { name: AxisType }) {
    this.type = 'axis';
    this.name = name;
    this.yAxisComponent = includes([AxisType.Y, AxisType.SECONDARY_Y], name);
  }

  render({ layout, axes, theme }: ChartState<Options>) {
    if (axes.centerYAxis || !axes[this.name]) {
      return;
    }

    this.theme = getAxisTheme(theme, this.name) as Required<AxisTheme>;
    this.rect = layout[this.name];

    const { labels, tickCount, isLabelAxis } = axes[this.name];
    const relativePositions = makeTickPixelPositions(this.axisSize(), tickCount);

    const { offsetKey, anchorKey } = getOffsetAndAnchorKey(this.yAxisComponent);

    const renderOptions: RenderOptions = pick(
      axes[this.name],
      'pointOnColumn',
      'tickDistance',
      'tickInterval',
      'labelInterval',
      'labelDistance'
    );

    const hasOnlyAxisLine = this.hasOnlyAxisLine();

    if (!hasOnlyAxisLine) {
      this.models.label = this.renderLabelModels(
        relativePositions,
        !isLabelAxis && this.yAxisComponent ? [...labels].reverse() : labels,
        offsetKey,
        anchorKey,
        renderOptions
      );

      this.models.tick = this.renderTickModels(
        relativePositions,
        offsetKey,
        anchorKey,
        renderOptions
      );
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
    const widthPixel = crispPixel(this.rect.width);
    let lineModel: LineModel;

    if (this.yAxisComponent) {
      const x = this.getYAxisXPoint();

      lineModel = {
        type: 'line',
        x,
        y: zeroPixel,
        x2: x,
        y2: crispPixel(this.rect.height),
      };
    } else {
      lineModel = {
        type: 'line',
        x: zeroPixel,
        y: zeroPixel,
        x2: widthPixel,
        y2: zeroPixel,
      };
    }

    return lineModel;
  }

  renderTickModels(
    relativePositions: number[],
    offsetKey: CoordinateKey,
    anchorKey: CoordinateKey,
    renderOptions: RenderOptions
  ): TickModel[] {
    const tickAnchorPoint = this.yAxisComponent ? this.getYAxisXPoint() : crispPixel(0);
    const { tickInterval } = renderOptions;
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
    relativePositions: number[],
    labels: string[],
    offsetKey: CoordinateKey,
    anchorKey: CoordinateKey,
    renderOptions: RenderOptions
  ): LabelModel[] {
    const { width, height } = this.rect;
    const { pointOnColumn, labelInterval, labelDistance, tickInterval } = renderOptions;

    const labelTheme = this.theme.label;
    const font = getTitleFontString(labelTheme);

    const isRightSide = this.isRightSide();
    const yAxisAnchorPoint = isRightSide ? crispPixel(width) : crispPixel(0);
    const labelAnchorPoint = this.yAxisComponent
      ? yAxisAnchorPoint
      : getAxisLabelAnchorPoint(labels[0], font);
    const interval = labelInterval === tickInterval ? labelInterval : 1;
    const labelAdjustment = pointOnColumn ? (labelDistance * interval) / 2 : 0;
    const yAxisTextAlign = isRightSide ? 'right' : 'left';
    const textAlign = this.yAxisComponent ? yAxisTextAlign : 'center';

    const style = ['default', { textAlign, font, fillStyle: labelTheme.color }];
    const limit = offsetKey === 'x' ? width : height;

    return labels.reduce<LabelModel[]>((positions, text, index) => {
      const offsetPos = relativePositions[index] + labelAdjustment;
      const needRender = !(index % labelInterval) && offsetPos <= limit;

      return needRender
        ? [
            ...positions,
            {
              type: 'label',
              text,
              style,
              [offsetKey]: crispPixel(offsetPos),
              [anchorKey]: labelAnchorPoint,
            } as LabelModel,
          ]
        : positions;
    }, []);
  }

  axisSize() {
    return this.yAxisComponent ? this.rect.height : this.rect.width;
  }

  beforeDraw(painter: Painter) {
    painter.ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
    painter.ctx.lineWidth = 1;
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
