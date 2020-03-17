import { PlotModel } from '../../types/components/plot';

export function plot(ctx: CanvasRenderingContext2D, plotModel: PlotModel) {
  const { x, y, width, height } = plotModel;

  ctx.beginPath();

  ctx.moveTo(x, y);
  ctx.lineTo(x + width, y + height);

  ctx.stroke();
  ctx.closePath();
}
