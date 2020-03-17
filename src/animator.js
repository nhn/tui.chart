"use strict";
exports.__esModule = true;
var Animator = /** @class */ (function () {
    function Animator() {
        this.anims = [];
        this.state = 'IDLE';
        this.requestId = null;
    }
    Animator.prototype.add = function (_a) {
        var chart = _a.chart, duration = _a.duration, requester = _a.requester, _b = _a.onCompleted, onCompleted = _b === void 0 ? function () { } : _b, _c = _a.onFrame, onFrame = _c === void 0 ? function (delta) {
            chart.update(delta);
        } : _c;
        var prevIndex = this.anims.findIndex(function (anim) { return anim.requester === requester; });
        if (~prevIndex) {
            this.anims.splice(prevIndex, 1);
        }
        this.anims.push({
            chart: chart,
            requester: requester,
            duration: duration,
            onFrame: onFrame,
            onCompleted: onCompleted,
            start: null,
            current: null,
            completed: false
        });
        if (this.state === 'IDLE') {
            this.start();
        }
    };
    Animator.prototype.start = function () {
        if (this.anims.length) {
            this.state = 'RUNNING';
            this.runFrame();
        }
    };
    Animator.prototype.runFrame = function () {
        var _this = this;
        this.requestId = window.requestAnimationFrame(function (timestamp) {
            _this.runAnims(timestamp);
        });
    };
    Animator.prototype.runAnims = function (timestamp) {
        this.next(timestamp);
        if (this.anims.length) {
            this.runFrame();
        }
        else {
            this.state = 'IDLE';
            this.requestId = null;
        }
    };
    Animator.prototype.next = function (timestamp) {
        this.anims.forEach(function (anim) {
            if (anim.start === null) {
                anim.start = timestamp;
            }
            Object.defineProperty(anim.chart, '___animId___', {
                value: timestamp,
                enumerable: false,
                writable: false,
                configurable: true
            });
            anim.current = Math.min((timestamp - anim.start) / anim.duration, 1);
            anim.onFrame(anim.current);
            if (anim.current >= 1) {
                anim.completed = true;
            }
        });
        this.anims.forEach(function (anim) {
            if (anim.chart.___animId___ === timestamp) {
                anim.chart.draw();
                delete anim.chart.___animId___;
            }
            if (anim.completed) {
                anim.onCompleted();
                anim.chart.eventBus.emit('animationCompleted', anim.requester);
            }
        });
        this.anims = this.anims.filter(function (anim) { return !anim.completed; });
    };
    return Animator;
}());
exports["default"] = new Animator();
