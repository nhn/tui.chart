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

export default class Axis extends Component {
  name!: AxisType;

  models: AxisModels = {};

  drawModels!: AxisModels;

  isCategoryType = false;

  initialize({ name }: { name: AxisType }) {
    this.type = 'axis';
    this.name = name;
  }

  render({ layout, axes }: ChartState<Options>) {
    this.rect = layout[this.name];

    const { labels, tickCount, isCategoryType, isLabelAxis } = axes[this.name];

    this.isCategoryType = isCategoryType;

    const relativePositions = makeTickPixelPositions(this.axisSize(), tickCount);

    const offsetKey = isYAxis(this.name) ? 'y' : 'x';
    const anchorKey = isYAxis(this.name) ? 'x' : 'y';

    this.models.label = this.renderLabelModels(
      relativePositions,
      !isLabelAxis && isYAxis(this.name) ? labels.reverse() : labels,
      offsetKey,
      anchorKey
    );

    this.models.tick = this.renderTickModels(relativePositions, offsetKey, anchorKey);

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
    anchorKey: CoordinateKey
  ): TickModel[] {
    const tickAnchorPoint = isYAxis(this.name) ? crispPixel(this.rect.width) : crispPixel(0);

    return relativePositions.map(position => ({
      type: 'tick',
      isYAxis: isYAxis(this.name),
      [offsetKey]: crispPixel(position),
      [anchorKey]: tickAnchorPoint
    })) as TickModel[];
  }

  renderLabelModels(
    relativePositions: number[],
    labels: string[],
    offsetKey: CoordinateKey,
    anchorKey: CoordinateKey
  ): LabelModel[] {
    const labelAnchorPoint = isYAxis(this.name) ? crispPixel(0) : crispPixel(this.rect.height);

    const labelAdjustment = this.isCategoryType ? this.tickDistance(labels.length) / 2 : 0;

    return labels.map((text, index) => {
      return {
        type: 'label',
        text,
        align: isYAxis(this.name) ? 'left' : 'center',
        [offsetKey]: crispPixel(relativePositions[index] + labelAdjustment),
        [anchorKey]: labelAnchorPoint
      };
    }) as LabelModel[];
  }

  tickDistance(labelsCount: number) {
    const offsetSizeKey = isYAxis(this.name) ? 'height' : 'width';

    return this.rect[offsetSizeKey] / labelsCount;
  }

  axisSize() {
    return isYAxis(this.name) ? this.rect.height : this.rect.width;
  }

  beforeDraw(painter: Painter) {
    painter.ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
    painter.ctx.lineWidth = 1;
  }
}
