import {
  label,
  StrokeLabelStyle,
  LabelStyle,
  StrokeLabelStyleName,
  labelStyle,
} from '@src/brushes/label';
import { DataLabelModel, DataLabelType } from '@t/components/dataLabels';
import { polygon } from './polygon';
import { pathRect, line } from './basic';
import { getTextHeight, getTextWidth } from '@src/helpers/calculator';
import { includes } from '@src/helpers/utils';

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
    drawBalloonLabel(ctx, model);

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

const dataLabelBalloon = {
  HEIGHT: 28,
  POINT_WIDTH: 6,
  POINT_HEIGHT: 4,
  PADDING_X: 5,
  PADDING_Y: 2,
};

function drawBalloonLabel(ctx: CanvasRenderingContext2D, model: DataLabelModel) {
  drawBalloonBox(ctx, model);
  drawBalloonArrow(ctx, model);
}

function drawBalloonArrow(ctx: CanvasRenderingContext2D, model: DataLabelModel) {
  const { POINT_HEIGHT, POINT_WIDTH } = dataLabelBalloon;
  const { x, y, textAlign, textBaseline } = model;
  let points;

  if (textAlign === 'center' && textBaseline === 'top') {
    points = [
      { x, y },
      { x: x - POINT_WIDTH / 2, y: y + POINT_HEIGHT },
      { x: x + POINT_WIDTH / 2, y: y + POINT_HEIGHT },
    ];
  } else if (textAlign === 'center' && textBaseline === 'bottom') {
    points = [
      { x, y },
      { x: x - POINT_WIDTH / 2, y: y - POINT_HEIGHT },
      { x: x + POINT_WIDTH / 2, y: y - POINT_HEIGHT },
    ];
  } else if (textBaseline === 'middle' && textAlign === 'right') {
    points = [
      { x, y },
      { x: x - POINT_HEIGHT, y: y - POINT_WIDTH / 2 },
      { x: x - POINT_HEIGHT, y: y + POINT_WIDTH / 2 },
    ];
  } else if (textBaseline === 'middle' && textAlign === 'left') {
    points = [
      { x, y },
      { x: x + POINT_HEIGHT, y: y - POINT_WIDTH / 2 },
      { x: x + POINT_HEIGHT, y: y + POINT_WIDTH / 2 },
    ];
  }
  console.log(model, points);
  polygon(ctx, { type: 'polygon', color: '#ffffff', lineWidth: 1, points, fillColor: '#ffffff' });
  line(ctx, {
    type: 'line',
    x: points[0].x,
    y: points[0].y,
    x2: points[1].x,
    y2: points[1].y,
    lineWidth: 1,
    strokeStyle: '#eeeeee',
  });
  line(ctx, {
    type: 'line',
    x: points[0].x,
    y: points[0].y,
    x2: points[2].x,
    y2: points[2].y,
    lineWidth: 1,
    strokeStyle: '#eeeeee',
  });
}

function drawBalloonBox(ctx: CanvasRenderingContext2D, model: DataLabelModel) {
  const { PADDING_X, PADDING_Y, POINT_HEIGHT } = dataLabelBalloon;
  let { x: boxX, y: boxY } = model;
  const { dataLabelType, text, textAlign, textBaseline } = model;
  const font = labelStyle.rectDataLabel.font;
  const labelWidth = getTextWidth(text, font);
  const width = labelWidth + PADDING_X * 2;
  const height = getTextHeight(font) + PADDING_Y * 2;

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

  pathRect(ctx, {
    type: 'pathRect',
    x: boxX,
    y: boxY,
    width,
    height,
    fill: '#ffffff',
    stroke: '#eeeeee',
    radius: height / 2,
    style: ['shadow'],
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
