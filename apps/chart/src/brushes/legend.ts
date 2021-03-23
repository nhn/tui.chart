import { line, circle, rect } from '@src/brushes/basic';
import { label } from '@src/brushes/label';
import { LegendModel } from '@t/components/legend';
import { getRGBA } from '@src/helpers/color';
import { Align } from '@t/options';
import { scatterSeries } from '@src/brushes/scatterSeries';
import { ScatterSeriesIconType } from '@t/components/series';
import { LegendIconType } from '@t/store/store';
import { getTitleFontString } from '@src/helpers/style';
import { getTextHeight } from '@src/helpers/calculator';
import { padding } from '@src/store/layout';

interface RenderOptions {
  iconType: LegendIconType;
  showCheckbox: boolean;
  checked: boolean;
  active: boolean;
  color: string;
  align: Align;
  font: string;
  fontColor: string;
}

export const LEGEND_ITEM_MARGIN_X = 40;
export const LEGEND_MARGIN_X = 5;
export const LEGEND_CHECKBOX_SIZE = 12;
export const LEGEND_ICON_SIZE = 12;
const ICON_BORDER_WIDTH = 1.5;

const INACTIVE_OPACITY = 0.3;
const RECT_SIZE = 10;
const LINE_ICON_PADDING = 2;
const CIRCLE_ICON_RADIUS = 6;

export function getLegendItemHeight(fontSize: number) {
  return fontSize + padding.Y;
}

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
  const strokeStyle = active ? color : getRGBA(color, INACTIVE_OPACITY);

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
  const borderColor = active ? '#bbb' : getRGBA('#bbbbbb', INACTIVE_OPACITY);

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
  const iconColor = active ? color : getRGBA(color, INACTIVE_OPACITY);

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

function drawScatterIcon(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  renderOptions: RenderOptions
) {
  const { iconType, active, color, showCheckbox } = renderOptions;
  const iconX = x + (showCheckbox ? LEGEND_CHECKBOX_SIZE + LEGEND_MARGIN_X : 0);
  const iconColor = active ? color : getRGBA(color, INACTIVE_OPACITY);

  scatterSeries(ctx, {
    type: 'scatterSeries',
    iconType: iconType as ScatterSeriesIconType,
    x: iconX + CIRCLE_ICON_RADIUS,
    y: y + CIRCLE_ICON_RADIUS,
    borderColor: iconColor,
    size: CIRCLE_ICON_RADIUS * 2,
    fillColor: 'rgba(255, 255, 255, 0)',
    borderWidth: ICON_BORDER_WIDTH,
  });
}

function drawLabel(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  text: string,
  renderOptions: RenderOptions
) {
  const { active, showCheckbox, font, fontColor } = renderOptions;
  const fillStyle = active ? fontColor : getRGBA(fontColor, INACTIVE_OPACITY);

  label(ctx, {
    type: 'label',
    x:
      x +
      LEGEND_ICON_SIZE +
      LEGEND_MARGIN_X +
      (showCheckbox ? LEGEND_CHECKBOX_SIZE + LEGEND_MARGIN_X : 0),
    y,
    text,
    style: ['default', { font, textBaseline: 'top', fillStyle }],
  });
}

export function legend(ctx: CanvasRenderingContext2D, model: LegendModel) {
  const { data, showCheckbox, align, fontSize, fontFamily, fontWeight } = model;
  const font = getTitleFontString({ fontSize, fontFamily, fontWeight });
  const fontColor = model.color!;

  data.forEach((datum) => {
    const {
      x,
      y,
      checked,
      active,
      color,
      iconType,
      useScatterChartIcon,
      viewLabel: legendLabel,
    } = datum;
    const iconY = y - 1 + (getTextHeight(legendLabel, font) - 11) / 4;
    const renderOptions: RenderOptions = {
      iconType,
      checked,
      active,
      color,
      showCheckbox,
      align,
      font,
      fontColor,
    };

    if (showCheckbox) {
      drawCheckbox(ctx, x, iconY, renderOptions);
    }
    if (useScatterChartIcon && iconType !== 'line') {
      drawScatterIcon(ctx, x, iconY, renderOptions);
    } else {
      drawIcon(ctx, x, iconY, renderOptions);
    }

    drawLabel(ctx, x, y, legendLabel, renderOptions);
  });
}
