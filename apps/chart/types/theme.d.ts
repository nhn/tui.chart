import { SectorStyle } from './brushes';
import { ScatterSeriesIconType } from './components/series';

type SeriesThemeMap = {
  line?: LineChartSeriesTheme;
  area?: AreaChartSeriesTheme;
  scatter?: ScatterChartSeriesTheme;
  heatmap?: HeatmapChartSeriesTheme;
  treemap?: TreemapChartSeriesTheme;
  bar?: BoxChartSeriesTheme;
  column?: BoxChartSeriesTheme;
  bubble?: CommonSeriesTheme;
  pie?: PieChartSeriesTheme;
  radar?: RadarChartSeriesTheme;
  boxPlot?: BoxPlotChartSeriesTheme;
  bullet?: BulletChartSeriesTheme;
  radialBar?: RadialBarChartSeriesTheme;
  gauge?: GaugeChartSeriesTheme;
};

type SeriesTheme =
  | LineChartSeriesTheme
  | AreaChartSeriesTheme
  | ComboChartSeriesTheme
  | HeatmapChartSeriesTheme
  | TreemapChartSeriesTheme
  | PieChartSeriesTheme
  | RadarChartSeriesTheme
  | ScatterChartSeriesTheme
  | BubbleChartSeriesTheme
  | NestedPieChartSeriesTheme
  | BoxChartSeriesTheme
  | BoxPlotChartSeriesTheme
  | BulletChartSeriesTheme
  | GaugeChartSeriesTheme;

type FontTheme = {
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string | number;
  color?: string;
};

type ChartTheme = {
  fontFamily?: string;
  backgroundColor?: string;
};

type LegendTheme = {
  label?: FontTheme;
};

type AxisLabelTheme = FontTheme & {
  textBubble?: Omit<TextBubbleTheme, 'arrow'>;
};

type CircularAxisTheme = {
  label?: AxisLabelTheme;
  lineWidth?: number;
  strokeStyle?: string;
  dotColor?: string;
  title?: FontTheme;
  tick?: {
    lineWidth?: number;
    strokeStyle?: string;
  };
};

type VerticalAxisTheme = {
  label?: AxisLabelTheme;
};

type Theme = {
  chart: ChartTheme;
  series: SeriesThemeMap;
  title: FontTheme;
  xAxis: AxisTheme;
  yAxis: AxisTheme | AxisTheme[];
  verticalAxis: VerticalAxisTheme;
  circularAxis: CircularAxisTheme;
  legend: LegendTheme;
  tooltip: TooltipTheme;
  plot: PlotTheme;
  exportMenu: ExportMenuTheme;
  noData: FontTheme;
};

type AxisTheme = {
  title?: FontTheme;
  label?: FontTheme;
  width?: number;
  color?: string;
};

type TooltipTheme = {
  background?: string;
  borderColor?: string;
  borderWidth?: number;
  borderStyle?: string;
  borderRadius?: number;
  header?: FontTheme;
  body?: FontTheme;
};

type LineTheme = {
  lineColor?: string;
  lineWidth?: number;
  dashSegments?: number[];
};

interface PlotTheme extends LineTheme {
  vertical?: LineTheme;
  horizontal?: LineTheme;
  backgroundColor?: string;
}

type XIconTheme = {
  color?: string;
  lineWidth?: number;
};

type DotIconTheme = {
  color?: string;
  width?: number;
  height?: number;
  gap?: number;
};

type ExportMenuButtonTheme = {
  backgroundColor?: string;
  borderRadius?: number;
  borderWidth?: number;
  borderColor?: string;
  xIcon?: XIconTheme;
  dotIcon?: DotIconTheme;
};

type ExportMenuPanelTheme = BorderTheme & {
  borderRadius?: number;
  header?: FontTheme & {
    backgroundColor?: string;
  };
  body?: FontTheme & {
    backgroundColor?: string;
  };
};

type ExportMenuTheme = {
  button?: ExportMenuButtonTheme;
  panel?: ExportMenuPanelTheme;
};

type ComboChartSeriesTheme =
  | NestedPieChartSeriesTheme
  | LineScatterChartSeriesTheme
  | ColumnLineChartSeriesTheme
  | LineAreaChartSeriesTheme;

type SelectSectorStyle = SectorStyle & {
  color?: string;
  restSeries?: {
    areaOpacity?: number;
  };
  areaOpacity?: number;
};

type PieChartSeriesTheme = {
  colors?: string[];
  lineWidth?: number;
  strokeStyle?: string;
  hover?: SectorStyle & { color?: string };
  select?: SelectSectorStyle;
  areaOpacity?: number;
  dataLabels?: PieDataLabelTheme;
};

