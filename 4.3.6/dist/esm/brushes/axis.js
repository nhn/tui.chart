import { line } from "./basic";
export const TICK_SIZE = 5;
export function tick(ctx, tickModel) {
    const { x, y, isYAxis, tickSize = TICK_SIZE, strokeStyle, lineWidth } = tickModel;
    const lineModel = {
        type: 'line',
        x,
        y,
        x2: x,
        y2: y,
        strokeStyle,
        lineWidth,
    };
    if (isYAxis) {
        lineModel.x2 += tickSize;
    }
    else {
        lineModel.y2 += tickSize;
    }
    line(ctx, lineModel);
}
