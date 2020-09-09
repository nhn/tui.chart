import Component from './component';
import { ChartState, Options } from '@t/store/store';
import { TooltipModelName } from '@t/components/tooltip';
import { CircleResponderModel, ResponderModel, BoxPlotResponderModel } from '@t/components/series';
import { LineModel } from '@t/components/axis';
import { crispPixel } from '@src/helpers/calculator';
import { isUndefined, includes } from '@src/helpers/utils';
import { LineTypeEventDetectType } from '@t/options';

export type HoveredSeriesModel = { [key in TooltipModelName]: ResponderModel[] } & {
  guideLine: LineModel[];
};

export default class HoveredSeries extends Component {
  models: HoveredSeriesModel = { guideLine: [] as LineModel[] } as HoveredSeriesModel;

  isShow = false;

  getModelsOnly() {
    const { guideLine, ...models } = this.models;

    return models;
  }

  getSeriesModels() {
    return Object.values(this.getModelsOnly()).flatMap((val) => val);
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
    this.models[name] = models?.length ? [...models] : [];
    this.isShow = !!this.getSeriesModels().length;

    if (eventType === 'grouped') {
      this.renderGroupedModels(name);
    } else if (eventType === 'point') {
      this.renderPointModels(name);
    }
  };

  private renderGroupedModels(name: TooltipModelName) {
    if (name === 'line' || name === 'area' || name === 'boxPlot') {
      if (this.isShow) {
        const model = this.getSeriesModels().filter(({ type }) =>
          includes(['circle', 'boxPlot'], type)
        )[0];
        if (!isUndefined(model)) {
          this.models.guideLine = [this.renderGuideLineModel(model)];
        }
      } else {
        this.models.guideLine = [];
      }
    }
  }

  private renderPointModels(name: TooltipModelName) {
    if (name === 'line' || name === 'column') {
      const models = this.getSeriesModels();

      if (models.length < 2) {
        return;
      }

      const modelKeys = Object.keys(this.getModelsOnly());
      const includeLineAndColumn = ['line', 'column'].every((modelName) =>
        includes(modelKeys, modelName)
      );

      if (includeLineAndColumn) {
        this.models.column = [];
      }
    }
  }

  renderGuideLineModel(model: CircleResponderModel | BoxPlotResponderModel): LineModel {
    const x = model.type === 'circle' ? crispPixel(model.x) : model.whisker.x;

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
