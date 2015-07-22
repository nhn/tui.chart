/**
 * @fileoverview View is parent of all view.
 * @author NHN Ent.
 *         FE Development Team <jiung.kang@nhnent.com>
 */

'use strict';

var dom = require('./domHandler.js'),
    chartConst = require('../const.js');

/**
 * @classdesc View is parent of all view.
 * @class
 */
var View = ne.util.defineClass({
    /**
     * Constructor
     */
    init: function() {
        this.el = dom.createElement('DIV', this.className || '');
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
            this.concatStr('width:', dimension.width, 'px'),
            this.concatStr('height:', dimension.height, 'px'),
        ].join(';');
    },

    /**
     * Position(top, right) renderer
     * @param {{top: number, left: number, right: number} position position
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
     * Title renderer
     * @param {string} title title
     * @param {{fontSize: number, color: string, background: string}} options options
     * @param {string} className css class name
     * @returns {element}
     */
    renderTitle: function(title, options, className) {
        var elTitle, cssText;

        if (!title) {
            return;
        }

        elTitle = dom.createElement('DIV', className);
        elTitle.innerHTML = title;

        cssText = this.makeFontCssText(options);

        if (options.background) {
            cssText += ';' + this.concatStr('background:', options.background);
        }

        elTitle.style.cssText = cssText;

        return elTitle;
    },

    /**
     * Background renderer.
     * @param {string} background background option
     */
    renderBackground: function(background) {
        if (!background) {
            return;
        }

        this.el.style.background = background;
    },

    /**
     * concat string
     * @params {...string} target strings
     * @returns {string}
     */
    concatStr: function() {
        return String.prototype.concat.apply('', arguments);
    },

    /**
     * Makes css text for font.
     * @param options
     * @returns {string}
     */
    makeFontCssText: function(options) {
        var cssTexts = [];

        if (options.fontSize) {
            cssTexts.push(this.concatStr('font-size:', options.fontSize, 'px'));
        }

        if (options.fontFamily) {
            cssTexts.push(this.concatStr('font-family:', options.fontFamily));
        }

        if (options.color) {
            cssTexts.push(this.concatStr('color:', options.color));
        }

        return cssTexts.join(';');
    },

    /**
     * Create size check element
     * @returns {element}
     * @private
     */
    _createSizeCheckEl: function() {
        var elDiv = dom.createElement('DIV'),
            elSpan = dom.createElement('SPAN');

        elDiv.appendChild(elSpan);
        elDiv.style.cssText = 'position:relative;top:10000px;left:10000px;line-height:1';
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
    _getRenderedLabelSize: function(label, options, property) {
        var elDiv = this._createSizeCheckEl(),
            elSpan = elDiv.firstChild,
            labelSize;

        options = options || {};
        elSpan.innerHTML = label;
        elSpan.style.fontSize = (options.fontSize || chartConst.DEFAULT_LABEL_FONT_SIZE) + 'px';

        if (options.fontFamily) {
            elSpan.style.fontFamily = options.fontFamily;
        }

        document.body.appendChild(elDiv);
        labelSize = elSpan[property];
        document.body.removeChild(elDiv);
        return labelSize;
    },

    /**
     * Get rendered label width.
     * @param {string} label label
     * @param {{fontSize: number, fontFamily: string, color: string}} options label options
     * @returns {number}
     */
    getRenderedLabelWidth: function(label, options) {
        var labelWidth = this._getRenderedLabelSize(label, options, 'offsetWidth');
        return labelWidth;
    },

    /**
     * Get rendered label height.
     * @param {string} label label
     * @param {{fontSize: number, fontFamily: string, color: string}} options label options
     * @returns {number}
     */
    getRenderedLabelHeight: function(label, options) {
        var labelHeight = this._getRenderedLabelSize(label, options, 'offsetHeight');
        return labelHeight;
    },

    /**
     * Get Rendered Labels Max Size(width or height)
     * @param {array} labels
     * @param {{fontSize: number, fontFamily: string, color: string}} options label options
     * @param {function} iteratee
     * @returns {number}
     * @private
     */
    _getRenderedLabelsMaxSize: function(labels, options, iteratee) {
        var sizes = ne.util.map(labels, function(label) {
                return iteratee(label, options);
            }, this),
            result = ne.util.max(sizes);
        return result;
    },

    /**
     * Get rendered labels max width.
     * @param {array} labels labels
     * @param {{fontSize: number, fontFamily: string, color: string}} options label options
     * @returns {number}
     */
    getRenderedLabelsMaxWidth: function(labels, options) {
        var iteratee = ne.util.bind(this.getRenderedLabelWidth, this),
            result = this._getRenderedLabelsMaxSize(labels, options, iteratee);
        return result;
    },

    /**
     * Get rendered labels max height.
     * @param {array} labels labels
     * @param {{fontSize: number, fontFamily: string, color: string}} options label options
     * @returns {number}
     */
    getRenderedLabelsMaxHeight: function(labels, options) {
        var iteratee = ne.util.bind(this.getRenderedLabelHeight, this),
            result = this._getRenderedLabelsMaxSize(labels, options, iteratee);
        return result;
    },

    /**
     * Is IE8?
     * @returns {boolean}
     */
    isIE8: function() {
        var browser = ne.util.browser,
            ie8 = browser.msie && browser.version === 8,
            isIE8 = function() {
                return ie8;
            };
        this.isIE8 = isIE8;
        return isIE8();
    }
});

ne.util.CustomEvents.mixin(View);

module.exports = View;