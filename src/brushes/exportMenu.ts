import { line, rect, pathRect } from '@src/brushes/basic';
import { Point } from '@t/options';
import { ExportMenuButtonModel } from '@t/components/exportMenu';
import { BUTTON_RECT_SIZE } from '@src/component/exportMenu';
import { ExportMenuButtonTheme } from '@t/theme';

type IconModel = {
  color: string;
  xIconLineWidth?: number;
} & Point;

function drawXIcon(ctx: CanvasRenderingContext2D, icon: IconModel) {
  const { x: startX, y: startY, color, xIconLineWidth } = icon;
  const offset = BUTTON_RECT_SIZE / 3;
  const strokeStyle = color;

  const x = startX + offset;
  const y = startY + offset;
  const x2 = startX + offset * 2;
  const y2 = startY + offset * 2;

  const points = [
    { x, y, x2, y2 },
    { x, y: y2, x2, y2: y },
  ];

  points.forEach((p) => {
    line(ctx, { type: 'line', ...p, strokeStyle, lineWidth: xIconLineWidth });
  });
}

function drawMoreIcon(ctx: CanvasRenderingContext2D, icon: IconModel) {
  const { x, y, color } = icon;
  const centerX = x + 11;
  const points = [
    { x: centerX, y: y + 7 },
    { x: centerX, y: y + 11 },
    { x: centerX, y: y + 15 },
  ];

  points.forEach((p) => {
    rect(ctx, {
      type: 'rect',
      ...p,
      color: color,
      width: 2,
      height: 2,
    });
  });
}

export function exportMenuButton(
  ctx: CanvasRenderingContext2D,
  exportMenuButtonModel: ExportMenuButtonModel
) {
  const { opened, x, y, theme } = exportMenuButtonModel;
  const {
    borderColor,
    backgroundColor,
    borderWidth,
    borderRadius,
    color,
    xIconLineWidth,
  } = theme as Required<ExportMenuButtonTheme>;
  pathRect(ctx, {
    type: 'pathRect',
    x,
    y,
    fill: borderColor,
    stroke: backgroundColor,
    width: BUTTON_RECT_SIZE,
    height: BUTTON_RECT_SIZE,
    radius: borderRadius,
    lineWidth: borderWidth,
  });

  if (opened) {
    drawXIcon(ctx, { x, y, color, xIconLineWidth });
  } else {
    drawMoreIcon(ctx, { x, y, color });
  }
}
