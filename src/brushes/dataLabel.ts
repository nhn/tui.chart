import {
  label,
  StrokeLabelStyle,
  LabelStyle,
  StrokeLabelStyleName,
  LabelStyleName,
} from '@src/brushes/label';
import { DataLabelModel } from '@t/components/dataLabels';
import { isNumber } from '@src/helpers/utils';

export function dataLabel(ctx: CanvasRenderingContext2D, model: DataLabelModel) {
  const {
    dataLabelType,
    x,
    y,
    text,
    textAlign,
    textBaseline,
    font,
    fillStyle,
    strokeStyle,
    opacity,
  } = model;
  const textStyle: LabelStyle = { textAlign, textBaseline };
  const textStrokeStyle: StrokeLabelStyle = {};

  if (font) {
    textStyle.font = font;
  }

  if (fillStyle) {
    textStyle.fillStyle = fillStyle;
  }

  if (strokeStyle) {
    textStrokeStyle.strokeStyle = strokeStyle;
  }

  let styleDefault: LabelStyleName, strokeStyleDefault: StrokeLabelStyleName;

  switch (dataLabelType) {
    case 'stackTotal':
      styleDefault = 'stackTotal';
      strokeStyleDefault = 'none';
      break;
    case 'sector':
      styleDefault = 'sector';
      strokeStyleDefault = 'none';
      break;
    case 'pieSeriesName':
      styleDefault = 'pieSeriesName';
      strokeStyleDefault = 'none';
      break;
    default:
      styleDefault = 'default';
      strokeStyleDefault = 'stroke';
  }

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
