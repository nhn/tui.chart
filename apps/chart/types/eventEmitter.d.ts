export type CustomEventType =
  | 'clickLegendLabel'
  | 'clickLegendCheckbox'
  | 'selectSeries'
  | 'unselectSeries'
  | 'hoverSeries'
  | 'unhoverSeries'
  | 'zoom'
  | 'resetZoom';

export type EventListener = (evt: any) => void;
