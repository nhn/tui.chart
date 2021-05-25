import { RectModel } from '@t/components/common';

export function rect(ctx: CanvasRenderingContext2D, model: RectModel) {
  const { x, y, width, height, style } = model;

  ctx.beginPath();

  if (style?.thickness && style?.borderColor) {
    const { borderColor, thickness } = style;
    ctx.fillStyle = borderColor;
    ctx.fillRect(x - thickness, y - thickness, width + thickness * 2, height + thickness * 2);
  }

  ctx.fillStyle = style?.color || 'transparent';
  ctx.fillRect(x, y, width, height);
}
