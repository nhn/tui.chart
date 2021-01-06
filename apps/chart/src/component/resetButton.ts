import Component from './component';
import { ChartState, Options } from '@t/store/store';
import { isUsingResetButton } from '@src/store/layout';

import { BUTTON_RECT_SIZE } from '@src/component/exportMenu';
import { ResetButtonModels } from '@t/components/resetButton';
import { RectResponderModel } from '@t/components/series';

export default class ResetButton extends Component {
  responders!: RectResponderModel[];

  models!: ResetButtonModels;

  initialize() {
    this.type = 'resetButton';
    this.name = 'resetButton';
  }

  onClick({ responders }: { responders: RectResponderModel[] }) {
    if (responders.length) {
      this.eventBus.emit('resetZoom');
      this.store.dispatch('resetZoom');
    }
  }

  render({ options, layout }: ChartState<Options>, computed) {
    if (!isUsingResetButton(options)) {
      return;
    }

    this.rect = layout.resetButton;
    this.isShow = computed.isLineTypeSeriesZooming;
    this.models = this.isShow ? [{ type: 'resetButton', x: 0, y: 0 }] : [];
    this.responders = this.isShow
      ? [{ type: 'rect', x: 0, y: 0, width: BUTTON_RECT_SIZE, height: BUTTON_RECT_SIZE }]
      : [];
  }
}
