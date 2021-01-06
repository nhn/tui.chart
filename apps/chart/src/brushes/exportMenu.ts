import { line, rect, pathRect } from '@src/brushes/basic';
import { Point } from '@t/options';
import { ExportMenuButtonModel } from '@t/components/exportMenu';
import { BUTTON_RECT_SIZE } from '@src/component/exportMenu';
import { ExportMenuButtonTheme, DotIconTheme, XIconTheme } from '@t/theme';

interface XIconModel extends Point {
  theme: Required<XIconTheme>;
}

interface DotIconModel extends Point {
  theme: Required<DotIconTheme>;
}

function drawXIcon(ctx: CanvasRenderingContext2D, icon: XIconModel, rectSize: number) {
  const {
    x: startX,
    y: startY,
    theme: { color: strokeStyle, lineWidth },
  } = icon;
  const offset = rectSize / 3;

  const x = startX + offset;
  const y = startY + offset;
  const x2 = startX + offset * 2;
  const y2 = startY + offset * 2;

  const points = [
    { x, y, x2, y2 },
    { x, y: y2, x2, y2: y },
  ];

  points.forEach((p) => {
    line(ctx, { type: 'line', ...p, strokeStyle, lineWidth });
  });
}

function drawMoreIcon(ctx: CanvasRenderingContext2D, icon: DotIconModel, rectSize: number) {
  const {
    x,
    y,
    theme: { color, width, height, gap },
  } = icon;
  const paddingX = (rectSize - width) / 2;
  const paddingY = (rectSize - (height * 3 + gap * 2)) / 2;
  const centerX = x + paddingX;

  const points = [
    { x: centerX, y: y + paddingY },
    { x: centerX, y: y + paddingY + height + gap },
    { x: centerX, y: y + paddingY + (height + gap) * 2 },
  ];

  points.forEach((p) => {
    rect(ctx, {
      type: 'rect',
      ...p,
      color,
      width: width,
      height: height,
    });
  });
}

export function exportMenuButton(
  ctx: CanvasRenderingContext2D,
  exportMenuButtonModel: ExportMenuButtonModel
) {
  const { opened, x: xPos, y: yPos, theme } = exportMenuButtonModel;
  const {
    borderColor,
    backgroundColor,
    borderWidth,
    borderRadius,
    xIcon,
    dotIcon,
  } = theme as Required<ExportMenuButtonTheme>;
  const x = xPos + borderWidth;
  const y = yPos + borderWidth;
  const rectSize = BUTTON_RECT_SIZE - 2 * borderWidth;

  pathRect(ctx, {
    type: 'pathRect',
    x,
    y,
    fill: backgroundColor,
    stroke: borderColor,
    width: rectSize,
    height: rectSize,
    radius: borderRadius,
    lineWidth: borderWidth,
  });

  if (opened) {
    drawXIcon(ctx, { x, y, theme: xIcon as Required<XIconTheme> }, rectSize);
  } else {
    drawMoreIcon(ctx, { x, y, theme: dotIcon as Required<DotIconTheme> }, rectSize);
  }
}
