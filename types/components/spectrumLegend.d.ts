import { Align, Point, Rect } from '@t/options';

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
} & Rect;

export type SpectrumLegendTooltipPointModel = Omit<SpectrumLegendTooltipModel, 'text'> & Point;

export type SpectrumLegendTooltipModel = {
  type: 'spectrumTooltip';
  text: string;
  color: string;
  colorRatio: number;
} & Omit<SpectrumLegendModel, 'startColor' | 'endColor' | 'type'>;
