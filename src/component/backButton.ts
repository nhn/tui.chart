import Component from './component';
import { ChartState, Options } from '@t/store/store';
import { isUsingResetButton } from '@src/store/layout';

import { BUTTON_RECT_SIZE } from '@src/component/exportMenu';
import { BackButtonModels } from '@t/components/resetButton';
import { RectResponderModel } from '@t/components/series';

export default class BackButton extends Component {
  responders!: RectResponderModel[];

  models!: BackButtonModels;

  initialize() {
    this.type = 'backButton';
    this.name = 'backButton';
  }

  onClick({ responders }: { responders: RectResponderModel[] }) {
    if (responders.length) {
      this.store.dispatch('zoomBack');
      this.eventBus.emit('resetSelectedSeries');
    }
  }

  render({ options, layout }: ChartState<Options>, computed) {
    if (!isUsingResetButton(options)) {
      return;
    }

    this.rect = layout.resetButton;
    this.isShow = computed.isTreemapSeriesZooming;
    this.models = this.isShow ? [{ type: 'backButton', x: 0, y: 0 }] : [];

    this.responders = this.isShow
      ? [{ type: 'rect', x: 0, y: 0, width: BUTTON_RECT_SIZE, height: BUTTON_RECT_SIZE }]
      : [];
  }
}
