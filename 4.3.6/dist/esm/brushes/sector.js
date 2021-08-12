import { makeStyleObj, fillStyle } from "../helpers/style";
import { calculateDegreeToRadian, getRadialPosition, DEGREE_360 } from "../helpers/sector";
export function sector(ctx, sectorModel) {
    const { degree: { start, end }, color, style, lineWidth, } = sectorModel;
    if (start === end) {
        return;
    }
    const isCircle = Math.abs(start - end) === DEGREE_360;
    ctx.beginPath();
    if (style) {
        const styleObj = makeStyleObj(style, {});
        Object.keys(styleObj).forEach((key) => {
            ctx[key] = styleObj[key];
        });
    }
    if (isCircle) {
        drawCircle(ctx, sectorModel);
    }
    else {
        drawSector(ctx, sectorModel);
    }
    ctx.closePath();
    fillStyle(ctx, color);
    if (lineWidth) {
        ctx.lineWidth = lineWidth;
        ctx.stroke();
    }
}
function drawSector(ctx, sectorModel) {
    const { x, y, radius: { inner, outer }, degree: { start, end }, clockwise, drawingStartAngle, } = sectorModel;
    if (inner < 0 || outer < 0) {
        return;
    }
    const startRadian = calculateDegreeToRadian(start, drawingStartAngle);
    const endRadian = calculateDegreeToRadian(end, drawingStartAngle);
    if (!inner) {
        ctx.moveTo(x, y);
    }
    ctx.arc(x, y, outer, startRadian, endRadian, !clockwise);
    if (inner) {
        ctx.arc(x, y, inner, endRadian, startRadian, clockwise);
    }
}
function drawCircle(ctx, sectorModel) {
    const { x, y, radius: { inner, outer }, clockwise, } = sectorModel;
    ctx.arc(x, y, outer, 0, 2 * Math.PI, !clockwise);
    if (inner) {
        const { x: innerStartPosX, y: innerStartPosY } = getRadialPosition(x, y, inner, 0);
        const startX = inner ? innerStartPosX : x;
        const startY = inner ? innerStartPosY : y;
        ctx.moveTo(startX, startY);
        ctx.arc(x, y, inner, 0, 2 * Math.PI, clockwise);
    }
}
