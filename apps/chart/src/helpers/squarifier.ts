import { sum } from '@src/helpers/calculator';
import { TreemapSeriesData } from '@t/store/store';
import { Rect, Size } from '@t/options';
import { pluck } from '@src/helpers/arrayUtil';

type IdType = string | number;

export type BoundMap = {
  [key in IdType]: Rect;
};

type WeightRows = {
  weight: number;
  id: string;
}[];

function calculateScale(values: number[], width: number, height: number) {
  return (width * height) / sum(values);
}

function isVerticalStack({ height, width }: Size) {
  return height < width;
}

function selectBaseSize(baseBound: Size) {
  return isVerticalStack(baseBound) ? baseBound.height : baseBound.width;
}

function makeBaseData(seriesItems: TreemapSeriesData[], baseBound: Rect) {
  const { width, height } = baseBound;
  const scale = calculateScale(pluck(seriesItems, 'data'), width, height);

  return seriesItems
    .map((seriesItem) => ({
      id: seriesItem.id,
      weight: seriesItem.data * scale,
    }))
    .sort((a, b) => b.weight - a.weight);
}

/**
 * Calculate worst aspect ratio.
 * Referred function worst() in https://www.win.tue.nl/~vanwijk/stm.pdf
 */
function worst(total: number, min: number, max: number, baseSize: number) {
  const sumSquare = total * total;
  const sizeSquare = baseSize * baseSize;

  return Math.max((sizeSquare * max) / sumSquare, sumSquare / (sizeSquare * min));
}

function changedStackDirection(
  total: number,
  weights: number[],
  baseSize: number,
  newWeight: number
) {
  const minWeight = Math.min(...weights);
  const maxWeight = Math.max(...weights);
  const beforeWorst = worst(total, minWeight, maxWeight, baseSize);
  const newWorst = worst(
    total + newWeight,
    Math.min(minWeight, newWeight),
    Math.max(maxWeight, newWeight),
    baseSize
  );

  return newWorst >= beforeWorst;
}

function calculateFixedSize(baseSize: number, total: number, rows: WeightRows) {
  if (!total) {
    const weights = pluck(rows, 'weight');
    total = sum(weights);
  }

  return total / baseSize;
}

function addBounds(startPosition: number, rows: WeightRows, fixedSize: number, callback: Function) {
  rows.reduce((storedPosition, rowDatum) => {
    const dynamicSize = rowDatum.weight / fixedSize;

    callback(dynamicSize, storedPosition, rowDatum.id);

    return storedPosition + dynamicSize;
  }, startPosition);
}

function addBound(boundMap: BoundMap, id: IdType, rect: Rect) {
  boundMap[id] = rect;
}

function addBoundsForVerticalStack(
  boundMap: BoundMap,
  rows: WeightRows,
  baseBound: Rect,
  baseSize: number,
  total: number
) {
  const fixedWidth = calculateFixedSize(baseSize, total, rows);

  addBounds(baseBound.y, rows, fixedWidth, (dynamicHeight, storedTop, id) => {
    addBound(boundMap, id, {
      x: baseBound.x,
      y: storedTop,
      width: fixedWidth,
      height: dynamicHeight,
    });
  });

  baseBound.x += fixedWidth;
  baseBound.width -= fixedWidth;
}

function addBoundsForHorizontalStack(
  boundMap: BoundMap,
  rows: WeightRows,
  baseBound: Rect,
  baseSize: number,
  total: number
) {
  const fixedHeight = calculateFixedSize(baseSize, total, rows);

  addBounds(baseBound.x, rows, fixedHeight, (dynamicWidth, storedLeft, id) => {
    addBound(boundMap, id, {
      x: storedLeft,
      y: baseBound.y,
      width: dynamicWidth,
      height: fixedHeight,
    });
  });

  baseBound.y += fixedHeight;
  baseBound.height -= fixedHeight;
}

function getAddingBoundsFunction(baseBound: Size) {
  if (isVerticalStack(baseBound)) {
    return addBoundsForVerticalStack;
  }

  return addBoundsForHorizontalStack;
}

export function squarify(layout: Rect, seriesItems: TreemapSeriesData[]) {
  const baseBound = layout;
  const baseData = makeBaseData(seriesItems, baseBound);
  let row: WeightRows = [];
  let baseSize, addBoundsFunc;

  const boundMap = {};

  baseData.forEach((datum) => {
    const weights = pluck(row, 'weight');
    const totalWeight = sum(weights);

    if (row.length && changedStackDirection(totalWeight, weights, baseSize, datum.weight)) {
      addBoundsFunc(boundMap, row, baseBound, baseSize, totalWeight);
      row = [];
    }

    if (!row.length) {
      baseSize = selectBaseSize(baseBound);
      addBoundsFunc = getAddingBoundsFunction(baseBound);
    }

    row.push(datum);
  });

  if (row.length) {
    addBoundsFunc(boundMap, row, baseBound, baseSize);
  }

  return boundMap;
}
