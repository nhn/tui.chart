import { line, rect, pathRect } from "./basic";
import { BUTTON_RECT_SIZE } from "../component/exportMenu";
function drawXIcon(ctx, icon, rectSize) {
    const { x: startX, y: startY, theme: { color: strokeStyle, lineWidth }, } = icon;
    const offset = rectSize / 3;
    const x = startX + offset;
    const y = startY + offset;
    const x2 = startX + offset * 2;
    const y2 = startY + offset * 2;
    const points = [
        { x, y, x2, y2 },
        { x, y: y2, x2, y2: y },
    ];
    points.forEach((p) => {
        line(ctx, Object.assign(Object.assign({ type: 'line' }, p), { strokeStyle, lineWidth }));
    });
}
function drawMoreIcon(ctx, icon, rectSize) {
    const { x, y, theme: { color, width, height, gap }, } = icon;
    const paddingX = (rectSize - width) / 2;
    const paddingY = (rectSize - (height * 3 + gap * 2)) / 2;
    const centerX = x + paddingX;
    const points = [
        { x: centerX, y: y + paddingY },
        { x: centerX, y: y + paddingY + height + gap },
        { x: centerX, y: y + paddingY + (height + gap) * 2 },
    ];
    points.forEach((p) => {
        rect(ctx, Object.assign(Object.assign({ type: 'rect' }, p), { color, width: width, height: height }));
    });
}
export function exportMenuButton(ctx, exportMenuButtonModel) {
    const { opened, x: xPos, y: yPos, theme } = exportMenuButtonModel;
    const { borderColor, backgroundColor, borderWidth, borderRadius, xIcon, dotIcon, } = theme;
    const x = xPos + borderWidth;
    const y = yPos + borderWidth;
    const rectSize = BUTTON_RECT_SIZE - 2 * borderWidth;
    pathRect(ctx, {
        type: 'pathRect',
        x,
        y,
        fill: backgroundColor,
        stroke: borderColor,
        width: rectSize,
        height: rectSize,
        radius: borderRadius,
        lineWidth: borderWidth,
    });
    if (opened) {
        drawXIcon(ctx, { x, y, theme: xIcon }, rectSize);
    }
    else {
        drawMoreIcon(ctx, { x, y, theme: dotIcon }, rectSize);
    }
}
