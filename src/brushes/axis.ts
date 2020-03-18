import { TickModel, LabelModel, LineModel } from '@t/components/axis';

export function tick(ctx: CanvasRenderingContext2D, tickModel: TickModel) {
  const { x, y, isYAxis } = tickModel;

  ctx.beginPath();

  if (isYAxis) {
    ctx.moveTo(x - 5, y);
    ctx.lineTo(x, y);
  } else {
    ctx.moveTo(x, y);
    ctx.lineTo(x, y + 5);
  }

  ctx.stroke();
  ctx.closePath();
}

export function label(ctx: CanvasRenderingContext2D, labelModel: LabelModel) {
  const { x, y, text, align = 'left' } = labelModel;

  ctx.font = 'normal 11px Arial';
  ctx.fillStyle = '#333';
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x, y + 1);
}

export function line(ctx: CanvasRenderingContext2D, lineModel: LineModel) {
  const { x, y, x2, y2 } = lineModel;

  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.closePath();
}
