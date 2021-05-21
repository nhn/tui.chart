import Component from '@src/component/component';
import { RectModel, RectResponderModel } from '@t/components/common';

export default class Legend extends Component {
  models!: RectModel[];

  responders!: RectResponderModel[];

  initialize() {
    this.type = 'legend';
    this.name = 'legend';
  }

  render(chartState) {
    this.rect = chartState.layout.legend;
    this.models = [
      {
        type: 'rect',
        x: 0,
        y: 0,
        width: this.rect.width,
        height: this.rect.height,
        style: {
          color: 'rgba(174,198,207,0.5)',
        },
      },
    ];
  }
}
