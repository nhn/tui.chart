/**
 * @fileoverview DOM Handler.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */

import snippet from 'tui-code-snippet';

/**
 * DOM Handler.
 * @module domHandler
 * @private */
export default {
  /**
   * Create element.
   * @memberOf module:domHandler
   * @param {string} tag html tag
   * @param {string} newClass class name
   * @returns {HTMLElement} created element
   */
  create(tag, newClass) {
    const el = document.createElement(tag);

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
  _getClassNames(el) {
    let className;
    let classNames;

    if (el.classList) {
      classNames = [...el.classList];
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
  addClass(el, newClass) {
    if (!el || !newClass) {
      return;
    }

    const classNames = this._getClassNames(el);
    const index = snippet.inArray(newClass, classNames);

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
  removeClass(el, rmClass) {
    const classNames = this._getClassNames(el);
    const index = snippet.inArray(rmClass, classNames);

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
  hasClass(el, findClass) {
    const classNames = this._getClassNames(el);
    const index = snippet.inArray(findClass, classNames);

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
  findParentByClass(el, className, lastClass) {
    const parent = el.parentNode;
    let result;

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
  append(container, children) {
    if (!container || !children) {
      return;
    }
    children = snippet.isArray(children) ? children : [children];

    snippet.forEachArray(children, child => {
      if (!child) {
        return;
      }
      container.appendChild(child);
    });
  }
};
