import { BoxSeriesModel, RectModel } from '@t/components/series';

export function box(ctx: CanvasRenderingContext2D, boxModel: BoxSeriesModel) {
  const { x, y, width, height } = boxModel;

  ctx.fillStyle = boxModel.color;
  ctx.fillRect(x, y, width, height);
}

export function rect(ctx: CanvasRenderingContext2D, model: RectModel) {
  const thickness = 4;
  const { x, y, width, height, offsetKey = 'y' } = model;

  ctx.beginPath();
  ctx.fillStyle = '#fff';

  ctx.shadowColor = 'rgba(0, 0, 0, .3)';

  if (offsetKey === 'y') {
    ctx.shadowOffsetY = 4;
  } else {
    ctx.shadowOffsetX = 4;
  }

  ctx.shadowBlur = 8;

  ctx.fillRect(x - thickness, y - thickness, width + thickness * 2, height + thickness * 2);

  if (offsetKey === 'y') {
    ctx.shadowOffsetY = 0;
  } else {
    ctx.shadowOffsetX = 0;
  }

  ctx.shadowColor = 'transparent';

  ctx.fillStyle = model.color;
  ctx.rect(x, y, width, height);
  ctx.fill();
}
