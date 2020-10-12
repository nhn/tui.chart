import { getPercentageValue, isString, includes } from './utils';
import { Rect, PieSeriesType } from '@t/options';
import { TooltipData } from '@t/components/tooltip';

const DEFAULT_RADIUS_RATIO = 0.9;
const semiCircleCenterYRatio = {
  COUNTER_CLOCKWISE: 0.1,
  CLOCKWISE: 1,
};

export function hasClockwiseSemiCircle(clockwise: boolean, startAngle: number, endAngle: number) {
  return (
    clockwise && ((startAngle >= -90 && endAngle <= 90) || (startAngle >= 90 && endAngle <= 180))
  );
}

export function hasCounterClockwiseSemiCircle(
  clockwise: boolean,
  startAngle: number,
  endAngle: number
) {
  return (
    !clockwise && ((startAngle >= -180 && endAngle <= 90) || (startAngle <= 90 && endAngle >= -90))
  );
}

export function getRadius(defaultRadius: number, radius: string | number): number {
  return isString(radius)
    ? Number(((defaultRadius * getPercentageValue(radius)) / 100).toFixed(2))
    : radius;
}

export function getTotalAngle(clockwise: boolean, startAngle: number, endAngle: number) {
  const totalAngle = Math.abs(endAngle - startAngle);

  return totalAngle !== 360 && !clockwise ? 360 - totalAngle : totalAngle;
}

export function isSemiCircle(clockwise: boolean, startAngle: number, endAngle: number) {
  return (
    getTotalAngle(clockwise, startAngle, endAngle) <= 180 &&
    (hasClockwiseSemiCircle(clockwise, startAngle, endAngle) ||
      hasCounterClockwiseSemiCircle(clockwise, startAngle, endAngle))
  );
}

function getSemiCircleRadius(size: number) {
  return size * DEFAULT_RADIUS_RATIO;
}

export function getDefaultRadius(rect: Rect, isSemiCircular = false) {
  const { width, height } = rect;

  return (
    (isSemiCircular ? getSemiCircleRadius(height) : Math.min(width, height) / 2) *
    DEFAULT_RADIUS_RATIO
  );
}

export function getSemiCircleCenterY(rectHeight: number, clockwise: boolean) {
  return clockwise
    ? rectHeight * semiCircleCenterYRatio.CLOCKWISE
    : rectHeight * semiCircleCenterYRatio.COUNTER_CLOCKWISE;
}

export function makePieTooltipData(seriesRawData: PieSeriesType[], category = ''): TooltipData[] {
  return seriesRawData.map(({ data, name, color, rootParentName }) => ({
    label: name,
    color: color!,
    value: data,
    category,
    rootParentName,
  }));
}

export function isPieTypeSeries(seriesName: string) {
  return seriesName === 'pie';
}
