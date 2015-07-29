/**
 * @fileoverview EventHandler
 * @author NHN Ent.
 *         FE Development Team <jiung.kang@nhnent.com>
 */

'use strict';

var attachEvent, addEventListener, eventListener;

attachEvent = function (eventName, el, callback) {
    if (typeof callback == "object" && callback.handleEvent) {
        el.attachEvent("on" + eventName, function () {
            callback.handleEvent.call(callback);
        });
    } else {
        el.attachEvent("on" + eventName, callback);
    }
};

addEventListener = function (eventName, el, callback) {
    try {
        el.addEventListener(eventName, callback);
    } catch (e) {
        if (typeof callback == "object" && callback.handleEvent) {
            el.addEventListener(eventName, function (e) {
                callback.handleEvent.call(callback, e);
            });
        } else {
            throw e;
        }
    }
};

//EventListener.mixin = function(target) {
//    ne.util.extend(target.prototype, EventListener.prototype);
//};

module.exports =  {
    bindEvent: function (eventName, el, callback) {
        if ("addEventListener" in el) {
            this.bindEvent = addEventListener;
        } else if ("attachEvent" in el) {
            this.bindEvent = attachEvent;
        }
        this.bindEvent(eventName, el, callback);
    }
};