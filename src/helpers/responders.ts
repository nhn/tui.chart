import { CircleModel, CircleResponderModel, RectResponderModel } from '@t/components/series';
import { Point, Rect } from '@t/options';
import { getDistance } from '@src/helpers/calculator';
import { AxisData } from '@t/store/store';
import { range } from '@src/helpers/utils';
import { TooltipData } from '@t/components/tooltip';

export function getNearestResponder(
  responders: CircleResponderModel[],
  mousePosition: Point,
  rect: Rect
) {
  let minDistance = Infinity;
  let result: CircleResponderModel[] = [];
  responders.forEach((responder) => {
    const { x, y } = responder;
    const responderPoint = { x: x + rect.x, y: y + rect.y };
    const distance = getDistance(responderPoint, mousePosition);

    if (minDistance > distance) {
      minDistance = distance;
      result = [responder];
    } else if (minDistance === distance) {
      if (result.length && result[0].radius > responder.radius) {
        result = [responder];
      } else {
        result.push(responder);
      }
    }
  });

  return result;
}

export function makeRectResponderModel(
  rect: Rect,
  axis: AxisData,
  vertical = true
): RectResponderModel[] {
  const { pointOnColumn, tickCount, tickDistance } = axis;
  const { width, height } = rect;
  const halfDetectAreaIndex = pointOnColumn ? [] : [0, tickCount - 1];
  const halfSize = tickDistance / 2;

  return range(0, tickCount).map((index) => {
    const half = halfDetectAreaIndex.includes(index);
    const size = half ? halfSize : tickDistance;
    let startPos = 0;

    if (index !== 0) {
      startPos += pointOnColumn ? tickDistance * index : halfSize + tickDistance * (index - 1);
    }

    return {
      type: 'rect',
      y: vertical ? 0 : startPos,
      height: vertical ? height : size,
      x: vertical ? startPos : 0,
      width: vertical ? size : width,
      index,
    };
  });
}

export function makeTooltipCircleMap(
  seriesCircleModel: CircleModel[],
  tooltipDataArr: TooltipData[]
) {
  return seriesCircleModel.reduce<Record<string, CircleResponderModel[]>>((acc, cur, dataIndex) => {
    const index = cur.index!;
    const tooltipModel = { ...cur, data: tooltipDataArr[dataIndex % tooltipDataArr.length] };
    if (!acc[index]) {
      acc[index] = [];
    }
    acc[index].push(tooltipModel);

    return acc;
  }, {});
}
