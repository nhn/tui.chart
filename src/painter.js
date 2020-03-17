"use strict";
exports.__esModule = true;
var Painter = /** @class */ (function () {
    function Painter(chart) {
        this.width = 0;
        this.height = 0;
        this.brushes = {};
        this.chart = chart;
    }
    Painter.prototype.setup = function () {
        var _a = this.chart.store.state.chart, height = _a.height, width = _a.width;
        if (!this.ctx) {
            var canvas = document.createElement('canvas');
            this.chart.el.appendChild(canvas);
            canvas.addEventListener('click', this.chart);
            canvas.addEventListener('mousemove', this.chart);
            var ctx = canvas.getContext('2d');
            if (ctx) {
                this.ctx = ctx;
            }
        }
        this.ctx.canvas.height = this.height = height || 0;
        this.ctx.canvas.width = this.width = width || 0;
    };
    Painter.prototype.add = function (name, brush) {
        this.brushes[name] = brush;
    };
    Painter.prototype.addGroups = function (groups) {
        var _this = this;
        groups.forEach(function (group) {
            Object.keys(group).forEach(function (key) {
                _this.add(key, group[key]);
            });
        });
    };
    Painter.prototype.paint = function (name, brushModel) {
        if (this.brushes[name]) {
            this.brushes[name](this.ctx, brushModel);
        }
        else {
            console.log(this.brushes);
            throw new Error("Brush don't exist in painter: " + name);
        }
    };
    Painter.prototype.paintForEach = function (brushModels) {
        var _this = this;
        brushModels.forEach(function (m) { return _this.paint(m.type, m); });
    };
    Painter.prototype.beforeFrame = function () {
        this.ctx.clearRect(0, 0, this.width, this.height);
    };
    Painter.prototype.beforeDraw = function (transX, transY) {
        this.ctx.save();
        this.ctx.translate(transX, transY);
    };
    Painter.prototype.afterDraw = function () {
        this.ctx.restore();
    };
    return Painter;
}());
exports["default"] = Painter;
