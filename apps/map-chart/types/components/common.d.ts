import { Rect } from '@t/store';

interface RectStyle {
  thickness?: number;
  color?: string;
  borderColor?: string;
}

interface RectModel extends Rect {
  type: 'rect';
  style?: RectStyle;
}

export interface RectResponderModel extends RectModel {
  responderType: 'rect';
}
