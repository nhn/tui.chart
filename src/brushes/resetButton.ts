import { Point } from '@t/options';
import { BUTTON_RECT_SIZE } from '@src/component/exportMenu';
import { BackButtonModel, ResetButtonModel } from '@t/components/resetButton';
import { circle, line, pathRect } from '@src/brushes/basic';
import { areaPoints } from '@src/brushes/lineSeries';

const ARROW_HEIGHT = 3;
const ARROW_WIDTH = 6;

function drawResetIcon(ctx: CanvasRenderingContext2D, point: Point) {
  const { x, y } = point;
  const centerX = x + BUTTON_RECT_SIZE / 2;
  const centerY = y + BUTTON_RECT_SIZE / 2;
  const tickSize = BUTTON_RECT_SIZE / 10;
  const color = '#545454';

  circle(ctx, {
    type: 'circle',
    x: centerX,
    y: centerY,
    radius: tickSize * 2,
    angle: { start: 0, end: Math.PI / 2 },
    color: 'transparent',
    style: [{ lineWidth: 2, strokeStyle: color }],
  });
  const pointStartX = centerX + tickSize * 2;
  const pointStartY = centerY;

  const points = [
    { x: pointStartX - ARROW_WIDTH / 2, y: pointStartY },
    { x: pointStartX + ARROW_WIDTH / 2, y: pointStartY },
    { x: pointStartX, y: pointStartY + ARROW_HEIGHT },
  ];

  areaPoints(ctx, {
    type: 'areaPoints',
    points,
    lineWidth: 1,
    color,
    fillColor: color,
  });
}

function drawBackIcon(ctx: CanvasRenderingContext2D, point: Point) {
  const tickSize = BUTTON_RECT_SIZE / 12;
  const { x, y } = point;
  const centerX = x + BUTTON_RECT_SIZE / 2;
  const centerY = y + BUTTON_RECT_SIZE / 2;
  const color = '#545454';

  circle(ctx, {
    type: 'circle',
    x: centerX,
    y: centerY,
    radius: tickSize * 2,
    angle: { start: Math.PI / 2, end: (Math.PI * 3) / 2 },
    color: 'transparent',
    style: [{ lineWidth: 2, strokeStyle: color }],
  });

  line(ctx, {
    type: 'line',
    lineWidth: 2,
    x: centerX - tickSize,
    y: centerY + tickSize * 2,
    x2: centerX,
    y2: centerY + tickSize * 2,
    strokeStyle: color,
  });

  line(ctx, {
    type: 'line',
    lineWidth: 2,
    x: centerX - tickSize,
    y: centerY - tickSize * 2,
    x2: centerX,
    y2: centerY - tickSize * 2,
    strokeStyle: color,
  });

  const pointStartX = centerX - tickSize;
  const pointStartY = centerY - tickSize * 2;
  const points = [
    { x: pointStartX - ARROW_HEIGHT, y: pointStartY },
    { x: pointStartX, y: pointStartY - ARROW_WIDTH / 2 },
    { x: pointStartX, y: pointStartY + ARROW_WIDTH / 2 },
  ];

  areaPoints(ctx, {
    type: 'areaPoints',
    points,
    lineWidth: 1,
    color,
    fillColor: color,
  });
}

export function backButton(ctx: CanvasRenderingContext2D, backButtonModel: BackButtonModel) {
  const { x, y } = backButtonModel;

  pathRect(ctx, {
    type: 'pathRect',
    x,
    y,
    fill: '#f4f4f4',
    stroke: '#f4f4f4',
    width: BUTTON_RECT_SIZE,
    height: BUTTON_RECT_SIZE,
    radius: 5,
  });

  drawBackIcon(ctx, { x, y });
}

export function resetButton(ctx: CanvasRenderingContext2D, resetButtonModel: ResetButtonModel) {
  const { x, y } = resetButtonModel;

  pathRect(ctx, {
    type: 'pathRect',
    x,
    y,
    fill: '#f4f4f4',
    stroke: '#f4f4f4',
    width: BUTTON_RECT_SIZE,
    height: BUTTON_RECT_SIZE,
    radius: 5,
  });

  drawResetIcon(ctx, { x, y });
}
