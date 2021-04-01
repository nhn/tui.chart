import Component from "./component";
import { calculateDegreeToRadian, getRadialPosition, DEGREE_360, DEGREE_NEGATIVE_90, calculateValidAngle, } from "../helpers/sector";
import { getTitleFontString } from "../helpers/style";
import { includes } from "../helpers/utils";
import { isNoData } from "../helpers/validation";
const RECT_SIZE = 4;
const HALF_TICK = 5;
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
        this.models = {
            verticalAxisLabel: [],
            circularAxisLabel: [],
            dot: [],
            line: [],
            tick: [],
        };
    }
    initialize(initParam) {
        var _a, _b;
        this.type = 'axis';
        this.name = (_b = (_a = initParam) === null || _a === void 0 ? void 0 : _a.name, (_b !== null && _b !== void 0 ? _b : 'radial'));
    }
    render({ layout, radialAxes, theme, series }) {
        this.isShow = !isNoData(series);
        this.rect = layout.plot;
        if (!radialAxes) {
            return;
        }
        this.circularAxisTheme = theme.circularAxis;
        const { circularAxis, verticalAxis } = radialAxes;
        if (verticalAxis) {
            this.verticalAxisTheme = theme.verticalAxis;
            this.models.verticalAxisLabel = this.renderVerticalAxisLabel(verticalAxis);
        }
        this.models.circularAxisLabel = this.renderCircularAxisLabel(circularAxis);
        if (this.name === 'gauge') {
            this.models.line = this.renderArcLine(circularAxis);
            this.models.tick = this.renderTick(circularAxis);
        }
        else {
            this.models.dot = this.renderDotModel(circularAxis);
        }
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
        const { radius: { ranges, outer }, label: { labels, interval, maxWidth, maxHeight, margin, align }, angle: { start }, pointOnColumn, centerX, centerY, tickDistance, } = verticalAxis;
        const labelAdjustment = pointOnColumn ? tickDistance / 2 : 0;
        const font = getTitleFontString(this.verticalAxisTheme.label);
        const { visible: textBubbleVisible, backgroundColor, borderRadius, borderColor, borderWidth, paddingX, paddingY, } = this.verticalAxisTheme.label.textBubble;
        const labelPaddingX = textBubbleVisible ? paddingX : 0;
        const labelPaddingY = textBubbleVisible ? paddingY : 0;
        const width = maxWidth + labelPaddingX * 2 - margin;
        const height = maxHeight + labelPaddingY * 2;
        const fontColor = this.verticalAxisTheme.label.color;
        return ranges.reduce((acc, radius, index) => {
            const { x, y } = getRadialPosition(centerX, centerY, radius - labelAdjustment, calculateDegreeToRadian(start));
            const needRender = hasNeedRender(index, pointOnColumn, interval, radius, outer);
            let posX = x + margin;
            let labelPosX = x + margin + labelPaddingX;
            if (align === 'center') {
                posX = x - margin - width / 2;
                labelPosX = x - margin;
            }
            else if (includes(['right', 'end'], align)) {
                posX = x - margin - width;
                labelPosX = x - margin - labelPaddingX;
            }
            return needRender
                ? [
                    ...acc,
                    {
                        type: 'bubbleLabel',
                        rotationPosition: { x, y },
                        radian: calculateDegreeToRadian(start, 0),
                        bubble: {
                            x: posX,
                            y: y - height / 2,
                            width,
                            height,
                            align,
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
                            style: [{ font, fillStyle: fontColor, textAlign: align, textBaseline: 'middle' }],
                        },
                    },
                ]
                : acc;
        }, []);
    }
    renderDotModel(circularAxis) {
        const { angle: { central, drawingStart }, label: { labels, interval }, radius: { outer }, centerX, centerY, clockwise, } = circularAxis;
        const { dotColor } = this.circularAxisTheme;
        return labels.reduce((acc, cur, index) => {
            const startDegree = drawingStart + central * index * (clockwise ? 1 : -1);
            const { x, y } = getRadialPosition(centerX, centerY, outer, calculateDegreeToRadian(calculateValidAngle(startDegree)));
            return index % interval === 0
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
        const { centerX, centerY, clockwise, label: { labels, interval, margin, maxHeight }, angle: { drawingStart, central }, radius: { outer }, } = circularAxis;
        const radius = outer + (margin + maxHeight / 2) * (this.name === 'gauge' ? -1 : 1);
        const labelTheme = this.circularAxisTheme.label;
        const font = getTitleFontString(labelTheme);
        const degree = central * (clockwise ? 1 : -1);
        return labels.reduce((acc, text, index) => {
            const startDegree = drawingStart + degree * index;
            const validStartAngle = calculateValidAngle(startDegree);
            return index % interval === 0
                ? [
                    ...acc,
                    Object.assign({ type: 'label', style: [
                            { textAlign: 'center', textBaseline: 'middle', font, fillStyle: labelTheme.color },
                        ], text }, getRadialPosition(centerX, centerY, radius, calculateDegreeToRadian(validStartAngle))),
                ]
                : acc;
        }, []);
    }
    renderTick(circularAxis) {
        const { centerX, centerY, tickInterval, clockwise, angle: { central, drawingStart }, label: { labels }, radius: { outer }, } = circularAxis;
        const { strokeStyle, lineWidth } = this.circularAxisTheme.tick;
        return labels.reduce((acc, cur, index) => {
            const startDegree = drawingStart + central * index * (clockwise ? 1 : -1);
            const { x, y } = getRadialPosition(centerX, centerY, outer - HALF_TICK, calculateDegreeToRadian(calculateValidAngle(startDegree)));
            const { x: x2, y: y2 } = getRadialPosition(centerX, centerY, outer + HALF_TICK, calculateDegreeToRadian(calculateValidAngle(startDegree)));
            return index % tickInterval === 0
                ? [
                    ...acc,
                    {
                        type: 'line',
                        lineWidth,
                        strokeStyle,
                        x,
                        y,
                        x2,
                        y2,
                    },
                ]
                : acc;
        }, []);
    }
    renderArcLine(circularAxis) {
        const { centerX, centerY, clockwise, angle: { start, end, total }, radius: { outer }, } = circularAxis;
        const { strokeStyle, lineWidth } = this.circularAxisTheme;
        return total === DEGREE_360
            ? [
                {
                    type: 'circle',
                    x: centerX,
                    y: centerY,
                    radius: outer,
                    borderWidth: lineWidth,
                    borderColor: strokeStyle,
                    color: 'rgba(0, 0, 0, 0)',
                },
            ]
            : [
                {
                    type: 'arc',
                    borderWidth: lineWidth,
                    borderColor: strokeStyle,
                    x: centerX,
                    y: centerY,
                    angle: { start, end },
                    drawingStartAngle: DEGREE_NEGATIVE_90,
                    radius: outer,
                    clockwise,
                },
            ];
    }
}
