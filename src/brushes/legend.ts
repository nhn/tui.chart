import { line, circle } from '@src/brushes/basic';
import { label } from '@src/brushes/label';
import { rect } from '@src/brushes/boxSeries';
import { LegendModel } from '@t/components/legend';
import { getRGBA } from '@src/helpers/color';
import { LegendIconType } from '@t/store/store';
import { Align } from '@t/options';

interface RenderOptions {
  iconType: LegendIconType;
  showCheckbox: boolean;
  checked: boolean;
  active: boolean;
  color: string;
  align: Align;
}

export const LEGEND_ITEM_HEIGHT = 25;
export const LEGEND_ITEM_MARGIN_X = 40;
export const LEGEND_MARGIN_X = 5;
export const LEGEND_MARGIN_Y = 15;
export const LEGEND_CHECKBOX_SIZE = 12;
export const LEGEND_ICON_SIZE = 12;
export const LEGEND_LABEL_FONT = 'normal 11px Arial';
const RECT_SIZE = 10;
const LINE_ICON_PADDING = 2;
const CIRCLE_ICON_RADIUS = 6;

function drawLineIcon(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
  const xCurveOffset = [2, 2, 6, 6, 10, 10];
  const yCurveOffset = [8, 0, 0, 8, 8, 0];

  xCurveOffset.forEach((xOffset, idx) => {
    if (idx === 5) {
      return;
    }
    line(ctx, {
      type: 'line',
      x: x + xOffset,
      y: y + yCurveOffset[idx],
      x2: x + xCurveOffset[idx + 1],
      y2: y + yCurveOffset[idx + 1],
      lineWidth: 2,
      strokeStyle: color,
    });
  });
}

function drawCheckIcon(ctx: CanvasRenderingContext2D, x: number, y: number, active: boolean) {
  const color = '#555555';
  const strokeStyle = active ? color : getRGBA(color, 0.3);

  line(ctx, {
    type: 'line',
    x: x + 2,
    y: y + 5,
    x2: x + 5,
    y2: y + 8,
    strokeStyle,
    lineWidth: 2,
  });
  line(ctx, {
    type: 'line',
    x: x + 5,
    y: y + 9,
    x2: x + 10,
    y2: y + 3,
    strokeStyle,
    lineWidth: 2,
  });
}

function drawCheckbox(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  renderOptions: RenderOptions
) {
  const { active, checked } = renderOptions;
  const borderColor = active ? '#bbb' : getRGBA('#bbbbbb', 0.3);

  rect(ctx, {
    type: 'rect',
    x,
    y,
    width: LEGEND_CHECKBOX_SIZE,
    height: LEGEND_CHECKBOX_SIZE,
    color: '#fff',
    borderColor,
    thickness: 1,
  });

  if (checked) {
    drawCheckIcon(ctx, x, y, active);
  }
}

function drawIcon(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  renderOptions: RenderOptions
) {
  const { iconType, active, color, showCheckbox } = renderOptions;
  const iconX = x + (showCheckbox ? LEGEND_CHECKBOX_SIZE + LEGEND_MARGIN_X : 0);
  const iconColor = active ? color : getRGBA(color, 0.3);

  if (iconType === 'rect') {
    rect(ctx, {
      type: 'rect',
      x: iconX,
      y: y + (LEGEND_CHECKBOX_SIZE - RECT_SIZE) / 2,
      width: RECT_SIZE,
      height: RECT_SIZE,
      color: iconColor,
    });
  } else if (iconType === 'line') {
    drawLineIcon(ctx, iconX, y + LINE_ICON_PADDING, iconColor);
  } else if (iconType === 'circle') {
    circle(ctx, {
      type: 'circle',
      x: iconX + CIRCLE_ICON_RADIUS,
      y: y + CIRCLE_ICON_RADIUS,
      radius: CIRCLE_ICON_RADIUS,
      color: iconColor,
      style: ['default'],
    });
  }
}

function drawLabel(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  text: string,
  renderOptions: RenderOptions
) {
  const { active, showCheckbox } = renderOptions;
  const color = '#333333';
  const fontColor = active ? color : getRGBA(color, 0.3);

  label(ctx, {
    type: 'label',
    x:
      x +
      LEGEND_ICON_SIZE +
      LEGEND_MARGIN_X +
      (showCheckbox ? LEGEND_CHECKBOX_SIZE + LEGEND_MARGIN_X : 0),
    y,
    text,
    style: ['default', { font: LEGEND_LABEL_FONT, textBaseline: 'top', fillStyle: fontColor }],
  });
}

export function legend(ctx: CanvasRenderingContext2D, model: LegendModel) {
  const { data, iconType, showCheckbox, align } = model;

  data.forEach((datum) => {
    const { x, y, checked, active, color } = datum;
    const renderOptions: RenderOptions = {
      iconType,
      checked,
      active,
      color,
      showCheckbox,
      align,
    };

    if (showCheckbox) {
      drawCheckbox(ctx, x, y, renderOptions);
    }
    drawIcon(ctx, x, y, renderOptions);
    drawLabel(ctx, x, y, datum.label, renderOptions);
  });
}
