import {
  label,
  StrokeLabelStyle,
  LabelStyle,
  StrokeLabelStyleName,
  labelStyle,
} from '@src/brushes/label';
import { DataLabelModel, DataLabelType } from '@t/components/dataLabels';
import { getTextHeight, getTextWidth } from '@src/helpers/calculator';
import { includes } from '@src/helpers/utils';
import { makeStyleObj } from '@src/helpers/style';
import { RectStyle, StyleProp } from '@t/components/series';
import { Point } from '@t/options';

type PathRectStyleName = 'shadow';

type TextBubbleModel = {
  radius?: number;
  width: number;
  height: number;
  style: StyleProp<RectStyle, PathRectStyleName>;
  stroke?: string;
  fill?: string;
  lineWidth?: number;
  points?: Point[];
  direction?: string;
} & Point;

const textBubbleStyle = {
  shadow: {
    shadowColor: 'rgba(0, 0, 0, 0.3)',
    shadowOffsetY: 2,
    shadowBlur: 2,
  },
};

const textBubble = {
  HEIGHT: 28,
  POINT_WIDTH: 6,
  POINT_HEIGHT: 4,
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
    hasTextBalloon = false,
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

  if (hasTextBalloon) {
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
}

function drawBubbleLabel(ctx: CanvasRenderingContext2D, model: DataLabelModel) {
  const { PADDING_X, PADDING_Y, POINT_HEIGHT, POINT_WIDTH } = textBubble;
  const { dataLabelType, text, textAlign, textBaseline } = model;
  const font = labelStyle.rectDataLabel.font;
  const labelWidth = getTextWidth(text, font);
  const width = labelWidth + PADDING_X * 2;
  const height = getTextHeight(font) + PADDING_Y * 2;
  let { x: boxX, y: boxY } = model;

  if (textAlign === 'center' && textBaseline === 'top') {
    boxX -= width / 2;
    boxY += POINT_HEIGHT;
  } else if (textAlign === 'center' && textBaseline === 'bottom') {
    boxX -= width / 2;
    boxY -= height + POINT_HEIGHT;
  } else if (textBaseline === 'middle' && textAlign === 'right') {
    boxX -= width + POINT_HEIGHT;
    boxY -= height / 2;
  } else if (textBaseline === 'middle' && textAlign === 'left') {
    boxX += POINT_HEIGHT;
    boxY -= height / 2;
  }

  const { direction, points } = getTextBubbleArrow({ ...model, y: model.y - 1 });
  const vertical = includes(['top', 'bottom'], direction);

  drawTextBubble(ctx, {
    x: boxX,
    y: boxY - 1,
    radius: vertical ? height / 2 : (height - POINT_WIDTH) / 2,
    width,
    height,
    style: ['shadow'],
    fill: '#ffffff',
    stroke: '#eeeeee',
    lineWidth: 1,
    direction,
    points,
  });

  const { styleDefault, strokeStyleDefault } = getStyleDefaultName(dataLabelType);

  label(ctx, {
    type: 'label',
    x: boxX + width / 2,
    y: boxY + height / 2,
    text,
    style: [styleDefault, { textAlign: 'center' }],
    stroke: [strokeStyleDefault],
  });
}

function getTextBubbleArrow(model: DataLabelModel) {
  const { POINT_HEIGHT, POINT_WIDTH } = textBubble;
  const { x, y, textAlign, textBaseline } = model;
  let direction, points;

  if (textAlign === 'center' && textBaseline === 'top') {
    direction = 'top';
    points = [
      { x: x - POINT_WIDTH / 2, y: y + POINT_HEIGHT },
      { x, y },
      { x: x + POINT_WIDTH / 2, y: y + POINT_HEIGHT },
    ];
  } else if (textAlign === 'center' && textBaseline === 'bottom') {
    direction = 'bottom';
    points = [
      { x: x + POINT_WIDTH / 2, y: y - POINT_HEIGHT },
      { x, y },
      { x: x - POINT_WIDTH / 2, y: y - POINT_HEIGHT },
    ];
  } else if (textBaseline === 'middle' && textAlign === 'right') {
    direction = 'right';
    points = [
      { x: x - POINT_HEIGHT, y: y - POINT_WIDTH / 2 },
      { x, y },
      { x: x - POINT_HEIGHT, y: y + POINT_WIDTH / 2 },
    ];
  } else if (textBaseline === 'middle' && textAlign === 'left') {
    direction = 'left';
    points = [
      { x: x + POINT_HEIGHT, y: y + POINT_WIDTH / 2 },
      { x, y },
      { x: x + POINT_HEIGHT, y: y - POINT_WIDTH / 2 },
    ];
  }

  return {
    direction,
    points,
  };
}

function drawTextBubbleArrow(ctx: CanvasRenderingContext2D, points: Point[]) {
  if (!points.length) {
    return;
  }

  ctx.lineTo(points[0].x, points[0].y);
  ctx.lineTo(points[1].x, points[1].y);
  ctx.lineTo(points[2].x, points[2].y);
}

function drawTextBubble(ctx: CanvasRenderingContext2D, model: TextBubbleModel) {
  const {
    x,
    y,
    radius = 0,
    width,
    height,
    style,
    stroke,
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
    drawTextBubbleArrow(ctx, points);
  }

  ctx.lineTo(right - radius, y);
  ctx.quadraticCurveTo(right, y, right, y + radius);

  if (direction === 'right') {
    drawTextBubbleArrow(ctx, points);
  }

  ctx.lineTo(right, y + height - radius);
  ctx.quadraticCurveTo(right, bottom, right - radius, bottom);

  if (direction === 'bottom') {
    drawTextBubbleArrow(ctx, points);
  }

  ctx.lineTo(x + radius, bottom);
  ctx.quadraticCurveTo(x, bottom, x, bottom - radius);

  if (direction === 'left') {
    drawTextBubbleArrow(ctx, points);
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
    ctx.fillStyle = fill;
    ctx.fill();
  }

  if (ctx.shadowColor) {
    ctx.shadowColor = 'transparent';
  }

  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  }
}
