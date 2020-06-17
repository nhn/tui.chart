import { RectModel, RectStyle } from '@t/components/series';
import { makeStyleObj } from '@src/helpers/style';
import { isNull } from '@src/helpers/utils';

export type RectStyleName = 'default';

export function rect(ctx: CanvasRenderingContext2D, model: RectModel) {
  if (isNull(model)) {
    return;
  }

  const { x, y, width, height, style, thickness = 0 } = model;

  ctx.beginPath();

  if (style) {
    const styleObj = makeStyleObj<RectStyle, RectStyleName>(style, {});

    Object.keys(styleObj).forEach((key) => {
      ctx[key] = styleObj[key];
    });
  }

  if (thickness) {
    ctx.fillStyle = '#fff';
    ctx.fillRect(x - thickness, y - thickness, width + thickness * 2, height + thickness * 2);
    ctx.shadowColor = 'transparent';
  }

  ctx.fillStyle = model.color;
  ctx.rect(x, y, width, height);
  ctx.fill();
}
