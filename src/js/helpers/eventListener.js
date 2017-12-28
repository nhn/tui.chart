/**
 * @fileoverview Event listener.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var snippet = require('tui-code-snippet');

var bindHandlerMap = {};

/**
 * Event listener.
 * @module eventListener
 * @private */
var eventListener = {
    /**
     * Add event listener for IE.
     * @memberOf module:eventListener
     * @param {HTMLElement} target target element
     * @param {string} type event type
     * @param {function} handler callback function
     * @param {?object} context context for callback
     * @private
     */
    _attachEvent: function(target, type, handler, context) {
        var bindHandler;

        if (context) {
            bindHandler = snippet.bind(handler, context);
        } else {
            bindHandler = handler;
        }

        bindHandlerMap[type + handler] = bindHandler;
        target.attachEvent('on' + type, bindHandler);
    },

    /**
     * Add event listener for other browsers.
     * @memberOf module:eventListener
     * @param {HTMLElement} target - target element
     * @param {string} type - event type
     * @param {function} handler - handler
     * @param {object} [context] - context for handler
     * @private
     */
    _addEventListener: function(target, type, handler, context) {
        var bindHandler;

        if (context) {
            bindHandler = snippet.bind(handler, context);
        } else {
            bindHandler = handler;
        }

        bindHandlerMap[type + handler] = bindHandler;
        target.addEventListener(type, bindHandler);
    },

    /**
     * Bind DOM event.
     * @memberOf module:eventListener
     * @memberOf module:eventListener
     * @param {HTMLElement} target target element
     * @param {string} type event type
     * @param {function} handler handler function
     * @param {object} [context] - context for handler
     * @private
     */
    _bindEvent: function(target, type, handler, context) {
        var bindEvent;

        if ('addEventListener' in target) {
            bindEvent = this._addEventListener;
        } else if ('attachEvent' in target) {
            bindEvent = this._attachEvent;
        }
        eventListener._bindEvent = bindEvent;

        bindEvent(target, type, handler, context);
    },

    /**
     * Bind DOM events.
     * @memberOf module:eventListener
     * @param {HTMLElement} target - target element
     * @param {string | object} types - type or map of type and handler
     * @param {function | object} [handler] - handler or context
     * @param {object} [context] - context
     */
    on: function(target, types, handler, context) {
        var handlerMap = {};
        if (snippet.isString(types)) {
            handlerMap[types] = handler;
        } else {
            handlerMap = types;
            context = handler;
        }

        snippet.forEach(handlerMap, function(_handler, type) {
            eventListener._bindEvent(target, type, _handler, context);
        });
    },

    /**
     * Remove event listener for IE.
     * @memberOf module:eventListener
     * @param {HTMLElement} target - target element
     * @param {string} type - event type
     * @param {function} handler - handler
     * @private
     */
    _detachEvent: function(target, type, handler) {
        if (bindHandlerMap[type + handler]) {
            target.detachEvent('on' + type, bindHandlerMap[type + handler]);
            delete bindHandlerMap[type + handler];
        }
    },

    /**
     * Add event listener for other browsers.
     * @memberOf module:eventListener
     * @param {HTMLElement} target - target element
     * @param {string} type - event type
     * @param {function} handler - handler
     * @private
     */
    _removeEventListener: function(target, type, handler) {
        target.removeEventListener(type, bindHandlerMap[type + handler]);
        delete bindHandlerMap[type + handler];
    },

    /**
     * Unbind DOM event.
     * @memberOf module:eventListener
     * @param {HTMLElement} target - target element
     * @param {string} type - event type
     * @param {function} handler - handler
     * @private
     */
    _unbindEvent: function(target, type, handler) {
        var unbindEvent;
        if ('removeEventListener' in target) {
            unbindEvent = eventListener._removeEventListener;
        } else if ('detachEvent' in target) {
            unbindEvent = eventListener._detachEvent;
        }
        eventListener._unbindEvent = unbindEvent;

        unbindEvent(target, type, handler);
    },

    /**
     * Unbind DOM events.
     * @memberOf module:eventListener
     * @param {HTMLElement} target - target element
     * @param {string | object} types - type or map of type and handler
     * @param {function} [handler] - handler
     */
    off: function(target, types, handler) {
        var handlerMap = {};
        if (snippet.isString(types)) {
            handlerMap[types] = handler;
        } else {
            handlerMap = types;
        }

        snippet.forEach(handlerMap, function(_handler, type) {
            eventListener._unbindEvent(target, type, _handler);
        });
    }
};

module.exports = eventListener;
