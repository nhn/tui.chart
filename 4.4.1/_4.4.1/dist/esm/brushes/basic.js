import { makeStyleObj, setLineDash, fillStyle, strokeWithOptions } from "../helpers/style";
import { calculateDegreeToRadian } from "../helpers/sector";
const circleStyle = {
    default: {
        strokeStyle: '#ffffff',
        lineWidth: 2,
    },
    plot: {
        lineWidth: 1,
        strokeStyle: 'rgba(0, 0, 0, 0.05)',
    },
};
const rectStyle = {
    shadow: {
        shadowColor: 'rgba(0, 0, 0, 0.3)',
        shadowOffsetX: 2,
        shadowOffsetY: 2,
        shadowBlur: 6,
    },
};
export function clipRectArea(ctx, clipRectAreaModel) {
    const { x, y, width, height } = clipRectAreaModel;
    ctx.beginPath();
    ctx.rect(x, y, width, height);
    ctx.clip();
}
export function pathRect(ctx, pathRectModel) {
    const { x, y, width, height, radius = 0, stroke: strokeStyle = 'black', fill = '', lineWidth = 1, } = pathRectModel;
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    if (fill) {
        fillStyle(ctx, fill);
    }
    strokeWithOptions(ctx, { lineWidth, strokeStyle });
}
export function circle(ctx, circleModel) {
    const { x, y, style, radius, color, angle = { start: 0, end: Math.PI * 2 }, borderWidth: lineWidth, borderColor: strokeStyle, } = circleModel;
    ctx.beginPath();
    if (style) {
        const styleObj = makeStyleObj(style, circleStyle);
        Object.keys(styleObj).forEach((key) => {
            ctx[key] = styleObj[key];
        });
    }
    ctx.arc(x, y, radius, angle.start, angle.end, true);
    strokeWithOptions(ctx, { lineWidth, strokeStyle });
    fillStyle(ctx, color);
    ctx.closePath();
}
export function line(ctx, lineModel) {
    const { x, y, x2, y2, strokeStyle, lineWidth, dashSegments } = lineModel;
    ctx.beginPath();
    if (dashSegments) {
        setLineDash(ctx, dashSegments);
    }
    ctx.moveTo(x, y);
    ctx.lineTo(x2, y2);
    strokeWithOptions(ctx, { strokeStyle, lineWidth });
    ctx.closePath();
}
export function rect(ctx, model) {
    const { x, y, width, height, style, thickness = 0, color, borderColor = '#ffffff' } = model;
    ctx.beginPath();
    if (style) {
        const styleObj = makeStyleObj(style, rectStyle);
        Object.keys(styleObj).forEach((key) => {
            ctx[key] = styleObj[key];
        });
    }
    if (thickness) {
        ctx.fillStyle = borderColor;
        ctx.fillRect(x - thickness, y - thickness, width + thickness * 2, height + thickness * 2);
        ctx.shadowColor = 'rgba(0, 0, 0, 0)'; // reset shadow color
    }
    ctx.rect(x, y, width, height);
    fillStyle(ctx, color);
}
export function arc(ctx, arcModel) {
    const { x, y, angle: { start, end }, borderWidth: lineWidth, borderColor: strokeStyle, drawingStartAngle, radius, clockwise = true, } = arcModel;
    ctx.beginPath();
    const startRadian = calculateDegreeToRadian(start, drawingStartAngle);
    const endRadian = calculateDegreeToRadian(end, drawingStartAngle);
    ctx.arc(x, y, radius, startRadian, endRadian, !clockwise);
    strokeWithOptions(ctx, { lineWidth, strokeStyle });
    ctx.closePath();
}
