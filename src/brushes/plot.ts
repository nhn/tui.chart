export type PlotModel = {
  type: 'plot';
  x: number;
  y: number;
  width: number;
  height: number;
};

export function plot(ctx: CanvasRenderingContext2D, plotModel: PlotModel) {
  const { x, y, width, height } = plotModel;

  ctx.beginPath();

  ctx.moveTo(x, y);
  ctx.lineTo(x + width, y + height);

  ctx.stroke();
  ctx.closePath();
}
