import { BoxPlotModel } from '@t/components/series';
import { line, rect } from './basic';

export function boxPlot(ctx: CanvasRenderingContext2D, model: BoxPlotModel) {
  const { rect: rectModel, whisker, median, minimum, maximum } = model;
  const { color } = rectModel;

  line(ctx, {
    type: 'line',
    lineWidth: 1,
    strokeStyle: color,
    ...whisker,
  });

  line(ctx, {
    type: 'line',
    lineWidth: 1,
    strokeStyle: color,
    ...minimum,
  });

  line(ctx, {
    type: 'line',
    lineWidth: 1,
    strokeStyle: color,
    ...maximum,
  });

  rect(ctx, {
    type: 'rect',
    color,
    ...rectModel,
  });

  line(ctx, {
    type: 'line',
    lineWidth: 1,
    strokeStyle: '#ffffff',
    ...median,
  });
}
