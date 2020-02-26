export type CircleModel = {
  type: 'circle';
  color: string;
  x: number;
  y: number;
  radius: number;
};

export function circle(ctx: CanvasRenderingContext2D, { x, y, radius, color }: CircleModel) {
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.arc(x, y, radius, 0, Math.PI * 2, true);
  ctx.stroke();
  ctx.closePath();
}
