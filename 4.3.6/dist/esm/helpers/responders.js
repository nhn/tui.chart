import { getDistance } from "./calculator";
import { range } from "./utils";
import { getRadiusRanges } from "./sector";
// eslint-disable-next-line complexity
export function isSameSeriesResponder({ models, comparisonModel, name, eventDetectType, }) {
    switch (name) {
        case 'heatmap':
            return isClickSameNameResponder(models, comparisonModel);
        case 'bullet':
            return eventDetectType === 'grouped'
                ? isClickSameGroupedRectResponder(models, comparisonModel)
                : isClickSameNameResponder(models, comparisonModel);
        case 'radar':
        case 'bubble':
        case 'scatter':
        case 'area':
        case 'line':
            return isClickSameCircleResponder(models, comparisonModel);
        case 'pie':
            return isClickSameDataResponder(models, comparisonModel);
        case 'column':
        case 'bar':
            return eventDetectType === 'grouped'
                ? isClickSameGroupedRectResponder(models, comparisonModel)
                : isClickSameDataResponder(models, comparisonModel);
        case 'boxPlot':
            return eventDetectType === 'grouped'
                ? isClickSameDataResponder(models, comparisonModel)
                : isClickSameBoxPlotDataResponder(models, comparisonModel);
        case 'treemap':
            return isClickSameLabelResponder(models, comparisonModel);
        case 'gauge':
            return isClickSameNameResponder(models, comparisonModel);
        default:
            return false;
    }
}
export function getNearestResponder(responders, mousePosition, rect) {
    let minDistance = Infinity;
    let result = [];
    responders.forEach((responder) => {
        const { x, y, radius } = responder;
        const responderPoint = { x: x + rect.x, y: y + rect.y };
        const distance = getDistance(responderPoint, mousePosition);
        if (minDistance > distance) {
            minDistance = distance;
            result = [responder];
        }
        else if (minDistance === distance) {
            if (result.length && result[0].radius > radius) {
                result = [responder];
            }
            else {
                result.push(responder);
            }
        }
    });
    return result;
}
export function makeRectResponderModel(rect, axis, categories, vertical = true) {
    const { pointOnColumn, tickDistance, rectResponderCount } = axis;
    const { width, height } = rect;
    const halfDetectAreaIndex = pointOnColumn ? [] : [0, rectResponderCount - 1];
    const halfSize = tickDistance / 2;
    return range(0, rectResponderCount).map((index) => {
        const half = halfDetectAreaIndex.includes(index);
        const size = half ? halfSize : tickDistance;
        let startPos = 0;
        if (index !== 0) {
            startPos += pointOnColumn ? tickDistance * index : halfSize + tickDistance * (index - 1);
        }
        return {
            type: 'rect',
            y: vertical ? 0 : startPos,
            height: vertical ? height : size,
            x: vertical ? startPos : 0,
            width: vertical ? size : width,
            index,
            label: categories[index],
        };
    });
}
export function makeRectResponderModelForCoordinateType(responderInfo, rect) {
    const { width, height } = rect;
    let startPos = 0;
    return responderInfo
        .sort((a, b) => a.x - b.x)
        .reduce((acc, model, index) => {
        const { x, label } = model;
        const next = responderInfo[index + 1];
        const endPos = next ? (next.x + x) / 2 : width;
        const rectResponderModel = {
            type: 'rect',
            x: startPos,
            y: 0,
            width: endPos - startPos,
            height,
            label,
            index,
        };
        startPos = endPos;
        return [...acc, rectResponderModel];
    }, []);
}
export function makeTooltipCircleMap(seriesCircleModel, tooltipDataArr) {
    const dataMap = tooltipDataArr.reduce((acc, cur) => {
        const { index, seriesIndex } = cur;
        if (!acc[seriesIndex]) {
            acc[seriesIndex] = [];
        }
        acc[seriesIndex][index] = cur;
        return acc;
    }, []);
    return seriesCircleModel.reduce((acc, model) => {
        const { seriesIndex, index } = model;
        const data = dataMap[seriesIndex][index];
        const { category } = data;
        if (!category) {
            return acc;
        }
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(Object.assign(Object.assign({}, model), { data }));
        return acc;
    }, {});
}
export function getDeepestNode(responders) {
    return responders.reduce((acc, responder) => {
        if (!acc.length || responder.depth > acc[0].depth) {
            return [responder];
        }
        return acc;
    }, []);
}
export function isClickSameNameResponder(responders, selectedSeries) {
    var _a;
    return (responders.length && ((_a = selectedSeries) === null || _a === void 0 ? void 0 : _a.length) && responders[0].name === selectedSeries[0].name);
}
export function isClickSameCircleResponder(responders, selectedSeries) {
    var _a;
    let same = false;
    if (responders.length && ((_a = selectedSeries) === null || _a === void 0 ? void 0 : _a.length) && responders.length === selectedSeries.length) {
        same = responders.reduce((acc, cur, idx) => {
            return (acc &&
                cur.seriesIndex === selectedSeries[idx].seriesIndex &&
                cur.index === selectedSeries[idx].index);
        }, true);
    }
    return same;
}
export function isClickSameDataResponder(responders, selectedSeries) {
    var _a;
    let same = false;
    if (responders.length && ((_a = selectedSeries) === null || _a === void 0 ? void 0 : _a.length) && responders.length === selectedSeries.length) {
        same = responders.reduce((acc, cur, idx) => {
            var _a, _b, _c, _d;
            return (acc &&
                ((_a = cur.data) === null || _a === void 0 ? void 0 : _a.label) === ((_b = selectedSeries[idx].data) === null || _b === void 0 ? void 0 : _b.label) &&
                ((_c = cur.data) === null || _c === void 0 ? void 0 : _c.category) === ((_d = selectedSeries[idx].data) === null || _d === void 0 ? void 0 : _d.category));
        }, true);
    }
    return same;
}
export function isClickSameLabelResponder(responders, selectedSeries) {
    var _a;
    return (responders.length && ((_a = selectedSeries) === null || _a === void 0 ? void 0 : _a.length) && responders[0].label === selectedSeries[0].label);
}
export function isClickSameGroupedRectResponder(responders, selectedSeries) {
    var _a;
    return (responders.length && ((_a = selectedSeries) === null || _a === void 0 ? void 0 : _a.length) && responders[0].index === selectedSeries[0].index);
}
export function isClickSameBoxPlotDataResponder(responders, selectedSeries) {
    var _a, _b, _c, _d, _e;
    let same = false;
    if (responders.length && ((_a = selectedSeries) === null || _a === void 0 ? void 0 : _a.length)) {
        const { type, data } = responders[0];
        same =
            type === selectedSeries[0].type &&
                ((_b = data) === null || _b === void 0 ? void 0 : _b.label) === ((_c = selectedSeries[0].data) === null || _c === void 0 ? void 0 : _c.label) &&
                ((_d = data) === null || _d === void 0 ? void 0 : _d.category) === ((_e = selectedSeries[0].data) === null || _e === void 0 ? void 0 : _e.category);
    }
    return same;
}
export function makeGroupedSectorResponderModel(radiusRanges, renderOptions, categories) {
    const { centerX, centerY, angleRange: { start, end }, clockwise, } = renderOptions;
    return getRadiusRanges(radiusRanges, 0).map((radius, index) => ({
        type: 'sector',
        x: centerX,
        y: centerY,
        degree: { start, end },
        radius,
        name: categories[index],
        clockwise,
        index,
    }));
}
