import Component from './component';
import { ChartState, Options } from '@t/store/store';
import { getRGBA, getAlpha } from '@src/helpers/color';
import { LabelStyle, LabelModel } from '@t/components/axis';
import { deepCopy } from '@src/helpers/utils';
import { DataLabel } from '@t/components/dataLabels';
import { StrokeLabelStyle } from '@src/brushes/label';

type RenderOptions = {
  font?: string;
  textColor?: string;
  textStrokeColor?: string;
};
export default class DataLabels extends Component {
  models!: LabelModel[];

  drawModels!: LabelModel[];

  initialize() {
    this.type = 'dataLabels';
    this.name = 'dataLabels';
  }

  initUpdate(delta) {
    this.drawModels.forEach((current, index) => {
      const target = this.models[index];
      const targetStyle = target.style![1] as LabelStyle;
      const currentStyle = current.style![1] as LabelStyle;
      const targetStrokeStyle = target.stroke![1] as StrokeLabelStyle;
      const currentStrokeStyle = current.style![1] as StrokeLabelStyle;
      const alpha = getAlpha(targetStyle.fillStyle!) * delta;
      const strokeAlpha = getAlpha(targetStrokeStyle.strokeStyle!) * delta;

      currentStyle.fillStyle = getRGBA(currentStyle.fillStyle!, alpha);
      currentStrokeStyle.strokeStyle = getRGBA(currentStrokeStyle.strokeStyle!, strokeAlpha);
    });
  }

  render({ layout, dataLabels }: ChartState<Options>) {
    this.rect = layout.plot;
    this.models = this.renderLabelModel(dataLabels);

    if (!this.drawModels) {
      this.drawModels = this.models.map((m) => {
        const drawModel = { ...deepCopy(m) };
        const style = drawModel.style![1] as LabelStyle;
        const stroke = drawModel.style![1] as StrokeLabelStyle;

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
        stroke: ['stroke', strokeStyles],
      };
    });
  }
}
