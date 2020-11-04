import { PolygonModel } from '@t/components/series';

export function polygon(ctx: CanvasRenderingContext2D, polygonModel: PolygonModel) {
  const { color, points, lineWidth, fillColor, dashSegments = [] } = polygonModel;

  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'round';
  ctx.strokeStyle = color;

  if (fillColor) {
    ctx.fillStyle = fillColor;
  }

  ctx.beginPath();

  if (dashSegments) {
    ctx.setLineDash(dashSegments);
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
    ctx.fill();
  }
  ctx.stroke();
  ctx.closePath();
}
