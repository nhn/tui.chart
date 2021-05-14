import { Rect } from '@t/store';

interface RectModel extends Rect {
  type: 'rect';
}

export interface RectResponderModel extends RectModel {
  responderType: 'rect';
}
