import { ValueEdge } from '@t/index';

const SNAP_VALUES = [1, 2, 5, 10];

export function getLimitSafely(baseValues: number[], isXAxis = false): ValueEdge {
  const limit = {
    min: Math.min(...baseValues),
    max: Math.max(...baseValues),
  };

  if (baseValues.length === 1) {
    const [firstValue] = baseValues;

    if (isXAxis) {
      limit.min = firstValue;
      limit.max = firstValue;
    } else if (firstValue > 0) {
      limit.min = 0;
    } else if (firstValue === 0) {
      limit.max = 10;
    } else {
      limit.max = 0;
    }
  } else if (limit.min === 0 && limit.max === 0) {
    limit.max = 10;
  } else if (limit.min === limit.max) {
    limit.min -= limit.min / 10;
    limit.max += limit.max / 10;
  }

  return limit;
}

export function getDigits(num: number): number {
  const logNumberDividedLN10 = num === 0 ? 1 : Math.log(Math.abs(num)) / Math.LN10;

  return 10 ** Math.floor(logNumberDividedLN10);
}

export function getNormalizedLimit(limit: ValueEdge, stepSize: number): ValueEdge {
  let { min, max } = limit;
  const minNumber = Math.min(getDigits(max), getDigits(stepSize));
  const placeNumber = minNumber > 1 ? 1 : 1 / minNumber;
  const fixedStep = stepSize * placeNumber;

  // ceil max value step digits
  max = (Math.ceil((max * placeNumber) / fixedStep) * fixedStep) / placeNumber;

  if (min > stepSize) {
    // floor min value to multiples of step
    min = (Math.floor((min * placeNumber) / fixedStep) * fixedStep) / placeNumber;
  } else if (min < 0) {
    min = -(Math.ceil((Math.abs(min) * placeNumber) / fixedStep) * fixedStep) / placeNumber;
  } else {
    min = 0;
  }

  return { min, max };
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

export function getNormalizedStep(stepSize: number) {
  const placeNumber = getDigits(stepSize);
  const simplifiedStepValue = stepSize / placeNumber;

  return getSnappedNumber(simplifiedStepValue) * placeNumber;
}
