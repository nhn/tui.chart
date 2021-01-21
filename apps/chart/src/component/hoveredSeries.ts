import Component from './component';
import { ChartState, Options } from '@t/store/store';
import { TooltipModelName } from '@t/components/tooltip';
import { CircleResponderModel, ResponderModel, BoxPlotResponderModel } from '@t/components/series';
import { LineModel } from '@t/components/axis';
import { crispPixel } from '@src/helpers/calculator';
import { isUndefined, includes } from '@src/helpers/utils';
import { LineTypeEventDetectType, BoxTypeEventDetectType } from '@t/options';
import { ResponderSeriesModel } from '@src/component/selectedSeries';
import { isSameSeriesResponder } from '@src/helpers/responders';
import { makeObservableObjectToNormal } from '@src/store/reactive';

export type HoveredSeriesModel = ResponderSeriesModel & { guideLine: LineModel[] };

const guideLineType = {
  line: 'circle',
  area: 'circle',
  boxPlot: 'boxPlot',
};

export default class HoveredSeries extends Component {
  models: HoveredSeriesModel = { guideLine: [] as LineModel[] } as HoveredSeriesModel;

  isShow = false;

  modelForGuideLine!: CircleResponderModel | BoxPlotResponderModel;

  getSeriesModels(type?: TooltipModelName) {
    const { guideLine, ...models } = this.models;

    return (type ? models[type] : Object.values(models))?.flatMap((val) => val);
  }

  hasGuideLine() {
    const [rectModel] = this.getSeriesModels().filter(({ type }) => type === 'rect');

    return !isUndefined(this.modelForGuideLine) && isUndefined(rectModel);
  }

  getModelForGuideLine(name: TooltipModelName) {
    return this.getSeriesModels().filter(({ type }) => type === guideLineType[name])[0];
  }

  renderHoveredSeries = ({
    models,
    name,
    eventDetectType,
  }: {
    models: ResponderModel[];
    name: TooltipModelName;
    eventDetectType?: LineTypeEventDetectType | BoxTypeEventDetectType;
  }) => {
    const prevModels = this.getSeriesModels(name);
    this.models[name] = [...models];
    this.isShow = !!this.getSeriesModels().length;

    const isSame =
      !!prevModels?.length &&
      !!models.length &&
      isSameSeriesResponder({ models, comparisonModel: prevModels, eventDetectType, name });

    if (prevModels?.length && !models.length) {
      this.eventBus.emit('unhoverSeries', makeObservableObjectToNormal(prevModels));
    } else if (models.length && !isSame) {
      this.eventBus.emit('hoverSeries', makeObservableObjectToNormal(models));
    }

    this.modelForGuideLine = this.getModelForGuideLine(name);

    if (eventDetectType === 'grouped') {
      this.renderGroupedModels(name);
    }
  };

  private renderGroupedModels(name: TooltipModelName) {
    if (includes(Object.keys(guideLineType), name)) {
      if (this.isShow && this.hasGuideLine()) {
        this.models.guideLine = [this.renderGuideLineModel(this.modelForGuideLine)];
      } else {
        this.models.guideLine = [];
      }
    }
  }

  renderGuideLineModel(model: CircleResponderModel | BoxPlotResponderModel): LineModel {
    const x = crispPixel(
      model.type === 'boxPlot' && model.boxPlotDetection
        ? model.boxPlotDetection.x + model.boxPlotDetection.width / 2
        : model.x
    );

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

  resetHoveredSeries = () => {
    this.models = { guideLine: [] as LineModel[] } as HoveredSeriesModel;
  };

  initialize() {
    this.type = 'hoveredSeries';
    this.name = 'hoveredSeries';
    this.eventBus.on('renderHoveredSeries', this.renderHoveredSeries);
    this.eventBus.on('resetHoveredSeries', this.resetHoveredSeries);
  }

  render({ layout }: ChartState<Options>) {
    this.rect = layout.plot;
  }
}
