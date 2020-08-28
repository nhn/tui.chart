import { BubblePoint, ObjectTypeDatetimePoint, Point } from '@t/options';
import { TooltipDataValue } from '@t/components/tooltip';
import { isObject } from '@src/helpers/utils';
import { isRangeValue } from './range';

function isBubblePointType(value: ObjectTypeDatetimePoint | Point): value is BubblePoint {
  return value.hasOwnProperty('r');
}

export function getValueString(value: TooltipDataValue) {
  let result = '';

  if (isRangeValue(value)) {
    result = `${value[0]} ~ ${value[1]}`;
  } else if (isObject(value) && !Array.isArray(value)) {
    result = `(${value.x}, ${value.y})` + (isBubblePointType(value) ? `, r: ${value.r}` : '');
  } else {
    result = String(value);
  }

  return result;
}

export function getSeriesNameTpl(label: string, color: string) {
  return `<span class="series-name">
    <i class="icon" style="background: ${color}"></i>
    <span class="name">${label}</span>
  </span>`;
}

export function getTitleValueTpl(title: string, value: string) {
  return `<div class="tooltip-series">
    <span class="series-name">${title}</span>
    <span class="series-value">${value}</span>
  </div>`;
}
