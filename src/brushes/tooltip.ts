import { line, pathRect } from '@src/brushes/basic';
import { label as labelBrush } from '@src/brushes/label';
import { TooltipData, TooltipDataValue, TooltipModel } from '@t/components/tooltip';
import { rect } from '@src/brushes/boxSeries';
import { LabelModel } from '@t/components/axis';
import { BubblePoint, Point } from '@t/options';
import { deepMergedCopy, isObject } from '@src/helpers/utils';
import { getTextWidth } from '@src/helpers/calculator';
import { LabelStyle } from './label';

const MINIMUM_TOOLTIP_TEXT_WIDTH = 100;
const CATEGORY_FONT_STYLE = 'bold 13px Arial';
const LABEL_FONT_STYLE = 'normal 12px Arial';
const COLOR_RECT_SIZE = 13;
const CATEGORY_TEXT_HEIGHT = 13;
const padding = { X: 15, Y: 10 };
const MINIMUM_LABEL_MARGIN_RIGHT = 15;

type CategoryAreaInfo = {
  xStartPoint: number;
  yStartPoint: number;
  text: string;
  width: number;
} & Point;

type DataItemAreaInfo = {
  xStartPoint: number;
  width: number;
  x: number;
  y: number;
} & Pick<TooltipData, 'label' | 'value' | 'color'>;

function isBubblePointType(value: Point | BubblePoint): value is BubblePoint {
  return value.hasOwnProperty('r');
}

function getValueString(value: TooltipDataValue) {
  if (isObject(value)) {
    return `(${value.x}, ${value.y})` + (isBubblePointType(value) ? `, r: ${value.r}` : '');
  }

  return String(value);
}

function getMaximumTooltipTextWidth(tooltipModel: TooltipModel) {
  const { data, category } = tooltipModel;
  const categoryWidth = category ? getTextWidth(category, CATEGORY_FONT_STYLE) : 0;
  const textWidth = data.reduce((acc, { value, label }) => {
    const valueWidth = getTextWidth(getValueString(value), LABEL_FONT_STYLE);
    const labelWidth = getTextWidth(label, LABEL_FONT_STYLE);

    return Math.max(valueWidth + labelWidth + COLOR_RECT_SIZE, acc);
  }, -1);

  return Math.max(MINIMUM_TOOLTIP_TEXT_WIDTH, categoryWidth, textWidth);
}

function renderCategoryArea(ctx: CanvasRenderingContext2D, categoryAreaInfo: CategoryAreaInfo) {
  const { xStartPoint, yStartPoint, text, width, x, y } = categoryAreaInfo;

  labelBrush(ctx, {
    type: 'label',
    x: xStartPoint,
    y: yStartPoint,
    text,
    style: [
      'default',
      {
        textBaseline: 'top',
        fillStyle: '#fff',
        font: CATEGORY_FONT_STYLE,
        textAlign: 'left',
      },
    ],
  });

  line(ctx, {
    type: 'line',
    x,
    y: y + CATEGORY_TEXT_HEIGHT,
    x2: x + width,
    y2: y + CATEGORY_TEXT_HEIGHT,
    strokeStyle: 'rgba(0, 0, 0, 0.1)',
  });
}

function renderLabelModel(text: string, point: Point, styleObj?: LabelStyle) {
  const { x, y } = point;
  const labelStyle = {
    textBaseline: 'top',
    fillStyle: '#fff',
    font: 'normal 12px Arial',
    textAlign: 'left',
  } as LabelStyle;

  return {
    x,
    y: y + 1,
    type: 'label',
    text,
    style: ['default', styleObj ? deepMergedCopy(labelStyle, styleObj) : labelStyle],
  } as LabelModel;
}

function renderDataItem(ctx: CanvasRenderingContext2D, dataItemAreaInfo: DataItemAreaInfo) {
  const { xStartPoint, x, y, label, color, value, width } = dataItemAreaInfo;

  rect(ctx, {
    type: 'rect',
    x: xStartPoint,
    y,
    width: COLOR_RECT_SIZE,
    height: COLOR_RECT_SIZE,
    color,
  });

  labelBrush(ctx, renderLabelModel(label, { x: xStartPoint + COLOR_RECT_SIZE + 5, y }));
  labelBrush(
    ctx,
    renderLabelModel(getValueString(value), { x: x + width - padding.X, y }, { textAlign: 'right' })
  );
}

export function tooltip(ctx: CanvasRenderingContext2D, tooltipModel: TooltipModel) {
  const { x, y, data, category } = tooltipModel;
  const xStartPoint = x + padding.X;
  const yStartPoint = y + padding.Y;

  const bgColor = 'rgba(85, 85, 85, 0.95)';
  const categoryHeight = category ? 30 : 0;

  const dataHeight = 13;
  const width =
    getMaximumTooltipTextWidth(tooltipModel) + padding.X * 2 + MINIMUM_LABEL_MARGIN_RIGHT;
  const height = padding.Y * 2 + categoryHeight + dataHeight * data.length;

  pathRect(ctx, {
    type: 'pathRect',
    x,
    y,
    width,
    height,
    radius: 5,
    fill: bgColor,
    stroke: bgColor,
  });

  if (category) {
    renderCategoryArea(ctx, { xStartPoint, yStartPoint, x, y, width, text: category });
  }

  data.forEach(({ label, color, value }, index) => {
    const dataPoint = yStartPoint + categoryHeight + 15 * index;

    renderDataItem(ctx, { x, y: dataPoint, xStartPoint, label, color, value, width });
  });
}
