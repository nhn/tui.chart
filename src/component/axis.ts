import Component from './component';
import Painter from '@src/painter';

import { ChartState } from '@src/store/store';

import { LabelModel, TickModel, LineModel } from '@src/brushes/axis';

import { makeTickPixelPositions, crispPixel } from '@src/helpers/calculator';

type axisType = 'xAxis' | 'yAxis' | 'yCenterAxis';

type DrawModels = LabelModel | TickModel | LineModel;

const isYAxis = (name: string) => name === 'yAxis' || name === 'yCenterAxis';

export default class Axis extends Component {
  name!: axisType;

  models: Record<string, DrawModels[]> = {};

  drawModels!: Record<string, DrawModels[]>;

  initialize({ name }: { name: axisType }) {
    this.type = 'axis';
    this.name = name;
  }

  render({ layout, axes, options }: ChartState) {
    this.rect = layout[this.name];

    const { labels, tickCount } = axes[this.name];
    const { pointOnColumn } = options[this.name];

    const relativePositions = makeTickPixelPositions(this.axisSize(), tickCount);

    const offsetKey = isYAxis(this.name) ? 'y' : 'x';
    const anchorKey = isYAxis(this.name) ? 'x' : 'y';

    // this.models = [
    //   ...this.renderLabelModels({
    //     relativePositions,
    //     labels,
    //     offsetKey,
    //     anchorKey,
    //     pointOnColumn
    //   }),
    //   ...this.renderTickModels({
    //     relativePositions,
    //     offsetKey,
    //     anchorKey
    //   }),
    //   this.renderAxisLineModel()
    // ];

    this.models.label = this.renderLabelModels({
      relativePositions,
      labels,
      offsetKey,
      anchorKey,
      pointOnColumn
    });

    this.models.tick = this.renderTickModels({
      relativePositions,
      offsetKey,
      anchorKey
    });

    this.models.axisLine = [this.renderAxisLineModel()];

    if (!this.drawModels) {
      this.drawModels = {};

      ['tick', 'label'].forEach(type => {
        this.drawModels[type] = this.models[type].map(m => {
          const drawModel = {
            ...m
          };

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

  renderAxisLineModel() {
    const axisLine: any = {
      type: 'line'
    };

    if (isYAxis(this.name)) {
      axisLine.x = crispPixel(this.rect.width);
      axisLine.y = crispPixel(0);
      axisLine.x2 = crispPixel(this.rect.width);
      axisLine.y2 = crispPixel(this.rect.height);
    } else {
      axisLine.x = crispPixel(0);
      axisLine.y = crispPixel(0);
      axisLine.x2 = crispPixel(this.rect.width);
      axisLine.y2 = crispPixel(0);
    }

    return axisLine;
  }

  renderTickModels({
    relativePositions,
    offsetKey,
    anchorKey
  }: {
    relativePositions: number[];
    offsetKey: 'x' | 'y';
    anchorKey: 'x' | 'y';
  }) {
    const tickAnchorPoint = isYAxis(this.name) ? crispPixel(this.rect.width) : crispPixel(0);

    const tickModels = relativePositions.map(position => {
      const newTick: any = {
        type: 'tick',
        isYAxis: isYAxis(this.name)
      };

      const offset = crispPixel(position);

      newTick[offsetKey] = offset;
      newTick[anchorKey] = tickAnchorPoint;

      return newTick;
    });

    return tickModels;
  }

  renderLabelModels({
    relativePositions,
    labels,
    offsetKey,
    anchorKey,
    pointOnColumn
  }: {
    relativePositions: number[];
    labels: string[];
    offsetKey: 'x' | 'y';
    anchorKey: 'x' | 'y';
    pointOnColumn: boolean;
  }) {
    const labelAnchorPoint = isYAxis(this.name) ? crispPixel(0) : crispPixel(this.rect.height);

    const labelAdjustment = pointOnColumn ? this.tickDistance(labels.length) / 2 : 0;
    const labelAlign: CanvasTextAlign = labelAdjustment ? 'center' : 'left';

    const labelModels = relativePositions.map((position, index) => {
      const newLabel: any = {
        type: 'label',
        text: labels[labels.length - 1 - index],
        align: labelAlign
      };

      const offset = crispPixel(position);

      newLabel[offsetKey] = offset + labelAdjustment;
      newLabel[anchorKey] = labelAnchorPoint;

      return newLabel;
    });

    if (labelAlign === 'center') {
      labelModels.pop();
    }

    return labelModels;
  }

  tickDistance(labelsCount: number) {
    const offsetSizeKey = isYAxis(this.name) ? 'height' : 'width';

    return this.rect[offsetSizeKey] / labelsCount;
  }

  axisSize() {
    return isYAxis(this.name) ? this.rect.height : this.rect.width;
  }

  beforeDraw(painter: Painter) {
    painter.ctx.strokeStyle = 'black';
    painter.ctx.lineWidth = 1;
  }
}
