import Component from './component';
import { CircleModel, CircleResponderModel, CircleSeriesModels } from '@t/components/series';
import { Rect } from '@t/options';
import { getNearestResponder } from '@src/helpers/responders';

export default abstract class CircleSeries extends Component {
  models: CircleSeriesModels = { series: [] };

  drawModels!: CircleSeriesModels;

  responders!: CircleResponderModel[];

  activatedResponders: CircleResponderModel[] = [];

  rect!: Rect;

  initUpdate(delta: number) {
    this.drawModels.series.forEach((model, index) => {
      model.radius = (this.models.series[index] as CircleModel).radius * delta;
    });
  }

  onMousemove({ responders, mousePosition }) {
    const closestResponder = getNearestResponder(responders, mousePosition, this.rect);

    this.eventBus.emit('renderHoveredSeries', { models: closestResponder, name: this.name });
    this.activatedResponders = closestResponder;

    this.eventBus.emit('seriesPointHovered', { models: this.activatedResponders, name: this.name });
    this.eventBus.emit('needDraw');
  }

  onClick({ responders, mousePosition }) {
    if (this.selectable) {
      this.eventBus.emit('renderSelectedSeries', {
        models: getNearestResponder(responders, mousePosition, this.rect),
        name: this.name,
      });

      this.eventBus.emit('needDraw');
    }
  }
}
