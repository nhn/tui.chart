export default class EventEmitter {
  handlers = [];

  on(type, handler) {
    if (!this.handlers[type]) {
      this.handlers[type] = [];
    }
    this.handlers[type].push(handler);
  }

  emit(type, ...args) {
    if (this.handlers[type]) {
      this.handlers[type].forEach(handler => handler(...args));
    }
  }
}
