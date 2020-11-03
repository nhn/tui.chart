import {
  label,
  StrokeLabelStyle,
  LabelStyle,
  StrokeLabelStyleName,
  labelStyle,
  bubbleLabel,
} from '@src/brushes/label';
import { DataLabelModel, DataLabelType } from '@t/components/dataLabels';
import { getTextHeight, getTextWidth } from '@src/helpers/calculator';
import { includes } from '@src/helpers/utils';
import { Point } from '@t/options';
import { line } from './basic';

type PathRectStyleName = 'shadow';

export type ArrowDirection = 'top' | 'right' | 'bottom' | 'left';

export const textBubble = {
  HEIGHT: 28,
  POINT_WIDTH: 8,
  POINT_HEIGHT: 6,
  PADDING_X: 5,
  PADDING_Y: 2,
};

function getStyleDefaultName(
  type: DataLabelType
): { styleDefault: LabelStyle; strokeStyleDefault: StrokeLabelStyleName } {
  const labelStyleDefaultMap = {
    stackTotal: 'stackTotal',
    sector: 'sector',
    pieSeriesName: 'pieSeriesName',
    treemapSeriesName: 'treemapSeriesName',
    rect: 'rectDataLabel',
    line: 'lineDataLabel',
  };

  const styleDefaultWithType = labelStyleDefaultMap[type];

  return {
    styleDefault: styleDefaultWithType ? styleDefaultWithType : 'default',
    strokeStyleDefault:
      styleDefaultWithType || includes(['rect', 'line'], type) ? 'none' : 'stroke',
  };
}

export function dataLabel(ctx: CanvasRenderingContext2D, model: DataLabelModel) {
  const {
    dataLabelType,
    x,
    y,
    text,
    textAlign,
    textBaseline,
    style,
    opacity,
    defaultColor,
    hasTextBubble = false,
    callout,
  } = model;
  const textStyle: LabelStyle = { textAlign, textBaseline };
  const textStrokeStyle: StrokeLabelStyle = {};

  if (defaultColor) {
    textStyle.fillStyle = defaultColor;
  }

  // @TODO: 테마로 입력받은 값 사용
  if (style) {
    Object.keys(style).forEach((key) => {
      const styleValue = style[key];

      if (!styleValue) {
        return;
      }

      switch (key) {
        case 'font':
          textStyle.font = styleValue;
          break;
        case 'color':
          textStyle.fillStyle = styleValue;
          break;
        case 'textStrokeColor':
          textStrokeStyle.strokeStyle = styleValue;
          break;
      }
    });
  }

  if (hasTextBubble) {
    drawBubbleLabel(ctx, model);

    return;
  }

  const { styleDefault, strokeStyleDefault } = getStyleDefaultName(dataLabelType);

  label(ctx, {
    type: 'label',
    x,
    y,
    text,
    style: [styleDefault, textStyle],
    stroke: [strokeStyleDefault, textStrokeStyle],
    opacity,
  });

  if (callout) {
    line(ctx, callout);
  }
}

export function drawBubbleLabel(ctx: CanvasRenderingContext2D, model: DataLabelModel) {
  const { PADDING_X, PADDING_Y, POINT_HEIGHT } = textBubble;
  const { dataLabelType, text, textAlign, textBaseline } = model;
  const font = labelStyle.rectDataLabel.font;
  const labelWidth = getTextWidth(text, font);
  const width = labelWidth + PADDING_X * 2;
  let height = getTextHeight(font) + PADDING_Y * 2;
  let { x: boxX, y: boxY } = model;
  let direction: ArrowDirection = 'top';

  if (textAlign === 'center' && textBaseline === 'top') {
    boxX -= width / 2;
    boxY += POINT_HEIGHT;
    direction = 'top';
  } else if (textAlign === 'center' && textBaseline === 'bottom') {
    boxX -= width / 2;
    boxY -= height + POINT_HEIGHT;
    direction = 'bottom';
  } else if (textBaseline === 'middle' && textAlign === 'right') {
    height += 5;
    boxX -= width + POINT_HEIGHT;
    boxY -= height / 2;
    direction = 'right';
  } else if (textBaseline === 'middle' && textAlign === 'left') {
    height += 5;
    boxX += POINT_HEIGHT;
    boxY -= height / 2;
    direction = 'left';
  }

  const points = getBubbleArrowPoints(direction, { x: model.x, y: model.y - 1 });
  const { styleDefault, strokeStyleDefault } = getStyleDefaultName(dataLabelType);

  bubbleLabel(ctx, {
    x: boxX,
    y: boxY - 1,
    radius: 7,
    width,
    height,
    stroke: '#eeeeee',
    bubbleStyle: ['shadow'],
    direction,
    points,
    labelStyle: [styleDefault, { textAlign: 'center' }],
    labelStrokeStyle: [strokeStyleDefault],
    text,
  });
}

export function getBubbleArrowPoints(direction: ArrowDirection, { x, y }: Point): Point[] {
  const { POINT_HEIGHT, POINT_WIDTH } = textBubble;
  let points: Point[] = [];

  if (direction === 'top') {
    points = [
      { x: x - POINT_WIDTH / 2, y: y + POINT_HEIGHT },
      { x, y },
      { x: x + POINT_WIDTH / 2, y: y + POINT_HEIGHT },
    ];
  } else if (direction === 'bottom') {
    points = [
      { x: x + POINT_WIDTH / 2, y: y - POINT_HEIGHT },
      { x, y },
      { x: x - POINT_WIDTH / 2, y: y - POINT_HEIGHT },
    ];
  } else if (direction === 'right') {
    points = [
      { x: x - POINT_HEIGHT, y: y - POINT_WIDTH / 2 },
      { x, y },
      { x: x - POINT_HEIGHT, y: y + POINT_WIDTH / 2 },
    ];
  } else if (direction === 'left') {
    points = [
      { x: x + POINT_HEIGHT, y: y + POINT_WIDTH / 2 },
      { x, y },
      { x: x + POINT_HEIGHT, y: y - POINT_WIDTH / 2 },
    ];
  }

  return points;
}
