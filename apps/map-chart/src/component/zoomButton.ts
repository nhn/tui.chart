import Component from '@src/component/component';
import { RectModel, RectResponderModel } from '@t/components/common';

export default class ZoomButton extends Component {
  models!: RectModel[];

  responders!: RectResponderModel[];

  initialize() {
    this.type = 'zoomButton';
    this.name = 'zoomButton';
  }

  render(chartState) {
    this.rect = chartState.layout.zoomButton;
    this.models = [
      {
        type: 'rect',
        x: 0,
        y: 0,
        width: this.rect.width,
        height: this.rect.height,
        style: {
          color: 'rgba(255,179,71,0.5)',
        },
      },
    ];
  }
}
