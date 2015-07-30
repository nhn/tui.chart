/**
 * @fileoverview EventHandler
 * @author NHN Ent.
 *         FE Development Team <jiung.kang@nhnent.com>
 */

'use strict';

var attachEvent, addEventListener;

/**
 * Event listener for IE.
 * @param {string} eventName event name
 * @param {HTMLElement} el target element
 * @param {function} callback callback function
 */
attachEvent = function (eventName, el, callback) {
    if (typeof callback == "object" && callback.handleEvent) {
        el.attachEvent("on" + eventName, function () {
            callback.handleEvent.call(callback);
        });
    } else {
        el.attachEvent("on" + eventName, callback);
    }
};

/**
 * Event listener for other browsers.
 * @param {string} eventName event name
 * @param {HTMLElement} el target element
 * @param {function} callback callback function
 */
addEventListener = function (eventName, el, callback) {
    try {
        el.addEventListener(eventName, callback);
    } catch (e) {
        if (typeof callback == "object" && callback.handleEvent) {
            el.addEventListener(eventName, function (event) {
                callback.handleEvent.call(callback, event);
            });
        } else {
            throw e;
        }
    }
};


module.exports = {
    /**
     * Bind event function.
     * @param {string} eventName event name
     * @param {HTMLElement} el target element
     * @param {function} callback callback function
     */
    bindEvent: function (eventName, el, callback) {
        if ("addEventListener" in el) {
            this.bindEvent = addEventListener;
        } else if ("attachEvent" in el) {
            this.bindEvent = attachEvent;
        }
        this.bindEvent(eventName, el, callback);
    }
};