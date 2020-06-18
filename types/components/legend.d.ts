import { Align, Point } from '@t/options';
import { LegendIconType } from '@t/store/store';

type LegendData = {
  color: string;
  label: string;
  checked: boolean;
  active: boolean;
} & Point;

export type LegendModel = {
  type: 'legend';
  align: Align;
  showCheckbox: boolean;
  iconType: LegendIconType;
  data: LegendData[];
};

export type LegendResponderType = 'checkbox' | 'label';

export type LegendResponderModel = LegendData &
  Point & {
    type: LegendResponderType;
    width?: number;
  };
