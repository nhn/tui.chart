import Component from './component';
import { ChartState, Options } from '@t/store/store';
import { RectResponderModel, RectModel } from '@t/components/series';
import { range } from '@src/helpers/utils';
import { sortNumber } from '@src/helpers/utils';
import { ResetButtonModel } from '@t/components/resetButton';
import { BUTTON_RECT_SIZE } from '@src/component/exportMenu';
import { ZoomModels } from '@t/components/zoom';
import { Point } from '@t/options';

interface RenderOptions {
  pointOnColumn: boolean;
  tickDistance: number;
  tickCount: number;
}

const DRAG_MIN_WIDTH = 15;
const RESET_BUTTON_MARGIN = 10;

export default class Zoom extends Component {
  models: ZoomModels = { selectionArea: [], resetButton: [] };

  responders!: RectResponderModel[];

  private dragStartPosition: Point | null = null;

  private dragStartPoint: RectResponderModel | null = null;

  private isDragging = false;

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
      ...this.makeRectResponderModel(categories!, {
        pointOnColumn,
        tickDistance,
        tickCount,
      }),
      ...this.addResetButtonResponder(),
    ];
  }

  resetSelectionArea() {
    this.dragStartPosition = null;
    this.dragStartPoint = null;
    this.models.selectionArea = [];
    this.isDragging = false;
    this.eventBus.emit('needDraw');
  }

  onMousedown({ responders, mousePosition }) {
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
        this.dragStartPosition = mousePosition;
      }
    }
  }

  resetZoomState() {
    this.resetSelectionArea();
    this.models.resetButton = [];
    this.store.dispatch('resetZoom');
  }

  addResetButtonResponder(): RectResponderModel[] {
    return [
      {
        x: RESET_BUTTON_MARGIN,
        y: RESET_BUTTON_MARGIN,
        type: 'rect',
        width: BUTTON_RECT_SIZE,
        height: BUTTON_RECT_SIZE,
        data: { name: 'resetButton' },
      },
    ];
  }

  renderResetButton(): ResetButtonModel[] {
    return [{ type: 'resetButton', x: RESET_BUTTON_MARGIN, y: RESET_BUTTON_MARGIN }];
  }

  onMouseup({ responders }: { responders: RectResponderModel[] }) {
    if (this.isDragging && this.dragStartPoint && responders.length) {
      const dragRange = [this.dragStartPoint, responders[0]]
        .sort((a, b) => a.index! - b.index!)
        .map((m) => m.data?.value);

      this.store.dispatch('zoom', dragRange);
      this.eventBus.emit('renderHoveredSeries', { models: [], name: this.name });
      if (!this.models.resetButton.length) {
        this.models.resetButton = this.renderResetButton();
      }
    }
    this.resetSelectionArea();
  }

  makeRectResponderModel(categories: string[], renderOptions: RenderOptions): RectResponderModel[] {
    const categorySize = categories.length;
    const { pointOnColumn, tickDistance } = renderOptions;
    const { height } = this.rect;

    const halfDetectAreaIndex = pointOnColumn ? [] : [0, categorySize - 1];
    const halfWidth = tickDistance / 2;

    return range(0, categorySize).map((index) => {
      const half = halfDetectAreaIndex.includes(index);
      const width = half ? halfWidth : tickDistance;
      let startX = 0;

      if (index !== 0) {
        startX += pointOnColumn ? tickDistance * index : halfWidth + tickDistance * (index - 1);
      }

      return {
        type: 'rect',
        x: startX,
        y: 0,
        height,
        width,
        index,
        data: { name: 'selectionArea', value: categories[index] },
      };
    });
  }

  onMousemove({ responders, mousePosition }) {
    if (!responders.length) {
      return;
    }

    if (this.dragStartPosition && !this.isDragging) {
      const { x } = mousePosition;
      const { x: startX } = this.dragStartPosition;

      this.isDragging = Math.abs(startX - x) > DRAG_MIN_WIDTH;
    }

    if (this.isDragging) {
      const startIndex = this.dragStartPoint!.index!;
      const endIndex = responders[0].index!;
      const [start, end] = [startIndex, endIndex].sort(sortNumber);
      const includedResponders = this.responders.slice(start, end + 1);

      this.models.selectionArea = [
        ...includedResponders.map<RectModel>((m) => ({
          ...m,
          x: m.x,
          y: 0,
          type: 'rect',
          color: 'rgba(0, 0, 0, 0.2)',
        })),
      ];
      this.eventBus.emit('needDraw');
    }
  }

  onMouseoutComponent() {
    this.resetSelectionArea();
  }
}
