import { setLineDash, fillStyle, strokeWithOptions } from "../helpers/style";
export function polygon(ctx, polygonModel) {
    const { color: strokeStyle, points, lineWidth, fillColor, dashSegments = [] } = polygonModel;
    if (!points.length) {
        return;
    }
    ctx.beginPath();
    if (dashSegments) {
        setLineDash(ctx, dashSegments);
    }
    points.forEach(({ x, y }, idx) => {
        if (idx === 0) {
            ctx.moveTo(x, y);
            return;
        }
        ctx.lineTo(x, y);
    });
    ctx.lineTo(points[0].x, points[0].y);
    if (fillColor) {
        fillStyle(ctx, fillColor);
    }
    strokeWithOptions(ctx, { lineWidth, strokeStyle });
    ctx.closePath();
}
