import { label, StrokeLabelStyle, LabelStyle, StrokeLabelStyleName } from '@src/brushes/label';
import { DataLabelModel, DataLabelType } from '@t/components/dataLabels';

function getStyleDefaultName(
  type: DataLabelType
): { styleDefault: LabelStyle; strokeStyleDefault: StrokeLabelStyleName } {
  const labelStyleDefaultMap = {
    stackTotal: 'stackTotal',
    sector: 'sector',
    pieSeriesName: 'pieSeriesName',
    treemapSeriesName: 'treemapSeriesName',
  };

  const styleDefaultWithType = labelStyleDefaultMap[type];

  return {
    styleDefault: styleDefaultWithType ? styleDefaultWithType : 'default',
    strokeStyleDefault: styleDefaultWithType ? 'none' : 'stroke',
  };
}

export function dataLabel(ctx: CanvasRenderingContext2D, model: DataLabelModel) {
  const {
    dataLabelType,
    x,
    y,
    text,
    textAlign,
    textBaseline,
    style,
    opacity,
    defaultColor,
  } = model;
  const textStyle: LabelStyle = { textAlign, textBaseline };
  const textStrokeStyle: StrokeLabelStyle = {};

  if (defaultColor) {
    textStyle.fillStyle = defaultColor;
  }

  if (style) {
    Object.keys(style).forEach((key) => {
      const styleValue = style[key];

      if (!styleValue) {
        return;
      }

      switch (key) {
        case 'font':
          textStyle.font = styleValue;
          break;
        case 'color':
          textStyle.fillStyle = styleValue;
          break;
        case 'textStrokeColor':
          textStrokeStyle.strokeStyle = styleValue;
          break;
      }
    });
  }

  const { styleDefault, strokeStyleDefault } = getStyleDefaultName(dataLabelType);

  label(ctx, {
    type: 'label',
    x,
    y,
    text,
    style: [styleDefault, textStyle],
    stroke: [strokeStyleDefault, textStrokeStyle],
    opacity,
  });
}
