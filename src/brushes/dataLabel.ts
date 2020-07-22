import {
  label,
  StrokeLabelStyle,
  LabelStyle,
  StrokeLabelStyleName,
  LabelStyleName,
} from '@src/brushes/label';
import { DataLabelModel, DataLabelType } from '@t/components/dataLabels';

function getStyleDefaultName(type: DataLabelType) {
  let styleDefault: LabelStyleName = 'default';
  let strokeStyleDefault: StrokeLabelStyleName = 'stroke';

  if (type === 'stackTotal') {
    styleDefault = 'stackTotal';
    strokeStyleDefault = 'none';
  } else if (type === 'sector') {
    styleDefault = 'sector';
    strokeStyleDefault = 'none';
  } else if (type === 'pieSeriesName') {
    styleDefault = 'pieSeriesName';
    strokeStyleDefault = 'none';
  }

  return {
    styleDefault,
    strokeStyleDefault,
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
