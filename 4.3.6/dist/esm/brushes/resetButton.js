import { BUTTON_RECT_SIZE } from "../component/exportMenu";
import { circle, line, pathRect } from "./basic";
import { areaPoints } from "./lineSeries";
const ARROW_HEIGHT = 3;
const ARROW_WIDTH = 6;
function drawResetIcon(ctx, point) {
    const { x, y } = point;
    const centerX = x + BUTTON_RECT_SIZE / 2;
    const centerY = y + BUTTON_RECT_SIZE / 2;
    const tickSize = BUTTON_RECT_SIZE / 10;
    const color = '#545454';
    circle(ctx, {
        type: 'circle',
        x: centerX,
        y: centerY,
        radius: tickSize * 2,
        angle: { start: 0, end: Math.PI / 2 },
        color: 'transparent',
        style: [{ lineWidth: 2, strokeStyle: color }],
    });
    const pointStartX = centerX + tickSize * 2;
    const pointStartY = centerY;
    const points = [
        { x: pointStartX - ARROW_WIDTH / 2, y: pointStartY },
        { x: pointStartX + ARROW_WIDTH / 2, y: pointStartY },
        { x: pointStartX, y: pointStartY + ARROW_HEIGHT },
    ];
    areaPoints(ctx, {
        type: 'areaPoints',
        points,
        lineWidth: 1,
        color,
        fillColor: color,
    });
}
function drawBackIcon(ctx, point) {
    const barWidth = 4;
    const radius = BUTTON_RECT_SIZE / 7;
    const { x, y } = point;
    const centerX = x + BUTTON_RECT_SIZE / 2;
    const centerY = y + BUTTON_RECT_SIZE / 2;
    const color = '#545454';
    line(ctx, {
        type: 'line',
        lineWidth: 2,
        x: centerX - barWidth / 2,
        y: centerY + radius,
        x2: centerX + barWidth / 2,
        y2: centerY + radius,
        strokeStyle: color,
    });
    line(ctx, {
        type: 'line',
        lineWidth: 2,
        x: centerX - barWidth / 2,
        y: centerY - radius,
        x2: centerX + barWidth / 2,
        y2: centerY - radius,
        strokeStyle: color,
    });
    circle(ctx, {
        type: 'circle',
        x: centerX + barWidth / 2,
        y: centerY,
        radius,
        angle: { start: Math.PI / 2, end: (Math.PI * 3) / 2 },
        color: 'transparent',
        style: [{ lineWidth: 2, strokeStyle: color }],
    });
    const pointStartX = centerX - barWidth / 2;
    const pointStartY = centerY - radius;
    const points = [
        { x: pointStartX - ARROW_HEIGHT, y: pointStartY },
        { x: pointStartX, y: pointStartY - ARROW_WIDTH / 2 },
        { x: pointStartX, y: pointStartY + ARROW_WIDTH / 2 },
    ];
    areaPoints(ctx, {
        type: 'areaPoints',
        points,
        lineWidth: 1,
        color,
        fillColor: color,
    });
}
export function backButton(ctx, backButtonModel) {
    const { x, y } = backButtonModel;
    pathRect(ctx, {
        type: 'pathRect',
        x,
        y,
        fill: '#f4f4f4',
        stroke: '#f4f4f4',
        width: BUTTON_RECT_SIZE,
        height: BUTTON_RECT_SIZE,
        radius: 5,
    });
    drawBackIcon(ctx, { x, y });
}
export function resetButton(ctx, resetButtonModel) {
    const { x, y } = resetButtonModel;
    pathRect(ctx, {
        type: 'pathRect',
        x,
        y,
        fill: '#f4f4f4',
        stroke: '#f4f4f4',
        width: BUTTON_RECT_SIZE,
        height: BUTTON_RECT_SIZE,
        radius: 5,
    });
    drawResetIcon(ctx, { x, y });
}
