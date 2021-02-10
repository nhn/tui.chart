import Component from './component';
import { ChartState, Options, RadialYAxisData, RadialAxisData } from '@t/store/store';
import {
  calculateDegreeToRadian,
  getRadialPosition,
  getRadialLabelAlign,
} from '@src/helpers/sector';
import { RadialAxisModels } from '@t/components/radialAxis';
import { RectModel } from '@t/components/series';
import { AxisTheme, RadialAxisTheme, TextBubbleTheme } from '@t/theme';
import { getTitleFontString } from '@src/helpers/style';
import { includes } from '@src/helpers/utils';
import { BubbleLabelModel, BubbleInfo, LabelModel } from '@t/brush/label';

const RECT_SIZE = 4;

export default class RadialAxis extends Component {
  models: RadialAxisModels = { dot: [], yAxisLabel: [], radialAxisLabel: [] };

  yAxisTheme!: Required<AxisTheme>;

  radialAxisTheme!: Required<RadialAxisTheme>;

  initialize() {
    this.type = 'axis';
    this.name = 'radial';
  }

  render({ layout, radialAxes, theme }: ChartState<Options>) {
    this.rect = layout.plot;

    if (!radialAxes) {
      return;
    }

    this.yAxisTheme = theme.yAxis as Required<AxisTheme>;
    this.radialAxisTheme = theme.radialAxis as Required<RadialAxisTheme>;

    this.models.yAxisLabel = this.renderYAxisLabel(radialAxes.yAxis);
    this.models.dot = this.renderDotModel(radialAxes.radialAxis);
    this.models.radialAxisLabel = this.renderRadialAxisLabel(radialAxes.radialAxis);
  }

  getBubbleShadowStyle() {
    const {
      visible,
      shadowColor,
      shadowOffsetX,
      shadowOffsetY,
      shadowBlur,
    } = this.yAxisTheme.label.textBubble!;

    return visible && shadowColor
      ? [
          {
            shadowColor,
            shadowOffsetX,
            shadowOffsetY,
            shadowBlur,
          },
        ]
      : [];
  }

  renderYAxisLabel(yAxis: RadialYAxisData): BubbleLabelModel[] {
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
    } = yAxis;
    const labelAdjustment = pointOnColumn ? tickDistance / 2 : 0;

    const font = getTitleFontString(this.yAxisTheme.label);
    const {
      visible: textBubbleVisible,
      backgroundColor,
      borderRadius,
      borderColor,
      borderWidth,
      paddingX,
      paddingY,
    } = this.yAxisTheme.label.textBubble as Required<Omit<TextBubbleTheme, 'arrow'>>;

    const labelPaddingX = textBubbleVisible ? paddingX : 0;
    const labelPaddingY = textBubbleVisible ? paddingY : 0;
    const width = maxLabelWidth + labelPaddingX * 2;
    const height = maxLabelHeight + labelPaddingY * 2;
    const fontColor = this.yAxisTheme.label.color;

    return radiusRanges.reduce<BubbleLabelModel[]>((acc, radius, index) => {
      const { x, y } = getRadialPosition(
        centerX,
        centerY,
        radius,
        calculateDegreeToRadian(startAngle)
      );
      const needRender =
        !pointOnColumn && index === 0
          ? false
          : !(index % labelInterval) &&
            ((pointOnColumn && radius <= outerRadius) || (!pointOnColumn && radius < outerRadius));

      let posX = x + labelMargin;
      const padding = startAngle > 0 && startAngle < 360 ? 20 : 0;
      let labelPosX = x + padding + labelMargin + labelPaddingX;

      if (textAlign === 'center') {
        posX = x - labelMargin - width / 2;
        labelPosX = x - labelMargin;
      } else if (includes(['right', 'end'], textAlign)) {
        posX = x - labelMargin - width;
        labelPosX = x - padding - labelMargin - labelPaddingX;
      }

      return needRender
        ? [
            ...acc,
            {
              type: 'bubbleLabel',
              radian: calculateDegreeToRadian(startAngle, 0),
              bubble: {
                x: posX,
                y: y + labelAdjustment - height / 2,
                width,
                height,
                radius: borderRadius,
                fill: backgroundColor,
                align: textAlign,
                lineWidth: borderWidth,
                strokeStyle: borderColor,
                style: this.getBubbleShadowStyle(),
              } as BubbleInfo,
              label: {
                text: labels[index],
                x: labelPosX,
                y: y + labelAdjustment,
                font: font,
                color: fontColor,
                textAlign,
              },
            },
          ]
        : acc;
    }, []);
  }

  renderDotModel(radialAxis: RadialAxisData): RectModel[] {
    const {
      degree,
      centerX,
      centerY,
      labels,
      labelInterval,
      outerRadius,
      drawingStartAngle,
      clockwise,
    } = radialAxis;
    const { dotColor } = this.radialAxisTheme;

    return labels.reduce<RectModel[]>((acc, cur, index) => {
      const startDegree = drawingStartAngle + degree * index * (clockwise ? 1 : -1);
      const { x, y } = getRadialPosition(
        centerX,
        centerY,
        outerRadius,
        calculateDegreeToRadian(startDegree)
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

  renderRadialAxisLabel(radialAxis: RadialAxisData): LabelModel[] {
    const {
      centerX,
      centerY,
      labels,
      labelInterval,
      totalAngle,
      drawingStartAngle,
      labelMargin,
      clockwise,
      outerRadius,
    } = radialAxis;
    const radius = outerRadius + labelMargin;
    const labelTheme = this.radialAxisTheme.label;
    const font = getTitleFontString(labelTheme);
    const degree = radialAxis.degree * (clockwise ? 1 : -1);

    return labels.reduce<LabelModel[]>((acc, text, index) => {
      const startDegree = drawingStartAngle + degree * index;
      const endDegree = drawingStartAngle + degree * (index + 1);
      const degreeRange = {
        start: startDegree,
        end: endDegree,
      };

      const textAlign = getRadialLabelAlign(
        {
          totalAngle,
          degree: degreeRange,
          drawingStartAngle: 0,
        },
        'outer',
        false
      );

      return index % labelInterval === 0
        ? [
            ...acc,
            {
              type: 'label',
              style: [{ textAlign, font, fillStyle: labelTheme.color }],
              text,
              ...getRadialPosition(centerX, centerY, radius, calculateDegreeToRadian(startDegree)),
            },
          ]
        : acc;
    }, []);
  }
}
