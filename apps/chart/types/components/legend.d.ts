import { Align, Point } from '../options';
import { ChartType, LegendIconType } from '../store/store';
import { FontTheme } from '../theme';

export type CheckedLegendType = Pick<LegendData, 'chartType' | 'label' | 'checked'>[];

type LegendData = {
  color: string;
  label: string;
  viewLabel: string;
  checked: boolean;
  active: boolean;
  chartType: ChartType;
  iconType: LegendIconType;
  useScatterChartIcon?: boolean;
  rowIndex: number;
  columnIndex: number;
  colorIndex?: number;
  colorByCategories?: boolean;
} & Point;

export type LegendModel = {
  type: 'legend';
  align: Align;
  showCheckbox: boolean;
  data: LegendData[];
} & FontTheme;
