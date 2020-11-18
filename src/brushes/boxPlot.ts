import { BoxPlotModel } from '@t/components/series';
import { line, rect } from './basic';

export function boxPlot(ctx: CanvasRenderingContext2D, model: BoxPlotModel) {
  const { rect: rectModel, upperWhisker, lowerWhisker, median, minimum, maximum } = model;

  line(ctx, { type: 'line', ...minimum });

  line(ctx, { type: 'line', ...lowerWhisker });

  rect(ctx, { type: 'rect', ...rectModel });

  line(ctx, { type: 'line', ...upperWhisker });

  line(ctx, { type: 'line', ...maximum });

  line(ctx, { type: 'line', ...median });
}
