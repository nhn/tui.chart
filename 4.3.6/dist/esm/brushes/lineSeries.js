import { setLineDash, fillStyle, strokeWithOptions } from "../helpers/style";
import { isNull } from "../helpers/utils";
export function linePoints(ctx, pointsModel) {
    const { color: strokeStyle, lineWidth, points, dashSegments = [] } = pointsModel;
    ctx.lineCap = 'round';
    ctx.beginPath();
    if (dashSegments) {
        setLineDash(ctx, dashSegments);
    }
    let start = false;
    points.forEach((point, idx) => {
        var _a, _b;
        if (isNull(point)) {
            start = false;
            return;
        }
        if (!start) {
            ctx.moveTo(point.x, point.y);
            start = true;
            return;
        }
        if (point.controlPoint && ((_b = (_a = points[idx - 1]) === null || _a === void 0 ? void 0 : _a.controlPoint) === null || _b === void 0 ? void 0 : _b.next)) {
            const { x: prevX, y: prevY } = points[idx - 1].controlPoint.next;
            const { controlPoint, x, y } = point;
            ctx.bezierCurveTo(prevX, prevY, controlPoint.prev.x, controlPoint.prev.y, x, y);
        }
        else {
            ctx.lineTo(point.x, point.y);
        }
    });
    strokeWithOptions(ctx, { lineWidth, strokeStyle });
    ctx.closePath();
    setLineDash(ctx, []);
}
export function areaPoints(ctx, areaPointsModel) {
    const { fillColor } = areaPointsModel;
    ctx.beginPath();
    linePoints(ctx, areaPointsModel);
    fillStyle(ctx, fillColor);
    ctx.closePath();
}
