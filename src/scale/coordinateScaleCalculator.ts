import { ValueEdge, ScaleData } from '@t/store/store';

const SNAP_VALUES = [1, 2, 5, 10];

const DEFAULT_PIXELS_PER_STEP = 88;

interface Overflowed {
  min: boolean;
  max: boolean;
}

type stackScaleType =
  | 'percentStack'
  | 'minusPercentStack'
  | 'dualPercentStack'
  | 'divergingPercentStack';

function adjustLimitForOverflow(limit: ValueEdge, step: number, overflowed: Overflowed) {
  const { min, max } = limit;

  return {
    min: overflowed.min ? min - step : min,
    max: overflowed.max ? max + step : max
  };
}

function isSeriesOverflowed(scaleData: ScaleData, limit: ValueEdge) {
  const scaleDataLimit = scaleData.limit;
  const isOverflowedMin = scaleDataLimit.min === limit.min && scaleDataLimit.min !== 0;
  const isOverflowedMax = scaleDataLimit.max === limit.max && scaleDataLimit.max !== 0;

  if (!isOverflowedMin && !isOverflowedMax) {
    return null;
  }

  return {
    min: isOverflowedMin,
    max: isOverflowedMax
  };
}

function getDigits(num: number): number {
  const logNumberDividedLN10 = num === 0 ? 1 : Math.log(Math.abs(num)) / Math.LN10;

  return Math.pow(10, Math.floor(logNumberDividedLN10));
}

function getSnappedNumber(num: number): number {
  let snapNumber = 0;

  for (let i = 0, t = SNAP_VALUES.length; i < t; i += 1) {
    snapNumber = SNAP_VALUES[i];
    const guideValue = (snapNumber + (SNAP_VALUES[i + 1] || snapNumber)) / 2;

    if (num <= guideValue) {
      break;
    }
  }

  return snapNumber;
}

function getNormalizedStep(step: number) {
  const placeNumber = getDigits(step);
  const simplifiedStepValue = step / placeNumber;

  return getSnappedNumber(simplifiedStepValue) * placeNumber;
}

/**
 * Get normalized limit values
 * max = 155 and step = 10 ---> max = 160
 */
function getNormalizedLimit(limit: ValueEdge, step: number, showLabel?: boolean): ValueEdge {
  let { min, max } = limit;
  const minNumber = Math.min(getDigits(max), getDigits(step));
  const placeNumber = minNumber > 1 ? 1 : 1 / minNumber;
  const fixedStep = step * placeNumber;
  const noExtraMax = max;

  // ceil max value step digits
  max = (Math.ceil((max * placeNumber) / fixedStep) * fixedStep) / placeNumber;
  const isNotEnoughSize = fixedStep / 2 > max - noExtraMax;

  if (showLabel && isNotEnoughSize) {
    max += fixedStep;
  }

  if (min > step) {
    // floor min value to multiples of step
    min = (Math.floor((min * placeNumber) / fixedStep) * fixedStep) / placeNumber;
  } else if (min < 0) {
    min = -(Math.ceil((Math.abs(min) * placeNumber) / fixedStep) * fixedStep) / placeNumber;
  } else {
    // 0 when min value is positive and smaller than step
    min = 0;
  }

  return {
    min,
    max
  };
}

function getNormalizedStepCount(limitSize: number, step: number) {
  const multiplier = 1 / Math.min(getDigits(limitSize), getDigits(step));

  return Math.ceil((limitSize * multiplier) / (step * multiplier));
}

function getNormalizedScale(scale: ScaleData, showLabel?: boolean): ScaleData {
  const step = getNormalizedStep(scale.step);
  const edge = getNormalizedLimit(scale.limit, step, showLabel);
  const limitSize = Math.abs(edge.max - edge.min);
  const stepCount = getNormalizedStepCount(limitSize, step);

  return {
    limit: {
      min: edge.min,
      max: edge.max
    },
    step,
    stepCount
  };
}

function getRoughScale(
  range: ValueEdge,
  offsetSize: number,
  stepCount?: number,
  minimumStepSize?: number
): ScaleData {
  const { min, max } = range;
  const limitSize = Math.abs(max - min);
  const valuePerPixel = limitSize / offsetSize;

  if (!stepCount) {
    stepCount = Math.ceil(offsetSize / DEFAULT_PIXELS_PER_STEP);
  }

  const pixelsPerStep = offsetSize / stepCount;
  let step = valuePerPixel * pixelsPerStep;

  if (minimumStepSize) {
    step = minimumStepSize;
    stepCount = limitSize / step;
  }

  return { limit: { min, max }, step, stepCount };
}

export function coordinateScaleCalculator(options: {
  range: ValueEdge;
  offsetSize: number;
  stepCount?: number;
  minimumStepSize?: number;
  showLabel?: boolean;
}): ScaleData {
  const { range, offsetSize, stepCount, minimumStepSize, showLabel } = options;

  const roughScale = getRoughScale(range, offsetSize, stepCount, minimumStepSize);
  const normalizedScale = getNormalizedScale(roughScale, showLabel);
  const overflowed = isSeriesOverflowed(normalizedScale, range);

  if (overflowed) {
    const { step, limit } = normalizedScale;
    normalizedScale.limit = adjustLimitForOverflow(limit, step, overflowed);
  }

  return normalizedScale;
}

export function getStackScaleData(type: stackScaleType): ScaleData {
  if (type === 'percentStack') {
    return { limit: { min: 0, max: 100 }, step: 25, stepCount: 5 };
  }
  if (type === 'minusPercentStack') {
    return { limit: { min: -100, max: 0 }, step: 25, stepCount: 5 };
  }
  if (type === 'dualPercentStack') {
    return { limit: { min: -100, max: 100 }, step: 25, stepCount: 9 };
  }
  if (type === 'divergingPercentStack') {
    return { limit: { min: -100, max: 100 }, step: 25, stepCount: 9 };
  }

  return {} as ScaleData;
}
