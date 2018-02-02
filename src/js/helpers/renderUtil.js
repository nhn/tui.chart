/**
 * @fileoverview Util for rendering.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var chartConst = require('./../const');
var dom = require('./domHandler');
var arrayUtil = require('./arrayUtil');

var snippet = require('tui-code-snippet');
var predicate = require('./predicate');

var concat = Array.prototype.concat;

var browser = snippet.browser,
    isIE7 = browser.msie && browser.version === 7,
    isOldBrowser = browser.msie && browser.version <= 8;
var hasComputedStyle = window.getComputedStyle || false;

var lineBaseChartCount = 0;
var CLIP_RECT_ID = 'clipRectForAnimation';

/**
 * Util for rendering.
 * @module renderUtil
 * @private */
var renderUtil = {
    /**
     * Concat string.
     * @params {...string} target strings
     * @returns {string} concat string
     * @memberof module:renderUtil
     */
    concatStr: function() {
        return String.prototype.concat.apply('', arguments);
    },

    /**
     * Make cssText for font.
     * @param {{fontSize: number, fontFamily: string, color: string}} theme font theme
     * @returns {string} cssText
     * @memberof module:renderUtil
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

        if (theme.fontWeight) {
            cssTexts.push(this.concatStr('font-weight:', theme.fontWeight));
        }

        return cssTexts.join(';');
    },

    checkEl: null,
    /**
     * Create element for size check.
     * @memberof module:renderUtil
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

        snippet.forEach(theme, function(key, value) {
            keys.push(key + value);
        });

        return keys.join('-');
    },

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

        if (theme.fontWeight) {
            div.style.fontWeight = theme.fontWeight;
        }

        if (theme.cssText) {
            div.style.cssText += theme.cssText;
        }
    },

    /**
     * Size cache.
     * @type {object}
     * @private
     */
    sizeCache: {},

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

        label = snippet.isExisty(label) ? String(label) : '';

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
     * @memberof module:renderUtil
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
     * @memberof module:renderUtil
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
     * @memberof module:renderUtil
     * @param {string[]} labels labels
     * @param {{fontSize: number, fontFamily: string, color: string}} theme label theme
     * @param {function} iteratee iteratee
     * @returns {number} max size (width or height)
     * @private
     */
    _getRenderedLabelsMaxSize: function(labels, theme, iteratee) {
        var maxSize = 0,
            sizes;

        if (labels && labels.length) {
            sizes = snippet.map(labels, function(label) {
                return iteratee(label, theme);
            });
            maxSize = arrayUtil.max(sizes);
        }

        return maxSize;
    },

    /**
     * Get rendered labels max width.
     * @memberof module:renderUtil
     * @param {string[]} labels labels
     * @param {{fontSize: number, fontFamily: string, color: string}} theme label theme
     * @returns {number} max width
     * @private
     */
    getRenderedLabelsMaxWidth: function(labels, theme) {
        var iteratee = snippet.bind(this.getRenderedLabelWidth, this);
        var maxWidth = this._getRenderedLabelsMaxSize(labels, theme, iteratee);

        return maxWidth;
    },

    /**
     * Get rendered labels max height.
     * @memberof module:renderUtil
     * @param {string[]} labels labels
     * @param {{fontSize: number, fontFamily: string, color: string}} theme label theme
     * @returns {number} max height
     */
    getRenderedLabelsMaxHeight: function(labels, theme) {
        var iteratee = snippet.bind(this.getRenderedLabelHeight, this);
        var maxHeight = this._getRenderedLabelsMaxSize(labels, theme, iteratee);

        return maxHeight;
    },

    /**
     * Render dimension.
     * @memberof module:renderUtil
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
     * @memberof module:renderUtil
     * @param {HTMLElement} el target element
     * @param {{top: number, left: number, right: number}} position position
     */
    renderPosition: function(el, position) {
        if (snippet.isUndefined(position)) {
            return;
        }

        snippet.forEachArray(['top', 'bottom', 'left', 'right'], function(key) {
            var value = position[key];

            if (snippet.isNumber(value)) {
                el.style[key] = position[key] + 'px';
            }
        });
    },

    /**
     * Render background.
     * @memberof module:renderUtil
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
     * @memberof module:renderUtil
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
     * @memberof module:renderUtil
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
     * @memberof module:renderUtil
     */
    expandBound: function(bound) {
        var dimension = bound.dimension;
        var position = bound.position;

        return {
            dimension: {
                width: dimension.width + (chartConst.SERIES_EXPAND_SIZE * 2),
                height: dimension.height + (chartConst.SERIES_EXPAND_SIZE * 2)
            },
            position: {
                left: position.left - chartConst.SERIES_EXPAND_SIZE,
                top: position.top - chartConst.SERIES_EXPAND_SIZE
            }
        };
    },

    /**
     * Proper case.
     * @param {string} value - string value
     * @returns {string}
     */
    _properCase: function(value) {
        return value.substring(0, 1).toUpperCase() + value.substring(1);
    },

    /**
     * Make mouse event detector name.
     * @param {string} prefix prefix
     * @param {string} value value
     * @param {string} suffix suffix
     * @returns {string} mouse event detector name
     * @memberof module:renderUtil
     */
    makeMouseEventDetectorName: function(prefix, value, suffix) {
        return prefix + this._properCase(value) + this._properCase(suffix);
    },

    /**
     * Format value.
     * @param {object} params - raw data
     *     @param {number} params.value value
     *     @param {Array.<function>} params.formatFunctions - functions for format
     *     @param {string} params.chartType - type of chart
     *     @param {string} params.areaType - type of area like yAxis, xAxis, series, circleLegend
     *     @param {string} [params.valueType] - type of value
     *     @param {string} [params.legendName] - legendName
     * @returns {string} formatted value
     * @memberof module:renderUtil
     */
    formatValue: function(params) {
        var value = params.value;
        var formatFunctions = params.formatFunctions;
        var valueType = params.valueType || 'value';
        var areaType = params.areaType;
        var chartType = params.chartType;
        var legendName = params.legendName;

        var fns = [String(value)].concat(formatFunctions || []);

        return snippet.reduce(fns, function(stored, fn) {
            return fn(stored, chartType, areaType, valueType, legendName);
        });
    },
    /**
     * Format values.
     * @param {Array.<number>} values values
     * @param {Array.<function>} formatFunctions functions for format
     * @param {string} chartType - type of chart
     * @param {string} areaType - type of area like yAxis, xAxis, series, circleLegend
     * @param {string} valueType - type of value
     * @returns {Array.<string>}
     * @memberof module:renderUtil
     */
    formatValues: function(values, formatFunctions, chartType, areaType, valueType) {
        var formatedValues;

        if (!formatFunctions || !formatFunctions.length) {
            return values;
        }

        formatedValues = snippet.map(values, function(label) {
            return renderUtil.formatValue({
                value: label,
                formatFunctions: formatFunctions,
                chartType: chartType,
                areaType: areaType,
                valueType: valueType
            });
        });

        return formatedValues;
    },

    /**
     * Format date.
     * @param {string | number | date} value - value
     * @param {string} format - date format
     * @returns {string}
     * @memberof module:renderUtil
     */
    formatDate: function(value, format) {
        var date = snippet.isDate(value) ? value : (new Date(value));
        format = format || chartConst.DEFAULT_DATE_FORMAT;

        return snippet.formatDate(format, date) || value;
    },

    /**
     * Format dates.
     * @param {Array.<string | number | date>} values - values
     * @param {string} format - date format
     * @returns {Array}
     * @memberof module:renderUtil
     */
    formatDates: function(values, format) {
        var formatDate = this.formatDate;

        format = format || chartConst.DEFAULT_DATE_FORMAT;

        return snippet.map(values, function(value) {
            return formatDate(value, format);
        });
    },

    /**
     * Cancel animation
     * @param {{id: number}} animation animaion object
     * @memberof module:renderUtil
     */
    cancelAnimation: function(animation) {
        if (animation && animation.id) {
            cancelAnimationFrame(animation.id);
            delete animation.id;
        }
    },

    /**
     * Start animation.
     * @param {number} animationTime - animation time
     * @param {function} onAnimation - animation callback function
     * @param {function} onCompleted - completed callback function
     * @returns {{id: number}} requestAnimationFrame id
     * @memberof module:renderUtil
     */
    startAnimation: function(animationTime, onAnimation, onCompleted) {
        var animation = {},
            startTime;

        /**
         * Animate.
         */
        function animate() {
            var diffTime = (new Date()).getTime() - startTime,
                ratio = Math.min((diffTime / animationTime), 1);

            onAnimation(ratio);

            if (ratio === 1) {
                delete animation.id;
                if (onCompleted) {
                    onCompleted();
                }
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
     * @memberof module:renderUtil
     * @returns {boolean} result boolean
     */
    isOldBrowser: function() {
        return isOldBrowser;
    },

    /**
     * Format to zero fill.
     * @param {string} value target value
     * @param {number} len length of result
     * @returns {string} formatted value
     * @private
     */
    formatToZeroFill: function(value, len) {
        var zero = '0';

        value = String(value);

        if (value.length >= len) {
            return value;
        }

        while (value.length < len) {
            value = zero + value;
        }

        return value;
    },

    /**
     * Format to Decimal.
     * @param {string} value target value
     * @param {number} len length of under decimal point
     * @returns {string} formatted value
     * @memberof module:renderUtil
     */
    formatToDecimal: function(value, len) {
        var DECIMAL = 10;
        var pow;

        if (len === 0) {
            return Math.round(value);
        }

        pow = Math.pow(DECIMAL, len);
        value = Math.round(value * pow) / pow;
        value = parseFloat(value).toFixed(len);

        return value;
    },

    /**
     * Format to Comma.
     * @param {string} value target value
     * @returns {string} formatted value
     * @private
     */
    formatToComma: function(value) {
        var comma = ',',
            underPointValue = '',
            betweenLen = 3,
            orgValue = value,
            sign, values, lastIndex, formattedValue;

        value = String(value);
        sign = value.indexOf('-') > -1 ? '-' : '';

        if (value.indexOf('.') > -1) {
            values = value.split('.');
            value = String(Math.abs(values[0]));
            underPointValue = '.' + values[1];
        } else {
            value = String(Math.abs(value));
        }

        if (value.length <= betweenLen) {
            formattedValue = orgValue;
        } else {
            values = (value).split('').reverse();
            lastIndex = values.length - 1;
            values = snippet.map(values, function(char, index) {
                var result = [char];
                if (index < lastIndex && (index + 1) % betweenLen === 0) {
                    result.push(comma);
                }

                return result;
            });
            formattedValue = sign + concat.apply([], values).reverse().join('') + underPointValue;
        }

        return formattedValue;
    },

    /**
     * Make cssText from map.
     * @param {object} cssMap - css map
     * @returns {string}
     * @memberof module:renderUtil
     */
    makeCssTextFromMap: function(cssMap) {
        return snippet.map(cssMap, function(value, name) {
            return renderUtil.concatStr(name, ':', value);
        }).join(';');
    },

    /**
     * Perse String.
     * @param {string} value - string
     * @returns {string}
     */
    _perseString: function(value) {
        return typeof value === 'string' || typeof value === 'number' ? String(value) : '';
    },

    /**
     * Add prefix or suffix to label.
     * @param {array} labels - labels
     * @param {string} prefix - string
     * @param {string} suffix - string
     * @returns {array}
     * @memberof module:renderUtil
     */
    addPrefixSuffix: function(labels, prefix, suffix) {
        prefix = this._perseString(prefix);
        suffix = this._perseString(suffix);

        if (!(prefix === '' && suffix === '')) {
            return snippet.map(labels, function(label) {
                return prefix + label + suffix;
            });
        }

        return labels;
    },

    /**
     * Returns element's style value defined at css file
     * @param {HTMLElement} target - Current element
     * @returns {Object} Style object of element
     * @memberof module:renderUtil
     */
    getStyle: function(target) {
        var computedObj;

        if (hasComputedStyle) {
            computedObj = window.getComputedStyle(target, '');
        } else {
            computedObj = target.currentStyle;
        }

        return computedObj;
    },

    /**
     * Get clip rect id
     * @returns {string} create unique id by line base chart count
     */
    generateClipRectId: function() {
        var id = CLIP_RECT_ID + lineBaseChartCount;
        lineBaseChartCount += 1;

        return id;
    },

    /**
     * get default height of series top area
     * @param {string} chartType - chart type
     * @param {object} theme - series theme
     * @returns {number} - default series top height
     */
    getDefaultSeriesTopAreaHeight: function(chartType, theme) {
        if (predicate.isBarTypeChart(chartType) ||
            predicate.isLineTypeChart(chartType) ||
            predicate.isComboChart(chartType) ||
            predicate.isBulletChart(chartType)
        ) {
            return this.getRenderedLabelHeight(chartConst.MAX_HEIGHT_WORD, theme) +
                chartConst.SERIES_LABEL_PADDING;
        }

        return 0;
    }
};

/**
 * Set css opacity.
 * @param {HTMLElement | Array.<HTMLElement>} elements - elements
 * @param {function} iteratee - iteratee
 * @ignore
 */
function setOpacity(elements, iteratee) {
    elements = snippet.isArray(elements) ? elements : [elements];
    snippet.forEachArray(elements, iteratee);
}

/**
 * Make filter opacity css string.
 * @param {number} opacity - opacity
 * @returns {string}
 * @ignore
 */
function makeCssFilterOpacityString(opacity) {
    return 'alpha(opacity=' + (opacity * chartConst.OLD_BROWSER_OPACITY_100) + ')';
}

if (isOldBrowser) {
    /**
     * Make opacity css text for old browser(IE7, IE8).
     * @param {number} opacity - opacity
     * @returns {string}
     */
    renderUtil.makeOpacityCssText = function(opacity) {
        var cssText = '';

        if (snippet.isExisty(opacity)) {
            cssText = ';filter:' + makeCssFilterOpacityString(opacity);
        }

        return cssText;
    };

    /**
     * Set css opacity for old browser(IE7, IE8).
     * @param {HTMLElement | Array.<HTMLElement>} elements - elements
     * @param {number} opacity - opacity
     */
    renderUtil.setOpacity = function(elements, opacity) {
        var filter = makeCssFilterOpacityString(opacity);
        setOpacity(elements, function(element) {
            element.style.filter = filter;
        });
    };
} else {
    /**
     * Make opacity css text for browser supporting opacity property of CSS3.
     * @param {number} opacity - opacity
     * @returns {string}
     */
    renderUtil.makeOpacityCssText = function(opacity) {
        var cssText = '';

        if (snippet.isExisty(opacity)) {
            cssText = ';opacity:' + opacity;
        }

        return cssText;
    };

    /**
     * Set css opacity for browser supporting opacity property of CSS3.
     * @param {HTMLElement | Array.<HTMLElement>} elements - elements
     * @param {number} opacity - opacity
     */
    renderUtil.setOpacity = function(elements, opacity) {
        setOpacity(elements, function(element) {
            element.style.opacity = opacity;
        });
    };
}

module.exports = renderUtil;
