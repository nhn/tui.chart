import { RectModel } from '@t/components/common';

export function rect(ctx: CanvasRenderingContext2D, model: RectModel) {
  const { x, y, width, height, style } = model;
  console.log(model);

  if (style) {
    const { thickness = 1, color, borderColor = '#ffffff' } = style;

    ctx.fillStyle = borderColor;
    ctx.fillRect(x - thickness, y - thickness, width + thickness * 2, height + thickness * 2);

    ctx.shadowColor = 'rgba(0, 0, 0, 0)'; // reset shadow color
  }

  ctx.beginPath();

  // if (style) {
  //   const styleObj = makeStyleObj<RectStyle, RectStyleName>(style, rectStyle);
  //
  //   Object.keys(styleObj).forEach((key) => {
  //     ctx[key] = styleObj[key];
  //   });
  // }

  ctx.rect(x, y, width, height);

  // ctx.fillStyle = '#323232';
  // ctx.fill();
}
