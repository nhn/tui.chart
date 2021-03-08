import { Point, Rect } from '../options';
import { Nullable, StyleProp, RectStyle } from './series';
import {
  StrokeLabelStyleName,
  StrokeLabelStyle,
  LabelStyleName,
  LabelStyle,
  PathRectStyleName,
} from '../brushes';

export type LabelModel = {
  type: 'label';
  style?: StyleProp<LabelStyle, LabelStyleName>;
  stroke?: StyleProp<StrokeLabelStyle, StrokeLabelStyleName>;
  text: string;
  opacity?: number;
  radian?: number;
  rotationPosition?: Point;
} & Point;

export type TickModel = {
  type: 'tick';
  isYAxis: boolean;
  tickSize: number;
  strokeStyle: string;
  lineWidth: number;
} & Point;

export type LineModel = {
  type: 'line';
  x2: number;
  y2: number;
  strokeStyle?: string;
  lineWidth?: number;
  dashSegments?: number[];
  name?: string;
} & Point;

export type AxisModels = {
  label: LabelModel[];
  tick: TickModel[];
  axisLine: LineModel[];
};

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
  radian?: number;
  direction?: ArrowDirection;
} & Nullable<Partial<Arrow>>;

export type BubbleLabelModel = {
  type: 'bubbleLabel';
  radian?: number;
  rotationPosition?: Point;
  bubble: BubbleInfo;
  label: Point & {
    text?: string;
    strokeStyle?: string;
    style?: StyleProp<LabelStyle, LabelStyleName>;
  };
};