type NestedPieChartSeriesTheme = Record<string, PieChartSeriesTheme> | PieChartSeriesTheme;

interface TreemapChartSeriesTheme {
  colors?: string[];
  startColor?: string;
  endColor?: string;
  borderColor?: string;
  borderWidth?: number;
  select?: {
    color?: string;
  } & BorderTheme;
  hover?: {
    color?: string;
  } & BorderTheme;
  dataLabels?: BoxDataLabel;
}

interface HeatmapChartSeriesTheme {
  startColor: string;
  endColor: string;
  borderColor?: string;
  borderWidth?: number;
  select?: {
    color?: string;
  } & BorderTheme;
  hover?: {
    color?: string;
  } & BorderTheme;
  dataLabels?: BoxDataLabel;
}

type DotTheme = {
  color?: string;
  radius?: number;
} & BorderTheme;

interface LineTypeSeriesTheme {
  color?: string;
  lineWidth?: number;
  dashSegments?: number[];
}

interface ScatterChartSeriesTheme extends CommonSeriesTheme {
  iconTypes?: ScatterSeriesIconType[];
  borderWidth?: number;
  fillColor?: string;
  size?: number;
  select?: {
    size?: number;
    fillColor?: string;
  } & BorderTheme;
  hover?: {
    size?: number;
    fillColor?: string;
  } & BorderTheme;
}

interface BubbleChartSeriesTheme extends CommonSeriesTheme {
  borderWidth?: number;
  borderColor?: string;
  select?: Omit<DotTheme, 'radius'>;
  hover?: Omit<DotTheme, 'radius'>;
}

interface LineChartSeriesTheme extends Omit<LineTypeSeriesTheme, 'color'> {
  colors?: string[];
  dot?: Omit<DotTheme, 'color'>;
  select?: {
    dot?: DotTheme;
  };
  hover?: {
    dot?: DotTheme;
  };
  dataLabels?: BubbleDataLabel;
}

interface CommonSeriesTheme {
  colors?: string[];
}

interface AreaChartSeriesTheme extends LineChartSeriesTheme {
  areaOpacity?: number;
  select?: {
    dot?: DotTheme;
    areaOpacity?: number;
    restSeries?: {
      areaOpacity?: number;
    };
  };
}

interface LineScatterChartSeriesTheme {
  line?: LineChartSeriesTheme;
  scatter?: ScatterChartSeriesTheme;
  colors?: string[];
}

interface ColumnLineChartSeriesTheme {
  column?: BoxChartSeriesTheme;
  line?: LineChartSeriesTheme;
  colors?: string[];
}

interface LineAreaChartSeriesTheme {
  line?: LineChartSeriesTheme;
  area?: AreaChartSeriesTheme;
  colors?: string[];
}

interface BaseThemeOptions {
  chart?: ChartTheme;
  noData?: FontTheme;
  title?: FontTheme;
  legend?: LegendTheme;
  tooltip?: TooltipTheme;
  exportMenu?: ExportMenuTheme;
}

type GroupedRect = {
  color?: string;
  opacity?: number;
};

type BorderTheme = {
  borderColor?: string;
  borderWidth?: number;
};

type ConnectorTheme = {
  color?: string;
  lineWidth?: number;
  dashSegments?: number[];
};

interface BoxChartSeriesTheme extends CommonSeriesTheme {
  barWidth?: number | string;
  areaOpacity?: number;
  hover?: {
    color?: string;
    groupedRect?: GroupedRect;
  } & ShadowTheme &
    BorderTheme;
  select?: {
    color?: string;
    groupedRect?: GroupedRect;
    restSeries?: {
      areaOpacity?: number;
    };
    areaOpacity?: number;
  } & ShadowTheme &
    BorderTheme;
  connector?: ConnectorTheme;
  dataLabels?: BoxTypeDataLabelTheme;
}

interface BulletChartSeriesTheme extends CommonSeriesTheme {
  areaOpacity?: number;
  barWidth?: number | string;
  barWidthRatios?: {
    rangeRatio?: number;
    bulletRatio?: number;
    markerRatio?: number;
  };
  markerLineWidth?: number;
  rangeColors?: string[];
  borderColor?: string;
  borderWidth?: number;
  hover?: {
    color?: string;
    groupedRect?: GroupedRect;
  } & BorderTheme &
    ShadowTheme;
  select?: {
    color?: string;
    groupedRect?: GroupedRect;
    restSeries?: {
      areaOpacity?: number;
    };
    areaOpacity?: number;
  } & BorderTheme &
    ShadowTheme;
  dataLabels?: BulletDataLabelTheme;
}

