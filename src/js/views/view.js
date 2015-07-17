/**
 * @fileoverview View is parent of all view.
 * @author NHN Ent.
 *         FE Development Team <jiung.kang@nhnent.com>
 */

'use strict';

var DOMHandler = require('./domHandler.js'),
    chartConst = require('../const.js');

/**
 * @classdesc View is parent of all view.
 * @class
 */
var View = ne.util.defineClass({
    init: function() {
        this.el = this.createElement('DIV', this.className || '');
    },

    /**
     * Append child element.
     * @param {element} elChild child element
     */
    append: function(elChild) {
        if (!elChild) {
            return;
        }
        this.el.appendChild(elChild);
    },

    /**
     * Dimension renderer
     * @param {{width: number, height: number} dimension dimension
     */
    renderDimension: function(dimension) {
        this.el.style.cssText = [
            ['width:', dimension.width, 'px'].join(''),
            ['height:', dimension.height, 'px'].join(''),
        ].join(';');
    },

    /**
     * Position(top, right) renderer
     * @param position
     */
    renderPosition: function(position) {
        if (ne.util.isUndefined(position)) {
            return;
        }

        if (position.top) {
            this.el.style.top = position.top + 'px';
        }

        if (position.left) {
            this.el.style.left = position.left + 'px';
        }

        if (position.right) {
            this.el.style.right = position.right + 'px';
        }
    },

    /**
     * Create size check element
     * @returns {element}
     * @private
     */
    _createSizeCheckEl: function() {
        var elDiv = document.createElement('DIV'),
            elSpan = document.createElement('SPAN');

        elDiv.appendChild(elSpan);
        elDiv.style.cssText = 'position:relative;top:10000px;left:10000px';
        return elDiv;
    },

    /**
     * Get rendered label size (width or height)
     * @param {string} label label
     * @param {number} fontSize font size
     * @param {string} property element property
     * @returns {number}
     * @private
     */
    _getRenderedLabelSize: function(label, fontSize, property) {
        var elDiv = this._createSizeCheckEl(),
            elSpan = elDiv.firstChild,
            labelSize;

        elSpan.innerHTML = label;
        elSpan.style.fontSize = (fontSize || chartConst.DEFAULT_LABEL_FONT_SIZE) + 'px';
        document.body.appendChild(elDiv);
        labelSize = elSpan[property];
        document.body.removeChild(elDiv);

        return labelSize;
    },

    /**
     * Get rendered label width.
     * @param {string} label label
     * @param {number} fontSize font size
     * @returns {number}
     */
    getRenderedLabelWidth: function(label, fontSize) {
        var labelWidth = this._getRenderedLabelSize(label, fontSize, 'offsetWidth');
        return labelWidth;
    },

    /**
     * Get rendered label height.
     * @param {string} label label
     * @param {number} fontSize font size
     * @returns {number}
     */
    getRenderedLabelHeight: function(label, fontSize) {
        var labelHeight = this._getRenderedLabelSize(label, fontSize, 'offsetHeight');
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

    /**
     * Is IE8?
     * @returns {boolean}
     */
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