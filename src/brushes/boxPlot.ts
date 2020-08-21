import { BoxPlotModel } from '@t/components/series';
import { line, rect } from './basic';

export function boxPlot(ctx: CanvasRenderingContext2D, model: BoxPlotModel) {
  const {
    x,
    y,
    width,
    height,
    thickness = 0,
    style,
    color,
    whisker,
    median,
    minimum,
    maximum,
  } = model;

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
    x,
    y,
    width,
    height,
    thickness,
    style,
  });

  line(ctx, {
    type: 'line',
    lineWidth: 1,
    strokeStyle: '#ffffff',
    ...median,
  });
}
