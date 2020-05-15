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

function isYAxis(name: AxisType) {
  return name === AxisType.Y || name === AxisType.CENTER_Y;
}

type DrawModels = LabelModel | TickModel | LineModel;
type AxisModels = Record<string, DrawModels[]>;
type CoordinateKey = 'x' | 'y';

interface RenderOptions {
  pointOnColumn: boolean;
  tickDistance: number;
  tickInterval: number;
}

export default class Axis extends Component {
  name!: AxisType;

  models: AxisModels = {};

  drawModels!: AxisModels;

  initialize({ name }: { name: AxisType }) {
    this.type = 'axis';
    this.name = name;
  }

  render({ layout, axes }: ChartState<Options>) {
    this.rect = layout[this.name];

    const { labels, tickCount, pointOnColumn, isLabelAxis, tickDistance, tickInterval } = axes[
      this.name
    ]!;

    const relativePositions = makeTickPixelPositions(this.axisSize(), tickCount);
    const offsetKey = isYAxis(this.name) ? 'y' : 'x';
    const anchorKey = isYAxis(this.name) ? 'x' : 'y';

    const renderOptions: RenderOptions = {
      pointOnColumn,
      tickDistance,
      tickInterval
    };

    this.models.label = this.renderLabelModels(
      relativePositions,
      !isLabelAxis && isYAxis(this.name) ? labels.reverse() : labels,
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

          if (isYAxis(this.name)) {
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

    if (isYAxis(this.name)) {
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
    const tickAnchorPoint = isYAxis(this.name) ? crispPixel(this.rect.width) : crispPixel(0);
    const { tickInterval } = renderOptions;

    return relativePositions.reduce((positions, position, index) => {
      return index % tickInterval
        ? positions
        : [
            ...positions,
            {
              type: 'tick',
              isYAxis: isYAxis(this.name),
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
    const { tickDistance, pointOnColumn } = renderOptions;
    const labelAnchorPoint = isYAxis(this.name) ? crispPixel(0) : crispPixel(this.rect.height);
    const labelAdjustment = pointOnColumn ? tickDistance / 2 : 0;

    return labels.map((text, index) => {
      return {
        type: 'label',
        text,
        style: ['default', { textAlign: isYAxis(this.name) ? 'left' : 'center' }],
        [offsetKey]: crispPixel(relativePositions[index] + labelAdjustment),
        [anchorKey]: labelAnchorPoint
      };
    }) as LabelModel[];
  }

  axisSize() {
    return isYAxis(this.name) ? this.rect.height : this.rect.width;
  }

  beforeDraw(painter: Painter) {
    painter.ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
    painter.ctx.lineWidth = 1;
  }
}
