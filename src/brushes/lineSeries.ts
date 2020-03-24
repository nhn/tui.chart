import { CircleModel } from '@t/components/series';

export function circle(ctx: CanvasRenderingContext2D, circleModel: CircleModel) {
  const { x, y, radius, color } = circleModel;

  ctx.beginPath();
  ctx.fillStyle = color;

  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 2;

  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
  ctx.shadowBlur = 6;
  ctx.shadowOffsetY = 4;

  ctx.arc(x, y, radius, 0, Math.PI * 2, true);
  ctx.fill();
  ctx.stroke();
  ctx.closePath();
}
