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

  renderAxisTitle(option: Required<AxisTitleOption>): LabelModel[] {
    const { text, offsetX, offsetY } = option;

    if (this.isYAxis) {
      return [
        {
          type: 'label',
          text,
          x: offsetX,
          y: offsetY,
          style: ['axisTitle', { textAlign: 'left' }],
        },
      ];
    }

    return [
      {
        type: 'label',
        text,
        x: this.rect.width + offsetX,
        y: this.rect.height + offsetY,
        style: ['axisTitle', { textAlign: 'right' }],
      },
    ];
  }

  render({ axes, layout }: ChartState<Options>) {
    const titleOption = this.isYAxis ? axes.yAxis?.title : axes.xAxis?.title;

    if (!titleOption) {
      return;
    }

    this.rect = this.isYAxis ? layout.yAxisTitle : layout.xAxisTitle;
    this.models = this.renderAxisTitle(titleOption);
  }
}