interface BoxPlotChartSeriesTheme extends CommonSeriesTheme {
  areaOpacity?: number;
  barWidth?: number | string;
  barWidthRatios?: {
    barRatio?: number;
    minMaxBarRatio?: number;
  };
  dot?: BoxPlotDotTheme;
  line?: BoxPlotLineTypeTheme;
  rect?: BorderTheme;
  hover?: {
    color?: string;
    rect?: BorderTheme;
    dot?: BoxPlotDotTheme;
    line?: BoxPlotLineTypeTheme;
  } & ShadowTheme;
  select?: {
    color?: string;
    rect?: BorderTheme;
    dot?: BoxPlotDotTheme;
    line?: BoxPlotLineTypeTheme;
    restSeries?: {
      areaOpacity?: number;
    };
    areaOpacity?: number;
  } & ShadowTheme;
}

type LineTypeTheme = { lineWidth?: number; color?: string };

type BoxPlotLineTypeTheme = {
  whisker?: LineTypeTheme;
  minimum?: LineTypeTheme;
  maximum?: LineTypeTheme;
  median?: LineTypeTheme;
};

type BoxPlotDotTheme = DotTheme & { useSeriesColor?: boolean };

type ShadowTheme = {
  shadowColor?: string;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  shadowBlur?: number;
};

interface RadarChartSeriesTheme {
  colors?: string[];
  lineWidth?: number;
  dashSegments?: number[];
  areaOpacity?: number;
  dot?: DotTheme;
  select?: {
    dot?: DotTheme;
    areaOpacity?: number;
    restSeries?: {
      areaOpacity: number;
    };
  };
  hover?: {
    dot?: DotTheme;
  };
}

type ArrowDirection = 'top' | 'right' | 'bottom' | 'left';

type ArrowTheme = {
  visible?: boolean;
  width?: number;
  height?: number;
  direction?: ArrowDirection;
};

type TextBubbleTheme = {
  visible?: boolean;
  arrow?: ArrowTheme;
  paddingX?: number;
  paddingY?: number;
  backgroundColor?: string;
  borderRadius?: number;
  textAlign?: CanvasTextAlign;
} & BorderTheme &
  ShadowTheme;

type CalloutTheme = { lineWidth?: number; lineColor?: string; useSeriesColor?: boolean };

type TextStrokeTheme = {
  lineWidth?: number;
  textStrokeColor?: string;
  shadowColor?: string;
  shadowBlur?: number;
};

interface CommonDataLabelTheme extends FontTheme, TextStrokeTheme {
  useSeriesColor?: boolean;
}

interface BubbleDataLabel extends CommonDataLabelTheme {
  textBubble?: TextBubbleTheme;
}

interface BoxDataLabel extends CommonDataLabelTheme {
  textBubble?: Omit<TextBubbleTheme, 'arrow'>;
}

interface BoxTypeDataLabelTheme extends BubbleDataLabel {
  stackTotal?: BubbleDataLabel;
}

interface BulletDataLabelTheme extends BubbleDataLabel {
  marker?: BubbleDataLabel;
}

interface PieDataLabelTheme extends BoxDataLabel {
  pieSeriesName?: BoxDataLabel;
  callout?: CalloutTheme;
}

type GroupedSector = {
  color?: string;
  opacity?: number;
};

interface RadialBarChartSeriesTheme extends CommonSeriesTheme {
  barWidth?: number | string;
  colors?: string[];
  lineWidth?: number;
  strokeStyle?: string;
  hover?: SectorStyle & { color?: string; groupedSector?: GroupedSector };
  select?: SelectSectorStyle & { groupedSector?: GroupedSector };
  areaOpacity?: number;
  dataLabels?: BoxDataLabel;
}

type DataLabelTheme =
  | BubbleDataLabel
  | BoxDataLabel
  | BoxTypeDataLabelTheme
  | BulletDataLabelTheme
  | PieDataLabelTheme;

interface LineChartThemeOptions extends BaseThemeOptions {
  series?: LineChartSeriesTheme;
  yAxis?: AxisTheme | AxisTheme[];
  xAxis?: AxisTheme;
  plot?: PlotTheme;
}

interface AreaChartThemeOptions extends BaseThemeOptions {
  series?: AreaChartSeriesTheme;
  yAxis?: AxisTheme | AxisTheme[];
  xAxis?: AxisTheme;
  plot?: PlotTheme;
}

interface LineAreaChartThemeOptions extends BaseThemeOptions {
  series?: LineAreaChartSeriesTheme;
  yAxis?: AxisTheme | AxisTheme[];
  xAxis?: AxisTheme;
  plot?: PlotTheme;
}

