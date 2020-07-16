import { TickModel, LineModel } from '@t/components/axis';
import { line } from '@src/brushes/basic';

export function tick(ctx: CanvasRenderingContext2D, tickModel: TickModel) {
  const { x, y, isYAxis, tickSize = 5 } = tickModel;
  const lineModel: LineModel = { type: 'line', x, y, x2: x, y2: y };

  if (isYAxis) {
    lineModel.x2 += tickSize;
  } else {
    lineModel.y2 += tickSize;
  }

  line(ctx, lineModel);
}
