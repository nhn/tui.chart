import Component from './component';
import { ChartState, Options } from '@t/store/store';
import { TooltipModel } from '@t/components/tooltip';
import { RectModel } from '@t/components/series';

export default class Legend extends Component {
  models!: TooltipModel[];

  onClick({ responders }: { responders: RectModel[] }) {
    this.eventBus.emit('clickLegendCheckbox', responders);
  }

  onClickLegendCheckbox = (responders) => {
    console.log('click', responders);
  };

  initialize() {
    this.type = 'legend';
    this.name = 'legend';
    this.eventBus.on('clickLegendCheckbox', this.onClickLegendCheckbox);
  }

  render({ layout }: ChartState<Options>) {
    this.rect = layout.legend;
    this.models = [];
    this.responders = this.models.map((m) => ({
      ...m,
    }));
  }
}
