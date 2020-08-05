import { ValueEdge, ScaleData } from '@t/store/store';
import { Scale } from '@t/options';
import { isExist, isNumber, omit } from '@src/helpers/utils';
import { calculator } from '@src/helpers/calculator';

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

function adjustLimitForOverflow(limit: ValueEdge, stepSize: number, overflowed: Overflowed) {
  const { min, max } = limit;

  return {
    min: overflowed.min ? min - stepSize : min,
    max: overflowed.max ? max + stepSize : max,
  };
}

function isSeriesOverflowed(scaleData: ScaleData, scale: Required<Scale>) {
  const { min, max } = scale;
  const scaleDataLimit = scaleData.limit;
  const hasMinOption = isNumber(min);
  const hasMaxOption = isNumber(max);

  const isOverflowedMin = !hasMinOption && scaleDataLimit.min === min && scaleDataLimit.min !== 0;
  const isOverflowedMax = !hasMaxOption && scaleDataLimit.max === max && scaleDataLimit.max !== 0;

  if (!isOverflowedMin && !isOverflowedMax) {
    return null;
  }

  return {
    min: isOverflowedMin,
    max: isOverflowedMax,
  };
}

function getDigits(num: number): number {
  const logNumberDividedLN10 = num === 0 ? 1 : Math.log(Math.abs(num)) / Math.LN10;

  return 10 ** Math.floor(logNumberDividedLN10);
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

function getNormalizedStep(stepSize: number) {
  const placeNumber = getDigits(stepSize);
  const simplifiedStepValue = stepSize / placeNumber;

  return getSnappedNumber(simplifiedStepValue) * placeNumber;
}

/**
 * Get normalized limit values
 * max = 155 and step = 10 ---> max = 160
 */
function getNormalizedLimit(limit: ValueEdge, stepSize: number, showLabel?: boolean): ValueEdge {
  let { min, max } = limit;
  const minNumber = Math.min(getDigits(max), getDigits(stepSize));
  const placeNumber = minNumber > 1 ? 1 : 1 / minNumber;
  const fixedStep = stepSize * placeNumber;
  const noExtraMax = max;

  // ceil max value step digits
  max = (Math.ceil((max * placeNumber) / fixedStep) * fixedStep) / placeNumber;
  const isNotEnoughSize = fixedStep / 2 > max - noExtraMax;

  if (showLabel && isNotEnoughSize) {
    max += fixedStep;
  }

  if (min > stepSize) {
    // floor min value to multiples of step
    min = (Math.floor((min * placeNumber) / fixedStep) * fixedStep) / placeNumber;
  } else if (min < 0) {
    min = -(Math.ceil((Math.abs(min) * placeNumber) / fixedStep) * fixedStep) / placeNumber;
  }

  return {
    min,
    max,
  };
}

function getNormalizedStepCount(limitSize: number, stepSize: number) {
  const multiplier = 1 / Math.min(getDigits(limitSize), getDigits(stepSize));

  return Math.ceil((limitSize * multiplier) / (stepSize * multiplier));
}

function hasStepSize(stepSize: number | 'auto'): stepSize is number {
  return isNumber(stepSize);
}

function getNormalizedScale(
  scaleData: ScaleData,
  scale: Required<Scale>,
  showLabel?: boolean
): ScaleData {
  const stepSize = hasStepSize(scale.stepSize)
    ? scaleData.stepSize
    : getNormalizedStep(scaleData.stepSize);
  const edge = getNormalizedLimit(scaleData.limit, stepSize, showLabel);
  const limitSize = Math.abs(edge.max - edge.min);
  const stepCount = getNormalizedStepCount(limitSize, stepSize);

  return {
    limit: {
      min: edge.min,
      max: edge.max,
    },
    stepSize,
    stepCount,
  };
}

function getRoughScale(
  scale: Required<Scale>,
  offsetSize: number,
  minStepSize?: number
): ScaleData {
  const { min, max } = scale;
  const limitSize = Math.abs(max - min);
  const valuePerPixel = limitSize / offsetSize;

  let stepCount = Math.ceil(offsetSize / DEFAULT_PIXELS_PER_STEP);

  const pixelsPerStep = offsetSize / stepCount;
  let stepSize = valuePerPixel * pixelsPerStep;

  if (hasStepSize(scale.stepSize)) {
    stepSize = scale.stepSize;
    stepCount = limitSize / stepSize;
  } else if (isNumber(minStepSize) && stepSize < minStepSize) {
    stepSize = minStepSize;
    stepCount = limitSize / stepSize;
  }

  return { limit: { min, max }, stepSize, stepCount };
}

export function makeScaleOption(dataRange: ValueEdge, scaleOptions?: Scale): Required<Scale> {
  return {
    max: scaleOptions?.max ?? dataRange.max,
    min: scaleOptions?.min ?? dataRange.min,
    stepSize: scaleOptions?.stepSize ?? 'auto',
  };
}

export function calculateCoordinateScale(options: {
  dataRange: ValueEdge;
  offsetSize: number;
  scaleOption?: Scale;
  showLabel?: boolean;
  minStepSize?: number;
}): ScaleData {
  const { dataRange, scaleOption, offsetSize, showLabel, minStepSize } = options;
  const scale = makeScaleOption(dataRange, scaleOption);
  const roughScale = getRoughScale(scale, offsetSize, minStepSize);
  const normalizedScale = getNormalizedScale(roughScale, scale, showLabel);
  const overflowed = isSeriesOverflowed(normalizedScale, scale);

  if (overflowed) {
    const { stepSize, limit } = normalizedScale;
    normalizedScale.limit = adjustLimitForOverflow(limit, stepSize, overflowed);
  }

  return normalizedScale;
}

export function getStackScaleData(type: stackScaleType): ScaleData {
  if (type === 'minusPercentStack') {
    return { limit: { min: -100, max: 0 }, stepSize: 25, stepCount: 5 };
  }
  if (type === 'dualPercentStack') {
    return { limit: { min: -100, max: 100 }, stepSize: 25, stepCount: 9 };
  }
  if (type === 'divergingPercentStack') {
    return { limit: { min: -100, max: 100 }, stepSize: 25, stepCount: 9 };
  }

  return { limit: { min: 0, max: 100 }, stepSize: 25, stepCount: 5 };
}

