export default class EventEmitter {
    constructor() {
        this.handlers = [];
    }
    on(type, handler) {
        if (!this.handlers[type]) {
            this.handlers[type] = [];
        }
        this.handlers[type].push(handler);
    }
    emit(type, ...args) {
        var _a;
        (_a = this.handlers[type]) === null || _a === void 0 ? void 0 : _a.forEach((handler) => handler(...args));
    }
}
