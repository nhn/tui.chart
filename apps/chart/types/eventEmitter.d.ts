export type CustomEventType =
  | 'clickLegendLabel'
  | 'clickLegendCheckbox'
  | 'selectSeries'
  | 'unselectSeries'
  | 'hoverSeries'
  | 'unhoverSeries'
  | 'zoom'
  | 'resetZoom'
  | 'rangeSelection';

export type EventListener = (evt: any) => void;
