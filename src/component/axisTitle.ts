import Component from './component';
import { ChartState, Options } from '@t/store/store';
import { LabelModel } from '@t/components/axis';
import { AxisType } from '@src/component/axis';
import { AxisTitleOption } from '@t/options';
import { includes } from '@src/helpers/utils';

export default class AxisTitle extends Component {
  models!: LabelModel[];

  isYAxis!: boolean;

  initialize({ name }: { name: AxisType }) {
    this.type = 'axisTitle';
    this.name = name;
    this.isYAxis = includes([AxisType.Y, AxisType.SECONDARY_Y], name);
  }

  renderAxisTitle(option: Required<AxisTitleOption>, textAlign: CanvasTextAlign): LabelModel[] {
    const { text, offsetX, offsetY } = option;
    const [x, y] = this.isYAxis
      ? [this.name === AxisType.Y ? offsetX : this.rect.width + offsetX, offsetY]
      : [this.rect.width + offsetX, this.rect.height + offsetY];

    return [{ type: 'label', text, x, y, style: ['axisTitle', { textAlign }] }];
  }

  getTextAlign(hasCenterYAxis = false) {
    let result: CanvasTextAlign = 'right';

    if (this.name === AxisType.Y) {
      result = hasCenterYAxis ? 'center' : 'left';
    }

    return result;
  }

  render({ axes, layout }: ChartState<Options>) {
    const titleOption = axes[this.name]?.title;

    if (!titleOption) {
      this.models = [];

      return;
    }

    this.rect = layout[`${this.name}Title`];
    this.models = this.renderAxisTitle(titleOption, this.getTextAlign(!!axes.centerYAxis));
  }
}
