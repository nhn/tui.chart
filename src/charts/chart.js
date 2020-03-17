"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
var store_1 = require("@src/store/store");
var layout_1 = require("@src/store/layout");
var dataRange_1 = require("@src/store/dataRange");
var eventEmitter_1 = require("@src/eventEmitter");
var componentManager_1 = require("@src/component/componentManager");
var painter_1 = require("@src/painter");
var animator_1 = require("@src/animator");
var utils_1 = require("@src/helpers/utils");
var responderDetectors_1 = require("@src/responderDetectors");
var Chart = /** @class */ (function () {
    function Chart(props) {
        var _this = this;
        this.___animId___ = null;
        this.painter = new painter_1["default"](this);
        this.eventBus = new eventEmitter_1["default"]();
        var el = props.el, options = props.options, data = props.data;
        this.el = el;
        this.store = new store_1["default"]({
            state: {
                chart: options.chart,
                data: data,
                options: options
            }
        });
        this.componentManager = new componentManager_1["default"]({
            store: this.store,
            eventBus: this.eventBus
        });
        this.store.observe(function () {
            _this.painter.setup();
        });
        this.eventBus.on('needLoop', utils_1.debounce(function () {
            _this.eventBus.emit('loopStart');
            animator_1["default"].add({
                onCompleted: function () {
                    _this.eventBus.emit('loopComplete');
                },
                chart: _this,
                duration: 1000,
                requester: _this
            });
        }, 10));
        this.eventBus.on('needSubLoop', function (opts) {
            animator_1["default"].add(__assign(__assign({}, opts), { chart: _this }));
        });
        this.eventBus.on('needDraw', utils_1.debounce(function () {
            _this.draw();
        }, 10));
        this.initialize();
    }
    Chart.prototype.handleEvent = function (event) {
        var delegationMethod = "on" + (event.type[0].toUpperCase() + event.type.substring(1));
        var clientX = event.clientX, clientY = event.clientY;
        var canvasRect = this.painter.ctx.canvas.getBoundingClientRect();
        var mousePosition = {
            x: clientX - canvasRect.left,
            y: clientY - canvasRect.top
        };
        this.componentManager.forEach(function (component) {
            if (!component[delegationMethod]) {
                return;
            }
            if (!responderDetectors_1.responderDetectors.rect(mousePosition, component.rect)) {
                return;
            }
            var detected = (component.responders || []).filter(function (m) {
                return responderDetectors_1.responderDetectors[m.type](mousePosition, m, component.rect);
            });
            component[delegationMethod]({ mousePosition: mousePosition, responders: detected }, event);
        });
    };
    Chart.prototype.initialize = function () {
        this.store.setModule(layout_1["default"]);
        this.store.setModule(dataRange_1["default"]);
    };
    Chart.prototype.draw = function () {
        var _this = this;
        this.painter.beforeFrame();
        this.componentManager.forEach(function (component) {
            if (!component.isShow) {
                return;
            }
            _this.painter.beforeDraw(component.rect.x, component.rect.y);
            if (component.beforeDraw) {
                component.beforeDraw(_this.painter);
            }
            component.draw(_this.painter);
            _this.painter.afterDraw();
        });
    };
    Chart.prototype.update = function (delta) {
        this.componentManager.invoke('update', delta);
    };
    return Chart;
}());
exports["default"] = Chart;
