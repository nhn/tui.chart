import Component from './component';
import { ChartState, Options } from '@t/store/store';
import { BoundResponderModel, RectModel } from '@t/components/series';
import { range } from '@src/helpers/utils';
import { sortNumber } from '@src/helpers/utils';
import { ResetButtonModel } from '@t/components/resetButton';
import { BUTTON_RECT_SIZE } from '@src/component/exportMenu';
import { ZoomModels } from '@t/components/zoom';

interface RenderOptions {
  pointOnColumn: boolean;
  tickDistance: number;
  tickCount: number;
}

const RESET_BUTTON_MARGIN = 10;

export default class Zoom extends Component {
  models: ZoomModels = { selectionArea: [], resetButton: [] };

  responders!: BoundResponderModel[];

  private dragStartPoint: BoundResponderModel | null = null;

  initialize() {
    this.type = 'zoom';
  }

  render(state: ChartState<Options>) {
    if (!state.zoomRange) {
      return;
    }

    const { layout, axes, categories } = state;

    this.rect = layout.plot;
    const { tickDistance, pointOnColumn, tickCount } = axes.xAxis!;

    this.responders = [
      ...this.makeBoundResponderModel(categories!, {
        pointOnColumn,
        tickDistance,
        tickCount,
      }),
      ...this.addResetButtonResponder(),
    ];
  }

  resetSelectionArea() {
    this.dragStartPoint = null;
    this.models.selectionArea = [];
    this.eventBus.emit('needDraw');
  }

  onMousedown({ responders }: { responders: BoundResponderModel[] }) {
    if (responders.length) {
      const pushResetButton = responders.some(
        (responder) => responder.data!.name === 'resetButton'
      );
      const isZooming = !!this.models.resetButton.length;

      if (pushResetButton && isZooming) {
        this.resetZoomState();
      } else {
        this.dragStartPoint = responders.find(
          (responder) => responder.data!.name === 'selectionArea'
        )!;
      }
    }
  }

  resetZoomState() {
    this.resetSelectionArea();
    this.models.resetButton = [];
    this.store.dispatch('resetZoom');
  }

  addResetButtonResponder(): BoundResponderModel[] | undefined {
    return [
      {
        x: this.rect.x + RESET_BUTTON_MARGIN,
        y: this.rect.y + RESET_BUTTON_MARGIN,
        type: 'bound',
        width: BUTTON_RECT_SIZE,
        height: BUTTON_RECT_SIZE,
        data: { name: 'resetButton' },
      },
    ];
  }

  renderResetButton(): ResetButtonModel[] {
    return [{ type: 'resetButton', x: RESET_BUTTON_MARGIN, y: RESET_BUTTON_MARGIN }];
  }

  onMouseup({ responders }: { responders: BoundResponderModel[] }) {
    if (this.dragStartPoint && responders.length) {
      const dragRange = [this.dragStartPoint, responders[0]]
        .sort((a, b) => a.index! - b.index!)
        .map((m) => m.data!.value);

      this.store.dispatch('zoom', dragRange);
      if (!this.models.resetButton.length) {
        this.models.resetButton = this.renderResetButton();
        this.addResetButtonResponder();
      }
    }
    this.resetSelectionArea();
  }

  makeBoundResponderModel(
    categories: string[],
    renderOptions: RenderOptions
  ): BoundResponderModel[] {
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

      return {
        type: 'bound',
        y,
        height,
        x: startX,
        width,
        index,
        data: { name: 'selectionArea', value: categories[index] },
      };
    });
  }

  onMousemove({ responders }: { responders: BoundResponderModel[] }) {
    if (this.dragStartPoint && responders.length) {
      const { index: startIndex } = this.dragStartPoint!;
      const { index: endIndex } = responders[0];
      const [start, end] = [startIndex!, endIndex!].sort(sortNumber);
      const includedResponders = this.responders.slice(start, end! + 1);

      this.models.selectionArea = [
        ...includedResponders.map<RectModel>((m) => ({
          ...m,
          x: m.x - this.rect.x,
          y: 0,
          type: 'rect',
          color: 'rgba(0, 0, 0, 0.2)',
        })),
      ];
    }
    this.eventBus.emit('needDraw');
  }

  onMouseoutComponent() {
    this.resetSelectionArea();
  }
}
