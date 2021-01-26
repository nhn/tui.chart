import { isExist, omit } from "../helpers/utils";
import { add, multiply, divide } from "../helpers/calculator";
import { calculateCoordinateScale, makeScaleOption } from "./coordinateScaleCalculator";
const msMap = {
    year: 31536000000,
    month: 2678400000,
    week: 604800000,
    date: 86400000,
    hour: 3600000,
    minute: 60000,
    second: 1000,
};
export function calculateDatetimeScale(options) {
    const { dataRange, rawCategoriesSize, scaleOption } = options;
    const datetimeInfo = makeDatetimeInfo(dataRange, rawCategoriesSize, scaleOption);
    const { minDate, divisionNumber, limit } = datetimeInfo;
    const scale = calculateCoordinateScale(Object.assign(Object.assign({}, omit(options, 'scaleOption')), { dataRange: limit, minStepSize: 1 }));
    return restoreScaleToDatetimeType(scale, minDate, divisionNumber);
}
const msTypes = ['year', 'month', 'week', 'date', 'hour', 'minute', 'second'];
function restoreScaleToDatetimeType(scale, minDate, divisionNumber) {
    const { limit, stepSize } = scale;
    const { min, max } = limit;
    return Object.assign(Object.assign({}, scale), { stepSize: multiply(stepSize, divisionNumber), limit: {
            min: multiply(add(min, minDate), divisionNumber),
            max: multiply(add(max, minDate), divisionNumber),
        } });
}
function makeDatetimeInfo(limit, count, scaleOption) {
    var _a, _b;
    const dateType = findDateType(limit, count);
    const divisionNumber = (_b = (_a = scaleOption) === null || _a === void 0 ? void 0 : _a.stepSize, (_b !== null && _b !== void 0 ? _b : msMap[dateType]));
    const scale = makeScaleOption(limit, scaleOption);
    const minDate = divide(Number(new Date(scale.min)), divisionNumber);
    const maxDate = divide(Number(new Date(scale.max)), divisionNumber);
    return { divisionNumber, minDate, limit: { min: 0, max: maxDate - minDate } };
}
function findDateType({ max, min }, count) {
    const diff = max - min;
    const lastTypeIndex = msTypes.length - 1;
    let foundType;
    if (diff) {
        msTypes.every((type, index) => {
            const millisecond = msMap[type];
            const dividedCount = Math.floor(diff / millisecond);
            let foundIndex;
            if (dividedCount) {
                foundIndex =
                    index < lastTypeIndex && dividedCount < 2 && dividedCount < count ? index + 1 : index;
                foundType = msTypes[foundIndex];
            }
            return !isExist(foundIndex);
        });
    }
    else {
        foundType = 'second';
    }
    return foundType;
}
