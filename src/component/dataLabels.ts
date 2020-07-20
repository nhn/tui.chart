import Component from './component';
import { ChartState, Options } from '@t/store/store';
import { getRGBA, getAlpha } from '@src/helpers/color';
import { LabelStyle, LabelModel } from '@t/components/axis';
import { deepCopy } from '@src/helpers/utils';
import { DataLabel } from '@t/components/dataLabels';
import { StrokeLabelStyle } from '@src/brushes/label';

export default class DataLabels extends Component {
  models!: LabelModel[];

  drawModels!: LabelModel[];

  initialize() {
    this.type = 'dataLabels';
    this.name = 'dataLabels';
  }

  initUpdate(delta: number) {
    if (!this.drawModels) {
      return;
    }

    this.drawModels.forEach((current, index) => {
      const target = this.models[index];
      const lastIndex = target.style!.length - 1;
      const targetStyle = target.style![lastIndex] as LabelStyle;
      const currentStyle = current.style![lastIndex] as LabelStyle;
      const targetStrokeStyle = target.stroke![lastIndex] as StrokeLabelStyle;

      if (targetStyle?.fillStyle) {
        const alpha = getAlpha(targetStyle.fillStyle!) * delta;
        currentStyle.fillStyle = getRGBA(currentStyle.fillStyle!, alpha);
      }
      if (targetStrokeStyle?.strokeStyle) {
        const strokeAlpha = getAlpha(targetStrokeStyle.strokeStyle!) * delta;
        const currentStrokeStyle = current.style![lastIndex] as StrokeLabelStyle;
        currentStrokeStyle.strokeStyle = getRGBA(currentStrokeStyle.strokeStyle!, strokeAlpha);
      }
    });
  }

  render({ layout, dataLabels }: ChartState<Options>) {
    if (!dataLabels?.visible) {
      return;
    }

    this.rect = layout.plot;
    this.models = this.renderLabelModel(dataLabels.data);

    if (!this.drawModels) {
      this.drawModels = this.models.map((m) => {
        const drawModel = { ...deepCopy(m) };
        const lastIndex = m.style!.length - 1;
        const style = drawModel.style![lastIndex] as LabelStyle;
        const stroke = drawModel.style![lastIndex] as StrokeLabelStyle;

        style.fillStyle = getRGBA(style.fillStyle!, 0);
        stroke.strokeStyle = getRGBA(stroke.strokeStyle!, 0);

        return drawModel;
      });
    }
  }

  renderLabelModel(dataLabels: DataLabel[]): LabelModel[] {
    return dataLabels.map((dataLabel) => {
      const {
        x,
        y,
        text,
        textAlign,
        textBaseline,
        style: { font, color, textStrokeColor },
      } = dataLabel;
      const textStyle: LabelStyle = {
        font,
        fillStyle: color,
        textAlign,
        textBaseline,
      };
      const strokeStyles: StrokeLabelStyle = {
        strokeStyle: textStrokeColor,
      };

      return {
        type: 'label',
        text,
        x,
        y: y + 1,
        style: ['default', textStyle],
        stroke: ['default', strokeStyles],
      };
    });
  }
}
