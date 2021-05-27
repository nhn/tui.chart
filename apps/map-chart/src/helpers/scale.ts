import { getDigits, getNormalizedLimit, getNormalizedStep, ValueEdge } from '@toast-ui/shared';
import { ScaleData } from '@t/store';

const DEFAULT_PIXELS_PER_STEP = 88;

export function getRoughScale(dataRange: ValueEdge, offsetSize: number) {
  const { min, max } = dataRange;
  const limitSize = Math.abs(max - min);
  const valuePerPixel = limitSize / offsetSize;

  let stepCount = Math.ceil(offsetSize / DEFAULT_PIXELS_PER_STEP);

  const pixelsPerStep = offsetSize / stepCount;
  const stepSize = valuePerPixel * pixelsPerStep;
  stepCount = limitSize / stepSize;

  return { limit: { min, max }, stepSize, stepCount };
}

export function getNormalizedStepCount(limitSize: number, stepSize: number) {
  return Math.ceil(limitSize / stepSize);
}

export function getNormalizedScale(scaleData: ScaleData): ScaleData {
  const stepSize = getNormalizedStep(scaleData.stepSize);
  const { min, max } = getNormalizedLimit(scaleData.limit, stepSize);
  const limitSize = Math.abs(max - min);
  const stepCount = getNormalizedStepCount(limitSize, stepSize);

  return {
    limit: { min, max },
    stepSize,
    stepCount,
  };
}
