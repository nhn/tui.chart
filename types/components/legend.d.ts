import { Align, Point } from '@t/options';
import { ChartType, LegendIconType } from '@t/store/store';
import { FontTheme } from '@t/theme';

export type CheckedLegendType = Pick<LegendData, 'chartType' | 'label' | 'checked'>[];

type LegendData = {
  color: string;
  label: string;
  checked: boolean;
  active: boolean;
  chartType: ChartType;
  iconType: LegendIconType;
  useScatterChartIcon?: boolean;
} & Point;

export type LegendModel = {
  type: 'legend';
  align: Align;
  showCheckbox: boolean;
  data: LegendData[];
} & FontTheme;
