import { makeStyleObj, fillStyle, strokeWithOptions } from "../helpers/style";
import { isNumber } from "../helpers/utils";
import { rgba } from "../helpers/color";
import { pathRect } from "./basic";
export const DEFAULT_LABEL_TEXT = 'normal 11px Arial';
export const labelStyle = {
    default: {
        font: DEFAULT_LABEL_TEXT,
        fillStyle: '#333333',
        textAlign: 'left',
        textBaseline: 'middle',
    },
    title: {
        textBaseline: 'top',
    },
    axisTitle: {
        textBaseline: 'top',
    },
    rectLabel: {
        font: DEFAULT_LABEL_TEXT,
        fillStyle: 'rgba(0, 0, 0, 0.3)',
        textAlign: 'center',
        textBaseline: 'middle',
    },
};
export const strokeLabelStyle = {
    none: {
        lineWidth: 1,
        strokeStyle: 'rgba(255, 255, 255, 0)',
    },
    stroke: {
        lineWidth: 4,
        strokeStyle: 'rgba(255, 255, 255, 0.5)',
    },
};
export function label(ctx, labelModel) {
    const { x, y, text, style, stroke, opacity, radian } = labelModel;
    if (style) {
        const styleObj = makeStyleObj(style, labelStyle);
        Object.keys(styleObj).forEach((key) => {
            ctx[key] =
                key === 'fillStyle' && isNumber(opacity) ? rgba(styleObj[key], opacity) : styleObj[key];
        });
    }
    ctx.save();
    if (radian) {
        ctx.translate(x, y);
        ctx.rotate(radian);
        ctx.translate(-x, -y);
    }
    if (stroke) {
        const strokeStyleObj = makeStyleObj(stroke, strokeLabelStyle);
        const strokeStyleKeys = Object.keys(strokeStyleObj);
        strokeStyleKeys.forEach((key) => {
            ctx[key] =
                key === 'strokeStyle' && isNumber(opacity)
                    ? rgba(strokeStyleObj[key], opacity)
                    : strokeStyleObj[key];
        });
        if (strokeStyleKeys.length) {
            ctx.strokeText(text, x, y);
        }
    }
    ctx.fillText(text, x, y);
    ctx.restore();
}
export function rectLabel(ctx, model) {
    const { x, y, style, text, width, height, borderRadius = 0, backgroundColor } = model;
    pathRect(ctx, {
        type: 'pathRect',
        x: x - width / 2,
        y: y - height / 2,
        width,
        height,
        radius: borderRadius,
        fill: backgroundColor,
        stroke: 'rgba(0, 0, 0, 0)',
    });
    label(ctx, {
        type: 'label',
        x,
        y,
        style,
        text,
    });
}
const textBubbleStyle = {
    shadow: {
        shadowColor: 'rgba(0, 0, 0, 0.3)',
        shadowOffsetY: 2,
        shadowBlur: 4,
    },
};
export function bubbleLabel(ctx, model) {
    const { x, y, width, height, radius = 0, points, direction, lineWidth = 1, fill = '#ffffff', stroke, bubbleStyle = null, labelStyle: textStyle, labelStrokeStyle, text, } = model;
    drawBubble(ctx, {
        x,
        y,
        radius,
        width,
        height,
        style: bubbleStyle,
        fill,
        stroke,
        lineWidth,
        direction,
        points,
    });
    if (text) {
        ctx.shadowColor = 'rgba(0, 0, 0, 0)';
        label(ctx, {
            type: 'label',
            x: x + width / 2,
            y: y + height / 2 + 1,
            text,
            style: textStyle,
            stroke: labelStrokeStyle,
        });
    }
}
function drawBubbleArrow(ctx, points) {
    if (!points.length) {
        return;
    }
    ctx.lineTo(points[0].x, points[0].y);
    ctx.lineTo(points[1].x, points[1].y);
    ctx.lineTo(points[2].x, points[2].y);
}
function drawBubble(ctx, model) {
    const { x, y, radius = 0, width, height, style, stroke: strokeStyle, fill, lineWidth = 1, points = [], direction = '', } = model;
    const right = x + width;
    const bottom = y + height;
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    if (direction === 'top') {
        drawBubbleArrow(ctx, points);
    }
    ctx.lineTo(right - radius, y);
    ctx.quadraticCurveTo(right, y, right, y + radius);
    if (direction === 'right') {
        drawBubbleArrow(ctx, points);
    }
    ctx.lineTo(right, y + height - radius);
    ctx.quadraticCurveTo(right, bottom, right - radius, bottom);
    if (direction === 'bottom') {
        drawBubbleArrow(ctx, points);
    }
    ctx.lineTo(x + radius, bottom);
    ctx.quadraticCurveTo(x, bottom, x, bottom - radius);
    if (direction === 'left') {
        drawBubbleArrow(ctx, points);
    }
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    if (style) {
        const styleObj = makeStyleObj(style, textBubbleStyle);
        Object.keys(styleObj).forEach((key) => {
            ctx[key] = styleObj[key];
        });
    }
    if (fill) {
        fillStyle(ctx, fill);
    }
    if (strokeStyle) {
        strokeWithOptions(ctx, { strokeStyle, lineWidth });
    }
}
