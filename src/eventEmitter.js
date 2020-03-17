"use strict";
exports.__esModule = true;
var EventEmitter = /** @class */ (function () {
    function EventEmitter() {
        this.handlers = [];
    }
    EventEmitter.prototype.on = function (type, handler) {
        if (!this.handlers[type]) {
            this.handlers[type] = [];
        }
        this.handlers[type].push(handler);
    };
    EventEmitter.prototype.emit = function (type) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        if (this.handlers[type]) {
            this.handlers[type].forEach(function (handler) { return handler.apply(void 0, args); });
        }
    };
    return EventEmitter;
}());
exports["default"] = EventEmitter;
