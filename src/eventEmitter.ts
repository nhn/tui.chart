type EventType =
  | 'needSubLoop'
  | 'needDraw'
  | 'needLoop'
  | 'loopStart'
  | 'loopComplete'
  | 'seriesPointHovered'
  | 'renderHoveredSeries'
  | 'clickLegendCheckbox'
  | 'clickLegendLabel'
  | 'animationCompleted'
  | 'renderSpectrumTooltip';

type EventListener = (evt: any) => void;

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
