import Component from './component';
import Painter from '@src/painter';
import { AxisType, ChartState } from '@t/store/store';
import { makeTickPixelPositions, crispPixel } from '@src/helpers/calculator';
import { LabelModel, TickModel, LineModel } from '@t/components/axis';

function isYAxis(name: 'yAxis' | 'xAxis' | 'yCenterAxis') {
  return name === 'yAxis' || name === 'yCenterAxis';
}

type DrawModels = LabelModel | TickModel | LineModel;
type AxisModels = Record<string, DrawModels[]>;
type CoordinateKey = 'x' | 'y';

export default class Axis extends Component {
  name!: AxisType;

  models: AxisModels = {};

  drawModels!: AxisModels;

  initialize({ name }: { name: AxisType }) {
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

    this.models.label = this.renderLabelModels(
      relativePositions,
      labels,
      offsetKey,
      anchorKey,
      pointOnColumn
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
  ) {
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
    anchorKey: CoordinateKey,
    pointOnColumn: boolean
  ) {
    const labelAnchorPoint = isYAxis(this.name) ? crispPixel(0) : crispPixel(this.rect.height);

    const labelAdjustment = pointOnColumn ? this.tickDistance(labels.length) / 2 : 0;
    const labelAlign: CanvasTextAlign = labelAdjustment ? 'center' : 'left';

    const labelModels = relativePositions.map((position, index) => {
      const textIndex = isYAxis(this.name) ? labels.length - 1 - index : index;

      return {
        type: 'label',
        text: labels[textIndex],
        align: labelAlign,
        [offsetKey]: crispPixel(position) + labelAdjustment,
        [anchorKey]: labelAnchorPoint
      };
    });

    if (labelAlign === 'center') {
      labelModels.pop();
    }

    return labelModels as LabelModel[];
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
