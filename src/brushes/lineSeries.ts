import { AreaPointsModel, LinePointsModel } from '@t/components/series';

type PointsModel = LinePointsModel | AreaPointsModel;

export function linePoints(ctx: CanvasRenderingContext2D, pointsModel: PointsModel, close = true) {
  const { color, lineWidth, points } = pointsModel;

  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'round';
  ctx.strokeStyle = color;
  ctx.beginPath();

  points.forEach((point, idx) => {
    if (idx === 0) {
      ctx.moveTo(point.x, point.y);

      return;
    }

    if (point.controlPoint) {
      const { x: prevX, y: prevY } = points[idx - 1].controlPoint!.next;
      const { controlPoint, x, y } = point;

      ctx.bezierCurveTo(prevX, prevY, controlPoint.prev.x, controlPoint.prev.y, x, y);
    } else {
      ctx.lineTo(point.x, point.y);
    }
  });

  ctx.stroke();
  if (close) {
    ctx.closePath();
  }
}

export function areaPoints(ctx: CanvasRenderingContext2D, areaPointsModel: AreaPointsModel) {
  const { points, bottomYPoint, fillColor } = areaPointsModel;

  ctx.beginPath();

  const startPoint = points[0];
  const endPoint = points[points.length - 1];

  linePoints(ctx, areaPointsModel, false);

  ctx.lineTo(endPoint.x, bottomYPoint);
  ctx.lineTo(startPoint.x, bottomYPoint);
  ctx.lineTo(startPoint.x, startPoint.y);

  ctx.fillStyle = fillColor;
  ctx.fill();

  ctx.closePath();
}
