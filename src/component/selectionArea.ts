import Component from './component';
import { ChartState, Options } from '@t/store/store';
import { BoundResponderModel, RectModel } from '@t/components/series';
import { range } from '@src/helpers/utils';

interface RenderOptions {
  pointOnColumn: boolean;
  tickDistance: number;
  tickCount: number;
}

export default class SelectionArea extends Component {
  models!: RectModel[];

  responders!: BoundResponderModel[];

  private dragStartPoint: BoundResponderModel | null = null;

  initialize() {
    this.type = 'selectionArea';
  }

  render(state: ChartState<Options>) {
    const { layout, axes } = state;
    this.rect = layout.plot;
    this.models = [];
    const { tickDistance, pointOnColumn, tickCount } = axes.xAxis!;

    this.responders = this.makeBoundResponderModel({
      pointOnColumn,
      tickDistance,
      tickCount,
    });
  }

  resetDragState() {
    this.dragStartPoint = null;
    this.models = [];
    this.eventBus.emit('needDraw');
  }

  onMousedown({ responders }: { responders: BoundResponderModel[] }) {
    if (responders.length) {
      this.dragStartPoint = responders[0];
    }
  }

  onMouseup() {
    this.resetDragState();
  }

  makeBoundResponderModel(renderOptions: RenderOptions): BoundResponderModel[] {
    const { pointOnColumn, tickCount, tickDistance } = renderOptions;
    const { height, x, y } = this.rect;
    const halfDetectAreaIndex = pointOnColumn ? [] : [0, tickCount - 1];

    const halfWidth = tickDistance / 2;

    return range(0, tickCount).map((index) => {
      const half = halfDetectAreaIndex.includes(index);
      const width = half ? halfWidth : tickDistance;
      let startX = x;

      if (index !== 0) {
        startX += pointOnColumn ? tickDistance * index : halfWidth + tickDistance * (index - 1);
      }

      return { type: 'bound', y, height, x: startX, width, index };
    });
  }

  onMousemove({ responders }: { responders: BoundResponderModel[] }) {
    if (this.dragStartPoint && responders.length) {
      const { index: startIndex } = this.dragStartPoint!;
      const { index: endIndex } = responders[0];
      const [start, end] = [startIndex, endIndex].sort((a, b) => Number(a) - Number(b));
      const includedResponders = this.responders.slice(start, end! + 1);

      this.models = includedResponders.map((m) => ({
        ...m,
        x: m.x - this.rect.x,
        y: 0,
        type: 'rect',
        color: 'rgba(0, 0, 0, 0.2)',
      }));
    }
    this.eventBus.emit('needDraw');
  }

  onMouseoutComponent() {
    this.resetDragState();
  }
}
