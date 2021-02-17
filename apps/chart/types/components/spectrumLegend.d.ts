import { Align, Point, Rect } from '../options';

export type SpectrumLegendModels = {
  legend: SpectrumLegendModel[];
  tooltip: SpectrumLegendTooltipModel[];
};

export type SpectrumLegendModel = {
  type: 'spectrumLegend';
  align: Align;
  labels: string[];
  startColor: string;
  endColor: string;
  verticalAlign: boolean;
} & Rect;

export type SpectrumLegendTooltipPointModel = Omit<SpectrumLegendTooltipModel, 'text'> & Point;

export type SpectrumLegendTooltipModel = {
  type: 'spectrumTooltip';
  text: string;
  color: string;
  colorRatio: number;
  verticalAlign: boolean;
} & Omit<SpectrumLegendModel, 'startColor' | 'endColor' | 'type'>;
