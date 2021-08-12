import { range, isInteger, isString, isNumber, isNull } from "./utils";
import { DEFAULT_LABEL_TEXT } from "../brushes/label";
import { TICK_SIZE } from "../brushes/axis";
const LINE_HEIGHT_NORMAL = 1.2;
const ctx = document.createElement('canvas').getContext('2d');
export function getTextWidth(text, font = DEFAULT_LABEL_TEXT) {
    ctx.font = font;
    return Math.ceil(ctx.measureText(text).width);
}
/*
 * Calculate height of canvas text
 * https://developer.mozilla.org/en-US/docs/Web/API/TextMetrics
 * */
export function getTextHeight(text, font = DEFAULT_LABEL_TEXT) {
    ctx.font = font;
    const { actualBoundingBoxAscent, actualBoundingBoxDescent } = ctx.measureText(text);
    const validActualBoundingBox = isNumber(actualBoundingBoxAscent) && isNumber(actualBoundingBoxDescent);
    return validActualBoundingBox
        ? Math.ceil(Math.abs(actualBoundingBoxAscent) + Math.abs(actualBoundingBoxDescent)) + 1
        : getFontHeight(font);
}
export function getFontHeight(font = DEFAULT_LABEL_TEXT) {
    const fontSize = font.match(/\d+(?=px)/);
    return parseInt(String(Number(fontSize) * LINE_HEIGHT_NORMAL), 10);
}
export function getAxisLabelAnchorPoint(labelHeight) {
    return crispPixel(TICK_SIZE * 2 + labelHeight / 2);
}
function getDecimalLength(value) {
    var _a, _b;
    return _b = (_a = String(value).split('.')[1]) === null || _a === void 0 ? void 0 : _a.length, (_b !== null && _b !== void 0 ? _b : 0);
}
function findMultipleNum(...args) {
    const underPointLens = args.map((value) => getDecimalLength(value));
    const underPointLen = Math.max(...underPointLens);
    return Math.pow(10, underPointLen);
}
export function add(a, b) {
    const multipleNum = findMultipleNum(a, b);
    return (a * multipleNum + b * multipleNum) / multipleNum;
}
export function multiply(a, b) {
    const multipleNum = findMultipleNum(a, b);
    return (a * multipleNum * (b * multipleNum)) / (multipleNum * multipleNum);
}
export function divide(a, b) {
    const multipleNum = findMultipleNum(a, b);
    return (a * multipleNum) / (b * multipleNum);
}
export function sum(values) {
    const copyArr = values.slice();
    copyArr.unshift(0);
    return copyArr.reduce((base, value) => add(parseFloat(String(base)), parseFloat(String(value))));
}
export function divisors(value) {
    const result = [];
    for (let a = 2, b; a * a <= value; a += 1) {
        if (value % a === 0) {
            b = value / a;
            result.push(a);
            if (b !== a) {
                result.push(b);
            }
        }
    }
    return result.sort((prev, next) => prev - next);
}
export function makeLabelsFromLimit(limit, stepSize, isDateType) {
    const multipleNum = findMultipleNum(stepSize);
    const min = Math.round(limit.min * multipleNum);
    const max = Math.round(limit.max * multipleNum);
    const labels = range(min, max + 1, stepSize * multipleNum);
    return labels.map((label) => {
        return String(isDateType ? new Date(label) : label / multipleNum);
    });
}
export function makeTickPixelPositions(size, count, additionalPosition = 0, remainLastBlockIntervalPosition = 0) {
    let positions = [];
    if (count > 0) {
        positions = range(0, count).map((index) => {
            const ratio = index === 0 ? 0 : index / (count - 1);
            return ratio * size + additionalPosition;
        });
    }
    if (remainLastBlockIntervalPosition) {
        positions.push(remainLastBlockIntervalPosition);
    }
    return positions;
}
export function crispPixel(pixel, thickness = 1) {
    const halfThickness = thickness / 2;
    return thickness % 2
        ? (isInteger(pixel) ? pixel : Math.round(pixel - halfThickness)) + halfThickness
        : Math.round(pixel);
}
function getControlPoints(prev, cur, next) {
    // http://scaledinnovation.com/analytics/splines/aboutSplines.html
    const TENSION = 0.333;
    const { x: x0, y: y0 } = prev;
    const { x: x1, y: y1 } = cur;
    const { x: x2, y: y2 } = next;
    const d12 = getDistance(next, cur);
    const d01 = getDistance(cur, prev);
    const fa = (TENSION * d01) / (d01 + d12) || 0; // scaling factor for triangle Ta
    const fb = (TENSION * d12) / (d01 + d12) || 0; // ditto for Tb, simplifies to fb=t-fa
    return {
        prev: {
            x: x1 - fa * (x2 - x0),
            y: y1 - fa * (y2 - y0),
        },
        next: { x: x1 + fb * (x2 - x0), y: y1 + fb * (y2 - y0) },
    };
}
export function setSplineControlPoint(points) {
    for (let i = 0, pointsSize = points.length, prev = points[0]; i < pointsSize; i += 1) {
        const point = points[i];
        if (isNull(point)) {
            prev = points[i + 1];
            continue;
        }
        const next = points[Math.min(i + 1, pointsSize - 1) % pointsSize];
        if (prev && next) {
            point.controlPoint = getControlPoints(prev, point, next);
        }
        prev = point;
    }
}
export function getValueRatio(value, { min, max }) {
    if (max === min) {
        return 0;
    }
    return (value - min) / (max - min);
}
export function getDistance(point1, point2) {
    return Math.sqrt(Math.pow((point2.x - point1.x), 2) + Math.pow((point2.y - point1.y), 2));
}
export function getMaxLengthLabelWidth(labels) {
    const maxLengthLabel = labels.reduce((acc, cur) => (acc.length > cur.length ? acc : cur), '');
    return getTextWidth(maxLengthLabel);
}
export function getXPosition(axisData, offsetSize, value, dataIndex) {
    const { pointOnColumn, tickDistance, labelRange } = axisData;
    let x;
    if (labelRange) {
        const xValue = isString(value) ? Number(new Date(value)) : Number(value);
        const xValueRatio = getValueRatio(xValue, labelRange);
        x = xValueRatio * offsetSize;
    }
    else {
        x = tickDistance * dataIndex + (pointOnColumn ? tickDistance / 2 : 0);
    }
    return x;
}
