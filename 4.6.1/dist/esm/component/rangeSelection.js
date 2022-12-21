import Component from "./component";
import { isNull, range } from "../helpers/utils";
import { sortNumber } from "../helpers/utils";
import { makeObservableObjectToNormal } from "../store/reactive";
import { getCoordinateDataIndex, getCoordinateXValue, isCoordinateSeries, } from "../helpers/coordinate";
import { getXPosition } from "../helpers/calculator";
import { makeRectResponderModelForCoordinateType, } from "../helpers/responders";
const DRAG_MIN_WIDTH = 15;
export default class RangeSelection extends Component {
    constructor() {
        super(...arguments);
        this.models = { selectionArea: [] };
        this.dragStartPosition = null;
        this.dragStartPoint = null;
        this.isDragging = false;
    }
    initialize() {
        this.type = 'rangeSelection';
    }
    render(state, computed) {
        var _a, _b;
        if (!state.selectionRange && !state.zoomRange) {
            return;
        }
        this.resetSelectionArea();
        const { viewRange } = computed;
        const { layout, axes, series, scale } = state;
        const categories = state.categories;
        this.rect = layout.plot;
        this.startIndex = (_b = (_a = viewRange) === null || _a === void 0 ? void 0 : _a[0], (_b !== null && _b !== void 0 ? _b : 0));
        const coordinateChart = isCoordinateSeries(series);
        if (coordinateChart) {
            const responderInfo = this.getRectResponderInfoForCoordinateType(series, scale, axes.xAxis, categories);
            this.responders = this.makeRectResponderModelForCoordinateType(responderInfo, categories);
        }
        else {
            this.responders = this.makeRectResponderModel(categories, axes.xAxis);
        }
    }
    getRectResponderInfoForCoordinateType(series, scale, axisData, categories) {
        const points = [];
        const duplicateCheckMap = {};
        Object.keys(series).forEach((seriesName) => {
            const data = series[seriesName].data;
            data.forEach(({ rawData }) => {
                rawData.forEach((datum, idx) => {
                    if (isNull(datum)) {
                        return;
                    }
                    const dataIndex = getCoordinateDataIndex(datum, categories, idx, this.startIndex);
                    const x = getXPosition(axisData, this.rect.width, getCoordinateXValue(datum), dataIndex);
                    const xWithinRect = x >= 0 && x <= this.rect.width;
                    if (!duplicateCheckMap[x] && xWithinRect) {
                        duplicateCheckMap[x] = true;
                        points.push({ x, label: categories[dataIndex] });
                    }
                });
            });
        });
        return points;
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
        var _a, _b;
        if (this.isDragging && this.dragStartPoint && responders.length) {
            const dragRange = [this.dragStartPoint, responders[0]]
                .sort((a, b) => a.index - b.index)
                .map((m) => { var _a; return (_a = m.data) === null || _a === void 0 ? void 0 : _a.value; });
            const { series, options } = this.store.state;
            const { series: seriesOptions } = options;
            if (!series.column && ((_a = seriesOptions) === null || _a === void 0 ? void 0 : _a.zoomable)) {
                this.store.dispatch('zoom', dragRange);
                this.eventBus.emit('zoom', makeObservableObjectToNormal(dragRange));
            }
            if ((_b = seriesOptions) === null || _b === void 0 ? void 0 : _b.rangeSelectable) {
                this.eventBus.emit('rangeSelection', dragRange);
            }
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
    makeRectResponderModel(categories, axisData) {
        const categorySize = categories.length;
        const { pointOnColumn, tickDistance } = axisData;
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
    makeRectResponderModelForCoordinateType(responderInfo, categories) {
        const responders = makeRectResponderModelForCoordinateType(responderInfo, this.rect);
        return responders.map((m, idx) => (Object.assign(Object.assign({}, m), { data: { name: 'selectionArea', value: categories[idx] } })));
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
