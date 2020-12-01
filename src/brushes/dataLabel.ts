import {
  label,
  StrokeLabelStyle,
  LabelStyle,
  bubbleLabel,
  PathRectStyleName,
} from '@src/brushes/label';
import { DataLabelModel } from '@t/components/dataLabels';
import { getTextHeight, getTextWidth } from '@src/helpers/calculator';
import { Point, Rect } from '@t/options';
import { line } from './basic';
import { getFont } from '@src/helpers/style';
import { ArrowTheme, CommonDataLabelTheme, TextBubbleTheme } from '@t/theme';
import { Nullable, StyleProp, RectStyle } from '@t/components/series';
import { pick } from '@src/helpers/utils';

export type ArrowDirection = 'top' | 'right' | 'bottom' | 'left';
type Arrow = {
  direction: ArrowDirection;
  points: Point[];
} & Point;

type BubbleInfo = Rect & {
  radius: number;
  fill: string;
  lineWidth: number;
  stroke: string;
  bubbleStyle: Nullable<StyleProp<RectStyle, PathRectStyleName>>;
} & Nullable<Arrow>;

export function dataLabel(ctx: CanvasRenderingContext2D, model: DataLabelModel) {
  const { x, y, text, textAlign, textBaseline, opacity, callout, theme } = model;
  const { color, textBubble } = theme;
  const font = getFont(theme);
  const textStyle: LabelStyle = { textAlign, textBaseline, font, fillStyle: color };
  const textStrokeStyle: StrokeLabelStyle = getTextStrokeStyle(theme);

  if (callout) {
    const {
      theme: { lineWidth, lineColor },
    } = callout;

    line(ctx, {
      type: 'line',
      ...pick(callout, 'x', 'y', 'x2', 'y2'),
      strokeStyle: lineColor,
      lineWidth,
    });
  }

  if (textBubble?.visible) {
    drawBubbleLabel(ctx, model);

    return;
  }

  label(ctx, {
    type: 'label',
    x,
    y,
    text,
    style: [textStyle],
    stroke: [textStrokeStyle],
    opacity,
  });
}

export function drawBubbleLabel(ctx: CanvasRenderingContext2D, model: DataLabelModel) {
  const { text, theme } = model;
  const { color, textStrokeColor } = theme as Required<CommonDataLabelTheme>;
  const font = getFont(theme);
  const textStyle: LabelStyle = {
    textAlign: 'center',
    textBaseline: 'middle',
    font,
    fillStyle: color,
  };
  let textStrokeStyle: StrokeLabelStyle = {};

  if (textStrokeColor) {
    textStrokeStyle = { strokeStyle: textStrokeColor };
  }

  bubbleLabel(ctx, {
    ...getBubbleInfo(model),
    labelStyle: [textStyle],
    labelStrokeStyle: [textStrokeStyle],
    text,
  });
}

export function getBubbleArrowPoints(
  direction: ArrowDirection,
  { x, y }: Point,
  arrowPointTheme: Required<ArrowTheme>
): Point[] {
  const { width, height } = arrowPointTheme;
  let points: Point[] = [];

  if (direction === 'top') {
    points = [
      { x: x - width / 2, y: y + height },
      { x, y },
      { x: x + width / 2, y: y + height },
    ];
  } else if (direction === 'bottom') {
    points = [
      { x: x + width / 2, y: y - height },
      { x, y },
      { x: x - width / 2, y: y - height },
    ];
  } else if (direction === 'right') {
    points = [
      { x: x - height, y: y - width / 2 },
      { x, y },
      { x: x - height, y: y + width / 2 },
    ];
  } else if (direction === 'left') {
    points = [
      { x: x + height, y: y + width / 2 },
      { x, y },
      { x: x + height, y: y - width / 2 },
    ];
  }

  return points;
}

function getBubbleInfo(model: DataLabelModel): BubbleInfo {
  const { text, theme, textAlign, textBaseline } = model;
  const font = getFont(theme as Required<CommonDataLabelTheme>);
  const {
    arrow,
    paddingX,
    paddingY,
    borderRadius,
    borderColor,
    borderWidth,
    backgroundColor,
    shadowBlur,
    shadowOffsetX,
    shadowOffsetY,
    shadowColor,
  } = theme!.textBubble as Required<TextBubbleTheme>;
  const labelWidth = getTextWidth(text, font);
  const width = labelWidth + paddingX * 2;
  const height = getTextHeight(font) + paddingY * 2;
  let { x, y } = model;

  if (textAlign === 'center') {
    x -= width / 2;
  } else if (textAlign === 'right') {
    x -= width;
  }

  if (textBaseline === 'middle') {
    y -= height / 2;
  } else if (textBaseline === 'bottom') {
    y -= height;
  }

  const rect: Rect = { x, y, width, height };

  return {
    ...rect,
    radius: borderRadius,
    fill: backgroundColor,
    lineWidth: borderWidth,
    stroke: borderColor,
    bubbleStyle: [
      {
        shadowBlur,
        shadowOffsetX,
        shadowOffsetY,
        shadowColor,
      },
    ],
    ...getArrowInfo(rect, textAlign, textBaseline, arrow as Required<ArrowTheme>),
  } as BubbleInfo;
}

function getArrowInfo(
  rect: Rect,
  textAlign: CanvasTextAlign,
  textBaseline: CanvasTextBaseline,
  theme: Nullable<ArrowTheme>
): Nullable<Arrow> {
  if (!theme?.visible) {
    return null;
  }

  const arrowHeight = theme.height!;
  const { x, y, width, height } = rect;
  let { x: boxX, y: boxY } = rect;
  let pointX: number = x;
  let pointY: number = y;

  const direction: ArrowDirection = theme.direction ?? getArrowDirection(textAlign, textBaseline);

  if (direction === 'top') {
    boxY += arrowHeight;
  } else if (direction === 'bottom') {
    boxY -= arrowHeight;
    pointY += height;
  } else if (direction === 'right') {
    boxX -= arrowHeight;
    pointX += width;
  } else if (direction === 'left') {
    boxX += arrowHeight;
  }

  if (textAlign === 'center') {
    pointX = x + width / 2;
  } else if (textBaseline === 'middle') {
    pointY = y + height / 2;
  }

  return {
    direction,
    points: getBubbleArrowPoints(
      direction,
      { x: pointX, y: pointY },
      theme as Required<ArrowTheme>
    ),
    x: boxX,
    y: boxY,
  };
}

function getArrowDirection(
  textAlign: CanvasTextAlign,
  textBaseline: CanvasTextBaseline
): ArrowDirection {
  let direction: ArrowDirection = 'top';

  if (textAlign === 'center' && textBaseline === 'top') {
    direction = 'top';
  } else if (textAlign === 'center' && textBaseline === 'bottom') {
    direction = 'bottom';
  } else if (textBaseline === 'middle' && textAlign === 'right') {
    direction = 'right';
  } else if (textBaseline === 'middle' && textAlign === 'left') {
    direction = 'left';
  }

  return direction;
}

function getTextStrokeStyle(theme: CommonDataLabelTheme) {
  const { textStrokeColor, lineWidth, shadowColor, shadowBlur } = theme;
  const textStrokeStyle: StrokeLabelStyle = {};

  if (textStrokeColor) {
    textStrokeStyle.strokeStyle = textStrokeColor;
  }

  if (lineWidth) {
    textStrokeStyle.lineWidth = lineWidth;
  }

  if (shadowColor) {
    textStrokeStyle.shadowColor = shadowColor;
  }

  if (shadowBlur) {
    textStrokeStyle.shadowBlur = shadowBlur;
  }

  return textStrokeStyle;
}
