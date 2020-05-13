import { pathRect, label as labelBrush, line } from '@src/brushes/basic';
import { TooltipModel } from '@t/components/tooltip';
import { rect } from '@src/brushes/boxSeries';
import { LabelModel, LabelStyle } from '@t/components/axis';
import { Point } from '@t/options';
import { deepMergedCopy } from '@src/helpers/utils';

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
    labelBrush(ctx, {
      type: 'label',
      x: xStartPoint,
      y: yStartPoint,
      text: category,
      style: [
        'default',
        {
          textBaseline: 'top',
          fillStyle: '#fff',
          font: 'bold 13px Arial',
          textAlign: 'left'
        }
      ]
    });

    line(ctx, {
      type: 'line',
      x,
      y: y + categoryHeight,
      x2: x + width,
      y2: y + categoryHeight,
      strokeStyle: 'rgba(0, 0, 0, 0.1)'
    });
  }

  data.forEach(({ label, color, value }, index) => {
    const cy = yStartPoint + categoryHeight + 15 * index;

    rect(ctx, { type: 'rect', x: xStartPoint, y: cy, width: 13, height: dataHeight, color });

    const labelStyle = {
      textBaseline: 'top',
      fillStyle: '#fff',
      font: 'normal 12px Arial',
      textAlign: 'left'
    } as LabelStyle;

    const labelModel = (text: string, point: Point, styleObj?: LabelStyle) =>
      ({
        ...point,
        type: 'label',
        text,
        style: ['default', styleObj ? deepMergedCopy(labelStyle, styleObj) : labelStyle]
      } as LabelModel);

    labelBrush(ctx, labelModel(label, { x: xStartPoint + 20, y: cy }));
    labelBrush(
      ctx,
      labelModel(String(value), { x: x + width - xPadding, y: cy }, { textAlign: 'right' })
    );
  });
}
