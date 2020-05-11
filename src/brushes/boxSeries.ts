import { BoxSeriesModel, HoverBoxSeriesModel } from '@t/components/series';
import { crispPixel } from '@src/helpers/calculator';

export function box(ctx: CanvasRenderingContext2D, boxModel: BoxSeriesModel) {
  const { x, y, width, height } = boxModel;

  ctx.fillStyle = boxModel.color;
  ctx.fillRect(x, y, width, height);
}

export function rect(ctx: CanvasRenderingContext2D, model: HoverBoxSeriesModel) {
  const { x, y, width, height, offsetKey = 'y', thickness = 4 } = model;
  const shadowOffset = thickness / 2;

  ctx.beginPath();
  ctx.fillStyle = '#fff';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';

  if (offsetKey === 'y') {
    ctx.shadowOffsetX = shadowOffset;
    ctx.shadowOffsetY = shadowOffset;
  } else {
    ctx.shadowOffsetX = shadowOffset;
    ctx.shadowOffsetY = -1 * shadowOffset;
  }

  ctx.shadowBlur = thickness + shadowOffset;
  ctx.fillRect(x - thickness, y - thickness, width + thickness * 2, height + thickness * 2);
  ctx.shadowColor = 'transparent';
  ctx.fillStyle = model.color;

  ctx.rect(x, y, width, height);
  ctx.fill();
}
