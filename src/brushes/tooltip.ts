import { pathRect } from '@src/brushes/basic';
import { TooltipModel } from '@t/components/tooltip';

export function tooltip(ctx: CanvasRenderingContext2D, tooltipModel: TooltipModel) {
  const { x, y, data, category } = tooltipModel;
  const xPadding = 15;
  const yPadding = 11;
  const xStartPoint = x + xPadding;
  const yStartPoint = y + yPadding;

  const bgColor = 'rgba(85, 85, 85, 0.95)';
  const categoryHeight = category ? 30 : 0;

  const dataHeight = 13;
  const width = 156;
  const height = yPadding * 2 + categoryHeight + dataHeight * data.length;

  pathRect(ctx, {
    type: 'pathRect',
    x,
    y,
    width,
    height,
    radius: 5,
    fill: bgColor,
    stroke: bgColor
  });

  if (category) {
    ctx.textBaseline = 'top';
    ctx.fillStyle = 'white';
    ctx.font = 'bold 13px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(category, xStartPoint, yStartPoint);

    ctx.beginPath();
    ctx.moveTo(x, y + categoryHeight);
    ctx.lineTo(x + width, y + categoryHeight);
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';

    ctx.stroke();
    ctx.closePath();
  }

  data.forEach(({ label, color, value }, index) => {
    const cy = yStartPoint + categoryHeight + 15 * index;

    ctx.fillStyle = color;
    ctx.fillRect(xStartPoint, cy, 13, dataHeight);

    ctx.textBaseline = 'top';
    ctx.fillStyle = 'white';
    ctx.font = 'normal 12px Arial';

    ctx.textAlign = 'left';
    ctx.fillText(label, xStartPoint + 20, cy);

    ctx.textAlign = 'right';
    ctx.fillText(String(value), x + width - xPadding, cy);
  });
}
