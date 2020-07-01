import { ClipRectAreaModel, PathRectModel, CircleModel, CircleStyle } from '@t/components/series';
import { makeStyleObj } from '@src/helpers/style';
import { LineModel } from '@t/components/axis';

export type CircleStyleName = 'default' | 'hover';

const circleStyle = {
  default: {
    strokeStyle: '#fff',
    lineWidth: 2,
  },
  hover: {
    shadowColor: 'rgba(0, 0, 0, 0.3)',
    shadowBlur: 4,
    shadowOffsetY: 4,
    lineWidth: 3,
  },
};

export function clipRectArea(ctx: CanvasRenderingContext2D, clipRectAreaModel: ClipRectAreaModel) {
  const { x, y, width, height } = clipRectAreaModel;

  ctx.beginPath();
  ctx.rect(x, y, width, height);
  ctx.clip();
}

export function pathRect(ctx: CanvasRenderingContext2D, pathRectModel: PathRectModel) {
  const { x, y, width, height, radius = 0, stroke = 'black', fill = '' } = pathRectModel;

  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.stroke();
  }
}

export function circle(ctx: CanvasRenderingContext2D, circleModel: CircleModel) {
  const { x, y, style, radius, color } = circleModel;

  ctx.beginPath();
  ctx.fillStyle = color;

  if (style) {
    const styleObj = makeStyleObj<CircleStyle, CircleStyleName>(style, circleStyle);

    Object.keys(styleObj).forEach((key) => {
      ctx[key] = styleObj[key];
    });
  }

  ctx.arc(x, y, radius, 0, Math.PI * 2, true);
  ctx.fill();
  ctx.stroke();
  ctx.closePath();
}

export function line(ctx: CanvasRenderingContext2D, lineModel: LineModel) {
  const { x, y, x2, y2, strokeStyle, lineWidth, dashedPattern } = lineModel;

  if (strokeStyle) {
    ctx.strokeStyle = strokeStyle;
  }

  if (lineWidth) {
    ctx.lineWidth = lineWidth;
  }

  ctx.beginPath();

  if (dashedPattern) {
    ctx.setLineDash(dashedPattern);
  }

  ctx.moveTo(x, y);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.closePath();
}
