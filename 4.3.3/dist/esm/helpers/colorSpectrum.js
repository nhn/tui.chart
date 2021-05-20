import { rgbToHEX } from "./color";
import { isNull, isString, isUndefined } from "./utils";
export function makeDistances(startRGB, endRGB) {
    return startRGB.map((value, index) => endRGB[index] - value);
}
export function getColorRatio(limit, value) {
    if (isUndefined(value)) {
        return;
    }
    const divNumber = Math.abs(limit.max - limit.min);
    return divNumber && !isNull(value) ? (value - limit.min) / divNumber : 0;
}
export function getSpectrumColor(ratio, distances, startRGB) {
    const rgbColor = startRGB.map((start, index) => start + parseInt(String(distances[index] * ratio), 10));
    const color = rgbToHEX(...rgbColor);
    return isString(color) ? color : '';
}
