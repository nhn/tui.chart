import { BubblePoint, ObjectTypeDatetimePoint, Point, Rect } from '@t/options';
import { TooltipDataValue } from '@t/components/tooltip';
import { isObject } from '@src/helpers/utils';
import { CircleResponderModel } from '@t/components/series';
import { getDistance } from '@src/helpers/calculator';

function isBubblePointType(value: ObjectTypeDatetimePoint | Point): value is BubblePoint {
  return value.hasOwnProperty('r');
}

export function getValueString(value: TooltipDataValue) {
  if (isObject(value) && !Array.isArray(value)) {
    return `(${value.x}, ${value.y})` + (isBubblePointType(value) ? `, r: ${value.r}` : '');
  }

  return String(value);
}

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
    } else if (minDistance === distance && result.length && result[0].radius > responder.radius) {
      result = [responder];
    }
  });

  return result;
}
