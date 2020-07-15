import { rect } from '@src/brushes/boxSeries';
import { Point } from '@t/options';
import { BUTTON_RECT_SIZE } from '@src/component/exportMenu';
import { ResetButtonModel } from '@t/components/resetButton';
import { circle } from '@src/brushes/basic';
import { areaPoints } from '@src/brushes/lineSeries';

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

  const points = [
    { x: centerX + tickSize, y: centerY },
    { x: centerX + tickSize * 3, y: centerY },
    { x: centerX + tickSize * 2, y: centerY + tickSize },
  ];

  areaPoints(ctx, {
    type: 'areaPoints',
    points,
    lineWidth: 1,
    color,
    fillColor: color,
  });
}

export function resetButton(ctx: CanvasRenderingContext2D, resetButtonModel: ResetButtonModel) {
  const { x, y } = resetButtonModel;

  rect(ctx, {
    type: 'rect',
    x,
    y,
    color: '#f4f4f4',
    width: BUTTON_RECT_SIZE,
    height: BUTTON_RECT_SIZE,
  });

  drawResetIcon(ctx, { x, y });
}
