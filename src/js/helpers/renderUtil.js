/**
 * @fileoverview Util for rendering.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var dom = require('./domHandler'),
    chartConst = require('./../const');

var browser = tui.util.browser,
    isIE7 = browser.msie && browser.version === 7,
    isOldBrowser = browser.msie && browser.version <= 8;

/**
 * Util for rendering.
 * @module renderUtil
 */
var renderUtil = {
    /**
     * Concat string.
     * @memberOf module:renderUtil
     * @params {...string} target strings
     * @returns {string} concat string
     */
    concatStr: function() {
        return String.prototype.concat.apply('', arguments);
    },

    /**
     * Make cssText for font.
     * @memberOf module:renderUtil
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

    checkEl: null,
    /**
     * Create element for size check.
     * @memberOf module:renderUtil
     * @returns {HTMLElement} element
     * @private
     */
    _createSizeCheckEl: function() {
        var div, span;
        if (!this.checkEl) {
            div = dom.create('DIV', 'tui-chart-size-check-element');
            span = dom.create('SPAN');
            div.appendChild(span);
            this.checkEl = div;
        } else {
            this.checkEl.style.cssText = '';
        }

        return this.checkEl;
    },

    /**
     * Make caching key.
     * @param {string} label labek
     * @param {{fontSize: number, fontFamily: string}} theme theme
     * @param {string} offsetType offset type (offsetWidth or offsetHeight)
     * @returns {string} key
     * @private
     */
    _makeCachingKey: function(label, theme, offsetType) {
        var keys = [label, offsetType];

        tui.util.forEach(theme, function(key, value) {
            keys.push(key + value);
        });

        return keys.join('-');
    },

    /**
     * Size cache.
     * @type {object}
     */
    sizeCache: {},

    /**
     * Add css style.
     * @param {HTMLElement} div div element
     * @param {{fontSize: number, fontFamily: string, cssText: string}} theme theme
     * @private
     */
    _addCssStyle: function(div, theme) {
        div.style.fontSize = (theme.fontSize || chartConst.DEFAULT_LABEL_FONT_SIZE) + 'px';

        if (theme.fontFamily) {
            div.style.fontFamily = theme.fontFamily;
        }

        if (theme.cssText) {
            div.style.cssText += theme.cssText;
        }
    },

    /**
     * Get rendered label size (width or height).
     * @memberOf module:renderUtil
     * @param {string | number} label label
     * @param {object} theme theme
     * @param {string} offsetType offset type (offsetWidth or offsetHeight)
     * @returns {number} size
     * @private
     */
    _getRenderedLabelSize: function(label, theme, offsetType) {
        var key, div, span, labelSize;

        theme = theme || {};

        label += '';

        if (!label) {
            return 0;
        }

        key = this._makeCachingKey(label, theme, offsetType);
        labelSize = this.sizeCache[key];

        if (!labelSize) {
            div = this._createSizeCheckEl();
            span = div.firstChild;

            span.innerHTML = label;

            this._addCssStyle(div, theme);

            document.body.appendChild(div);
            labelSize = span[offsetType];
            document.body.removeChild(div);

            this.sizeCache[key] = labelSize;
        }

        return labelSize;
    },

    /**
     * Get rendered label width.
     * @memberOf module:renderUtil
     * @param {string} label label
     * @param {{fontSize: number, fontFamily: string, color: string}} theme label theme
     * @returns {number} width
     */
    getRenderedLabelWidth: function(label, theme) {
        var labelWidth = this._getRenderedLabelSize(label, theme, 'offsetWidth');
        return labelWidth;
    },

    /**
     * Get rendered label height.
     * @memberOf module:renderUtil
     * @param {string} label label
     * @param {{fontSize: number, fontFamily: string, color: string}} theme label theme
     * @returns {number} height
     */
    getRenderedLabelHeight: function(label, theme) {
        var labelHeight = this._getRenderedLabelSize(label, theme, 'offsetHeight');
        return labelHeight;
    },

    /**
     * Get Rendered Labels Max Size(width or height).
     * @memberOf module:boundsMaker
     * @param {string[]} labels labels
     * @param {{fontSize: number, fontFamily: string, color: string}} theme label theme
     * @param {function} iteratee iteratee
     * @returns {number} max size (width or height)
     * @private
     */
    _getRenderedLabelsMaxSize: function(labels, theme, iteratee) {
        var sizes = tui.util.map(labels, function(label) {
                return iteratee(label, theme);
            }, this),
            maxSize = tui.util.max(sizes);
        return maxSize;
    },

    /**
     * Get rendered labels max width.
     * @memberOf module:boundsMaker
     * @param {string[]} labels labels
     * @param {{fontSize: number, fontFamily: string, color: string}} theme label theme
     * @returns {number} max width
     * @private
     */
    getRenderedLabelsMaxWidth: function(labels, theme) {
        var iteratee = tui.util.bind(this.getRenderedLabelWidth, this),
            maxWidth = this._getRenderedLabelsMaxSize(labels, theme, iteratee);
        return maxWidth;
    },

    /**
     * Get rendered labels max height.
     * @memberOf module:boundsMaker
     * @param {string[]} labels labels
     * @param {{fontSize: number, fontFamily: string, color: string}} theme label theme
     * @returns {number} max height
     */
    getRenderedLabelsMaxHeight: function(labels, theme) {
        var iteratee = tui.util.bind(this.getRenderedLabelHeight, this),
            maxHeight = this._getRenderedLabelsMaxSize(labels, theme, iteratee);
        return maxHeight;
    },

    /**
     * Render dimension.
     * @memberOf module:renderUtil
     * @param {HTMLElement} el target element
     * @param {{width: number, height: number}} dimension dimension
     */
    renderDimension: function(el, dimension) {
        el.style.cssText = [
            this.concatStr('width:', dimension.width, 'px'),
            this.concatStr('height:', dimension.height, 'px')
        ].join(';');
    },

    /**
     * Render position(top, right).
     * @memberOf module:renderUtil
     * @param {HTMLElement} el target element
     * @param {{top: number, left: number, right: number}} position position
     */
    renderPosition: function(el, position) {
        if (tui.util.isUndefined(position)) {
            return;
        }

        if (!tui.util.isUndefined(position.top)) {
            el.style.top = position.top + 'px';
        }

        if (!tui.util.isUndefined(position.left)) {
            el.style.left = position.left + 'px';
        }

        if (!tui.util.isUndefined(position.right)) {
            el.style.right = position.right + 'px';
        }
    },

    /**
     * Render background.
     * @memberOf module:renderUtil
     * @param {HTMLElement} el target element
     * @param {string} background background option
     */
    renderBackground: function(el, background) {
        if (!background) {
            return;
        }

        el.style.background = background;
    },

    /**
     * Render font family.
     * @memberOf module:renderUtil
     * @param {HTMLElement} el target element
     * @param {string} fontFamily font family option
     */
    renderFontFamily: function(el, fontFamily) {
        if (!fontFamily) {
            return;
        }

        el.style.fontFamily = fontFamily;
    },

    /**
     * Render title.
     * @memberOf module:renderUtil
     * @param {string} title title
     * @param {{fontSize: number, color: string, background: string}} theme title theme
     * @param {string} className css class name
     * @returns {HTMLElement} title element
     */
    renderTitle: function(title, theme, className) {
        var elTitle, cssText;

        if (!title) {
            return null;
        }

        elTitle = dom.create('DIV', className);
        elTitle.innerHTML = title;

        cssText = renderUtil.makeFontCssText(theme);

        if (theme.background) {
            cssText += ';' + this.concatStr('background:', theme.background);
        }

        elTitle.style.cssText = cssText;

        return elTitle;
    },

    /**
     * Expand dimension.
     * @param {{
     *      dimension: {width: number, height: number},
     *      position: {left: number, top: number}
     * }} bound series bound
     * @returns {{
     *      dimension: {width: number, height: number},
     *      position: {left: number, top: number}
     * }} expended bound
     */
    expandBound: function(bound) {
        var dimension = bound.dimension,
            position = bound.position;
        return {
            dimension: {
                width: dimension.width + chartConst.SERIES_EXPAND_SIZE * 2,
                height: dimension.height + chartConst.SERIES_EXPAND_SIZE * 2
            },
            position: {
                left: position.left - chartConst.SERIES_EXPAND_SIZE,
                top: position.top - chartConst.SERIES_EXPAND_SIZE
            }
        };
    },

    /**
     * Make custom event name.
     * @param {string} prefix prefix
     * @param {string} value value
     * @param {string} suffix suffix
     * @returns {string} custom event name
     */
    makeCustomEventName: function(prefix, value, suffix) {
        return prefix + tui.util.properCase(value) + tui.util.properCase(suffix);
    },

    /**
     * Format value.
     * @param {number} value value
     * @param {Array.<function>} formatFunctions functions for format
     * @returns {string} formatted value
     */
    formatValue: function(value, formatFunctions) {
        var fns = [value].concat(formatFunctions || []);

        return tui.util.reduce(fns, function(stored, fn) {
            return fn(stored);
        });
    },

    /**
     * Cancel animation
     * @param {{id: number}} animation animaion object
     */
    cancelAnimation: function(animation) {
        if (animation && animation.id) {
            cancelAnimationFrame(animation.id);
            delete animation.id;
        }
    },

    /**
     * Start animation.
     * @param {number} animationTime animation time
     * @param {function} callback callback function
     * @returns {{id: number}} requestAnimationFrame id
     */
    startAnimation: function(animationTime, callback) {
        var animation = {},
            startTime;

        function animate() {
            var diffTime = (new Date()).getTime() - startTime,
                ratio = Math.min((diffTime / animationTime), 1);

            callback(ratio);

            if (ratio === 1) {
                delete animation.id;
            } else {
                animation.id = requestAnimationFrame(animate);
            }
        }

        startTime = (new Date()).getTime();
        animation.id = requestAnimationFrame(animate);

        return animation;
    },

    /**
     * Whether IE7 or not.
     * @returns {boolean} result boolean
     */
    isIE7: function() {
        return isIE7;
    },

    /**
     * Whether oldBrowser or not.
     * @memberOf module:renderUtil
     * @returns {boolean} result boolean
     */
    isOldBrowser: function() {
        return isOldBrowser;
    }
};

tui.util.defineNamespace('tui.chart');
tui.chart.renderUtil = renderUtil;

module.exports = renderUtil;
