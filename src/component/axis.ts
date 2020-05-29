import Component from './component';
import Painter from '@src/painter';
import { ChartState, Options } from '@t/store/store';
import { makeTickPixelPositions, crispPixel } from '@src/helpers/calculator';
import { LabelModel, TickModel, LineModel } from '@t/components/axis';

export enum AxisType {
  Y = 'yAxis',
  X = 'xAxis',
  CENTER_Y = 'yCenterAxis'
}

type DrawModels = LabelModel | TickModel | LineModel;
type AxisModels = Record<string, DrawModels[]>;
type CoordinateKey = 'x' | 'y';

interface RenderOptions {
  pointOnColumn: boolean;
  tickDistance: number;
  tickInterval: number;
  labelInterval: number;
}

export default class Axis extends Component {
  name!: AxisType;

  models: AxisModels = {};

  drawModels!: AxisModels;

  yAxisComponent!: boolean;

  initialize({ name }: { name: AxisType }) {
    this.type = 'axis';
    this.name = name;
    this.yAxisComponent = name === AxisType.Y || name === AxisType.CENTER_Y;
  }

  render({ layout, axes }: ChartState<Options>) {
    this.rect = layout[this.name];

    const {
      labels,
      tickCount,
      pointOnColumn,
      isLabelAxis,
      tickDistance,
      tickInterval,
      labelInterval
    } = axes[this.name]!;

    const relativePositions = makeTickPixelPositions(
      this.axisSize(),
      tickCount
    );
    const offsetKey = this.yAxisComponent ? 'y' : 'x';
    const anchorKey = this.yAxisComponent ? 'x' : 'y';

    const renderOptions: RenderOptions = {
      pointOnColumn,
      tickDistance,
      tickInterval,
      labelInterval
    };

    this.models.label = this.renderLabelModels(
      relativePositions,
      !isLabelAxis && this.yAxisComponent ? labels.reverse() : labels,
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

    this.models.axisLine = [this.renderAxisLineModel()];

    if (!this.drawModels) {
      this.drawModels = {};

      ['tick', 'label'].forEach(type => {
        this.drawModels[type] = this.models[type].map(m => {
          const drawModel = { ...m };

          if (this.yAxisComponent) {
            drawModel.y = 0;
          } else {
            drawModel.x = 0;
          }

          return drawModel;
        });
      });

      this.drawModels.axisLine = this.models.axisLine;
    }
  }

  renderAxisLineModel(): LineModel {
    const zeroPixel = crispPixel(0);

    if (this.yAxisComponent) {
      return {
        type: 'line',
        x: crispPixel(this.rect.width),
        y: zeroPixel,
        x2: crispPixel(this.rect.width),
        y2: crispPixel(this.rect.height)
      };
    }

    return {
      type: 'line',
      x: zeroPixel,
      y: zeroPixel,
      x2: crispPixel(this.rect.width),
      y2: zeroPixel
    };
  }

  renderTickModels(
    relativePositions: number[],
    offsetKey: CoordinateKey,
    anchorKey: CoordinateKey,
    renderOptions: RenderOptions
  ): TickModel[] {
    const tickAnchorPoint = this.yAxisComponent
      ? crispPixel(this.rect.width)
      : crispPixel(0);
    const { tickInterval } = renderOptions;

    return relativePositions.reduce((positions, position, index) => {
      return index % tickInterval
        ? positions
        : [
            ...positions,
            {
              type: 'tick',
              isYAxis: this.yAxisComponent,
              [offsetKey]: crispPixel(position),
              [anchorKey]: tickAnchorPoint
            } as TickModel
          ];
    }, [] as TickModel[]);
  }

  renderLabelModels(
    relativePositions: number[],
    labels: string[],
    offsetKey: CoordinateKey,
    anchorKey: CoordinateKey,
    renderOptions: RenderOptions
  ): LabelModel[] {
    const { tickDistance, pointOnColumn, labelInterval } = renderOptions;
    const labelAnchorPoint = this.yAxisComponent
      ? crispPixel(0)
      : crispPixel(this.rect.height);
    const labelAdjustment = pointOnColumn ? tickDistance / 2 : 0;

    return labels.reduce((positions, text, index) => {
      return index % labelInterval
        ? positions
        : [
            ...positions,
            {
              type: 'label',
              text,
              style: [
                'default',
                { textAlign: this.yAxisComponent ? 'left' : 'center' }
              ],
              [offsetKey]: crispPixel(
                relativePositions[index] + labelAdjustment
              ),
              [anchorKey]: labelAnchorPoint
            } as LabelModel
          ];
    }, [] as LabelModel[]);
  }

  axisSize() {
    return this.yAxisComponent ? this.rect.height : this.rect.width;
  }

  beforeDraw(painter: Painter) {
    painter.ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
    painter.ctx.lineWidth = 1;
  }
}
