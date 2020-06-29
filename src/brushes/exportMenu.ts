import { line } from '@src/brushes/basic';
import { rect } from '@src/brushes/boxSeries';
import { Point } from '@t/options';
import { ExportMenuButtonModel } from '@t/components/exportMenu';
import { EXPORT_BUTTON_RECT_SIZE } from '@src/component/exportMenu';

function renderXIcon(ctx: CanvasRenderingContext2D, point: Point) {
  const { x, y } = point;
  const offset = EXPORT_BUTTON_RECT_SIZE / 3;
  const strokeStyle = '#555555';
  const points = [
    { x: x + offset, y: y + offset, x2: x + offset * 2, y2: y + offset * 2 },
    { x: x + offset, y: y + offset * 2, x2: x + offset * 2, y2: y + offset },
  ];

  points.forEach((p) => {
    line(ctx, { type: 'line', ...p, strokeStyle, lineWidth: 2 });
  });
}

function renderMoreIcon(ctx: CanvasRenderingContext2D, point: Point) {
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
    width: EXPORT_BUTTON_RECT_SIZE,
    height: EXPORT_BUTTON_RECT_SIZE,
  });

  if (opened) {
    renderXIcon(ctx, { x, y });
  } else {
    renderMoreIcon(ctx, { x, y });
  }
}
