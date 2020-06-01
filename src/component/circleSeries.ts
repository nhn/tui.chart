import Component from './component';
import { CircleModel } from '@t/components/series';
import { ClipRectAreaModel } from '@t/components/series';
import { SeriesTheme } from '@t/store/store';
import { BubbleSeriesType, CoordinateDataType, Point, Rect, ScatterSeriesType } from '@t/options';
import { TooltipData } from '@t/components/tooltip';
import { getCoordinateDataIndex, getCoordinateYValue } from '@src/helpers/coordinate';
import { getDistance } from '@src/helpers/calculator';

type DrawModels = ClipRectAreaModel | CircleModel;

interface RenderOptions {
  theme: SeriesTheme;
}

export default abstract class CircleSeries extends Component {
  models!: DrawModels[];

  responders!: CircleModel[];

  activatedResponders: this['responders'] = [];

  rect!: Rect;

  update(delta: number) {
    if (this.models[0].type === 'clipRectArea') {
      this.models[0].width = this.rect.width * delta;
    }
  }

  renderClipRectAreaModel(): ClipRectAreaModel {
    return {
      type: 'clipRectArea',
      x: 0,
      y: 0,
      width: 0,
      height: this.rect.height,
    };
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
      } else if (minDistance === distance && result.length) {
        if (result[0].radius > responder.radius) {
          result = [responder];
        }
      }
    });

    return result;
  }

  onMousemove({ responders, mousePosition }) {
    this.activatedResponders.forEach((responder) => {
      const index = this.models.findIndex((model) => model === responder);
      this.models.splice(index, 1);
    });

    const closestResponder = this.getClosestResponder(responders, mousePosition);
    this.models.push(...closestResponder);
    this.activatedResponders = closestResponder;
    this.eventBus.emit('seriesPointHovered', this.activatedResponders);

    this.eventBus.emit('needDraw');
  }

  makeTooltipModel(
    circleData: BubbleSeriesType[] | ScatterSeriesType[],
    categories: string[],
    renderOptions: RenderOptions
  ) {
    const { theme } = renderOptions;

    return [...circleData].flatMap(({ data, name }, index) => {
      const tooltipData: TooltipData[] = [];

      data.forEach((datum: CoordinateDataType, dataIdx) => {
        tooltipData.push({
          label: name,
          color: theme.colors[index],
          value: getCoordinateYValue(datum),
          category: categories[getCoordinateDataIndex(datum, categories, dataIdx)],
        });
      });

      return tooltipData;
    });
  }
}
