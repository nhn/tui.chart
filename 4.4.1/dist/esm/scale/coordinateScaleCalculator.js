import { isNumber } from "../helpers/utils";
import { isDateType } from "../helpers/axes";
import { AxisType } from "../component/axis";
const SNAP_VALUES = [1, 2, 5, 10];
const DEFAULT_PIXELS_PER_STEP = 88;
function adjustLimitForOverflow({ min, max }, stepSize, overflowed) {
    return {
        min: overflowed.min ? min - stepSize : min,
        max: overflowed.max ? max + stepSize : max,
    };
}
function isSeriesOverflowed(scaleData, { min, max }, scaleOption) {
    var _a, _b;
    const scaleDataLimit = scaleData.limit;
    const hasMinOption = isNumber((_a = scaleOption) === null || _a === void 0 ? void 0 : _a.min);
    const hasMaxOption = isNumber((_b = scaleOption) === null || _b === void 0 ? void 0 : _b.max);
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
function getDigits(num) {
    const logNumberDividedLN10 = num === 0 ? 1 : Math.log(Math.abs(num)) / Math.LN10;
    return Math.pow(10, Math.floor(logNumberDividedLN10));
}
function getSnappedNumber(num) {
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
function getNormalizedStep(stepSize) {
    const placeNumber = getDigits(stepSize);
    const simplifiedStepValue = stepSize / placeNumber;
    return getSnappedNumber(simplifiedStepValue) * placeNumber;
}
/**
 * Get normalized limit values
 * max = 155 and step = 10 ---> max = 160
 */
function getNormalizedLimit(limit, stepSize) {
    let { min, max } = limit;
    const minNumber = Math.min(getDigits(max), getDigits(stepSize));
    const placeNumber = minNumber > 1 ? 1 : 1 / minNumber;
    const fixedStep = stepSize * placeNumber;
    // ceil max value step digits
    max = (Math.ceil((max * placeNumber) / fixedStep) * fixedStep) / placeNumber;
    if (min > stepSize) {
        // floor min value to multiples of step
        min = (Math.floor((min * placeNumber) / fixedStep) * fixedStep) / placeNumber;
    }
    else if (min < 0) {
        min = -(Math.ceil((Math.abs(min) * placeNumber) / fixedStep) * fixedStep) / placeNumber;
    }
    else {
        min = 0;
    }
    return { min, max };
}
export function getNormalizedStepCount(limitSize, stepSize) {
    const multiplier = 1 / Math.min(getDigits(limitSize), getDigits(stepSize));
    return Math.ceil((limitSize * multiplier) / (stepSize * multiplier));
}
function hasStepSize(stepSize) {
    return isNumber(stepSize);
}
function getNormalizedScale(scaleData, scale) {
    const stepSize = hasStepSize(scale.stepSize)
        ? scaleData.stepSize
        : getNormalizedStep(scaleData.stepSize);
    const edge = getNormalizedLimit(scaleData.limit, stepSize);
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
function getRoughScale(scale, offsetSize, minStepSize = 1) {
    const { min, max } = scale;
    const limitSize = Math.abs(max - min);
    const valuePerPixel = limitSize / offsetSize;
    let stepCount = Math.ceil(offsetSize / DEFAULT_PIXELS_PER_STEP);
    const pixelsPerStep = offsetSize / stepCount;
    let stepSize = valuePerPixel * pixelsPerStep;
    if (hasStepSize(scale.stepSize)) {
        stepSize = scale.stepSize;
        stepCount = limitSize / stepSize;
    }
    else if (isNumber(minStepSize) && stepSize < minStepSize) {
        stepSize = minStepSize;
        stepCount = limitSize / stepSize;
    }
    return { limit: { min, max }, stepSize, stepCount };
}
export function makeScaleOption(dataRange, scaleOptions) {
    var _a, _b, _c, _d, _e, _f;
    return {
        max: (_b = (_a = scaleOptions) === null || _a === void 0 ? void 0 : _a.max, (_b !== null && _b !== void 0 ? _b : dataRange.max)),
        min: (_d = (_c = scaleOptions) === null || _c === void 0 ? void 0 : _c.min, (_d !== null && _d !== void 0 ? _d : dataRange.min)),
        stepSize: (_f = (_e = scaleOptions) === null || _e === void 0 ? void 0 : _e.stepSize, (_f !== null && _f !== void 0 ? _f : 'auto')),
    };
}
export function calculateCoordinateScale(options) {
    const { dataRange, scaleOption, offsetSize, minStepSize, useSpectrumLegend } = options;
    const scale = makeScaleOption(dataRange, scaleOption);
    const roughScale = getRoughScale(scale, offsetSize, minStepSize);
    const normalizedScale = getNormalizedScale(roughScale, scale);
    const overflowed = useSpectrumLegend
        ? null
        : isSeriesOverflowed(normalizedScale, scale, scaleOption);
    if (overflowed) {
        const { stepSize, limit } = normalizedScale;
        normalizedScale.limit = adjustLimitForOverflow(limit, stepSize, overflowed);
    }
    return normalizedScale;
}
export function getStackScaleData(type) {
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
export function calculateXAxisScaleForCoordinateLineType(scale, options, categories) {
    const dateType = isDateType(options, AxisType.X);
    const values = categories.map((value) => (dateType ? Number(new Date(value)) : Number(value)));
    const { limit, stepSize } = scale;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const newLimit = Object.assign({}, limit);
    const distance = max - min;
    let positionRatio = 0;
    let sizeRatio = 1;
    if (distance) {
        if (limit.min < min) {
            newLimit.min += stepSize;
            positionRatio = (newLimit.min - min) / distance;
            sizeRatio -= positionRatio;
        }
        if (limit.max > max) {
            newLimit.max -= stepSize;
            sizeRatio -= (max - newLimit.max) / distance;
        }
    }
    const limitSize = Math.abs(newLimit.max - newLimit.min);
    const newStepCount = getNormalizedStepCount(limitSize, stepSize);
    return {
        limit: newLimit,
        stepCount: newStepCount,
        stepSize,
        positionRatio,
        sizeRatio,
    };
}
