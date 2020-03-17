import { ValueEdge, ScaleData } from '../../types/store/store';

const SNAP_VALUES = [1, 2, 5, 10];

const DEFAULT_PIXELS_PER_STEP = 88;

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
 * Get normailzed limit values
 * max = 155 and step = 10 ---> max = 160
 */
function getNormalizedLimit(
  min: number,
  max: number,
  step: number,
  showLabel?: boolean
): ValueEdge {
  const minNumber = Math.min(getDigits(max), getDigits(step));
  const placeNumber = minNumber > 1 ? 1 : 1 / minNumber;
  const fixedStep = step * placeNumber;
  const noExtraMax = max;
  let isNotEnoughSize = false;

  // ceil max value step digits
  max = (Math.ceil((max * placeNumber) / fixedStep) * fixedStep) / placeNumber;
  isNotEnoughSize = fixedStep / 2 > max - noExtraMax;

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

/**
 * Get normalized step count for floating point calculate error
 */
function getNormalizedStepCount(limitSize: number, step: number) {
  const multiplier = 1 / Math.min(getDigits(limitSize), getDigits(step));

  return Math.ceil((limitSize * multiplier) / (step * multiplier));
}

/**
 * Get normalized scale data
 */
function getNormalizedScale(
  scale: { step: number; limit: { min: number; max: number } },
  showLabel?: boolean
): ScaleData {
  const step = getNormalizedStep(scale.step);
  const edge = getNormalizedLimit(scale.limit.min, scale.limit.max, step, showLabel);
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

/**
 * Get rough(not normalized) scale data
 */
function getRoughScale(
  min: number,
  max: number,
  offsetSize: number,
  stepCount?: number,
  minimumStepSize?: number
): ScaleData {
  const limitSize = Math.abs(max - min);
  const valuePerPixel = limitSize / offsetSize;

  if (!stepCount) {
    stepCount = Math.ceil(offsetSize / DEFAULT_PIXELS_PER_STEP);
  }

  const pixelsPerStep = offsetSize / stepCount;
  let step = valuePerPixel * pixelsPerStep;

  if (minimumStepSize && step < minimumStepSize) {
    step = minimumStepSize;
    stepCount = limitSize / step;
  }

  return {
    limit: {
      min,
      max
    },
    step,
    stepCount
  };
}

/**
 * Calculate coordinate scale
 */
function coordinateScaleCalculator(options: {
  range: ValueEdge;
  offsetSize: number;
  stepCount?: number;
  minimumStepSize?: number;
  showLabel?: boolean;
}): ScaleData {
  const { range, offsetSize, stepCount, minimumStepSize, showLabel } = options;
  let scale = getRoughScale(range.min, range.max, offsetSize, stepCount, minimumStepSize);

  scale = getNormalizedScale(scale, showLabel);

  return scale;
}

export default coordinateScaleCalculator;
