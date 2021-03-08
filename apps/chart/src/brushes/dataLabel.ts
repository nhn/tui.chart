import { label, bubbleLabel } from '@src/brushes/label';
import { DataLabelModel } from '@t/components/dataLabels';
import { getTextHeight, getTextWidth } from '@src/helpers/calculator';
import { Point, Rect } from '@t/options';
import { line } from './basic';
import { getFont } from '@src/helpers/style';
import {
  ArrowTheme,
  CommonDataLabelTheme,
  TextBubbleTheme,
  BubbleDataLabel,
  ArrowDirection,
} from '@t/theme';
import { Nullable } from '@t/components/series';
import { pick, includes } from '@src/helpers/utils';
import { BubbleInfo, Arrow } from '@t/components/axis';
import { LabelStyle, StrokeLabelStyle } from '@t/brushes';

export function dataLabel(ctx: CanvasRenderingContext2D, model: DataLabelModel) {
  const { x, y, text, textAlign, textBaseline, opacity, callout, theme, radian } = model;
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
    radian,
  });
}

export function drawBubbleLabel(ctx: CanvasRenderingContext2D, model: DataLabelModel) {
  const { text, theme, radian = 0 } = model;
  const { color, textStrokeColor } = theme as Required<BubbleDataLabel>;
  const font = getFont(theme);

  const bubbleRect = getBubbleRect(model);
  const { x, y, width, height } = bubbleRect;

  bubbleLabel(ctx, {
    type: 'bubbleLabel',
    radian,
    rotationPosition: { x: model.x, y: model.y },
    bubble: bubbleRect,
    label: {
      x: x + width / 2,
      y: y + height / 2,
      text,
      style: [{ font, fillStyle: color, textAlign: 'center', textBaseline: 'middle' }],
      strokeStyle: textStrokeColor,
    },
  });
}

export function getBubbleArrowPoints(
  direction: ArrowDirection,
  { x, y }: Point,
  arrowPointTheme: ArrowTheme
): Point[] {
  const width = arrowPointTheme.width!;
  const height = arrowPointTheme.height!;
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

function getBubbleRect(model: DataLabelModel): BubbleInfo {
  const { text, theme, textAlign, textBaseline } = model;
  const font = getFont(theme as Required<BubbleDataLabel>);
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
  const height = getTextHeight(text, font) + paddingY * 2;
  let { x, y } = model;

  if (textAlign === 'center') {
    x -= width / 2;
  } else if (includes(['right', 'end'], textAlign)) {
    x -= width;
  }

  if (textBaseline === 'middle') {
    y -= height / 2;
  } else if (textBaseline === 'bottom') {
    y -= height;
  }

  const rect = { x, y, width, height };

  return {
    ...rect,
    radius: borderRadius,
    lineWidth: borderWidth,
    fill: backgroundColor,
    strokeStyle: borderColor,
    style: [
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
  const { width, height } = rect;
  const direction: ArrowDirection = theme.direction ?? getArrowDirection(textAlign, textBaseline);

  let { x: boxX, y: boxY } = rect;
  let { x: pointX, y: pointY } = rect;

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
    pointX = rect.x + width / 2;
  } else if (textBaseline === 'middle') {
    pointY = rect.y + height / 2;
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
  const { textStrokeColor } = theme;
  const textStrokeStyle: StrokeLabelStyle = pick(theme, 'lineWidth', 'shadowColor', 'shadowBlur');

  if (textStrokeColor) {
    textStrokeStyle.strokeStyle = textStrokeColor;
  }

  return textStrokeStyle;
}
