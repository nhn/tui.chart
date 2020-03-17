import { pathRect } from '@src/brushes/basic';
import { TooltipModel } from '../../types/components/tooltip';

export function tooltip(ctx: CanvasRenderingContext2D, tooltipModel: TooltipModel) {
  const { x, y, width, height, data } = tooltipModel;
  const xPadding = 15;
  const yPadding = 18;

  pathRect(ctx, {
    type: 'pathRect',
    x,
    y,
    width,
    height,
    radius: 5,
    fill: 'black',
    stroke: 'black'
  });

  data.forEach(({ label, color, value }, index) => {
    const cy = y + yPadding + 15 * index;

    ctx.fillStyle = color;
    ctx.fillRect(x + xPadding, cy, 13, 13);

    ctx.textBaseline = 'top';
    ctx.fillStyle = 'white';
    ctx.font = '13px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(label, x + xPadding + 20, cy);
    ctx.textAlign = 'right';
    ctx.fillText(String(value), x + width - xPadding, cy);
  });
}
