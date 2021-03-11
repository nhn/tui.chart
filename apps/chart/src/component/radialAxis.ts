import Component from './component';
import { ChartState, Options, CircularAxisData, VerticalAxisData } from '@t/store/store';
import {
  calculateDegreeToRadian,
  getRadialPosition,
  DEGREE_360,
  DEGREE_NEGATIVE_90,
} from '@src/helpers/sector';
import { RadialAxisModels, ArcModel } from '@t/components/radialAxis';
import { RectModel, CircleModel } from '@t/components/series';
import { CircularAxisTheme, VerticalAxisTheme, TextBubbleTheme } from '@t/theme';
import { getTitleFontString } from '@src/helpers/style';
import { includes } from '@src/helpers/utils';
import { BubbleLabelModel, LabelModel, LineModel } from '@t/components/axis';

const RECT_SIZE = 4;
const HALF_TICK = 5;

function hasNeedRender(
  index: number,
  pointOnColumn: boolean,
  labelInterval: number,
  innerRadius: number,
  outerRadius: number
) {
  return !pointOnColumn && index === 0
    ? false
    : !(index % labelInterval) &&
        ((pointOnColumn && innerRadius <= outerRadius) ||
          (!pointOnColumn && innerRadius < outerRadius));
}

function getValidDegree(degree: number) {
  return degree > DEGREE_360 ? degree - DEGREE_360 : degree;
}
export default class RadialAxis extends Component {
  models: RadialAxisModels = {
    verticalAxisLabel: [],
    circularAxisLabel: [],
    dot: [],
    line: [],
    tick: [],
  };

  verticalAxisTheme!: Required<VerticalAxisTheme>;

  circularAxisTheme!: Required<CircularAxisTheme>;

  initialize(initParam: { name: 'radial' | 'gauge' }) {
    this.type = 'axis';
    this.name = initParam?.name ?? 'radial';
  }

  render({ layout, radialAxes, theme }: ChartState<Options>) {
    this.rect = layout.plot;

    if (!radialAxes) {
      return;
    }

    this.circularAxisTheme = theme.circularAxis as Required<CircularAxisTheme>;

    const { circularAxis, verticalAxis } = radialAxes;

    if (verticalAxis) {
      this.verticalAxisTheme = theme.verticalAxis as Required<VerticalAxisTheme>;
      this.models.verticalAxisLabel = this.renderVerticalAxisLabel(verticalAxis);
    }

    this.models.circularAxisLabel = this.renderCircularAxisLabel(circularAxis);

    if (this.name === 'gauge') {
      this.models.line = this.renderArcLine(circularAxis);
      this.models.tick = this.renderTick(circularAxis);
    } else {
      this.models.dot = this.renderDotModel(circularAxis);
    }
  }

