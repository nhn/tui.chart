import Component from './component';
import Painter from '@src/painter';
import { ChartState, Options, CenterYAxisData, ViewAxisLabel } from '@t/store/store';
import { makeTickPixelPositions, crispPixel } from '@src/helpers/calculator';
import { TickModel, LineModel, AxisModels, LabelModel } from '@t/components/axis';
import { AxisTheme } from '@t/theme';
import { getAxisTheme } from '@src/helpers/axes';
import { getTitleFontString } from '@src/helpers/style';
import { AxisType } from '@src/component/axis';

type CoordinateKey = 'x' | 'y';

interface RenderOptions {
  tickInterval: number;
  centerYAxis: CenterYAxisData;
  needRotateLabel?: boolean;
  radian?: number;
  offsetY?: number;
  relativePositions: number[];
}

export default class AxisUsingCenterY extends Component {
  name!: AxisType;

  models: AxisModels = { label: [], tick: [], axisLine: [] };

  drawModels!: AxisModels;

  yAxisComponent!: boolean;

  theme!: Required<AxisTheme>;

  initialize({ name }: { name: AxisType }) {
    this.type = 'axis';
    this.name = name;
    this.yAxisComponent = name === AxisType.Y;
  }

  render({ layout, axes, theme }: ChartState<Options>) {
    const { centerYAxis } = axes;

    if (!centerYAxis) {
      return;
    }

    this.theme = getAxisTheme(theme, this.name) as Required<AxisTheme>;
    this.rect = layout[this.name];

    if (this.name === 'yAxis') {
      this.rect = { ...this.rect, x: centerYAxis.x };
    }

    const { viewLabels, tickCount, tickInterval, needRotateLabel, radian, offsetY } = axes[
      this.name
    ]!;

    const renderOptions: RenderOptions = {
      tickInterval,
      centerYAxis,
      needRotateLabel,
      radian,
      offsetY,
      relativePositions: makeTickPixelPositions(this.axisSize(centerYAxis), tickCount),
    };
    const offsetKey = this.yAxisComponent ? 'y' : 'x';
    const anchorKey = this.yAxisComponent ? 'x' : 'y';

    this.models.label = this.renderLabelModels(viewLabels, offsetKey, anchorKey, renderOptions);

    this.models.tick = this.renderTickModels(offsetKey, anchorKey, renderOptions);

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
          y2: heightPixel,
        },
        {
          type: 'line',
          x: zeroPixel,
          y: zeroPixel,
          x2: zeroPixel,
          y2: heightPixel,
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
    offsetKey: CoordinateKey,
    anchorKey: CoordinateKey,
    renderOptions: RenderOptions
  ): TickModel[] {
    const tickAnchorPoint = this.yAxisComponent ? crispPixel(this.rect.width) : crispPixel(0);
    const {
      tickInterval,
      centerYAxis: { secondStartX },
      relativePositions,
    } = renderOptions;

    return relativePositions.reduce<TickModel[]>((positions, position, index) => {
      if (index % tickInterval) {
        return positions;
      }

      const model = {
        type: 'tick',
        isYAxis: this.yAxisComponent,
        tickSize: this.yAxisComponent ? -5 : 5,
        [offsetKey]: crispPixel(position),
        [anchorKey]: tickAnchorPoint,
      } as TickModel;

      const addedTickModel = { ...model };

      if (this.yAxisComponent) {
        addedTickModel[anchorKey] = crispPixel(0);
        addedTickModel.tickSize = 5;
      } else {
        addedTickModel[offsetKey] = crispPixel(position + secondStartX);
      }

      return [...positions, model, addedTickModel];
    }, []);
  }

  renderLabelModels(
    labels: ViewAxisLabel[],
    offsetKey: CoordinateKey,
    anchorKey: CoordinateKey,
    renderOptions: RenderOptions
  ): LabelModel[] {
    const {
      centerYAxis: { secondStartX, yAxisLabelAnchorPoint },
      offsetY,
      needRotateLabel,
      radian,
    } = renderOptions;
    const labelTheme = this.theme.label;
    const font = getTitleFontString(labelTheme);

    let labelAnchorPoint, textAlign, textLabels;

    if (this.yAxisComponent) {
      labelAnchorPoint = crispPixel(yAxisLabelAnchorPoint!);
      textAlign = 'center';
      textLabels = labels;
    } else {
      labelAnchorPoint = offsetY;
      textLabels = [...labels].reverse();
      textAlign = needRotateLabel ? 'left' : 'center';
    }

    const style = ['default', { textAlign, font, fillStyle: labelTheme.color }];

    return textLabels.reduce((positions, { text, offsetPos }, index) => {
      const model = {
        type: 'label',
        text,
        style,
        [offsetKey]: crispPixel(offsetPos) + (this.yAxisComponent ? 0 : secondStartX),
        [anchorKey]: labelAnchorPoint,
        radian,
      } as LabelModel;

      const models: LabelModel[] = [model];

      if (!this.yAxisComponent) {
        const addedLabelModel = {
          ...model,
          text: labels[index].text,
          [offsetKey]: crispPixel(model[offsetKey] - secondStartX),
        };

        models.push(addedLabelModel);
      }

      return [...positions, ...models];
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
