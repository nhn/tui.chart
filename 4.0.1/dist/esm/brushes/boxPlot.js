import { line, rect } from "./basic";
export function boxPlot(ctx, model) {
    const { rect: rectModel, upperWhisker, lowerWhisker, median, minimum, maximum } = model;
    if (minimum) {
        line(ctx, Object.assign({ type: 'line' }, minimum));
    }
    if (lowerWhisker) {
        line(ctx, Object.assign({ type: 'line' }, lowerWhisker));
    }
    if (rectModel) {
        rect(ctx, Object.assign({ type: 'rect' }, rectModel));
    }
    if (upperWhisker) {
        line(ctx, Object.assign({ type: 'line' }, upperWhisker));
    }
    if (maximum) {
        line(ctx, Object.assign({ type: 'line' }, maximum));
    }
    if (median) {
        line(ctx, Object.assign({ type: 'line' }, median));
    }
}
