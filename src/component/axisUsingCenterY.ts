import Component from './component';
import Painter from '@src/painter';
import { AxisType } from '@src/component/axis';
import { ChartState, Options, CenterYAxisData } from '@t/store/store';
import { makeTickPixelPositions, crispPixel } from '@src/helpers/calculator';
import { LabelModel, TickModel, LineModel, AxisModels } from '@t/components/axis';

type CoordinateKey = 'x' | 'y';

interface RenderOptions {
  pointOnColumn: boolean;
  tickDistance: number;
  tickInterval: number;
  labelInterval: number;
  centerYAxis: CenterYAxisData;
}

export default class AxisUsingCenterY extends Component {
  name!: AxisType;

  models: AxisModels = { label: [], tick: [], axisLine: [] };

  drawModels!: AxisModels;

  yAxisComponent!: boolean;

  initialize({ name }: { name: AxisType }) {
    this.type = 'axis';
    this.name = name;
    this.yAxisComponent = name === AxisType.Y;
  }

  render({ layout, axes }: ChartState<Options>) {
    const {centerYAxis} = axes;

    if (!centerYAxis.visible) {
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
    } = axes[this.name];

    const renderOptions: RenderOptions = {
      pointOnColumn,
      tickDistance,
      tickInterval,
      labelInterval,
      centerYAxis
    };
    const relativePositions = makeTickPixelPositions(this.axisSize(centerYAxis), tickCount);
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

    this.models.axisLine = this.renderAxisLineModel(centerYAxis);

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

  renderAxisLineModel({ xAxisHalfSize, secondStartX }: CenterYAxisData): LineModel[] {
    const zeroPixel = crispPixel(0);
    const widthPixel = crispPixel(this.rect.width);

    let axisLine;

    if (this.yAxisComponent) {
      const heightPixel = crispPixel(this.rect.height);

      axisLine = [
        {
          type: 'line',
          x: widthPixel,
          y: zeroPixel,
          x2: widthPixel,
          y2:heightPixel,
        },
        {
          type: 'line',
          x: zeroPixel,
          y: zeroPixel,
          x2: zeroPixel,
          y2: heightPixel
        },
      ];
    } else {
      axisLine = [
        {
          type: 'line',
          x: zeroPixel,
          y: zeroPixel,
          x2: crispPixel(xAxisHalfSize),
          y2: zeroPixel,
        },
        {
          type: 'line',
          x: crispPixel(secondStartX),
          y: zeroPixel,
          x2: widthPixel,
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
    const { tickInterval, centerYAxis: {secondStartX} } = renderOptions;

    return relativePositions.reduce<TickModel[]>((positions, position, index) => {
      if (index % tickInterval) {
        return positions;
      }

      const model = {
        type: 'tick',
        isYAxis: this.yAxisComponent,
        tickSize: this.yAxisComponent? -5: 5,
        [offsetKey]: crispPixel(position),
        [anchorKey]: tickAnchorPoint,
      } as TickModel;

      const added = {...model};

      if (this.yAxisComponent) {
        added[anchorKey] = crispPixel(0);
        added.tickSize = 5;
      } else {
        added[offsetKey] = crispPixel(position + secondStartX);
      }

      return[
        ...positions,
        model,
        added
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
    const { tickDistance, pointOnColumn, labelInterval, centerYAxis: {secondStartX, yAxisLabelAnchorPoint} } = renderOptions;
    const labelAdjustment = pointOnColumn ? tickDistance / 2 : 0;
    let labelAnchorPoint, textAlign, textLabels;

    if (this.yAxisComponent) {
      labelAnchorPoint = crispPixel(yAxisLabelAnchorPoint!)
      textAlign = 'center';
      textLabels = labels;
    } else {
      labelAnchorPoint = crispPixel(this.rect.height);
      textAlign = 'center';
      textLabels = [...labels].reverse();
    }

    return textLabels.reduce((positions, text, index) => {
      if (index % labelInterval) {
        return positions;
      }

      const model = {
        type: 'label',
        text,
        style: ['default', { textAlign }],
        [offsetKey]: crispPixel(relativePositions[index] + labelAdjustment),
        [anchorKey]: labelAnchorPoint,
      } as LabelModel;
      const models: LabelModel[] = [model];

      if (!this.yAxisComponent) {
        const added = {...model};
        added.text = labels[index],
        added[offsetKey] = crispPixel(model[offsetKey] + secondStartX);

        models.push(added);
      }

      return [
            ...positions,
            ...models
          ];
    }, []);
  }

  axisSize(centerYAxis: CenterYAxisData) {
    let size;

    if (this.yAxisComponent) {
      size = this.rect.height;
    } else {
      size = centerYAxis.xAxisHalfSize!;
    }

    return size;
  }

  beforeDraw(painter: Painter) {
    painter.ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
    painter.ctx.lineWidth = 1;
  }
}
