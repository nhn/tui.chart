import {
  CircleModel,
  CircleResponderModel,
  RectResponderModel,
  TreemapRectResponderModel,
} from '@t/components/series';
import { Point, Rect } from '@t/options';
import { getDistance } from '@src/helpers/calculator';
import { AxisData, TreemapSeriesData } from '@t/store/store';
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

export function makeRectResponderModel(rect: Rect, xAxis: AxisData): RectResponderModel[] {
  const { pointOnColumn, tickCount, tickDistance } = xAxis;
  const { height } = rect;

  const halfDetectAreaIndex = pointOnColumn ? [] : [0, tickCount - 1];
  const halfWidth = tickDistance / 2;

  return range(0, tickCount).map((index) => {
    const half = halfDetectAreaIndex.includes(index);
    const width = half ? halfWidth : tickDistance;
    let startX = 0;

    if (index !== 0) {
      startX += pointOnColumn ? tickDistance * index : halfWidth + tickDistance * (index - 1);
    }

    return { type: 'rect', y: 0, height, x: startX, width, index };
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

export function getDeepestNode(responders: TreemapRectResponderModel[]) {
  return responders.reduce<TreemapRectResponderModel[]>((acc, responder) => {
    if (!acc.length) {
      return [responder];
    }

    if (responder.depth > acc[0].depth) {
      return [responder];
    }

    return acc;
  }, []);
}
