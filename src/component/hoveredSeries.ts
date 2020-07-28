import Component from './component';
import { ChartState, Options } from '@t/store/store';
import { TooltipModel } from '@t/components/tooltip';

export default class HoveredSeries extends Component {
  models: TooltipModel[] = [];

  isShow = false;

  renderHoveredSeries = (models) => {
    this.isShow = !!models.length;

    if (this.isShow) {
      this.models = [...models];
    }
  };

  initialize() {
    this.type = 'hoveredSeries';
    this.name = 'hoveredSeries';
    this.eventBus.on('renderHoveredSeries', this.renderHoveredSeries);
  }

  render({ layout }: ChartState<Options>) {
    this.rect = layout.plot;
  }
}
