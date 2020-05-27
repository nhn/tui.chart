import { pathRect, label as labelBrush, line } from '@src/brushes/basic';
import { TooltipData, TooltipModel, TooltipModelData } from '@t/components/tooltip';
import { rect } from '@src/brushes/boxSeries';
import { LabelModel, LabelStyle } from '@t/components/axis';
import { Point } from '@t/options';
import { deepMergedCopy } from '@src/helpers/utils';

interface CategorySizeInfo {
  xStartPoint: number;
  x: number;
  text: string;
  labelYStartPoint: number;
  lineYStartPoint: number;
}

type DataItemSizeInfo = {
  xStartPoint: number;
  dataPoint: number;
  x: number;
} & Pick<TooltipData, 'label' | 'value' | 'color'>;

const BG_COLOR = 'rgba(85, 85, 85, 0.95)';
const WIDTH = 150;
const padding = { X: 15, Y: 10, DATA_Y: 4 };
const DATA_TEXT_HEIGHT = 12;
const CATEGORY_TEXT_HEIGHT = 13;

function hasNoCategory(data: TooltipModelData): data is TooltipData[] {
  return Array.isArray(data);
}

function getTotalDataSize(data: TooltipModelData, categories: string[]) {
  let dataSize = 0;

  if (hasNoCategory(data)) {
    dataSize += data.length;
  } else {
    categories.forEach(category => {
      dataSize += data[category].length;
    });
  }

  return dataSize;
}

function renderCategoryArea(ctx: CanvasRenderingContext2D, sizeInfo: CategorySizeInfo) {
  const { xStartPoint, text, x, labelYStartPoint, lineYStartPoint } = sizeInfo;

  labelBrush(ctx, {
    type: 'label',
    x: xStartPoint,
    y: labelYStartPoint,
    text,
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
    y: lineYStartPoint,
    x2: x + WIDTH,
    y2: lineYStartPoint,
    strokeStyle: 'rgba(0, 0, 0, 0.1)'
  });
}

function renderDataItem(ctx: CanvasRenderingContext2D, sizeInfo: DataItemSizeInfo) {
  const { xStartPoint, dataPoint, x, label, color, value } = sizeInfo;

  rect(ctx, {
    type: 'rect',
    x: xStartPoint,
    y: dataPoint,
    width: DATA_TEXT_HEIGHT,
    height: DATA_TEXT_HEIGHT,
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
    labelModel(String(value), { x: x + WIDTH - padding.X, y: dataPoint }, { textAlign: 'right' })
  );
}

export function tooltip(ctx: CanvasRenderingContext2D, tooltipModel: TooltipModel) {
  const { x, y, data } = tooltipModel;

  const xStartPoint = x + padding.X;
  const yStartPoint = y;
  const noCategory = hasNoCategory(data);

  const categories = noCategory ? [] : Object.keys(data);

  const totalDataSize = getTotalDataSize(data, categories);
  const categorySize = categories.length;

  const categoryHeight = CATEGORY_TEXT_HEIGHT + padding.Y * 2;
  const dataAreaHeight = padding.Y * 2 * categorySize + (DATA_TEXT_HEIGHT + 2) * totalDataSize;
  const defaultPadding = noCategory ? 10 * 2 : 0;

  const height =
    defaultPadding +
    categoryHeight * categorySize +
    dataAreaHeight -
    (categorySize > 1 ? padding.Y : 0);

  pathRect(ctx, {
    type: 'pathRect',
    x,
    y,
    width: WIDTH,
    height,
    radius: 5,
    fill: BG_COLOR,
    stroke: BG_COLOR
  });

  if (hasNoCategory(data)) {
    data.forEach(({ label, color, value }, modelIdx) => {
      const dataPoint = yStartPoint + padding.Y + (DATA_TEXT_HEIGHT + padding.DATA_Y) * modelIdx;

      renderDataItem(ctx, { xStartPoint, dataPoint, label, color, value, x });
    });
  } else {
    let totalItemIdx = 0;

    categories.forEach((category, dataIdx) => {
      const models = data[category];

      const labelYStartPoint =
        yStartPoint +
        padding.Y * (dataIdx + 1) +
        (DATA_TEXT_HEIGHT + 2) * totalItemIdx +
        categoryHeight * dataIdx;

      const lineYStartPoint = labelYStartPoint + CATEGORY_TEXT_HEIGHT + padding.Y;

      renderCategoryArea(ctx, {
        xStartPoint,
        x,
        labelYStartPoint,
        lineYStartPoint,
        text: category
      });

      models.forEach(({ label, color, value }, modelIdx) => {
        const dataPoint =
          lineYStartPoint + padding.Y + (DATA_TEXT_HEIGHT + padding.DATA_Y) * modelIdx;
        totalItemIdx += 1;

        renderDataItem(ctx, { xStartPoint, dataPoint, label, color, value, x });
      });
    });
  }
}
