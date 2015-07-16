/**
 * @fileoverview View is parent of all view.
 * @author NHN Ent.
 *         FE Development Team <jiung.kang@nhnent.com>
 */

'use strict';

var DOMHandler = require('./domHandler.js'),
    neConst = require('../const.js');

/**
 * @classdesc View is parent of all view.
 * @class
 */
var View = ne.util.defineClass({
    init: function() {
        this.el = this.createElement('DIV', this.className || '');
    },

    /**
     * Size(width, height) rendering
     * @param {number} width area width
     * @param {number} height area height
     */
    renderSize: function(size) {
        this.el.style.cssText = [
            ['width:', size.width, 'px'].join(''),
            ['height:', size.height, 'px'].join(''),
        ].join(';');
    },

    renderPositionTop: function(top) {
        if (ne.util.isUndefined(top)) {
            return;
        }
        this.el.style.top = top + 'px';
    },


    createSizeCheckEl: function() {
        var elDiv = document.createElement('DIV'),
            elSpan = document.createElement('SPAN');

        elDiv.appendChild(elSpan);
        elDiv.style.cssText = 'position:relative;top:10000px;left:10000px';
        return elDiv;
    },

    /**
     * Get rendered label width.
     * @param {string} label label
     * @param {number} fontSize font size
     * @returns {number}
     */
    getRenderedLabelWidth: function(label, fontSize) {
        var elDiv = this.createSizeCheckEl(),
            elSpan = elDiv.firstChild,
            labelWidth;

        elSpan.innerHTML = label;
        elSpan.style.fontSize = (fontSize || neConst.DEFAULT_LABEL_FONT_SIZE) + 'px';
        document.body.appendChild(elDiv);
        labelWidth = elSpan.offsetWidth;
        document.body.removeChild(elDiv);

        return labelWidth;
    },

    /**
     * Get rendered label height.
     * @param {string} label label
     * @param {number} fontSize font size
     * @returns {number}
     */
    getRenderedLabelHeight: function(label, fontSize) {
        var elDiv = this.createSizeCheckEl(),
            elSpan = elDiv.firstChild,
            labelHeight;

        elSpan.innerHTML = label;
        elSpan.style.fontSize = (fontSize || neConst.DEFAULT_LABEL_FONT_SIZE) + 'px';
        document.body.appendChild(elDiv);
        labelHeight = elSpan.offsetHeight;
        document.body.removeChild(elDiv);

        return labelHeight;
    },

    /**
     * Get Rendered Labels Max Size(width or height)
     * @param {array} labels
     * @param {number} fontSize
     * @param {function} iteratee
     * @returns {number}
     * @private
     */
    _getRenderedLabelsMaxSize: function(labels, fontSize, iteratee) {
        var sizes = ne.util.map(labels, function(label) {
                return iteratee(label, fontSize);
            }, this),
            result = ne.util.max(sizes);
        return result;
    },

    /**
     * Get rendered labels max width.
     * @param {array} labels labels
     * @param {number} fontSize font size
     * @returns {number}
     */
    getRenderedLabelsMaxWidth: function(labels, fontSize) {
        var iteratee = ne.util.bind(this.getRenderedLabelWidth, this),
            result = this._getRenderedLabelsMaxSize(labels, fontSize, iteratee);
        return result;
    },

    /**
     * Get rendered labels max height.
     * @param {array} labels labels
     * @param {number} fontSize font size
     * @returns {number}
     */
    getRenderedLabelsMaxHeight: function(labels, fontSize) {
        var iteratee = ne.util.bind(this.getRenderedLabelHeight, this),
            result = this._getRenderedLabelsMaxSize(labels, fontSize, iteratee);
        return result;
    },

    isIE8: function() {
        var ie8 = window.navigator.userAgent.indexOf('MSIE 8.0') > -1,
            isIE8 = function() {
                return ie8;
            };
        this.isIE8 = isIE8;
        return isIE8();
    }
});

DOMHandler.mixin(View);

module.exports = View;