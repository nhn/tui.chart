import Component from './component';
import { ChartState, Options } from '@t/store/store';
import { RectModel } from '@t/components/series';

export default class SelectionArea extends Component {
  models!: RectModel[];

  private dragStartPoint = null;

  initialize() {
    this.type = 'selectionArea';
  }

  onMousedown({ mousePosition }) {
    this.dragStartPoint = mousePosition;
  }

  onMouseup() {
    this.dragStartPoint = null;
    this.models = [];
    this.eventBus.emit('needDraw');
  }

  onMousemove({ mousePosition }) {
    const { x } = mousePosition;
    if (this.dragStartPoint) {
      const { x: dragX } = this.dragStartPoint!;

      this.models = [
        {
          type: 'rect',
          x: dragX - this.rect.x,
          y: 0,
          width: x - dragX,
          height: this.rect.height,
          color: 'rgba(0, 0, 0, 0.2)',
        },
      ];
    }
    this.eventBus.emit('needDraw');
  }

  render(state: ChartState<Options>) {
    const { layout } = state;
    this.rect = layout.plot;
    this.models = [];
  }
}
