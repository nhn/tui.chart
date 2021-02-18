import Component from "./component";
import { calculateDegreeToRadian, getRadialPosition, getRadialLabelAlign, } from "../helpers/sector";
import { getTitleFontString } from "../helpers/style";
import { includes } from "../helpers/utils";
const RECT_SIZE = 4;
function hasNeedRender(index, pointOnColumn, labelInterval, innerRadius, outerRadius) {
    return !pointOnColumn && index === 0
        ? false
        : !(index % labelInterval) &&
            ((pointOnColumn && innerRadius <= outerRadius) ||
                (!pointOnColumn && innerRadius < outerRadius));
}
export default class RadialAxis extends Component {
    constructor() {
        super(...arguments);
        this.models = { dot: [], verticalAxisLabel: [], circularAxisLabel: [] };
    }
    initialize() {
        this.type = 'axis';
        this.name = 'radial';
    }
    render({ layout, radialAxes, theme }) {
        this.rect = layout.plot;
        if (!radialAxes) {
            return;
        }
        this.verticalAxisTheme = theme.verticalAxis;
        this.circularAxisTheme = theme.circularAxis;
        this.models.verticalAxisLabel = this.renderVerticalAxisLabel(radialAxes.verticalAxis);
        this.models.dot = this.renderDotModel(radialAxes.circularAxis);
        this.models.circularAxisLabel = this.renderCircularAxisLabel(radialAxes.circularAxis);
    }
    getBubbleShadowStyle() {
        const { visible, shadowColor, shadowOffsetX, shadowOffsetY, shadowBlur, } = this.verticalAxisTheme.label.textBubble;
        return visible && shadowColor
            ? [
                {
                    shadowColor,
                    shadowOffsetX,
                    shadowOffsetY,
                    shadowBlur,
                },
            ]
            : null;
    }
    renderVerticalAxisLabel(verticalAxis) {
        const { radiusRanges, pointOnColumn, centerX, centerY, labels, tickDistance, labelInterval, maxLabelWidth, maxLabelHeight, labelMargin, labelAlign: textAlign, outerRadius, startAngle, } = verticalAxis;
        const labelAdjustment = pointOnColumn ? tickDistance / 2 : 0;
        const font = getTitleFontString(this.verticalAxisTheme.label);
        const { visible: textBubbleVisible, backgroundColor, borderRadius, borderColor, borderWidth, paddingX, paddingY, } = this.verticalAxisTheme.label.textBubble;
        const labelPaddingX = textBubbleVisible ? paddingX : 0;
        const labelPaddingY = textBubbleVisible ? paddingY : 0;
        const width = maxLabelWidth + labelPaddingX * 2 - labelMargin;
        const height = maxLabelHeight + labelPaddingY * 2;
        const fontColor = this.verticalAxisTheme.label.color;
        return radiusRanges.reduce((acc, radius, index) => {
            const { x, y } = getRadialPosition(centerX, centerY, radius - labelAdjustment, calculateDegreeToRadian(startAngle));
            const needRender = hasNeedRender(index, pointOnColumn, labelInterval, radius, outerRadius);
            let posX = x + labelMargin;
            let labelPosX = x + labelMargin + labelPaddingX;
            if (textAlign === 'center') {
                posX = x - labelMargin - width / 2;
                labelPosX = x - labelMargin;
            }
            else if (includes(['right', 'end'], textAlign)) {
                posX = x - labelMargin - width;
                labelPosX = x - labelMargin - labelPaddingX;
            }
            return needRender
                ? [
                    ...acc,
                    {
                        type: 'bubbleLabel',
                        rotationPosition: { x, y },
                        radian: calculateDegreeToRadian(startAngle, 0),
                        bubble: {
                            x: posX,
                            y: y - height / 2,
                            width,
                            height,
                            align: textAlign,
                            radius: borderRadius,
                            fill: backgroundColor,
                            lineWidth: borderWidth,
                            strokeStyle: borderColor,
                            style: this.getBubbleShadowStyle(),
                        },
                        label: {
                            text: labels[index],
                            x: labelPosX,
                            y,
                            style: [{ font, fillStyle: fontColor, textAlign, textBaseline: 'middle' }],
                        },
                    },
                ]
                : acc;
        }, []);
    }
    renderDotModel(circularAxis) {
        const { degree, centerX, centerY, labels, labelInterval, outerRadius, drawingStartAngle, clockwise, } = circularAxis;
        const { dotColor } = this.circularAxisTheme;
        return labels.reduce((acc, cur, index) => {
            const startDegree = drawingStartAngle + degree * index * (clockwise ? 1 : -1);
            const { x, y } = getRadialPosition(centerX, centerY, outerRadius, calculateDegreeToRadian(startDegree));
            return index % labelInterval === 0
                ? [
                    ...acc,
                    {
                        type: 'rect',
                        color: dotColor,
                        width: RECT_SIZE,
                        height: RECT_SIZE,
                        x: x - RECT_SIZE / 2,
                        y: y - RECT_SIZE / 2,
                    },
                ]
                : acc;
        }, []);
    }
    renderCircularAxisLabel(circularAxis) {
        const { centerX, centerY, labels, labelInterval, totalAngle, drawingStartAngle, labelMargin, clockwise, outerRadius, } = circularAxis;
        const radius = outerRadius + labelMargin;
        const labelTheme = this.circularAxisTheme.label;
        const font = getTitleFontString(labelTheme);
        const degree = circularAxis.degree * (clockwise ? 1 : -1);
        return labels.reduce((acc, text, index) => {
            const startDegree = drawingStartAngle + degree * index;
            const endDegree = drawingStartAngle + degree * (index + 1);
            const degreeRange = {
                start: startDegree,
                end: endDegree,
            };
            const textAlign = getRadialLabelAlign({
                totalAngle,
                degree: degreeRange,
                drawingStartAngle: 0,
            }, 'outer', false);
            return index % labelInterval === 0
                ? [
                    ...acc,
                    Object.assign({ type: 'label', style: [{ textAlign, font, fillStyle: labelTheme.color }], text }, getRadialPosition(centerX, centerY, radius, calculateDegreeToRadian(startDegree))),
                ]
                : acc;
        }, []);
    }
}
