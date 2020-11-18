import { Align, Point } from '@t/options';
import { LegendIconType } from '@t/store/store';
import { FontTheme } from '@t/theme';

type LegendData = {
  color: string;
  label: string;
  checked: boolean;
  active: boolean;
  iconType: LegendIconType;
  useScatterChartIcon?: boolean;
} & Point;

export type LegendModel = {
  type: 'legend';
  align: Align;
  showCheckbox: boolean;
  data: LegendData[];
} & FontTheme;
