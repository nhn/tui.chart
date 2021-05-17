import { CustomEventType, EventListener } from '@t/eventEmitter';

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

export default class EventEmitter {
  handlers: EventListener[] = [];

  on(type: EventType, handler: EventListener) {
    if (!this.handlers[type]) {
      this.handlers[type] = [];
    }
    this.handlers[type].push(handler);
  }

  emit(type: EventType, ...args) {
    this.handlers[type]?.forEach((handler) => handler(...args));
  }
}
