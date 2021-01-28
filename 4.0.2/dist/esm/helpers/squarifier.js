import { sum } from "./calculator";
import { pluck } from "./arrayUtil";
function calculateScale(values, width, height) {
    return (width * height) / sum(values);
}
function isVerticalStack({ height, width }) {
    return height < width;
}
function selectBaseSize(baseBound) {
    return isVerticalStack(baseBound) ? baseBound.height : baseBound.width;
}
function makeBaseData(seriesItems, baseBound) {
    const { width, height } = baseBound;
    const scale = calculateScale(pluck(seriesItems, 'data'), width, height);
    return seriesItems
        .map((seriesItem) => ({
        id: seriesItem.id,
        weight: seriesItem.data * scale,
    }))
        .sort((a, b) => b.weight - a.weight);
}
/**
 * Calculate worst aspect ratio.
 * Referred function worst() in https://www.win.tue.nl/~vanwijk/stm.pdf
 */
function worst(total, min, max, baseSize) {
    const sumSquare = total * total;
    const sizeSquare = baseSize * baseSize;
    return Math.max((sizeSquare * max) / sumSquare, sumSquare / (sizeSquare * min));
}
function changedStackDirection(total, weights, baseSize, newWeight) {
    const minWeight = Math.min(...weights);
    const maxWeight = Math.max(...weights);
    const beforeWorst = worst(total, minWeight, maxWeight, baseSize);
    const newWorst = worst(total + newWeight, Math.min(minWeight, newWeight), Math.max(maxWeight, newWeight), baseSize);
    return newWorst >= beforeWorst;
}
function calculateFixedSize(baseSize, total, rows) {
    if (!total) {
        const weights = pluck(rows, 'weight');
        total = sum(weights);
    }
    return total / baseSize;
}
function addBounds(startPosition, rows, fixedSize, callback) {
    rows.reduce((storedPosition, rowDatum) => {
        const dynamicSize = rowDatum.weight / fixedSize;
        callback(dynamicSize, storedPosition, rowDatum.id);
        return storedPosition + dynamicSize;
    }, startPosition);
}
function addBound(boundMap, id, rect) {
    boundMap[id] = rect;
}
function addBoundsForVerticalStack(boundMap, rows, baseBound, baseSize, total) {
    const fixedWidth = calculateFixedSize(baseSize, total, rows);
    addBounds(baseBound.y, rows, fixedWidth, (dynamicHeight, storedTop, id) => {
        addBound(boundMap, id, {
            x: baseBound.x,
            y: storedTop,
            width: fixedWidth,
            height: dynamicHeight,
        });
    });
    baseBound.x += fixedWidth;
    baseBound.width -= fixedWidth;
}
function addBoundsForHorizontalStack(boundMap, rows, baseBound, baseSize, total) {
    const fixedHeight = calculateFixedSize(baseSize, total, rows);
    addBounds(baseBound.x, rows, fixedHeight, (dynamicWidth, storedLeft, id) => {
        addBound(boundMap, id, {
            x: storedLeft,
            y: baseBound.y,
            width: dynamicWidth,
            height: fixedHeight,
        });
    });
    baseBound.y += fixedHeight;
    baseBound.height -= fixedHeight;
}
function getAddingBoundsFunction(baseBound) {
    if (isVerticalStack(baseBound)) {
        return addBoundsForVerticalStack;
    }
    return addBoundsForHorizontalStack;
}
export function squarify(layout, seriesItems) {
    const baseBound = layout;
    const baseData = makeBaseData(seriesItems, baseBound);
    let row = [];
    let baseSize, addBoundsFunc;
    const boundMap = {};
    baseData.forEach((datum) => {
        const weights = pluck(row, 'weight');
        const totalWeight = sum(weights);
        if (row.length && changedStackDirection(totalWeight, weights, baseSize, datum.weight)) {
            addBoundsFunc(boundMap, row, baseBound, baseSize, totalWeight);
            row = [];
        }
        if (!row.length) {
            baseSize = selectBaseSize(baseBound);
            addBoundsFunc = getAddingBoundsFunction(baseBound);
        }
        row.push(datum);
    });
    if (row.length) {
        addBoundsFunc(boundMap, row, baseBound, baseSize);
    }
    return boundMap;
}
