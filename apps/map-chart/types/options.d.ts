export type Align = 'top' | 'bottom' | 'right' | 'left';

type ChartSizeInput = number | 'auto';
type MapType =
  | 'world'
  | 'south-korea'
  | 'usa'
  | 'china'
  | 'japan'
  | 'singapore'
  | 'thailand'
  | 'taiwan';

interface TitleOption {
  text: string;
}

interface ChartSize {
  width?: ChartSizeInput;
  height?: ChartSizeInput;
}

export interface LegendOptions {
  align?: Align;
  visible?: boolean;
}

export interface ChartOptions extends ChartSize {
  title?: string | TitleOption;
  type?: MapType;
}

export interface Options {
  chart?: ChartOptions;
  legend?: LegendOptions;
}
