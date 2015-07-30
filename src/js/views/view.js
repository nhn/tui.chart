/**
 * @fileoverview View is parent of all view.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var dom = require('./domHandler.js'),
    chartConst = require('../const.js');

var browser = ne.util.browser,
    isIE8 = browser.msie && browser.version === 8,
    View;

View = ne.util.defineClass(/** @lends View.prototype */ {
    /**
     * View is parent of all view.
     * @constructs View
     */
    init: function() {
        this.el = dom.createElement('DIV', this.className || '');
    },

    /**
     * Append child element.
     * @param {HTMLElement} elChild child element
     */
    append: function(elChild) {
        if (!elChild) {
            return;
        }
        this.el.appendChild(elChild);
    },

    /**
     * Append child elements.
     * @param {array.<HTMLElement>} elChildren child elements
     */
    appends: function(elChildren) {
        ne.util.forEachArray(elChildren, this.append, this);
    },

    /**
     * Dimension renderer
     * @param {{width: number, height: number}} dimension dimension
     */
    renderDimension: function(dimension) {
        this.el.style.cssText = [
            this.concatStr('width:', dimension.width, 'px'),
            this.concatStr('height:', dimension.height, 'px')
        ].join(';');
    },

    /**
     * Position(top, right) renderer
     * @param {{top: number, left: number, right: number}} position position
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
     * @param {{fontSize: number, color: string, background: string}} theme title theme
     * @param {string} className css class name
     * @returns {HTMLElement} title element
     */
    renderTitle: function(title, theme, className) {
        var elTitle, cssText;

        if (!title) {
            return;
        }

        elTitle = dom.createElement('DIV', className);
        elTitle.innerHTML = title;

        cssText = this.makeFontCssText(theme);

        if (theme.background) {
            cssText += ';' + this.concatStr('background:', theme.background);
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
     * Concat string
     * @params {...string} target strings
     * @returns {string} concat string
     */
    concatStr: function() {
        return String.prototype.concat.apply('', arguments);
    },

    /**
     * Makes css text for font.
     * @param {{fontSize: number, fontFamily: string, color: string}} theme font theme
     * @returns {string} cssText
     */
    makeFontCssText: function(theme) {
        var cssTexts = [];

        if (!theme) {
            return '';
        }

        if (theme.fontSize) {
            cssTexts.push(this.concatStr('font-size:', theme.fontSize, 'px'));
        }

        if (theme.fontFamily) {
            cssTexts.push(this.concatStr('font-family:', theme.fontFamily));
        }

        if (theme.color) {
            cssTexts.push(this.concatStr('color:', theme.color));
        }

        return cssTexts.join(';');
    },

    /**
     * Create size check element
     * @returns {HTMLElement} element
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
     * @param {object} options options
     * @param {string} property element property
     * @returns {number} size
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
     * @returns {number} width
     */
    getRenderedLabelWidth: function(label, options) {
        var labelWidth = this._getRenderedLabelSize(label, options, 'offsetWidth');
        return labelWidth;
    },

    /**
     * Get rendered label height.
     * @param {string} label label
     * @param {{fontSize: number, fontFamily: string, color: string}} theme label theme
     * @returns {number} height
     */
    getRenderedLabelHeight: function(label, theme) {
        var labelHeight = this._getRenderedLabelSize(label, theme, 'offsetHeight');
        return labelHeight;
    },

    /**
     * Get Rendered Labels Max Size(width or height)
     * @param {string[]} labels labels
     * @param {{fontSize: number, fontFamily: string, color: string}} theme label theme
     * @param {function} iteratee iteratee
     * @returns {number} max size (width or height)
     * @private
     */
    _getRenderedLabelsMaxSize: function(labels, theme, iteratee) {
        var sizes = ne.util.map(labels, function(label) {
                return iteratee(label, theme);
            }, this),
            maxSize = ne.util.max(sizes);
        return maxSize;
    },

    /**
     * Get rendered labels max width.
     * @param {string[]} labels labels
     * @param {{fontSize: number, fontFamily: string, color: string}} theme label theme
     * @returns {number} max width
     */
    getRenderedLabelsMaxWidth: function(labels, theme) {
        var iteratee = ne.util.bind(this.getRenderedLabelWidth, this),
            maxWidth = this._getRenderedLabelsMaxSize(labels, theme, iteratee);
        return maxWidth;
    },

    /**
     * Get rendered labels max height.
     * @param {string[]} labels labels
     * @param {{fontSize: number, fontFamily: string, color: string}} theme label theme
     * @returns {number} max height
     */
    getRenderedLabelsMaxHeight: function(labels, theme) {
        var iteratee = ne.util.bind(this.getRenderedLabelHeight, this),
            result = this._getRenderedLabelsMaxSize(labels, theme, iteratee);
        return result;
    },

    /**
     * Is IE8?
     * @returns {boolean} is ie8
     */
    isIE8: function() {
        return isIE8;
    }
});

ne.util.CustomEvents.mixin(View);

module.exports = View;