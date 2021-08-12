import { label, bubbleLabel } from "./label";
import { getTextHeight, getTextWidth } from "../helpers/calculator";
import { line } from "./basic";
import { getFont } from "../helpers/style";
import { pick, includes } from "../helpers/utils";
export function dataLabel(ctx, model) {
    var _a;
    const { x, y, text, textAlign, textBaseline, opacity, callout, theme, radian } = model;
    const { color, textBubble } = theme;
    const font = getFont(theme);
    const textStyle = { textAlign, textBaseline, font, fillStyle: color };
    const textStrokeStyle = getTextStrokeStyle(theme);
    if (callout) {
        const { theme: { lineWidth, lineColor }, } = callout;
        line(ctx, Object.assign(Object.assign({ type: 'line' }, pick(callout, 'x', 'y', 'x2', 'y2')), { strokeStyle: lineColor, lineWidth }));
    }
    if ((_a = textBubble) === null || _a === void 0 ? void 0 : _a.visible) {
        drawBubbleLabel(ctx, model);
        return;
    }
    label(ctx, {
        type: 'label',
        x,
        y,
        text,
        style: [textStyle],
        stroke: [textStrokeStyle],
        opacity,
        radian,
    });
}
export function drawBubbleLabel(ctx, model) {
    const { text, theme, radian = 0 } = model;
    const { color, textStrokeColor } = theme;
    const font = getFont(theme);
    const bubbleRect = getBubbleRect(model);
    const { x, y, width, height } = bubbleRect;
    bubbleLabel(ctx, {
        type: 'bubbleLabel',
        radian,
        rotationPosition: { x: model.x, y: model.y },
        bubble: bubbleRect,
        label: {
            x: x + width / 2,
            y: y + height / 2,
            text,
            style: [{ font, fillStyle: color, textAlign: 'center', textBaseline: 'middle' }],
            strokeStyle: textStrokeColor,
        },
    });
}
export function getBubbleArrowPoints(direction, { x, y }, arrowPointTheme) {
    const width = arrowPointTheme.width;
    const height = arrowPointTheme.height;
    let points = [];
    if (direction === 'top') {
        points = [
            { x: x - width / 2, y: y + height },
            { x, y },
            { x: x + width / 2, y: y + height },
        ];
    }
    else if (direction === 'bottom') {
        points = [
            { x: x + width / 2, y: y - height },
            { x, y },
            { x: x - width / 2, y: y - height },
        ];
    }
    else if (direction === 'right') {
        points = [
            { x: x - height, y: y - width / 2 },
            { x, y },
            { x: x - height, y: y + width / 2 },
        ];
    }
    else if (direction === 'left') {
        points = [
            { x: x + height, y: y + width / 2 },
            { x, y },
            { x: x + height, y: y - width / 2 },
        ];
    }
    return points;
}
function getBubbleRect(model) {
    const { text, theme, textAlign, textBaseline } = model;
    const font = getFont(theme);
    const { arrow, paddingX, paddingY, borderRadius, borderColor, borderWidth, backgroundColor, shadowBlur, shadowOffsetX, shadowOffsetY, shadowColor, } = theme.textBubble;
    const labelWidth = getTextWidth(text, font);
    const width = labelWidth + paddingX * 2;
    const height = getTextHeight(text, font) + paddingY * 2;
    let { x, y } = model;
    if (textAlign === 'center') {
        x -= width / 2;
    }
    else if (includes(['right', 'end'], textAlign)) {
        x -= width;
    }
    if (textBaseline === 'middle') {
        y -= height / 2;
    }
    else if (textBaseline === 'bottom') {
        y -= height;
    }
    const rect = { x, y, width, height };
    return Object.assign(Object.assign(Object.assign({}, rect), { radius: borderRadius, lineWidth: borderWidth, fill: backgroundColor, strokeStyle: borderColor, style: [
            {
                shadowBlur,
                shadowOffsetX,
                shadowOffsetY,
                shadowColor,
            },
        ] }), getArrowInfo(rect, textAlign, textBaseline, arrow));
}
function getArrowInfo(rect, textAlign, textBaseline, theme) {
    var _a, _b;
    if (!((_a = theme) === null || _a === void 0 ? void 0 : _a.visible)) {
        return null;
    }
    const arrowHeight = theme.height;
    const { width, height } = rect;
    const direction = (_b = theme.direction, (_b !== null && _b !== void 0 ? _b : getArrowDirection(textAlign, textBaseline)));
    let { x: boxX, y: boxY } = rect;
    let { x: pointX, y: pointY } = rect;
    if (direction === 'top') {
        boxY += arrowHeight;
    }
    else if (direction === 'bottom') {
        boxY -= arrowHeight;
        pointY += height;
    }
    else if (direction === 'right') {
        boxX -= arrowHeight;
        pointX += width;
    }
    else if (direction === 'left') {
        boxX += arrowHeight;
    }
    if (textAlign === 'center') {
        pointX = rect.x + width / 2;
    }
    else if (textBaseline === 'middle') {
        pointY = rect.y + height / 2;
    }
    return {
        direction,
        points: getBubbleArrowPoints(direction, { x: pointX, y: pointY }, theme),
        x: boxX,
        y: boxY,
    };
}
function getArrowDirection(textAlign, textBaseline) {
    let direction = 'top';
    if (textAlign === 'center' && textBaseline === 'top') {
        direction = 'top';
    }
    else if (textAlign === 'center' && textBaseline === 'bottom') {
        direction = 'bottom';
    }
    else if (textBaseline === 'middle' && textAlign === 'right') {
        direction = 'right';
    }
    else if (textBaseline === 'middle' && textAlign === 'left') {
        direction = 'left';
    }
    return direction;
}
function getTextStrokeStyle(theme) {
    const { textStrokeColor } = theme;
    const textStrokeStyle = pick(theme, 'lineWidth', 'shadowColor', 'shadowBlur');
    if (textStrokeColor) {
        textStrokeStyle.strokeStyle = textStrokeColor;
    }
    return textStrokeStyle;
}
