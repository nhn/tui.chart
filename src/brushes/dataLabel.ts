import { label, pathRect, LabelStyleName, labelStyle } from '@src/brushes/basic';
import { DataLabelModel, PathRectModel } from '@t/components/series';
import { getAlpha } from '@src/helpers/color';
import { getTextWidth, getTextHeight } from '@src/helpers/calculator';
import { LabelStyle } from '@t/components/axis';
import { makeStyleObj } from '@src/helpers/style';

export function dataLabel(ctx: CanvasRenderingContext2D, labelModel: DataLabelModel) {
  const { text, x, y, style } = labelModel;

  if (style) {
    const styleObj = makeStyleObj<LabelStyle, LabelStyleName>(style, labelStyle);

    Object.keys(styleObj).forEach((key) => {
      ctx[key] = styleObj[key];
    });
  }

  drawBackground(ctx, labelModel);
  drawStrokeText(ctx, labelModel);

  label(ctx, {
    type: 'label',
    x,
    y,
    text,
    style,
  });
}

function drawStrokeText(ctx: CanvasRenderingContext2D, labelModel: DataLabelModel) {
  if (!getAlpha(labelModel.textStrokeColor)) {
    return;
  }
  const { text, x, y, textStrokeColor } = labelModel;

  ctx.lineWidth = 4;
  ctx.strokeStyle = textStrokeColor;
  ctx.strokeText(text, x, y);

  ctx.shadowColor = textStrokeColor;
  ctx.shadowBlur = 5;
}

function drawBackground(ctx: CanvasRenderingContext2D, labelModel: DataLabelModel) {
  if (!getAlpha(labelModel.bgColor)) {
    return;
  }

  const { text, x, y, bgColor, style } = labelModel;
  const { font, textBaseline } = style![1] as Required<LabelStyle>;

  const PADDING = 0;
  const RADIUS = 2;
  const textWidth = getTextWidth(text, font);
  const textHeight = getTextHeight(font);
  const rectX = x - textWidth / 2;
  let rectY = y;

  if (textBaseline === 'bottom') {
    rectY = y - textHeight;
  } else if (textBaseline === 'middle') {
    rectY = y - textHeight / 2;
  }

  const rect: PathRectModel = {
    type: 'pathRect',
    x: rectX - PADDING,
    y: rectY - PADDING,
    width: textWidth + PADDING * 2,
    height: textHeight + PADDING * 2,
    radius: RADIUS,
    stroke: '',
    fill: bgColor,
  };

  pathRect(ctx, rect);

  ctx.shadowColor = bgColor;
  ctx.shadowBlur = 5;
}
