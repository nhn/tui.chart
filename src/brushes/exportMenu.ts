import { label, line } from '@src/brushes/basic';
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

export function exportMenu(ctx: CanvasRenderingContext2D, exportMenuModel: Point) {
  const height = 110;
  const width = 140;
  const titleHeight = 34;
  const buttonHeight = 38;
  const buttonWidth = 69;
  const marginY = 12;

  const startX = exportMenuModel.x - (width - EXPORT_BUTTON_RECT_SIZE);
  const startY = exportMenuModel.y + EXPORT_BUTTON_RECT_SIZE + 4;

  const wordWidth = { xls: 13.5, png: 18, csv: 16.5, jpeg: 21 };
  const wordModel = {
    xls: {
      width: wordWidth.xls,
      x: startX + (buttonWidth - wordWidth.xls) / 2,
      y: startY + titleHeight + marginY,
    },
    png: {
      width: wordWidth.png,
      x: startX + (buttonWidth - wordWidth.png) / 2,
      y: startY + titleHeight + buttonHeight + marginY,
    },
    csv: {
      width: wordWidth.csv,
      x: startX + (buttonWidth - wordWidth.csv) / 2 + buttonWidth,
      y: startY + titleHeight + marginY,
    },
    jpeg: {
      width: wordWidth.jpeg,
      x: startX + (buttonWidth - wordWidth.jpeg) / 2 + buttonWidth,
      y: startY + titleHeight + buttonHeight + marginY,
    },
  };

  rect(ctx, {
    type: 'rect',
    x: startX,
    y: startY,
    width,
    height,
    borderColor: '#bbbbbb',
    color: '#ffffff',
    thickness: 1,
  });

  rect(ctx, {
    type: 'rect',
    x: startX,
    y: startY,
    width,
    height: titleHeight,
    color: '#f4f4f4',
  });

  label(ctx, {
    type: 'label',
    x: startX + 10,
    y: startY + 10,
    text: 'Export to',
    style: ['default'],
  });

  Object.keys(wordModel).forEach((word) => {
    const { x, y } = wordModel[word];

    label(ctx, { type: 'label', x, y, text: word, style: ['default'] });
  });
}
