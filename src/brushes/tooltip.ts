import { pathRect, label as labelBrush, line } from '@src/brushes/basic';
import { TooltipModel } from '@t/components/tooltip';
import { rect } from '@src/brushes/boxSeries';
import { LabelModel, LabelStyle } from '@t/components/axis';
import { Point } from '@t/options';
import { deepMergedCopy } from '@src/helpers/utils';

export function tooltip(ctx: CanvasRenderingContext2D, tooltipModel: TooltipModel) {
  const { x, y, data } = tooltipModel;
  const xPadding = 15;
  const xStartPoint = x + xPadding;
  const yStartPoint = y;
  const bgColor = 'rgba(85, 85, 85, 0.95)';
  const categories = Object.keys(data);

  const dataHeight = 13;
  const width = 156;

  let dataSize = 0;

  categories.forEach(category => {
    dataSize += data[category].length;
  });

  const categorySize = categories.length;
  const padding = 10;
  const dataPadding = 4;
  const fontSize = 13;
  const categoryHeight = fontSize + padding * 2;
  const dataAreaHeight = padding * 2 * categorySize + (dataHeight + 2) * dataSize;

  const height = categoryHeight * categorySize + dataAreaHeight - (categorySize > 1 ? padding : 0);

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

  let totalIdx = 0;

  categories.forEach((category, dataIdx) => {
    const models = data[category];

    // render category
    const labelYStartPoint =
      yStartPoint +
      padding * (dataIdx + 1) +
      (dataHeight + 2) * totalIdx +
      categoryHeight * dataIdx;

    labelBrush(ctx, {
      type: 'label',
      x: xStartPoint,
      y: labelYStartPoint,
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

    const lineYStartPoint = labelYStartPoint + fontSize + padding;

    line(ctx, {
      type: 'line',
      x,
      y: lineYStartPoint,
      x2: x + width,
      y2: lineYStartPoint,
      strokeStyle: 'rgba(0, 0, 0, 0.1)'
    });

    models.forEach(({ label, color, value }, modelIdx) => {
      const dataPoint = lineYStartPoint + padding + (dataHeight + dataPadding) * modelIdx;
      totalIdx += 1;

      rect(ctx, {
        type: 'rect',
        x: xStartPoint,
        y: dataPoint,
        width: dataHeight,
        height: dataHeight,
        color
      });

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

      labelBrush(ctx, labelModel(label, { x: xStartPoint + 20, y: dataPoint }));
      labelBrush(
        ctx,
        labelModel(String(value), { x: x + width - xPadding, y: dataPoint }, { textAlign: 'right' })
      );
    });
  });
}

function renderCategoryArea(ctx: CanvasRenderingContext2D) {}

function renderDataArea(ctx: CanvasRenderingContext2D) {}
