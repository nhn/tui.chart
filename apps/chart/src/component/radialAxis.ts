import Component from './component';
import { ChartState, Options } from '@t/store/store';
import { calculateDegreeToRadian, getRadialPosition } from '@src/helpers/sector';
import { RectLabelModel, LabelModel } from '@t/components/axis';
import { RadialAxisModels } from '@t/components/radialAxis';
import { RectModel } from '@t/components/series';
import { AxisTheme, RadialAxisTheme } from '@t/theme';
import { getTitleFontString } from '@src/helpers/style';
import { getRadialLabelAlign } from '@src/helpers/dataLabels';

const padding = { X: 5, Y: 1 };
const RADIAL_AXIS_LABEL_RECT_BORDER_RADIUS = 7;
const RECT_SIZE = 4;

export default class RadialAxis extends Component {
  models: RadialAxisModels = { dot: [], yAxisLabel: [], circularAxisLabel: [] };

  yAxisTheme!: Required<AxisTheme>;

  circularAxisTheme!: Required<RadialAxisTheme>;

  initialize() {
    this.type = 'axis';
    this.name = 'radial';
  }

  render({ layout, radialAxes, theme, series }: ChartState<Options>) {
    this.rect = layout.plot;

    if (!radialAxes) {
      return;
    }

    this.yAxisTheme = theme.yAxis as Required<AxisTheme>;
    this.circularAxisTheme = theme.radialAxis as Required<RadialAxisTheme>;

    // @TODO: 테마적용 필요
    const align = series.radar ? 'center' : 'end';
    // const borderRadius = series.radar ? RADIAL_AXIS_LABEL_RECT_BORDER_RADIUS : 0;
    // const backgroundColor = series.radar ? '#f3f3f3' : 'rgba(0, 0, 0, 0)';

    this.models.yAxisLabel = this.renderYAxisLabel(radialAxes.yAxis, align);
    this.models.dot = this.renderDotModel(radialAxes.circularAxis);
    this.models.circularAxisLabel = this.renderCircularAxisLabel(radialAxes.circularAxis);
  }

  renderYAxisLabel(yAxis: any, align = 'center'): RectLabelModel[] {
    // @TODO: yAxis type
    const {
      radiusRanges,
      pointOnColumn,
      centerX,
      centerY,
      labels,
      tickDistance,
      labelInterval,
      axisSize,
      maxLabelWidth,
      maxLabelHeight,
      labelMargin,
    } = yAxis;
    const labelAdjustment = pointOnColumn ? tickDistance / 2 : 0;

    const font = getTitleFontString(this.yAxisTheme.label);
    const {
      visible: textBubbleVisible,
      backgroundColor,
      borderRadius,
      paddingX,
      paddingY,
    } = this.yAxisTheme.label.textBubble!;
    const width = maxLabelWidth + (textBubbleVisible ? paddingX! * 2 : 0);
    const height = maxLabelHeight + (textBubbleVisible ? paddingY! * 2 : 0);
    const fontColor = this.yAxisTheme.label.color;

    return radiusRanges.reduce((acc, radius, index) => {
      const { x, y } = getRadialPosition(centerX, centerY, radius, calculateDegreeToRadian(0));
      const needRender =
        !pointOnColumn && index === 0
          ? false
          : !(index % labelInterval) &&
            ((pointOnColumn && radius <= axisSize) || (!pointOnColumn && radius < axisSize));

      return needRender
        ? [
            ...acc,
            {
              type: 'rectLabel',
              text: labels[index],
              x: (align === 'end' ? x - width / 2 : x) - labelMargin,
              y: y + labelAdjustment,
              width,
              height,
              borderRadius,
              backgroundColor,
              style: [{ textAlign: 'center', textBaseline: 'middle', font, fillStyle: fontColor }],
            },
          ]
        : acc;
    }, []);
  }

  renderDotModel(circularAxis: any): RectModel[] {
    // @TODO: circularAxis type
    const { degree, centerX, centerY, labels, axisSize, labelInterval } = circularAxis;
    const { dotColor } = this.circularAxisTheme;

    return labels.reduce((acc, _, index) => {
      const { x, y } = getRadialPosition(
        centerX,
        centerY,
        axisSize,
        calculateDegreeToRadian(degree * index)
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

  renderCircularAxisLabel(circularAxis: any): LabelModel[] {
    // @TODO: circularAxis type
    const {
      degree,
      centerX,
      centerY,
      labels,
      axisSize,
      labelInterval,
      totalAngle,
      drawingStartAngle,
      labelMargin,
    } = circularAxis;
    const radius = axisSize + labelMargin;
    const font = getTitleFontString(this.circularAxisTheme.label);

    return labels.reduce((acc, text, index) => {
      const degreeRange = {
        start: degree * index,
        end: degree * (index + 1),
      };
      const textAlign = getRadialLabelAlign(
        {
          totalAngle,
          degree: degreeRange,
          drawingStartAngle,
        },
        'outer',
        false
      );

      return index % labelInterval === 0
        ? [
            ...acc,
            {
              type: 'label',
              style: [{ textAlign, font, fillStyle: this.circularAxisTheme.label.color }],
              text,
              ...getRadialPosition(
                centerX,
                centerY,
                radius,
                calculateDegreeToRadian(degree * index)
              ),
            },
          ]
        : acc;
    }, []);
  }
}
