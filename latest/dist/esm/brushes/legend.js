import { line, circle, rect } from "./basic";
import { label } from "./label";
import { getRGBA } from "../helpers/color";
import { scatterSeries } from "./scatterSeries";
import { getTitleFontString } from "../helpers/style";
import { getTextHeight } from "../helpers/calculator";
import { padding } from "../store/layout";
export const LEGEND_ITEM_MARGIN_X = 40;
export const LEGEND_MARGIN_X = 5;
export const LEGEND_CHECKBOX_SIZE = 12;
export const LEGEND_ICON_SIZE = 12;
const ICON_BORDER_WIDTH = 1.5;
const INACTIVE_OPACITY = 0.3;
const RECT_SIZE = 10;
const LINE_ICON_PADDING = 2;
const CIRCLE_ICON_RADIUS = 6;
export function getLegendItemHeight(fontSize) {
    return fontSize + padding.Y;
}
function drawLineIcon(ctx, x, y, color) {
    const xCurveOffset = [2, 2, 6, 6, 10, 10];
    const yCurveOffset = [8, 0, 0, 8, 8, 0];
    xCurveOffset.forEach((xOffset, idx) => {
        if (idx === 5) {
            return;
        }
        line(ctx, {
            type: 'line',
            x: x + xOffset,
            y: y + yCurveOffset[idx],
            x2: x + xCurveOffset[idx + 1],
            y2: y + yCurveOffset[idx + 1],
            lineWidth: 2,
            strokeStyle: color,
        });
    });
}
function drawCheckIcon(ctx, x, y, active) {
    const color = '#555555';
    const strokeStyle = active ? color : getRGBA(color, INACTIVE_OPACITY);
    line(ctx, {
        type: 'line',
        x: x + 2,
        y: y + 5,
        x2: x + 5,
        y2: y + 8,
        strokeStyle,
        lineWidth: 2,
    });
    line(ctx, {
        type: 'line',
        x: x + 5,
        y: y + 9,
        x2: x + 10,
        y2: y + 3,
        strokeStyle,
        lineWidth: 2,
    });
}
function drawCheckbox(ctx, x, y, renderOptions) {
    const { active, checked } = renderOptions;
    const borderColor = active ? '#bbb' : getRGBA('#bbbbbb', INACTIVE_OPACITY);
    rect(ctx, {
        type: 'rect',
        x,
        y,
        width: LEGEND_CHECKBOX_SIZE,
        height: LEGEND_CHECKBOX_SIZE,
        color: '#fff',
        borderColor,
        thickness: 1,
    });
    if (checked) {
        drawCheckIcon(ctx, x, y, active);
    }
}
function drawIcon(ctx, x, y, renderOptions) {
    const { iconType, active, color, showCheckbox } = renderOptions;
    const iconX = x + (showCheckbox ? LEGEND_CHECKBOX_SIZE + LEGEND_MARGIN_X : 0);
    const iconColor = active ? color : getRGBA(color, INACTIVE_OPACITY);
    if (iconType === 'rect') {
        rect(ctx, {
            type: 'rect',
            x: iconX,
            y: y + (LEGEND_CHECKBOX_SIZE - RECT_SIZE) / 2,
            width: RECT_SIZE,
            height: RECT_SIZE,
            color: iconColor,
        });
    }
    else if (iconType === 'line') {
        drawLineIcon(ctx, iconX, y + LINE_ICON_PADDING, iconColor);
    }
    else if (iconType === 'circle') {
        circle(ctx, {
            type: 'circle',
            x: iconX + CIRCLE_ICON_RADIUS,
            y: y + CIRCLE_ICON_RADIUS,
            radius: CIRCLE_ICON_RADIUS,
            color: iconColor,
            style: ['default'],
        });
    }
}
function drawScatterIcon(ctx, x, y, renderOptions) {
    const { iconType, active, color, showCheckbox } = renderOptions;
    const iconX = x + (showCheckbox ? LEGEND_CHECKBOX_SIZE + LEGEND_MARGIN_X : 0);
    const iconColor = active ? color : getRGBA(color, INACTIVE_OPACITY);
    scatterSeries(ctx, {
        type: 'scatterSeries',
        iconType: iconType,
        x: iconX + CIRCLE_ICON_RADIUS,
        y: y + CIRCLE_ICON_RADIUS,
        borderColor: iconColor,
        size: CIRCLE_ICON_RADIUS * 2,
        fillColor: 'rgba(255, 255, 255, 0)',
        borderWidth: ICON_BORDER_WIDTH,
    });
}
function drawLabel(ctx, x, y, text, renderOptions) {
    const { active, showCheckbox, font, fontColor } = renderOptions;
    const fillStyle = active ? fontColor : getRGBA(fontColor, INACTIVE_OPACITY);
    label(ctx, {
        type: 'label',
        x: x +
            LEGEND_ICON_SIZE +
            LEGEND_MARGIN_X +
            (showCheckbox ? LEGEND_CHECKBOX_SIZE + LEGEND_MARGIN_X : 0),
        y,
        text,
        style: ['default', { font, textBaseline: 'top', fillStyle }],
    });
}
export function legend(ctx, model) {
    const { data, showCheckbox, align, fontSize, fontFamily, fontWeight } = model;
    const font = getTitleFontString({ fontSize, fontFamily, fontWeight });
    const fontColor = model.color;
    data.forEach((datum) => {
        const { x, y, checked, active, color, iconType, useScatterChartIcon, viewLabel: legendLabel, } = datum;
        const iconY = y - 1 + (getTextHeight(legendLabel, font) - 11) / 4;
        const renderOptions = {
            iconType,
            checked,
            active,
            color,
            showCheckbox,
            align,
            font,
            fontColor,
        };
        if (showCheckbox) {
            drawCheckbox(ctx, x, iconY, renderOptions);
        }
        if (useScatterChartIcon && iconType !== 'line') {
            drawScatterIcon(ctx, x, iconY, renderOptions);
        }
        else {
            drawIcon(ctx, x, iconY, renderOptions);
        }
        drawLabel(ctx, x, y, legendLabel, renderOptions);
    });
}
