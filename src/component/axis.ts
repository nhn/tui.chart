import Component from './component';
import Painter from '@src/painter';
import { ChartState, Options } from '@t/store/store';
import { makeTickPixelPositions, crispPixel } from '@src/helpers/calculator';
import { LabelModel, TickModel, LineModel, AxisModels } from '@t/components/axis';

export enum AxisType {
  Y = 'yAxis',
  X = 'xAxis',
}

type CoordinateKey = 'x' | 'y';

interface RenderOptions {
  pointOnColumn: boolean;
  tickDistance: number;
  tickInterval: number;
  labelInterval: number;
  labelDistance: number;
}

export default class Axis extends Component {
  models: AxisModels = { label: [], tick: [], axisLine: [] };

  drawModels!: AxisModels;

  yAxisComponent!: boolean;

  initialize({ name }: { name: AxisType }) {
    this.type = 'axis';
    this.name = name;
    this.yAxisComponent = name === AxisType.Y;
  }

  render({ layout, axes }: ChartState<Options>) {
    if (axes.centerYAxis) {
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
    } = axes[this.name]!;

    const relativePositions = makeTickPixelPositions(this.axisSize(), tickCount);
    const offsetKey = this.yAxisComponent ? 'y' : 'x';
    const anchorKey = this.yAxisComponent ? 'x' : 'y';

    const renderOptions: RenderOptions = {
      pointOnColumn,
      tickDistance,
      tickInterval,
      labelInterval,
      labelDistance,
    };

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
      lineModel = {
        type: 'line',
        x: widthPixel,
        y: zeroPixel,
        x2: widthPixel,
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
    const tickAnchorPoint = this.yAxisComponent ? crispPixel(this.rect.width) : crispPixel(0);
    const { tickInterval } = renderOptions;

    return relativePositions.reduce<TickModel[]>((positions, position, index) => {
      return index % tickInterval
        ? positions
        : [
            ...positions,
            {
              type: 'tick',
              isYAxis: this.yAxisComponent,
              tickSize: this.yAxisComponent ? -5 : 5,
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
    const labelAnchorPoint = this.yAxisComponent ? crispPixel(0) : crispPixel(this.rect.height);
    const labelAdjustment = pointOnColumn ? labelDistance / 2 : 0;
    const style = ['default', { textAlign: this.yAxisComponent ? 'left' : 'center' }];

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
}
