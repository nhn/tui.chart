import { padding } from "../store/layout";
import { getTextWidth, getMaxLengthLabelWidth } from "../helpers/calculator";
import { label, bubbleLabel } from "./label";
import { getBubbleArrowPoints } from "./dataLabel";
export const SPECTRUM_LEGEND_LABEL_HEIGHT = 12;
export const spectrumLegendBar = {
    HEIGHT: 6,
    PADDING: 5,
};
export const spectrumLegendTooltip = {
    HEIGHT: 28,
    POINT_WIDTH: 8,
    POINT_HEIGHT: 6,
    PADDING: 6,
};
function getBarStartPoint(model) {
    const { align, x: modelX, y: modelY, labels, width } = model;
    const { PADDING } = spectrumLegendBar;
    let x, y;
    if (align === 'top') {
        x = modelX;
        y = modelY + SPECTRUM_LEGEND_LABEL_HEIGHT + PADDING;
    }
    else if (align === 'bottom') {
        x = modelX;
        y = modelY + spectrumLegendTooltip.HEIGHT;
    }
    else if (align === 'left') {
        x = modelX + getMaxLengthLabelWidth(labels) + PADDING;
        y = modelY + SPECTRUM_LEGEND_LABEL_HEIGHT / 2;
    }
    else {
        x =
            modelX +
                width -
                (getMaxLengthLabelWidth(labels) + padding.X + PADDING * 2 + spectrumLegendBar.HEIGHT);
        y = modelY + SPECTRUM_LEGEND_LABEL_HEIGHT / 2;
    }
    return { x, y };
}
function getLabelsStartPoint(model) {
    const { align, x: modelX, y: modelY, labels, width } = model;
    let x, y;
    if (align === 'top') {
        x = modelX;
        y = modelY;
    }
    else if (align === 'bottom') {
        x = modelX;
        y =
            modelY + spectrumLegendTooltip.HEIGHT + spectrumLegendBar.HEIGHT + spectrumLegendBar.PADDING;
    }
    else if (align === 'left') {
        x = modelX + getMaxLengthLabelWidth(labels);
        y = modelY;
    }
    else {
        x = modelX + width - getMaxLengthLabelWidth(labels) - padding.X;
        y = modelY;
    }
    return { x, y };
}
function getBarSize(width, height, verticalAlign) {
    const { HEIGHT } = spectrumLegendBar;
    const barWidth = verticalAlign ? width : HEIGHT;
    const barHeight = verticalAlign ? HEIGHT : height - SPECTRUM_LEGEND_LABEL_HEIGHT;
    return { barWidth, barHeight };
}
function drawLabels(ctx, model) {
    const { labels, align, x, y, width, height, verticalAlign } = model;
    const { barWidth, barHeight } = getBarSize(width, height, verticalAlign);
    const labelSize = labels.length - 1;
    const textBaseStyleMap = {
        left: {
            textAlign: 'right',
            textBaseline: 'top',
        },
        right: {
            textAlign: 'left',
            textBaseline: 'top',
        },
        top: {
            textAlign: 'center',
            textBaseline: 'top',
        },
        bottom: {
            textAlign: 'center',
            textBaseline: 'top',
        },
    };
    labels.forEach((text, idx) => {
        const startX = verticalAlign ? x + (barWidth / labelSize) * idx : x;
        const startY = verticalAlign ? y : y + (barHeight / labelSize) * idx;
        label(ctx, {
            type: 'label',
            x: startX,
            y: startY,
            text,
            style: ['default', textBaseStyleMap[align]],
        });
    });
}
function drawBar(ctx, model) {
    const { width, height, startColor, endColor, x, y, verticalAlign } = model;
    const { barWidth, barHeight } = getBarSize(width, height, verticalAlign);
    const gradient = verticalAlign
        ? ctx.createLinearGradient(x, y, x + barWidth, y)
        : ctx.createLinearGradient(x, y, x, y + barHeight);
    gradient.addColorStop(0, startColor);
    gradient.addColorStop(1, endColor);
    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, barWidth, barHeight);
}
function getTooltipArrowPoint(model) {
    const { align, colorRatio, width, height, x, y, labels, verticalAlign } = model;
    const { barWidth, barHeight } = getBarSize(width, height, verticalAlign);
    const { PADDING, HEIGHT } = spectrumLegendBar;
    if (align === 'top') {
        return {
            x: x + barWidth * colorRatio,
            y: y + SPECTRUM_LEGEND_LABEL_HEIGHT + HEIGHT + PADDING * 2,
        };
    }
    if (align === 'bottom') {
        return {
            x: x + barWidth * colorRatio,
            y: y + SPECTRUM_LEGEND_LABEL_HEIGHT + PADDING * 2,
        };
    }
    if (align === 'left') {
        return {
            x: x + getMaxLengthLabelWidth(labels) + HEIGHT + PADDING * 2,
            y: y + barHeight * colorRatio + PADDING,
        };
    }
    if (align === 'right') {
        return {
            x: x + width - (getMaxLengthLabelWidth(labels) + padding.X + PADDING * 3 + HEIGHT),
            y: y + barHeight * colorRatio + PADDING,
        };
    }
}
export function spectrumLegend(ctx, model) {
    const labelsStartPoint = getLabelsStartPoint(model);
    const barStartPoint = getBarStartPoint(model);
    drawLabels(ctx, Object.assign(Object.assign({}, model), labelsStartPoint));
    drawBar(ctx, Object.assign(Object.assign({}, model), barStartPoint));
}
export function spectrumTooltip(ctx, model) {
    const { x, y } = getTooltipArrowPoint(model);
    const { PADDING, POINT_HEIGHT, POINT_WIDTH } = spectrumLegendTooltip;
    const { align, text, color } = model;
    const labelWidth = getTextWidth(text);
    const width = labelWidth + PADDING * 2;
    const height = SPECTRUM_LEGEND_LABEL_HEIGHT + PADDING * 2;
    const direction = align;
    let boxStartX = x;
    let boxStartY = y;
    if (align === 'top') {
        boxStartY += POINT_HEIGHT;
    }
    else if (align === 'right') {
        boxStartX -= width / 2 + POINT_HEIGHT;
        boxStartY -= height / 2;
    }
    else if (align === 'left') {
        boxStartX += width / 2 + POINT_HEIGHT;
        boxStartY -= height / 2;
    }
    else if (align === 'bottom') {
        boxStartY -= height + POINT_HEIGHT;
    }
    const points = getBubbleArrowPoints(align, { x, y }, { visible: true, width: POINT_WIDTH, height: POINT_HEIGHT });
    bubbleLabel(ctx, {
        type: 'bubbleLabel',
        bubble: {
            x: boxStartX - width / 2,
            y: boxStartY,
            width,
            height,
            points,
            direction,
            fill: color,
        },
        label: {
            text,
            x: boxStartX,
            y: boxStartY + height / 2,
            style: [
                {
                    font: 'normal 11px Arial',
                    fillStyle: '#333333',
                    textAlign: 'center',
                    textBaseline: 'middle',
                },
            ],
        },
    });
}
