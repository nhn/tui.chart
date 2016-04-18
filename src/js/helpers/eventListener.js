/**
 * @fileoverview Event listener.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

/**
 * Event listener.
 * @module eventListener
 */
var eventListener = {
    /**
     * Event listener for IE.
     * @memberOf module:eventListener
     * @param {string} eventName event name
     * @param {HTMLElement} el target element
     * @param {function} callback callback function
     * @param {?object} context context for callback
     * @private
     */
    _attachEvent: function(eventName, el, callback, context) {
        if (context) {
            callback = tui.util.bind(callback, context);
        }
        el.attachEvent('on' + eventName, callback);
    },

    /**
     * Event listener for other browsers.
     * @memberOf module:eventListener
     * @param {string} eventName event name
     * @param {HTMLElement} el target element
     * @param {function} callback callback function
     * @param {?object} context context for callback
     * @private
     */
    _addEventListener: function(eventName, el, callback, context) {
        try {
            if (context) {
                callback = tui.util.bind(callback, context);
            }

            el.addEventListener(eventName, callback);
        } catch (e) {
            throw e;
        }
    },
    /**
     * Bind event function.
     * @memberOf module:eventListener
     * @param {string} eventName event name
     * @param {HTMLElement} target target element
     * @param {function} callback callback function
     * @param {?object} context context for callback
     */
    bindEvent: function(eventName, target, callback, context) {
        var bindEvent;
        if ('addEventListener' in target) {
            bindEvent = this._addEventListener;
        } else if ('attachEvent' in target) {
            bindEvent = this._attachEvent;
        }
        this.bindEvent = bindEvent;

        bindEvent(eventName, target, callback, context);
    }
};

module.exports = eventListener;
