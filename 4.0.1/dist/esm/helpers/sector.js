import { pick } from "./utils";
export function makeAnchorPositionParam(anchor, model) {
    return Object.assign({ anchor }, pick(model, 'x', 'y', 'radius', 'degree', 'drawingStartAngle'));
}
export function calculateDegreeToRadian(degree, drawingStartAngle = -90) {
    let result = 0;
    if (degree % 360 === 0) {
        result = (Math.PI / 180) * drawingStartAngle;
    }
    else if (degree >= 0 && degree < 360) {
        result = (Math.PI / 180) * (degree + drawingStartAngle);
    }
    return result;
}
export function calculateRadianToDegree(radian, drawingStartAngle = -90) {
    return ((radian * 180) / Math.PI - drawingStartAngle + 360) % 360;
}
export function getRadialAnchorPosition(param) {
    const { anchor, x, y, radius: { inner, outer }, degree: { start, end }, drawingStartAngle, } = param;
    const halfDegree = start + (end - start) / 2;
    const radian = calculateDegreeToRadian(halfDegree, drawingStartAngle);
    const r = anchor === 'center' ? (outer - inner) / 2 + inner : outer;
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
