import { BoxPlotModel } from '@t/components/series';
import { line, rect } from './basic';

export function boxPlot(ctx: CanvasRenderingContext2D, model: BoxPlotModel) {
  const { rect: rectModel, upperWhisker, lowerWhisker, median, minimum, maximum } = model;

  if (minimum) {
    line(ctx, { type: 'line', ...minimum });
  }

  if (lowerWhisker) {
    line(ctx, { type: 'line', ...lowerWhisker });
  }

  if (rectModel) {
    rect(ctx, { type: 'rect', ...rectModel });
  }

  if (upperWhisker) {
    line(ctx, { type: 'line', ...upperWhisker });
  }

  if (maximum) {
    line(ctx, { type: 'line', ...maximum });
  }

  if (median) {
    line(ctx, { type: 'line', ...median });
  }
}
