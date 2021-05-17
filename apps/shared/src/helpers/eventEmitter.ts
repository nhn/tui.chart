export type EventListener = (...args: any) => void;

type EventType = 'needSubLoop' | 'needDraw' | 'needLoop' | 'loopStart' | 'loopComplete';

export default class EventEmitter {
  handlers: Record<string, EventListener[]> = {};

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
