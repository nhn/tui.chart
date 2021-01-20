import { LabelModel, RectLabelModel } from '@t/components/axis';
import { makeStyleObj, fillStyle, strokeWithOptions } from '@src/helpers/style';
import { isNumber } from '@src/helpers/utils';
import { rgba } from '@src/helpers/color';
import { pathRect } from './basic';
import { Point } from '@t/options';
import { RectStyle, StyleProp, Nullable } from '@t/components/series';

export const DEFAULT_LABEL_TEXT = 'normal 11px Arial';

export type LabelStyleName = 'default' | 'title' | 'axisTitle' | 'rectLabel';
export type StrokeLabelStyleName = 'none' | 'stroke';

export interface LabelStyle {
  font?: string;
  fillStyle?: string;
  textAlign?: CanvasTextAlign;
  textBaseline?: CanvasTextBaseline;
}

export type StrokeLabelStyle = {
  lineWidth?: number;
  strokeStyle?: string;
  shadowColor?: string;
  shadowBlur?: number;
};

export const labelStyle = {
  default: {
    font: DEFAULT_LABEL_TEXT,
    fillStyle: '#333333',
    textAlign: 'left',
    textBaseline: 'middle',
  },
  title: {
    textBaseline: 'top',
  },
  axisTitle: {
    textBaseline: 'top',
  },
  rectLabel: {
    font: DEFAULT_LABEL_TEXT,
    fillStyle: 'rgba(0, 0, 0, 0.3)',
    textAlign: 'center',
    textBaseline: 'middle',
  },
};

export const strokeLabelStyle = {
  none: {
    lineWidth: 1,
    strokeStyle: 'rgba(255, 255, 255, 0)',
  },
  stroke: {
    lineWidth: 4,
    strokeStyle: 'rgba(255, 255, 255, 0.5)',
  },
};

export function label(ctx: CanvasRenderingContext2D, labelModel: LabelModel) {
  const { x, y, text, style, stroke, opacity } = labelModel;

  if (style) {
    const styleObj = makeStyleObj<LabelStyle, LabelStyleName>(style, labelStyle);

    Object.keys(styleObj).forEach((key) => {
      ctx[key] =
        key === 'fillStyle' && isNumber(opacity) ? rgba(styleObj[key]!, opacity) : styleObj[key];
    });
  }

  if (stroke) {
    const strokeStyleObj = makeStyleObj<StrokeLabelStyle, StrokeLabelStyleName>(
      stroke,
      strokeLabelStyle
    );
    const strokeStyleKeys = Object.keys(strokeStyleObj);

    strokeStyleKeys.forEach((key) => {
      ctx[key] =
        key === 'strokeStyle' && isNumber(opacity)
          ? rgba(strokeStyleObj[key]!, opacity)
          : strokeStyleObj[key];
    });

    if (strokeStyleKeys.length) {
      ctx.strokeText(text, x, y);
    }
  }

  ctx.fillText(text, x, y);
}

export function rectLabel(ctx: CanvasRenderingContext2D, model: RectLabelModel) {
  const { x, y, style, text, width, height, borderRadius = 0, backgroundColor } = model;

  pathRect(ctx, {
    type: 'pathRect',
    x: x - width / 2,
    y: y - height / 2,
    width,
    height,
    radius: borderRadius,
    fill: backgroundColor,
    stroke: 'rgba(0, 0, 0, 0)',
  });

  label(ctx, {
    type: 'label',
    x,
    y,
    style,
    text,
  });
}

export type PathRectStyleName = 'shadow';

export type BubbleArrowDirection = 'top' | 'right' | 'bottom' | 'left';

export type BubbleLabelModel = {
  radius?: number;
  width: number;
  height: number;
  stroke?: string;
  fill?: string;
  lineWidth?: number;
  points?: Point[];
  direction?: BubbleArrowDirection;
  bubbleStyle?: Nullable<StyleProp<RectStyle, PathRectStyleName>>;
  labelStyle?: StyleProp<LabelStyle, LabelStyleName>;
  labelStrokeStyle?: StyleProp<StrokeLabelStyle, StrokeLabelStyleName>;
  text?: string;
} & Point;

const textBubbleStyle = {
  shadow: {
    shadowColor: 'rgba(0, 0, 0, 0.3)',
    shadowOffsetY: 2,
    shadowBlur: 4,
  },
};

export function bubbleLabel(ctx: CanvasRenderingContext2D, model: BubbleLabelModel) {
  const {
    x,
    y,
    width,
    height,
    radius = 0,
    points,
    direction,
    lineWidth = 1,
    fill = '#ffffff',
    stroke,
    bubbleStyle = null,
    labelStyle: textStyle,
    labelStrokeStyle,
    text,
  } = model;

  drawBubble(ctx, {
    x,
    y,
    radius,
    width,
    height,
    style: bubbleStyle,
    fill,
    stroke,
    lineWidth,
    direction,
    points,
  });

  if (text) {
    label(ctx, {
      type: 'label',
      x: x + width / 2,
      y: y + height / 2 + 1,
      text,
      style: textStyle,
      stroke: labelStrokeStyle,
    });
  }
}

type BubbleModel = {
  radius?: number;
  width: number;
  height: number;
  style: Nullable<StyleProp<RectStyle, PathRectStyleName>>;
  stroke?: string;
  fill?: string;
  lineWidth?: number;
  points?: Point[];
  direction?: string;
} & Point;

function drawBubbleArrow(ctx: CanvasRenderingContext2D, points: Point[]) {
  if (!points.length) {
    return;
  }

  ctx.lineTo(points[0].x, points[0].y);
  ctx.lineTo(points[1].x, points[1].y);
  ctx.lineTo(points[2].x, points[2].y);
}

function drawBubble(ctx: CanvasRenderingContext2D, model: BubbleModel) {
  const {
    x,
    y,
    radius = 0,
    width,
    height,
    style,
    stroke: strokeStyle,
    fill,
    lineWidth = 1,
    points = [],
    direction = '',
  } = model;

  const right = x + width;
  const bottom = y + height;

  ctx.beginPath();
  ctx.moveTo(x + radius, y);

  if (direction === 'top') {
    drawBubbleArrow(ctx, points);
  }

  ctx.lineTo(right - radius, y);
  ctx.quadraticCurveTo(right, y, right, y + radius);

  if (direction === 'right') {
    drawBubbleArrow(ctx, points);
  }

  ctx.lineTo(right, y + height - radius);
  ctx.quadraticCurveTo(right, bottom, right - radius, bottom);

  if (direction === 'bottom') {
    drawBubbleArrow(ctx, points);
  }

  ctx.lineTo(x + radius, bottom);
  ctx.quadraticCurveTo(x, bottom, x, bottom - radius);

  if (direction === 'left') {
    drawBubbleArrow(ctx, points);
  }

  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);

  if (style) {
    const styleObj = makeStyleObj<RectStyle, PathRectStyleName>(style, textBubbleStyle);

    Object.keys(styleObj).forEach((key) => {
      ctx[key] = styleObj[key];
    });
  }

  if (fill) {
    fillStyle(ctx, fill);
  }

  if (ctx.shadowColor) {
    ctx.shadowColor = 'transparent';
  }

  if (strokeStyle) {
    strokeWithOptions(ctx, { strokeStyle, lineWidth });
  }
}
