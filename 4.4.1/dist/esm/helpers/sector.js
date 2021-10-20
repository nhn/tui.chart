import { pick } from "./utils";
export const DEGREE_180 = 180;
export const DEGREE_NEGATIVE_180 = -180;
export const DEGREE_360 = 360;
export const DEGREE_0 = 0;
export const DEGREE_NEGATIVE_90 = -90;
export const DEGREE_90 = 90;
const MINIMUM_RADIUS = 10;
export function makeAnchorPositionParam(anchor, model) {
    return Object.assign({ anchor }, pick(model, 'x', 'y', 'radius', 'degree', 'drawingStartAngle'));
}
export function calculateDegreeToRadian(degree, drawingStartAngle = DEGREE_NEGATIVE_90) {
    let result = 0;
    if (degree % DEGREE_360 === 0) {
        result = (Math.PI / DEGREE_180) * drawingStartAngle;
    }
    else if (degree >= 0) {
        result = (Math.PI / DEGREE_180) * (degree + drawingStartAngle);
    }
    return result;
}
export function calculateRadianToDegree(radian, drawingStartAngle = DEGREE_NEGATIVE_90) {
    return ((radian * DEGREE_180) / Math.PI - drawingStartAngle + DEGREE_360) % DEGREE_360;
}
export function getRadialAnchorPosition(param) {
    const { anchor, x, y, radius: { inner, outer }, degree: { start, end }, drawingStartAngle = DEGREE_NEGATIVE_90, } = param;
    const halfDegree = start + (end - start) / 2;
    const radian = calculateDegreeToRadian(halfDegree, drawingStartAngle);
    const r = anchor === 'outer' ? outer : (outer + inner) / 2;
    return getRadialPosition(x, y, r, radian);
}
export function getRadialPosition(x, y, r, radian) {
    return { x: Math.round(x + r * Math.cos(radian)), y: Math.round(y + r * Math.sin(radian)) };
}
export function withinRadian(clockwise, startDegree, endDegree, currentDegree) {
    return clockwise
        ? startDegree <= currentDegree && endDegree >= currentDegree
        : startDegree >= currentDegree && endDegree <= currentDegree;
}
export function initSectorOptions(options) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    const clockwise = (_b = (_a = options) === null || _a === void 0 ? void 0 : _a.clockwise, (_b !== null && _b !== void 0 ? _b : true));
    return {
        clockwise,
        startAngle: (_e = (_d = (_c = options) === null || _c === void 0 ? void 0 : _c.angleRange) === null || _d === void 0 ? void 0 : _d.start, (_e !== null && _e !== void 0 ? _e : (clockwise ? DEGREE_0 : DEGREE_360))),
        endAngle: (_h = (_g = (_f = options) === null || _f === void 0 ? void 0 : _f.angleRange) === null || _g === void 0 ? void 0 : _g.end, (_h !== null && _h !== void 0 ? _h : (clockwise ? DEGREE_360 : DEGREE_0))),
    };
}
export function getDefaultRadius({ width, height }, isSemiCircular = false, maxLabelWidth = 0, maxLabelHeight = 0) {
    let result;
    if (isSemiCircular) {
        result = Math.min(width / 2, height) - maxLabelHeight;
    }
    else if (width > height) {
        result = height / 2 - maxLabelHeight;
    }
    else {
        result = width / 2 - maxLabelWidth;
    }
    return Math.max(result, MINIMUM_RADIUS);
}
function getRadian(startAngle, endAngle, drawingStartAngle, needCalculateByHalf) {
    const degree = needCalculateByHalf ? (endAngle + startAngle) / 2 : startAngle;
    return calculateDegreeToRadian(degree, drawingStartAngle);
}
export function getRadialLabelAlign(model, anchor, needCalculateByHalf = true) {
    const { totalAngle = DEGREE_360, degree: { start, end }, drawingStartAngle = DEGREE_NEGATIVE_90, } = model;
    let textAlign = 'center';
    if (anchor !== 'outer') {
        return textAlign;
    }
    const radian0 = calculateDegreeToRadian(0, drawingStartAngle);
    const halfRadian = calculateDegreeToRadian(totalAngle / 2, drawingStartAngle);
    const radian = getRadian(start, end, drawingStartAngle, needCalculateByHalf);
    if (drawingStartAngle >= DEGREE_NEGATIVE_90 && drawingStartAngle < DEGREE_90) {
        if (radian0 < radian && halfRadian > radian) {
            textAlign = 'left';
        }
        else if (halfRadian < radian) {
            textAlign = 'right';
        }
    }
    else if (radian0 < radian && halfRadian > radian) {
        textAlign = 'right';
    }
    else if (halfRadian < radian) {
        textAlign = 'left';
    }
    return textAlign;
}
export function getRadiusRanges(radiusRanges, padding) {
    return radiusRanges.reduce((acc, cur, index) => {
        if (index) {
            acc.push({
                inner: cur + padding,
                outer: radiusRanges[index - 1] - padding,
            });
        }
        if (index === radiusRanges.length - 1) {
            acc.push({
                inner: padding,
                outer: cur - padding,
            });
        }
        return acc;
    }, []);
}
// Recalculate to an angle between 0 and 360 degrees.
export function calculateValidAngle(angle) {
    if (angle < DEGREE_0) {
        return DEGREE_360 + (angle % DEGREE_360);
    }
    if (angle > DEGREE_360) {
        return angle % DEGREE_360;
    }
    return angle;
}
