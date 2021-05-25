import Component from '@src/component/component';
import { RectModel, RectResponderModel } from '@t/components/common';

export default class Title extends Component {
  models!: RectModel[];

  responders!: RectResponderModel[];

  initialize() {
    this.type = 'title';
    this.name = 'title';
  }

  render(chartState) {
    this.rect = chartState.layout.title;
    this.models = [
      {
        type: 'rect',
        x: 0,
        y: 0,
        width: this.rect.width,
        height: this.rect.height,
        style: {
          color: 'rgba(199,158,203,0.5)',
        },
      },
    ];
  }
}
