import Component from "./component";
import { range } from "../helpers/utils";
import { sortNumber } from "../helpers/utils";
import { makeObservableObjectToNormal } from "../store/reactive";
const DRAG_MIN_WIDTH = 15;
export default class Zoom extends Component {
    constructor() {
        super(...arguments);
        this.models = { selectionArea: [] };
        this.dragStartPosition = null;
        this.dragStartPoint = null;
        this.isDragging = false;
    }
    initialize() {
        this.type = 'zoom';
    }
    render(state) {
        if (!state.zoomRange) {
            return;
        }
        this.resetSelectionArea();
        const { layout, axes, categories } = state;
        this.rect = layout.plot;
        const { tickDistance, pointOnColumn, tickCount } = axes.xAxis;
        this.responders = this.makeRectResponderModel(categories, {
            pointOnColumn,
            tickDistance,
            tickCount,
        });
    }
    resetSelectionArea() {
        this.dragStartPosition = null;
        this.dragStartPoint = null;
        this.models.selectionArea = [];
        this.isDragging = false;
    }
    onMousedown({ responders, mousePosition }) {
        if (responders.length) {
            this.dragStartPoint = responders.find((responder) => responder.data.name === 'selectionArea');
            this.dragStartPosition = mousePosition;
        }
    }
    onMouseup({ responders }) {
        if (this.isDragging && this.dragStartPoint && responders.length) {
            const dragRange = [this.dragStartPoint, responders[0]]
                .sort((a, b) => a.index - b.index)
                .map((m) => { var _a; return (_a = m.data) === null || _a === void 0 ? void 0 : _a.value; });
            this.store.dispatch('zoom', dragRange);
            this.eventBus.emit('zoom', makeObservableObjectToNormal(dragRange));
            this.eventBus.emit('resetHoveredSeries');
            this.eventBus.emit('hideTooltip');
            // @TODO: Should occur after the series' click event
            // Additional logic to control the sequence of events with each other is required.
            setTimeout(() => {
                this.eventBus.emit('resetSelectedSeries');
            });
        }
        this.resetSelectionArea();
    }
    makeRectResponderModel(categories, renderOptions) {
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
            const startIndex = this.dragStartPoint.index;
            const endIndex = responders[0].index;
            const [start, end] = [startIndex, endIndex].sort(sortNumber);
            const includedResponders = this.responders.slice(start, end + 1);
            this.models.selectionArea = [
                ...includedResponders.map((m) => (Object.assign(Object.assign({}, m), { x: m.x, y: 0, type: 'rect', color: 'rgba(0, 0, 0, 0.2)' }))),
            ];
            this.eventBus.emit('needDraw');
        }
    }
    onMouseoutComponent() {
        this.resetSelectionArea();
    }
}
