/**
 * @fileoverview Util for rendering.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */

import chartConst from './../const';
import dom from './domHandler';
import arrayUtil from './arrayUtil';
import snippet from 'tui-code-snippet';
const { browser } = snippet;
const isOldBrowser = browser.msie && browser.version <= 8;
const hasComputedStyle = window.getComputedStyle || false;
const CLIP_RECT_ID = 'clipRectForAnimation';
let lineBaseChartCount = 0;

/**
 * Util for rendering.
 * @module renderUtil
 * @private */
const renderUtil = {
  /**
   * Concat string.
   * @params {...string} target strings
   * @returns {string} concat string
   * @memberof module:renderUtil
   */
  concatStr(...args) {
    return String.prototype.concat.apply('', args);
  },

  /**
   * oneline trim tag for template literal
   * @params {...string} target strings
   * @returns {string} templating string
   * @memberof module:renderUtil
   */
  oneLineTrim(...args) {
    const normalTag = (template, ...expressions) =>
      template.reduce((accumulator, part, i) => accumulator + expressions[i - 1] + part);

    return normalTag(...args).replace(/\n\s*/g, '');
  },

  /**
   * Make cssText for font.
   * @param {{fontSize: number, fontFamily: string, color: string}} theme font theme
   * @returns {string} cssText
   * @memberof module:renderUtil
   */
  makeFontCssText(theme = {}) {
    const cssTexts = [];

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

    return cssTexts.length ? cssTexts.join(';') : '';
  },

  /**
   * Make caching key.
   * @param {string} label labek
   * @param {{fontSize: number, fontFamily: string}} theme theme
   * @param {string} offsetType offset type (offsetWidth or offsetHeight)
   * @returns {string} key
   * @private
   */
  _makeCachingKey(label, theme, offsetType) {
    const keys = [label, offsetType];

    snippet.forEach(theme, (key, value) => {
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
  _addCssStyle(div, { fontSize, fontFamily, fontWeight, cssText } = {}) {
    div.style.fontSize = `${fontSize || chartConst.DEFAULT_LABEL_FONT_SIZE}px`;

    if (fontFamily) {
      div.style.fontFamily = fontFamily;
    }

    if (fontWeight) {
      div.style.fontWeight = fontWeight;
    }

    if (cssText) {
      div.style.cssText += cssText;
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
  _getRenderedLabelSize(label = '', theme = {}, offsetType) {
    label = String(label);

    if (!label) {
      return 0;
    }

    const key = this._makeCachingKey(label, theme, offsetType);
    let labelSize = this.sizeCache[key];

    if (!labelSize) {
      const div = this._createSizeCheckEl();
      const span = div.firstChild;
      span.innerText = label;

      this._addCssStyle(div, theme);

      document.body.appendChild(div);
      labelSize = span[offsetType];
      document.body.removeChild(div);

      this.sizeCache[key] = labelSize;
    }

    return labelSize;
  },

  checkEl: null,
  /**
   * Create element for size check.
   * @memberof module:renderUtil
   * @returns {HTMLElement} element
   * @private
   */
  _createSizeCheckEl() {
    if (!this.checkEl) {
      const div = dom.create('DIV', 'tui-chart-size-check-element');
      const span = dom.create('SPAN');
      div.appendChild(span);
      this.checkEl = div;
    } else {
      this.checkEl.style.cssText = '';
    }

    return this.checkEl;
  },

  /**
   * Get rendered label width.
   * @memberof module:renderUtil
   * @param {string} label label
   * @param {{fontSize: number, fontFamily: string, color: string}} theme label theme
   * @returns {number} width
   */
  getRenderedLabelWidth(label, theme) {
    return this._getRenderedLabelSize(label, theme, 'offsetWidth');
  },

  /**
   * Get rendered label height.
   * @memberof module:renderUtil
   * @param {string} label label
   * @param {{fontSize: number, fontFamily: string, color: string}} theme label theme
   * @returns {number} height
   */
  getRenderedLabelHeight(label, theme) {
    return this._getRenderedLabelSize(label, theme, 'offsetHeight');
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
  _getRenderedLabelsMaxSize(labels, theme, iteratee) {
    let maxSize = 0;

    if (labels && labels.length) {
      const sizes = snippet.map(labels, label => iteratee(label, theme));
      maxSize = arrayUtil.max(sizes);
    }

    return maxSize;
  },

  /**
   * Get rendered labels max width.
   * @memberof module:renderUtil
   * @param {string[]} labels labels
   * @param {{fontSize: number, fontFamily: string, color: string}} theme label theme
   * @param {number} [maxWidth] - max width
   * @returns {number} max width
   * @private
   */
  getRenderedLabelsMaxWidth(labels, theme, maxWidth) {
    const iteratee = snippet.bind(this.getRenderedLabelWidth, this);
    const labelMaxSize = this._getRenderedLabelsMaxSize(labels, theme, iteratee);

    return maxWidth ? Math.min(maxWidth, labelMaxSize) : labelMaxSize;
  },

  /**
   * Get rendered labels max height.
   * @memberof module:renderUtil
   * @param {string[]} labels labels
   * @param {{fontSize: number, fontFamily: string, color: string}} theme label theme
   * @returns {number} max height
   */
  getRenderedLabelsMaxHeight(labels, theme) {
    const iteratee = snippet.bind(this.getRenderedLabelHeight, this);

    return this._getRenderedLabelsMaxSize(labels, theme, iteratee);
  },

  /**
   * Render dimension.
   * @memberof module:renderUtil
   * @param {HTMLElement} el target element
   * @param {{width: number, height: number}} dimension dimension
   */
  renderDimension(el, { width = 0, height = 0 }) {
    el.style.cssText = [
      this.concatStr('width:', width, 'px'),
      this.concatStr('height:', height, 'px')
    ].join(';');
  },

  /**
   * Render position(top, right).
   * @memberof module:renderUtil
   * @param {HTMLElement} el target element
   * @param {{top: number, left: number, right: number}} position position
   */
  renderPosition(el, position) {
    if (snippet.isUndefined(position)) {
      return;
    }

    snippet.forEachArray(['top', 'bottom', 'left', 'right'], key => {
      const value = position[key];

      if (snippet.isNumber(value)) {
        el.style[key] = `${value}px`;
      }
    });
  },

  /**
   * Render background.
   * @memberof module:renderUtil
   * @param {HTMLElement} el target element
   * @param {string} background background option
   */
  renderBackground(el, background) {
    if (background) {
      el.style.background = background;
    }
  },

  /**
   * Render font family.
   * @memberof module:renderUtil
   * @param {HTMLElement} el target element
   * @param {string} fontFamily font family option
   */
  renderFontFamily(el, fontFamily) {
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
  renderTitle(title, theme, className) {
    if (!title) {
      return null;
    }

    let cssText = renderUtil.makeFontCssText(theme);
    const elTitle = dom.create('DIV', className);
    elTitle.innerHTML = title;

    if (theme.background) {
      cssText += `;${this.concatStr('background:', theme.background)}`;
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
  expandBound({ dimension, position }) {
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
   * Proper case.
   * @param {string} value - string value
   * @returns {string}
   */
  _properCase(value) {
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
  makeMouseEventDetectorName(prefix, value, suffix) {
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
  formatValue(params) {
    const { value, formatFunctions, valueType = 'value', areaType, legendName, chartType } = params;
    const fns = [String(value), ...(formatFunctions || [])];

    return snippet.reduce(fns, (stored, fn) =>
      fn(stored, chartType, areaType, valueType, legendName)
    );
  },
  /**
   * Format values.
   * @param {Array.<number>} values values
   * @param {Array.<function>} formatFunctions functions for format
   * @param {object} typeInfos - type of chart
   *     @param {string} typeInfos.chartType - type of chart
   *     @param {string} typeInfos.areaType - type of area like yAxis, xAxis, series, circleLegend
   *     @param {string} typeInfos.valueType - type of value
   * @returns {Array.<string>}
   * @memberof module:renderUtil
   */
  formatValues(values, formatFunctions, typeInfos = {}) {
    const { chartType, areaType, valueType } = typeInfos;

    if (!formatFunctions || !formatFunctions.length) {
      return values;
    }

    return snippet.map(values, value =>
      renderUtil.formatValue({
        value,
        formatFunctions,
        chartType,
        areaType,
        valueType
      })
    );
  },

  /**
   * Format date.
   * @param {string | number | date} value - value
   * @param {string} format - date format
   * @returns {string}
   * @memberof module:renderUtil
   */
  formatDate(value, format = chartConst.DEFAULT_DATE_FORMAT) {
    const date = snippet.isDate(value) ? value : new Date(value);

    return snippet.formatDate(format, date) || value;
  },

  /**
   * Format dates.
   * @param {Array.<string | number | date>} values - values
   * @param {string} format - date format
   * @returns {Array}
   * @memberof module:renderUtil
   */
  formatDates(values, format = chartConst.DEFAULT_DATE_FORMAT) {
    return snippet.map(values, value => this.formatDate(value, format));
  },

  /**
   * Cancel animation
   * @param {{id: number}} animation animaion object
   * @memberof module:renderUtil
   */
  cancelAnimation(animation) {
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
  startAnimation(animationTime, onAnimation, onCompleted) {
    const animation = {};
    const startTime = new Date().getTime();

    /**
     * Animate.
     */
    function animate() {
      const diffTime = new Date().getTime() - startTime;
      const ratio = Math.min(diffTime / animationTime, 1);

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

    animation.id = requestAnimationFrame(animate);

    return animation;
  },

  /**
   * Whether oldBrowser or not.
   * @memberof module:renderUtil
   * @returns {boolean} result boolean
   */
  isOldBrowser() {
    return isOldBrowser;
  },

  /**
   * Format to zero fill.
   * @param {string} value target value
   * @param {number} len length of result
   * @returns {string} formatted value
   * @private
   */
  formatToZeroFill(value, len) {
    const zero = '0';

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
  formatToDecimal(value, len) {
    const DECIMAL = 10;
    const pow = Math.pow(DECIMAL, len);

    if (len === 0) {
      return Math.round(value);
    }

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
  formatToComma(value) {
    value = String(value);
    const comma = ',';
    const betweenLen = 3;
    const orgValue = value;
    const sign = value.indexOf('-') > -1 ? '-' : '';
    let underPointValue = '';
    let values;
    let lastIndex;
    let formattedValue;

    if (value.indexOf('.') > -1) {
      values = value.split('.');
      value = String(Math.abs(values[0]));
      underPointValue = `.${values[1]}`;
    } else {
      value = String(Math.abs(value));
    }

    if (value.length <= betweenLen) {
      formattedValue = orgValue;
    } else {
      values = value.split('').reverse();
      lastIndex = values.length - 1;
      values = snippet.map(values, (char, index) => {
        const result = [char];
        if (index < lastIndex && (index + 1) % betweenLen === 0) {
          result.push(comma);
        }

        return result;
      });
      formattedValue =
        sign +
        []
          .concat(...values)
          .reverse()
          .join('') +
        underPointValue;
    }

    return formattedValue;
  },

  /**
   * Make cssText from map.
   * @param {object} cssMap - css map
   * @returns {string}
   * @memberof module:renderUtil
   */
  makeCssTextFromMap(cssMap) {
    return snippet.map(cssMap, (value, name) => renderUtil.concatStr(name, ':', value)).join(';');
  },

  /**
   * Perse String.
   * @param {string} value - string
   * @returns {string}
   */
  _perseString(value) {
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
  addPrefixSuffix(labels, prefix = '', suffix = '') {
    prefix = this._perseString(prefix);
    suffix = this._perseString(suffix);

    if (!(prefix === '' && suffix === '')) {
      return snippet.map(labels, label => this.addPrefixSuffixItem(label, prefix, suffix));
    }

    return labels;
  },

  /**
   * Add prefix or suffix for one item
   * @param {string} label - labels
   * @param {string} prefix - string
   * @param {string} suffix - string
   * @returns {string}
   * @memberof module:renderUtil
   */
  addPrefixSuffixItem(label, prefix = '', suffix = '') {
    prefix = this._perseString(prefix);
    suffix = this._perseString(suffix);

    return prefix + label + suffix;
  },

  /**
   * Returns element's style value defined at css file
   * @param {HTMLElement} target - Current element
   * @returns {Object} Style object of element
   * @memberof module:renderUtil
   */
  getStyle(target) {
    let computedObj;

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
  generateClipRectId() {
    const id = CLIP_RECT_ID + lineBaseChartCount;
    lineBaseChartCount += 1;

    return id;
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
  return `alpha(opacity=${opacity * chartConst.OLD_BROWSER_OPACITY_100})`;
}

if (isOldBrowser) {
  /**
   * Make opacity css text for old browser(IE7, IE8).
   * @param {number} opacity - opacity
   * @returns {string}
   */
  renderUtil.makeOpacityCssText = function(opacity) {
    let cssText = '';

    if (snippet.isExisty(opacity)) {
      const cssOpacityString = makeCssFilterOpacityString(opacity);
      cssText = `;filter:${cssOpacityString}`;
    }

    return cssText;
  };

  /**
   * Set css opacity for old browser(IE7, IE8).
   * @param {HTMLElement | Array.<HTMLElement>} elements - elements
   * @param {number} opacity - opacity
   */
  renderUtil.setOpacity = function(elements, opacity) {
    const filter = makeCssFilterOpacityString(opacity);
    setOpacity(elements, element => {
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
    let cssText = '';

    if (snippet.isExisty(opacity)) {
      cssText = `;opacity:${opacity}`;
    }

    return cssText;
  };

  /**
   * Set css opacity for browser supporting opacity property of CSS3.
   * @param {HTMLElement | Array.<HTMLElement>} elements - elements
   * @param {number} opacity - opacity
   */
  renderUtil.setOpacity = function(elements, opacity) {
    setOpacity(elements, element => {
      element.style.opacity = opacity;
    });
  };
}

export default renderUtil;
