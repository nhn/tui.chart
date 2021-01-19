import { PolygonModel } from '@t/components/series';
import { setLineDash } from '@src/helpers/style';
import { fillStyle } from '@src/brushes/basic';

export function polygon(ctx: CanvasRenderingContext2D, polygonModel: PolygonModel) {
  const { color, points, lineWidth, fillColor, dashSegments = [] } = polygonModel;

  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = color;
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
    // ctx.fillStyle = fillColor;
    // ctx.fill();
  }
  ctx.stroke();
  ctx.closePath();
}
