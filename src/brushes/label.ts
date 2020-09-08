import { LabelModel } from '@t/components/axis';
import { makeStyleObj } from '@src/helpers/style';
import { isNumber } from '@src/helpers/utils';
import { rgba } from '@src/helpers/color';

export const DEFAULT_LABEL_TEXT = 'normal 11px Arial';
export const TITLE_TEXT = '100 18px Arial';
const AXIS_TITLE_TEXT = '700 11px Arial';

export type LabelStyleName =
  | 'default'
  | 'title'
  | 'axisTitle'
  | 'stackTotal'
  | 'sector'
  | 'pieSeriesName'
  | 'treemapSeriesName';
export type StrokeLabelStyleName = 'none' | 'stroke';

export interface LabelStyle {
  font?: string;
  fillStyle?: string;
  textAlign?: CanvasTextAlign;
  textBaseline?: CanvasTextBaseline;
}

export type StrokeLabelStyle = {
  lineWidth?: string;
  strokeStyle?: string;
  shadowColor?: string;
  shadowBlur?: number;
};

export const labelStyle = {
  default: {
    font: DEFAULT_LABEL_TEXT,
    fillStyle: '#333333',
    textAlign: 'left',
    textBaseline: 'middle',
  },
  title: {
    font: TITLE_TEXT,
    fillStyle: '#333333',
    textBaseline: 'top',
  },
  axisTitle: {
    font: AXIS_TITLE_TEXT,
    fillStyle: '#bbbbbb',
    textBaseline: 'top',
  },
  stackTotal: {
    font: '600 11px Arial',
    fillStyle: '#333333',
    textBaseline: 'middle',
  },
  sector: {
    font: '100 15px Arial',
    fillStyle: '#333333',
    textAlign: 'center',
    textBaseline: 'middle',
  },
  pieSeriesName: {
    font: '400 11px Arial',
    fillStyle: '#333333',
    textAlign: 'center',
    textBaseline: 'middle',
  },
  treemapSeriesName: {
    font: '400 11px Arial',
    fillStyle: '#ffffff',
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

export function label(ctx: CanvasRenderingContext2D, labelModel: LabelModel) {
  const { x, y, text, style, stroke, opacity } = labelModel;

  if (style) {
    const styleObj = makeStyleObj<LabelStyle, LabelStyleName>(style, labelStyle);

    Object.keys(styleObj).forEach((key) => {
      ctx[key] =
        key === 'fillStyle' && isNumber(opacity) ? rgba(styleObj[key]!, opacity) : styleObj[key];
    });
  }

  if (stroke) {
    const strokeStyleObj = makeStyleObj<StrokeLabelStyle, StrokeLabelStyleName>(
      stroke,
      strokeLabelStyle
    );

    Object.keys(strokeStyleObj).forEach((key) => {
      ctx[key] =
        key === 'strokeStyle' && isNumber(opacity)
          ? rgba(strokeStyleObj[key]!, opacity)
          : strokeStyleObj[key];
    });

    ctx.strokeText(text, x, y);
  }

  ctx.fillText(text, x, y);
}
