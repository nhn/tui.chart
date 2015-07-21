/**
 * @fileoverview This is DOM Handler.
 * @author NHN Ent.
 *         FE Development Team <jiung.kang@nhnent.com>
 */

'use strict';

var DOMHandler = {
    /**
     * Create element.
     * @param {string} tag html tag
     * @param {string} newClass class name
     * @returns {Element}
     */
    createElement: function(tag, newClass) {
        var el = document.createElement(tag);

        if(newClass) {
            this.addClass(el, newClass);
        }

        return el;
    },

    /**
     * Add class.
     * @param {element} el target element
     * @param {string} newClass add class name
     */
    addClass: function(el, newClass) {
        var className = el.className,
            classNameArr;

        if (className && (className + ' ').indexOf(newClass + ' ') > -1) {
            return;
        }

        classNameArr = className ? className.split(' ') : [];
        classNameArr.push(newClass);

        el.className = classNameArr.join(' ');
    },

    /**
     * Remove class.
     * @param {element} el target element
     * @param {string} rmClass remove class name
     */
    removeClass: function(el, rmClass) {
        var className = el.className ? el.className : '',
            classNames = className.split(' '),
            index = ne.util.indexOf(classNames, rmClass);

        if (index === -1) {
            return;
        }

        classNames.splice(index, 1);
        el.className = classNames.join(' ');
    }
};

///**
// * mixin function
// * @param {class} target
// */
//DOMHandler.mixin = function(target) {
//    ne.util.extend(target.prototype, DOMHandler.prototype);
//};

module.exports = DOMHandler;