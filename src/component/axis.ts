import Component from './component';
import Painter from '@src/painter';
import { ChartState, Options, YCenterAxis } from '@t/store/store';
import { makeTickPixelPositions, crispPixel } from '@src/helpers/calculator';
import { LabelModel, TickModel, LineModel, AxisModels } from '@t/components/axis';

export enum AxisType {
  Y = 'yAxis',
  X = 'xAxis',
  CENTER_Y = 'yCenterAxis',
}

type CoordinateKey = 'x' | 'y';

interface RenderOptions {
  pointOnColumn: boolean;
  tickDistance: number;
  tickInterval: number;
  labelInterval: number;
  yCenterAxis: YCenterAxis;
}

export default class Axis extends Component {
  name!: AxisType;

  models: AxisModels = { label: [], tick: [], axisLine: [] };

  drawModels!: AxisModels;

  yAxisComponent!: boolean;

  visibleYCenterAxis!: boolean;

  initialize({ name }: { name: AxisType }) {
    this.type = 'axis';
    this.name = name;
    this.yAxisComponent = name === AxisType.Y;
  }

  render({ layout, axes, yCenterAxis }: ChartState<Options>) {
    this.rect = layout[this.name];
    this.visibleYCenterAxis = !!yCenterAxis?.visible;

    const {
      labels,
      tickCount,
      pointOnColumn,
      isLabelAxis,
      tickDistance,
      tickInterval,
      labelInterval,
    } = axes[this.name]!;

    const renderOptions: RenderOptions = {
      pointOnColumn,
      tickDistance,
      tickInterval,
      labelInterval,
      yCenterAxis,
    };
    const relativePositions = makeTickPixelPositions(this.axisSize(yCenterAxis), tickCount);
    const offsetKey = this.yAxisComponent ? 'y' : 'x';
    const anchorKey = this.yAxisComponent ? 'x' : 'y';

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

    this.models.axisLine = this.renderAxisLineModel(yCenterAxis);

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

  renderAxisLineModel(yCenterAxis: YCenterAxis): LineModel[] {
    return yCenterAxis?.visible
      ? this.makeAxisLineModelIfCenterYAxis(yCenterAxis)
      : this.makeAxisLineModel();
  }

  makeAxisLineModel(): LineModel[] {
    const zeroPixel = crispPixel(0);

    if (this.yAxisComponent) {
      return [
        {
          type: 'line',
          x: crispPixel(this.rect.width),
          y: zeroPixel,
          x2: crispPixel(this.rect.width),
          y2: crispPixel(this.rect.height),
        },
      ];
    }

    return [
      {
        type: 'line',
        x: zeroPixel,
        y: zeroPixel,
        x2: crispPixel(this.rect.width),
        y2: zeroPixel,
      },
    ];
  }

  makeAxisLineModelIfCenterYAxis({ xAxisHalfSize, secondStartX }: YCenterAxis): LineModel[] {
    const zeroPixel = crispPixel(0);
    let axisLine;

    if (this.yAxisComponent) {
      axisLine = [
        {
          type: 'line',
          x: crispPixel(this.rect.width),
          y: zeroPixel,
          x2: crispPixel(this.rect.width),
          y2: crispPixel(this.rect.height),
        },
        {
          type: 'line',
          x: zeroPixel,
          y: zeroPixel,
          x2: zeroPixel,
          y2: crispPixel(this.rect.height),
        },
      ];
    } else {
      axisLine = [
        {
          type: 'line',
          x: zeroPixel,
          y: zeroPixel,
          x2: crispPixel(xAxisHalfSize!),
          y2: zeroPixel,
        },
        {
          type: 'line',
          x: crispPixel(secondStartX!),
          y: zeroPixel,
          x2: crispPixel(this.rect.width),
          y2: zeroPixel,
        },
      ];
    }

    return axisLine;
  }

  renderTickModels(
    relativePositions: number[],
    offsetKey: CoordinateKey,
    anchorKey: CoordinateKey,
    renderOptions: RenderOptions
  ): TickModel[] {
    const tickAnchorPoint = this.yAxisComponent ? crispPixel(this.rect.width) : crispPixel(0);
    const { tickInterval, yCenterAxis } = renderOptions;
    let tickModels = relativePositions.reduce<TickModel[]>((positions, position, index) => {
      return index % tickInterval
        ? positions
        : [
            ...positions,
            {
              type: 'tick',
              isYAxis: this.yAxisComponent,
              direction: this.yAxisComponent ? 'left' : 'bottom',
              [offsetKey]: crispPixel(position),
              [anchorKey]: tickAnchorPoint,
            } as TickModel,
          ];
    }, []);

    if (this.visibleYCenterAxis) {
      tickModels = [
        ...tickModels,
        ...this.getAddedTickModels(tickModels, offsetKey, anchorKey, yCenterAxis?.secondStartX!),
      ];
    }

    return tickModels;
  }

  getAddedTickModels(
    basicTickModels: TickModel[],
    offsetKey: CoordinateKey,
    anchorKey: CoordinateKey,
    secondStartX: number
  ): TickModel[] {
    let models: TickModel[] = [];

    if (this.yAxisComponent) {
      models = basicTickModels.map(
        (model) =>
          ({
            ...model,
            [anchorKey]: crispPixel(0),
            direction: 'right',
          } as TickModel)
      );
    } else {
      models = basicTickModels.map(
        (model) =>
          ({
            ...model,
            [offsetKey]: crispPixel(model[offsetKey] + secondStartX),
          } as TickModel)
      );
    }

    return models;
  }

  renderLabelModels(
    relativePositions: number[],
    labels: string[],
    offsetKey: CoordinateKey,
    anchorKey: CoordinateKey,
    renderOptions: RenderOptions
  ): LabelModel[] {
    const { tickDistance, pointOnColumn, labelInterval, yCenterAxis } = renderOptions;
    const labelAdjustment = pointOnColumn ? tickDistance / 2 : 0;
    let labelAnchorPoint, textAlign, textLabels;

    if (this.yAxisComponent) {
      labelAnchorPoint = this.visibleYCenterAxis
        ? crispPixel(yCenterAxis?.yAxisLabelAnchorPoint!)
        : crispPixel(0);
      textAlign = this.visibleYCenterAxis ? 'center' : 'left';
      textLabels = labels;
    } else {
      labelAnchorPoint = crispPixel(this.rect.height);
      textAlign = 'center';
      textLabels = this.visibleYCenterAxis ? [...labels].reverse() : labels;
    }

    let models = textLabels.reduce((positions, text, index) => {
      return index % labelInterval
        ? positions
        : [
            ...positions,
            {
              type: 'label',
              text,
              style: ['default', { textAlign }],
              [offsetKey]: crispPixel(relativePositions[index] + labelAdjustment),
              [anchorKey]: labelAnchorPoint,
            },
          ];
    }, []);

    if (this.visibleYCenterAxis && !this.yAxisComponent) {
      models = [
        ...models,
        ...this.getAddedLabelModels(labels, models, offsetKey, yCenterAxis?.secondStartX!),
      ];
    }

    return models;
  }

  getAddedLabelModels(
    labels: string[],
    labelModels: LabelModel[],
    offsetKey: CoordinateKey,
    secondStartX: number
  ): LabelModel[] {
    return labelModels.map((model, index) => ({
      ...model,
      text: labels[index],
      [offsetKey]: crispPixel(model[offsetKey] + secondStartX),
    }));
  }

  axisSize(yCenterAxis: YCenterAxis) {
    let size;

    if (this.yAxisComponent) {
      size = this.rect.height;
    } else if (this.visibleYCenterAxis) {
      size = yCenterAxis?.xAxisHalfSize!;
    } else {
      size = this.rect.width;
    }

    return size;
  }

  beforeDraw(painter: Painter) {
    painter.ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
    painter.ctx.lineWidth = 1;
  }
}
