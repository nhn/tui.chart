import { line, rect } from '@src/brushes/basic';
import { Point } from '@t/options';
import { ExportMenuButtonModel } from '@t/components/exportMenu';
import { BUTTON_RECT_SIZE } from '@src/component/exportMenu';

function drawXIcon(ctx: CanvasRenderingContext2D, point: Point) {
  const { x: startX, y: startY } = point;
  const offset = BUTTON_RECT_SIZE / 3;
  const strokeStyle = '#555555';

  const x = startX + offset;
  const y = startY + offset;
  const x2 = startX + offset * 2;
  const y2 = startY + offset * 2;

  const points = [
    { x, y, x2, y2 },
    { x, y: y2, x2, y2: y },
  ];

  points.forEach((p) => {
    line(ctx, { type: 'line', ...p, strokeStyle, lineWidth: 2 });
  });
}

function drawMoreIcon(ctx: CanvasRenderingContext2D, point: Point) {
  const { x, y } = point;
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
      color: '#555555',
      width: 2,
      height: 2,
    });
  });
}

export function exportMenuButton(
  ctx: CanvasRenderingContext2D,
  exportMenuButtonModel: ExportMenuButtonModel
) {
  const { opened, x, y } = exportMenuButtonModel;

  rect(ctx, {
    type: 'rect',
    x,
    y,
    color: '#f4f4f4',
    width: BUTTON_RECT_SIZE,
    height: BUTTON_RECT_SIZE,
  });

  if (opened) {
    drawXIcon(ctx, { x, y });
  } else {
    drawMoreIcon(ctx, { x, y });
  }
}