interface LineScatterChartThemeOptions extends BaseThemeOptions {
  series?: LineScatterChartSeriesTheme;
  yAxis?: AxisTheme | AxisTheme[];
  xAxis?: AxisTheme;
  plot?: PlotTheme;
}

interface PieChartThemeOptions extends BaseThemeOptions {
  series?: PieChartSeriesTheme;
  plot?: PlotTheme;
}

interface NestedPieChartThemeOptions extends BaseThemeOptions {
  series?: NestedPieChartSeriesTheme;
  plot?: PlotTheme;
}

interface RadarChartThemeOptions extends BaseThemeOptions {
  series?: RadarChartSeriesTheme;
  verticalAxis?: VerticalAxisTheme;
  circularAxis?: CircularAxisTheme;
  plot?: LineTheme;
}

interface HeatmapChartThemeOptions extends BaseThemeOptions {
  series?: HeatmapChartSeriesTheme;
  yAxis?: AxisTheme;
  xAxis?: AxisTheme;
  plot?: PlotTheme;
}

interface TreemapChartThemeOptions extends BaseThemeOptions {
  series?: TreemapChartSeriesTheme;
}

interface ScatterChartThemeOptions extends BaseThemeOptions {
  series?: ScatterChartSeriesTheme;
  yAxis?: AxisTheme;
  xAxis?: AxisTheme;
  plot?: PlotTheme;
}

interface BubbleChartThemeOptions extends BaseThemeOptions {
  series?: BubbleChartSeriesTheme;
  yAxis?: AxisTheme;
  xAxis?: AxisTheme;
  plot?: PlotTheme;
}

interface BoxChartThemeOptions extends BaseThemeOptions {
  series?: BoxChartSeriesTheme;
  yAxis?: AxisTheme | AxisTheme[];
  xAxis?: AxisTheme;
  plot?: PlotTheme;
}

interface BulletCharThemeOptions extends BaseThemeOptions {
  series?: BulletChartSeriesTheme;
  yAxis?: AxisTheme;
  xAxis?: AxisTheme;
  plot?: PlotTheme;
}

interface BoxPlotCharThemeOptions extends BaseThemeOptions {
  series?: BoxPlotChartSeriesTheme;
  yAxis?: AxisTheme;
  xAxis?: AxisTheme;
  plot?: PlotTheme;
}

interface ColumnLineChartThemeOptions extends BaseThemeOptions {
  series?: ColumnLineChartSeriesTheme;
  yAxis?: AxisTheme | AxisTheme[];
  xAxis?: AxisTheme;
  plot?: PlotTheme;
}

type CheckAnchorPieSeries = {
  hasOuterAnchor: boolean;
  hasOuterAnchorPieSeriesName: boolean;
};

interface RadialBarChartThemeOptions extends BaseThemeOptions {
  series?: RadialBarChartSeriesTheme;
  verticalAxis?: VerticalAxisTheme;
  circularAxis?: CircularAxisTheme;
  plot?: LineTheme;
}

type PinTheme = {
  radius: number;
  color: string;
  borderWidth: number;
  borderColor: string;
};

type ClockHandSizeTheme = string | number | number[] | string[];

type ClockHandTheme = {
  color: string;
  size: ClockHandSizeTheme;
  baseLine: number;
};

type SolidTheme = {
  barWidth?: number | string;
  lineWidth?: number;
  strokeStyle?: string;
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  color?: string;
  backgroundSolid?: { color?: string };
};

interface GaugeChartSeriesTheme extends CommonSeriesTheme {
  areaOpacity?: number;
  solid?: SolidTheme;
  clockHand?: Partial<ClockHandTheme>;
  pin?: Partial<PinTheme>;
  hover?: {
    clockHand?: Partial<ClockHandTheme>;
    pin?: Partial<PinTheme>;
    solid?: Omit<SolidTheme, 'backgroundSolid'>;
  };
  select?: {
    clockHand?: Partial<ClockHandTheme>;
    pin?: Partial<PinTheme>;
    solid?: Omit<SolidTheme, 'backgroundSolid'>;
    areaOpacity?: number;
    restSeries?: {
      areaOpacity?: number;
    };
  };
  dataLabels?: BoxDataLabel;
}

type GaugePlotTheme = {
  bands: {
    barWidth?: number;
  };
};
interface GaugeChartThemeOptions extends BaseThemeOptions {
  series?: GaugeChartSeriesTheme;
  circularAxis?: CircularAxisTheme;
  plot?: GaugePlotTheme;
}
