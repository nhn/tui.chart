import { AreaPointsModel, LinePointsModel } from '@t/components/series';
import { setLineDash } from '@src/helpers/style';
import { isNull } from '@src/helpers/utils';

type PointsModel = LinePointsModel | AreaPointsModel;

export function linePoints(ctx: CanvasRenderingContext2D, pointsModel: PointsModel) {
  const { color, lineWidth, points, dashSegments = [] } = pointsModel;

  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'round';
  ctx.strokeStyle = color;
  ctx.beginPath();

  if (dashSegments) {
    setLineDash(ctx, dashSegments);
  }

  let start = false;

  points.forEach((point, idx) => {
    if (isNull(point)) {
      start = false;

      return;
    }

    if (!start) {
      ctx.moveTo(point.x, point.y);
      start = true;

      return;
    }

    if (point.controlPoint && points[idx - 1]?.controlPoint?.next) {
      const { x: prevX, y: prevY } = points[idx - 1]!.controlPoint!.next;
      const { controlPoint, x, y } = point;

      ctx.bezierCurveTo(prevX, prevY, controlPoint.prev.x, controlPoint.prev.y, x, y);
    } else {
      ctx.lineTo(point.x, point.y);
    }
  });

  ctx.stroke();
  ctx.closePath();
  setLineDash(ctx, []);
}

export function areaPoints(ctx: CanvasRenderingContext2D, areaPointsModel: AreaPointsModel) {
  const { fillColor } = areaPointsModel;

  ctx.beginPath();
  linePoints(ctx, areaPointsModel);

  ctx.fillStyle = fillColor;
  ctx.fill();

  ctx.closePath();
}
