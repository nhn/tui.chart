import Component from './component';
import { ChartState, Options } from '@t/store/store';
import { LabelModel } from '@t/components/axis';
import { AxisType } from '@src/component/axis';
import { AxisTitleOption } from '@t/options';

export default class AxisTitle extends Component {
  models!: LabelModel[];

  isYAxis!: boolean;

  initialize({ name }: { name: AxisType }) {
    this.type = 'axisTitle';
    this.name = name;
    this.isYAxis = name === 'yAxis';
  }

  renderAxisTitle(option: Required<AxisTitleOption>, visibleCenterYAxis = false): LabelModel[] {
    const { text, offsetX, offsetY } = option;
    const [x, y] = this.isYAxis
      ? [offsetX, offsetY]
      : [this.rect.width + offsetX, this.rect.height + offsetY];
    const yAxisTitleTextAlign = visibleCenterYAxis ? 'center' : 'left';
    const textAlign = this.isYAxis ? yAxisTitleTextAlign : 'right';

    return [{ type: 'label', text, x, y, style: ['axisTitle', { textAlign }] }];
  }

  render({ axes, layout }: ChartState<Options>) {
    const { xAxis, yAxis, centerYAxis } = axes;
    const titleOption = this.isYAxis ? yAxis.title : xAxis.title;

    if (!titleOption) {
      return;
    }

    this.rect = this.isYAxis ? layout.yAxisTitle : layout.xAxisTitle;
    this.models = this.renderAxisTitle(titleOption, centerYAxis.visible);
  }
}
