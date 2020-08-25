import Component, { ComponentName } from './component';
import { ChartState, Options } from '@t/store/store';
import { TooltipModel } from '@t/components/tooltip';

export type HoveredSeriesModel = { [key in ComponentName]: TooltipModel[] };

export default class HoveredSeries extends Component {
  models: HoveredSeriesModel = {} as HoveredSeriesModel;

  isShow = false;

  renderHoveredSeries = ({ models, name }: { models: TooltipModel[]; name: ComponentName }) => {
    this.models[name] = [...models];
    this.isShow = !!Object.values(this.models).flatMap((val) => val).length;
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
