/**
 * @fileoverview Event listener.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */
import snippet from 'tui-code-snippet';

const bindHandlerMap = {};

/**
 * Event listener.
 * @module eventListener
 * @private */
const eventListener = {
  /**
   * Add event listener for IE.
   * @memberOf module:eventListener
   * @param {HTMLElement} target target element
   * @param {string} type event type
   * @param {function} handler callback function
   * @param {?object} context context for callback
   * @private
   */
  _attachEvent(target, type, handler, context) {
    let bindHandler;

    if (context) {
      bindHandler = handler.bind(context);
    } else {
      bindHandler = handler;
    }

    bindHandlerMap[type + handler] = bindHandler;
    target.attachEvent(`on${type}`, bindHandler);
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
  _addEventListener(target, type, handler, context) {
    let bindHandler;

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
  _bindEvent(target, type, handler, context) {
    let bindEvent;

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
  on(target, types, handler, context) {
    let handlerMap = {};
    if (snippet.isString(types)) {
      handlerMap[types] = handler;
    } else {
      handlerMap = types;
      context = handler;
    }

    snippet.forEach(handlerMap, (_handler, type) => {
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
  _detachEvent(target, type, handler) {
    if (bindHandlerMap[type + handler]) {
      target.detachEvent(`on${type}`, bindHandlerMap[type + handler]);
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
  _removeEventListener(target, type, handler) {
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
  _unbindEvent(target, type, handler) {
    let unbindEvent;
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
  off(target, types, handler) {
    let handlerMap = {};
    if (snippet.isString(types)) {
      handlerMap[types] = handler;
    } else {
      handlerMap = types;
    }

    snippet.forEach(handlerMap, (_handler, type) => {
      eventListener._unbindEvent(target, type, _handler);
    });
  }
};

export default eventListener;
