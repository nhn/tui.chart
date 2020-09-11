import Component from './component';
import Painter from '@src/painter';
import { ChartState, Options } from '@t/store/store';
import { makeTickPixelPositions, crispPixel, LABEL_ANCHOR_POINT } from '@src/helpers/calculator';
import { LabelModel, TickModel, LineModel, AxisModels } from '@t/components/axis';
import { TICK_SIZE } from '@src/brushes/axis';
import { includes } from '@src/helpers/utils';

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

  initialize({ name }: { name: AxisType }) {
    this.type = 'axis';
    this.name = name;
    this.yAxisComponent = includes([AxisType.Y, AxisType.SECONDARY_Y], name);
  }

  render({ layout, axes }: ChartState<Options>) {
    if (axes.centerYAxis || !axes[this.name]) {
      return;
    }

    this.rect = layout[this.name];

    const {
      labels,
      tickCount,
      pointOnColumn,
      isLabelAxis,
      tickDistance,
      tickInterval,
      labelInterval,
      labelDistance,
    } = axes[this.name];

    const relativePositions = makeTickPixelPositions(this.axisSize(), tickCount);

    const { offsetKey, anchorKey } = getOffsetAndAnchorKey(this.yAxisComponent);

    const renderOptions: RenderOptions = {
      pointOnColumn,
      tickDistance,
      tickInterval,
      labelInterval,
      labelDistance,
    };

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
    const { pointOnColumn, labelInterval, labelDistance } = renderOptions;
    const isRightSide = this.isRightSide();
    const yAxisAnchorPoint = isRightSide ? crispPixel(this.rect.width) : crispPixel(0);
    const labelAnchorPoint = this.yAxisComponent ? yAxisAnchorPoint : LABEL_ANCHOR_POINT;
    const labelAdjustment = pointOnColumn ? labelDistance / 2 : 0;
    const yAxisTextAlign = isRightSide ? 'right' : 'left';
    const style = ['default', { textAlign: this.yAxisComponent ? yAxisTextAlign : 'center' }];

    return labels.reduce<LabelModel[]>((positions, text, index) => {
      return index % labelInterval
        ? positions
        : [
            ...positions,
            {
              type: 'label',
              text,
              style,
              [offsetKey]: crispPixel(relativePositions[index] + labelAdjustment),
              [anchorKey]: labelAnchorPoint,
            } as LabelModel,
          ];
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
      (this.yAxisComponent && !this.rect.width) || (this.name === 'xAxis' && !this.rect.height)
    );
  }
}
