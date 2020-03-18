import { CircleModel } from '@t/components/series';

export function circle(ctx: CanvasRenderingContext2D, circleModel: CircleModel) {
  const { x, y, radius, color } = circleModel;

  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.arc(x, y, radius, 0, Math.PI * 2, true);
  ctx.stroke();
  ctx.closePath();
}
