/**
 * @fileoverview DOM Handler.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var snippet = require('tui-code-snippet');
var aps = Array.prototype.slice;

/**
 * DOM Handler.
 * @module domHandler
 * @private */
var domHandler = {
    /**
     * Create element.
     * @memberOf module:domHandler
     * @param {string} tag html tag
     * @param {string} newClass class name
     * @returns {HTMLElement} created element
     */
    create: function(tag, newClass) {
        var el = document.createElement(tag);

        if (newClass) {
            this.addClass(el, newClass);
        }

        return el;
    },

    /**
     * Get class names.
     * @memberOf module:domHandler
     * @param {HTMLElement} el target element
     * @returns {Array} names
     * @private
     */
    _getClassNames: function(el) {
        var className, classNames;

        if (el.classList) {
            classNames = aps.call(el.classList);
        } else {
            className = el.className || '';
            classNames = className && snippet.isString(className) ? className.split(' ') : [];
        }

        return classNames;
    },

    /**
     * Add css class to target element.
     * @memberOf module:domHandler
     * @param {HTMLElement} el target element
     * @param {string} newClass add class name
     */
    addClass: function(el, newClass) {
        var classNames, index;

        if (!el || !newClass) {
            return;
        }

        classNames = this._getClassNames(el);
        index = snippet.inArray(newClass, classNames);

        if (index > -1) {
            return;
        }

        classNames.push(newClass);
        el.className = classNames.join(' ');
    },

    /**
     * Remove css class from target element.
     * @memberOf module:domHandler
     * @param {HTMLElement} el target element
     * @param {string} rmClass remove class name
     */
    removeClass: function(el, rmClass) {
        var classNames = this._getClassNames(el),
            index = snippet.inArray(rmClass, classNames);

        if (index === -1) {
            return;
        }

        classNames.splice(index, 1);
        el.className = classNames.join(' ');
    },

    /**
     * Whether class exist or not.
     * @memberOf module:domHandler
     * @param {HTMLElement} el target element
     * @param {string} findClass target css class
     * @returns {boolean} has class
     */
    hasClass: function(el, findClass) {
        var classNames = this._getClassNames(el);
        var index = snippet.inArray(findClass, classNames);

        return index > -1;
    },

    /**
     * Find parent by class name.
     * @memberOf module:domHandler
     * @param {HTMLElement} el target element
     * @param {string} className target css class
     * @param {string} lastClass last css class
     * @returns {HTMLElement} result element
     */
    findParentByClass: function(el, className, lastClass) {
        var parent = el.parentNode,
            result;

        if (!parent) {
            result = null;
        } else if (this.hasClass(parent, className)) {
            result = parent;
        } else if (parent.nodeName === 'BODY' || this.hasClass(parent, lastClass)) {
            result = null;
        } else {
            result = this.findParentByClass(parent, className, lastClass);
        }

        return result;
    },

    /**
     * Append child element.
     * @memberOf module:domHandler
     * @param {HTMLElement} container container element
     * @param {HTMLElement} children child element
     */
    append: function(container, children) {
        if (!container || !children) {
            return;
        }
        children = snippet.isArray(children) ? children : [children];

        snippet.forEachArray(children, function(child) {
            if (!child) {
                return;
            }
            container.appendChild(child);
        });
    }
};

module.exports = domHandler;
