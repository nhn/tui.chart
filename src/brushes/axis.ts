export type LabelModel = {
  type: 'label';
  align: 'left' | 'center';
  x: number;
  y: number;
  text: string;
};

export type TickModel = {
  type: 'tick';
  isYAxis: boolean;
  x: number;
  y: number;
};

export type LineModel = {
  type: 'line';
  x: number;
  y: number;
  x2: number;
  y2: number;
};

export function tick(ctx: CanvasRenderingContext2D, { x, y, isYAxis }: TickModel) {
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

export function label(ctx: CanvasRenderingContext2D, { x, y, text, align = 'left' }: LabelModel) {
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x, y + 1);
}

export function line(ctx: CanvasRenderingContext2D, { x, y, x2, y2 }: LineModel) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.closePath();
}
