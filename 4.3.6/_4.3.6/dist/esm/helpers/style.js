import { isString, pick } from "./utils";
import { getAlpha } from "./color";
export function makeStyleObj(style, styleSet) {
    return style.reduce((acc, curValue) => {
        if (isString(curValue)) {
            return Object.assign(Object.assign({}, acc), styleSet[curValue]);
        }
        return Object.assign(Object.assign({}, acc), curValue);
    }, {});
}
export function getTranslateString(x, y) {
    return `translate(${x}px,${y}px)`;
}
export function getTitleFontString(fontTheme) {
    const { fontFamily, fontSize, fontWeight } = fontTheme;
    return `${fontWeight} ${fontSize}px ${fontFamily}`;
}
export function getFontStyleString(theme) {
    const { color, fontSize, fontFamily, fontWeight } = theme;
    return `font-weight: ${fontWeight}; font-family: ${fontFamily}; font-size: ${fontSize}px; color: ${color};`;
}
export function getFont(theme) {
    return getTitleFontString(pick(theme, 'fontFamily', 'fontWeight', 'fontSize'));
}
export function setLineDash(ctx, dashSegments) {
    if (ctx.setLineDash) {
        ctx.setLineDash(dashSegments);
    }
}
export function getBoxTypeSeriesPadding(tickDistance) {
    return Math.floor(tickDistance * 0.15);
}
export function fillStyle(ctx, fillOption) {
    ctx.fillStyle = fillOption;
    ctx.fill();
}
export function strokeWithOptions(ctx, style) {
    const { lineWidth, strokeStyle } = style;
    if (strokeStyle) {
        ctx.strokeStyle = strokeStyle;
    }
    if (lineWidth) {
        ctx.lineWidth = lineWidth;
    }
    if (ctx.lineWidth && getAlpha(String(ctx.strokeStyle))) {
        ctx.stroke();
    }
}
