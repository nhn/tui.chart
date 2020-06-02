import Component from './component';
import { CircleModel } from '@t/components/series';
import { ClipRectAreaModel } from '@t/components/series';
import { Point, Rect } from '@t/options';
import { getDistance } from '@src/helpers/calculator';

type DrawModels = ClipRectAreaModel | CircleModel;

export default abstract class CircleSeries extends Component {
  models!: DrawModels[];

  drawModels!: DrawModels[];

  responders!: CircleModel[];

  activatedResponders: this['responders'] = [];

  rect!: Rect;

  update(delta: number) {
    this.drawModels.forEach((model, index) => {
      if (
        model.type === 'circle' &&
        (model.name === 'scatterSeries' || model.name === 'bubbleSeries')
      ) {
        model.radius = (this.models[index] as CircleModel).radius * delta;
      }
    });
  }

  getClosestResponder(responders: CircleModel[], mousePosition: Point) {
    let minDistance = Infinity;
    let result: CircleModel[] = [];
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
    this.activatedResponders.forEach((responder) => {
      const index = this.drawModels.findIndex((model) => model === responder);
      this.drawModels.splice(index, 1);
    });

    const closestResponder = this.getClosestResponder(responders, mousePosition);
    this.drawModels.push(...closestResponder);
    this.activatedResponders = closestResponder;
    this.eventBus.emit('seriesPointHovered', this.activatedResponders);

    this.eventBus.emit('needDraw');
  }
}