  getBubbleShadowStyle() {
    const {
      visible,
      shadowColor,
      shadowOffsetX,
      shadowOffsetY,
      shadowBlur,
    } = this.verticalAxisTheme.label.textBubble!;

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

  renderVerticalAxisLabel(verticalAxis: VerticalAxisData): BubbleLabelModel[] {
    const {
      radiusRanges,
      pointOnColumn,
      centerX,
      centerY,
      labels,
      tickDistance,
      labelInterval,
      maxLabelWidth,
      maxLabelHeight,
      labelMargin,
      labelAlign: textAlign,
      outerRadius,
      startAngle,
    } = verticalAxis;
    const labelAdjustment = pointOnColumn ? tickDistance / 2 : 0;
    const font = getTitleFontString(this.verticalAxisTheme.label);
    const {
      visible: textBubbleVisible,
      backgroundColor,
      borderRadius,
      borderColor,
      borderWidth,
      paddingX,
      paddingY,
    } = this.verticalAxisTheme.label.textBubble as Required<Omit<TextBubbleTheme, 'arrow'>>;

    const labelPaddingX = textBubbleVisible ? paddingX : 0;
    const labelPaddingY = textBubbleVisible ? paddingY : 0;
    const width = maxLabelWidth + labelPaddingX * 2 - labelMargin;
    const height = maxLabelHeight + labelPaddingY * 2;
    const fontColor = this.verticalAxisTheme.label.color;

    return radiusRanges.reduce<BubbleLabelModel[]>((acc, radius, index) => {
      const { x, y } = getRadialPosition(
        centerX,
        centerY,
        radius - labelAdjustment,
        calculateDegreeToRadian(startAngle)
      );
      const needRender = hasNeedRender(index, pointOnColumn, labelInterval, radius, outerRadius);
      let posX = x + labelMargin;
      let labelPosX = x + labelMargin + labelPaddingX;

      if (textAlign === 'center') {
        posX = x - labelMargin - width / 2;
        labelPosX = x - labelMargin;
      } else if (includes(['right', 'end'], textAlign)) {
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

  renderDotModel(circularAxis: CircularAxisData): RectModel[] {
    const {
      degree,
      centerX,
      centerY,
      labels,
      labelInterval,
      outerRadius,
      drawingStartAngle,
      clockwise,
    } = circularAxis;
    const { dotColor } = this.circularAxisTheme;

    return labels.reduce<RectModel[]>((acc, cur, index) => {
      const startDegree = drawingStartAngle + degree * index * (clockwise ? 1 : -1);
      const { x, y } = getRadialPosition(
        centerX,
        centerY,
        outerRadius,
        calculateDegreeToRadian(getValidDegree(startDegree))
      );

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

  renderCircularAxisLabel(circularAxis: CircularAxisData): LabelModel[] {
    const {
      centerX,
      centerY,
      labels,
      labelInterval,
      drawingStartAngle,
      labelMargin,
      clockwise,
      outerRadius,
      maxLabelHeight,
    } = circularAxis;
    const radius =
      outerRadius + (labelMargin + maxLabelHeight / 2) * (this.name === 'gauge' ? -1 : 1);
    const labelTheme = this.circularAxisTheme.label;
    const font = getTitleFontString(labelTheme);
    const degree = circularAxis.degree * (clockwise ? 1 : -1);

    return labels.reduce<LabelModel[]>((acc, text, index) => {
      const startDegree = drawingStartAngle + degree * index;
      const validStartAngle = getValidDegree(startDegree);

      return index % labelInterval === 0
        ? [
            ...acc,
            {
              type: 'label',
              style: [
                { textAlign: 'center', textBaseline: 'middle', font, fillStyle: labelTheme.color },
              ],
              text,
              ...getRadialPosition(
                centerX,
                centerY,
                radius,
                calculateDegreeToRadian(validStartAngle)
              ),
            },
          ]
        : acc;
    }, []);
  }

  renderTick(circularAxis: CircularAxisData): LineModel[] {
    const {
      degree,
      centerX,
      centerY,
      labels,
      tickInterval,
      outerRadius,
      drawingStartAngle,
      clockwise,
    } = circularAxis;

    const { strokeStyle, lineWidth } = this.circularAxisTheme.tick;

    return labels.reduce<LineModel[]>((acc, cur, index) => {
      const startDegree = drawingStartAngle + degree * index * (clockwise ? 1 : -1);
      const { x, y } = getRadialPosition(
        centerX,
        centerY,
        outerRadius - HALF_TICK,
        calculateDegreeToRadian(getValidDegree(startDegree))
      );

      const result = getRadialPosition(
        centerX,
        centerY,
        outerRadius + HALF_TICK,
        calculateDegreeToRadian(getValidDegree(startDegree))
      );

      return index % tickInterval === 0
        ? [
            ...acc,
            {
              type: 'line',
              lineWidth,
              strokeStyle,
              x,
              y,
              x2: result.x,
              y2: result.y,
            },
          ]
        : acc;
    }, []);
  }

  renderArcLine(circularAxis: CircularAxisData): ArcModel[] | CircleModel[] {
    const {
      centerX,
      centerY,
      outerRadius,
      startAngle,
      endAngle,
      clockwise,
      totalAngle,
    } = circularAxis;
    const { strokeStyle, lineWidth } = this.circularAxisTheme;

    return totalAngle === DEGREE_360
      ? [
          {
            type: 'circle',
            x: centerX,
            y: centerY,
            radius: outerRadius,
            borderWidth: lineWidth,
            borderColor: strokeStyle,
            color: 'rgba(0, 0, 0, 0)',
          },
        ]
      : [outerRadius].map<ArcModel>((radius) => ({
          type: 'arc',
          borderWidth: lineWidth,
          borderColor: strokeStyle,
          x: centerX,
          y: centerY,
          angle: { start: startAngle, end: endAngle },
          drawingStartAngle: DEGREE_NEGATIVE_90,
          radius,
          clockwise,
        }));
  }
}
