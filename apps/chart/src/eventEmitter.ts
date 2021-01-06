type EventType =
  | 'needSubLoop'
  | 'needDraw'
  | 'needLoop'
  | 'loopStart'
  | 'loopComplete'
  | 'animationCompleted'
  | 'renderSpectrumTooltip'
  | 'renderDataLabels'
  | 'resetHoveredSeries'
  | 'resetSelectedSeries'
  | 'renderSelectedSeries'
  | 'renderHoveredSeries'
  | 'seriesPointHovered'
  | 'showTooltip'
  | 'hideTooltip'
  | CustomEventType;

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

export default class EventEmitter {
  handlers: EventListener[] = [];

  on(type: EventType, handler: EventListener) {
    if (!this.handlers[type]) {
      this.handlers[type] = [];
    }
    this.handlers[type].push(handler);
  }

  emit(type: EventType, ...args) {
    if (this.handlers[type]) {
      this.handlers[type].forEach((handler) => handler(...args));
    }
  }
}
