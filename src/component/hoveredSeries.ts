import Component from './component';
import { ChartState, Options } from '@t/store/store';
import { TooltipModelName } from '@t/components/tooltip';
import { CircleResponderModel, ResponderModel } from '@t/components/series';
import { LineModel } from '@t/components/axis';
import { crispPixel } from '@src/helpers/calculator';
import { isUndefined } from '@src/helpers/utils';
import { LineTypeEventDetectType } from '@t/options';

export type HoveredSeriesModel = { [key in TooltipModelName]: ResponderModel[] } & {
  guideLine: LineModel[];
};

export default class HoveredSeries extends Component {
  models: HoveredSeriesModel = { guideLine: [] as LineModel[] } as HoveredSeriesModel;

  isShow = false;

  getSeriesModels() {
    const { guideLine, ...model } = this.models;

    return Object.values(model).flatMap((val) => val);
  }

  renderHoveredSeries = ({
    models,
    name,
    eventType,
  }: {
    models: ResponderModel[];
    name: TooltipModelName;
    eventType?: LineTypeEventDetectType;
  }) => {
    this.models[name] = [...models];
    this.isShow = !!this.getSeriesModels().length;

    if (eventType === 'grouped' && (name === 'line' || name === 'area')) {
      if (this.isShow) {
        const model = this.getSeriesModels().filter(({ type }) => type === 'circle')[0];
        if (!isUndefined(model)) {
          this.models.guideLine = [this.renderGuideLineModel(model)];
        }
      } else {
        this.models.guideLine = [];
      }
    }
  };

  renderGuideLineModel(circleModel: CircleResponderModel): LineModel {
    const x = crispPixel(circleModel.x);

    return {
      type: 'line',
      x,
      y: 0,
      x2: x,
      y2: this.rect.height,
      strokeStyle: '#ddd',
      lineWidth: 1,
    };
  }

  initialize() {
    this.type = 'hoveredSeries';
    this.name = 'hoveredSeries';
    this.eventBus.on('renderHoveredSeries', this.renderHoveredSeries);
  }

  render({ layout }: ChartState<Options>) {
    this.rect = layout.plot;
  }
}
