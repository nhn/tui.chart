import { Point, Rect } from '@t/options';
import { StyleProp, RectStyle, Nullable } from '@t/components/series';

export type PathRectStyleName = 'shadow';
export type BubbleArrowDirection = 'top' | 'right' | 'bottom' | 'left';
export type LabelStyleName = 'default' | 'title' | 'axisTitle';
export type StrokeLabelStyleName = 'none' | 'stroke';
export type StrokeLabelStyle = {
  lineWidth?: number;
  strokeStyle?: string;
  shadowColor?: string;
  shadowBlur?: number;
};

export interface LabelStyle {
  font?: string;
  fillStyle?: string;
  textAlign?: CanvasTextAlign;
  textBaseline?: CanvasTextBaseline;
}

export type LabelModel = {
  type: 'label';
  style?: StyleProp<LabelStyle, LabelStyleName>;
  stroke?: StyleProp<StrokeLabelStyle, StrokeLabelStyleName>;
  text: string;
  opacity?: number;
  radian?: number;
  rotationPosition?: Point;
} & Point;

export type ArrowDirection = 'top' | 'right' | 'bottom' | 'left';
type Arrow = {
  direction: ArrowDirection;
  points: Point[];
} & Point;

export type BubbleInfo = Rect & {
  fill: string;
  lineWidth?: number;
  strokeStyle?: string;
  radius?: number;
  style?: Nullable<StyleProp<RectStyle, PathRectStyleName>>;
  align?: string;
  radian?: number;
  direction?: ArrowDirection;
  textBaseline?: CanvasTextBaseline;
} & Nullable<Arrow>;

export type BubbleLabelModel = {
  type: 'bubbleLabel';
  radian?: number;
  bubble: BubbleInfo;
  label: Point & {
    text?: string;
    textAlign?: string;
    font?: string;
    color?: string;
    strokeStyle?: string;
    textBaseline?: CanvasTextBaseline;
  };
};
