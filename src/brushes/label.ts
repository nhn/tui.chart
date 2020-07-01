import { LabelModel } from '@t/components/axis';
import { makeStyleObj } from '@src/helpers/style';

const DEFAULT_LABEL_TEXT = 'normal 11px Arial';
export const TITLE_TEXT = '100 18px Arial';
const AXIS_TITLE_TEXT = '700 11px Arial';

export type LabelStyleName = 'default' | 'title' | 'axisTitle';
export type StrokeLabelStyleName = 'default' | 'stroke';

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
    textBaseline: 'top',
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
};

export const strokeLabelStyle = {
  default: {
    lineWidth: 4,
    strokeStyle: 'rgba(255, 255, 255, 0.5)',
  },
};

export function label(ctx: CanvasRenderingContext2D, labelModel: LabelModel) {
  const { x, y, text, style, stroke } = labelModel;

  if (style) {
    const styleObj = makeStyleObj<LabelStyle, LabelStyleName>(style, labelStyle);

    Object.keys(styleObj).forEach((key) => {
      ctx[key] = styleObj[key];
    });
  }

  if (stroke) {
    const strokeStyleObj = makeStyleObj<StrokeLabelStyle, StrokeLabelStyleName>(
      stroke,
      strokeLabelStyle
    );

    Object.keys(strokeStyleObj).forEach((key) => {
      ctx[key] = strokeStyleObj[key];
    });

    ctx.strokeText(text, x, y);
  }

  ctx.fillText(text, x, y);
}
