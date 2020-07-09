import Component from './component';
import { CircleModel, CircleResponderModel, CircleSeriesModels } from '@t/components/series';
import { Point, Rect } from '@t/options';
import { getDistance } from '@src/helpers/calculator';

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

  getClosestResponder(responders: CircleResponderModel[], mousePosition: Point) {
    let minDistance = Infinity;
    let result: CircleResponderModel[] = [];
    responders.forEach((responder) => {
      const { x, y } = responder;
      const responderPoint = { x: x + this.rect.x, y: y + this.rect.y };
      const distance = getDistance(responderPoint, mousePosition);

      if (minDistance > distance) {
        minDistance = distance;
        result = [responder];
      } else if (minDistance === distance && result.length && result[0].radius > responder.radius) {
        result = [responder];
      }
    });

    return result;
  }

  onMousemove({ responders, mousePosition }) {
    const closestResponder = this.getClosestResponder(responders, mousePosition);

    this.eventBus.emit('renderHoveredSeries', closestResponder);
    this.activatedResponders = closestResponder;

    this.eventBus.emit('seriesPointHovered', this.activatedResponders);
    this.eventBus.emit('needDraw');
  }
}
