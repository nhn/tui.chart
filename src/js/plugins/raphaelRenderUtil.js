/**
 * @fileoverview Util for raphael rendering.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */

import snippet from 'tui-code-snippet';
import renderUtil from '../helpers/renderUtil';
import raphael from 'raphael';

const LINE_HEIGHT_FOR_CALCULATE = 1.11;
const storeForGetTextDimension = {
  cacheFontInfo: '',
  elementForTextSize: null,
  canvasElement: getCanvasForTextDimension()
};

/**
 * Util for raphael rendering.
 * @module raphaelRenderUtil
 * @private
 */
export default {
  /**
   * Make line path.
   * @memberOf module:raphaelRenderUtil
   * @param {{top: number, left: number}} fromPos from position
   * @param {{top: number, left: number}} toPos to position
   * @param {number} width width
   * @returns {string} path
   */
  makeLinePath(fromPos, toPos, width = 1) {
    const fromPoint = [fromPos.left, fromPos.top];
    const toPoint = [toPos.left, toPos.top];
    const additionalPoint = (width % 2) / 2;

    fromPoint.forEach((from, index) => {
      if (from === toPoint[index]) {
        fromPoint[index] = toPoint[index] = Math.round(from) - additionalPoint;
      }
    });

    return ['M', ...fromPoint, 'L', ...toPoint];
  },

  /**
   * Render line.
   * @memberOf module:raphaelRenderUtil
   * @param {object} paper raphael paper
   * @param {string} path line path
   * @param {string} color line color
   * @param {number} strokeWidth stroke width
   * @returns {object} raphael line
   */
  renderLine(paper, path, color, strokeWidth) {
    const line = paper.path([path]);
    const strokeStyle = {
      stroke: color,
      'stroke-width': snippet.isUndefined(strokeWidth) ? 2 : strokeWidth,
      'stroke-linecap': 'butt'
    };
    if (color === 'transparent') {
      strokeStyle.stroke = '#fff';
      strokeStyle['stroke-opacity'] = 0;
    }

    line.attr(strokeStyle).node.setAttribute('class', 'auto-shape-rendering');

    return line;
  },

  /**
   * text ellipsis for fixed width
   * @param {string} text - target text
   * @param {number} fixedWidth - width for ellipsis
   * @param {object} theme - label theme
   * @returns {string}
   */
  getEllipsisText(text, fixedWidth, theme) {
    const textArray = String(text).split('');
    const textLength = textArray.length;
    const dotWidth = this.getRenderedTextSize('.', theme.fontSize, theme.fontFamily).width;
    let newString = '';
    let textWidth = dotWidth * 2;

    for (let i = 0; i < textLength; i += 1) {
      textWidth += this.getRenderedTextSize(textArray[i], theme.fontSize, theme.fontFamily).width;
      if (textWidth >= fixedWidth) {
        newString += '..';
        break;
      }
      newString += textArray[i];
    }

    return newString;
  },

  /**
   * Render text
   * @param {object} paper - Raphael paper object
   * @param {{left: number, top: number}} pos - text object position
   * @param {string} text - text content
   * @param {object} [attributes] - text object's attributes
   * @returns {object}
   */
  renderText(paper, pos, text, attributes) {
    const textObj = paper.text(pos.left, pos.top, snippet.decodeHTMLEntity(String(text)));

    if (attributes) {
      if (attributes['dominant-baseline']) {
        textObj.node.setAttribute('dominant-baseline', attributes['dominant-baseline']);
      } else {
        textObj.node.setAttribute('dominant-baseline', 'central');
      }

      textObj.attr(attributes);
    }

    return textObj;
  },

  /**
   * Render area graph.
   * @param {object} paper raphael paper
   * @param {string} path path
   * @param {object} fillStyle fill style
   *      @param {string} fillStyle.fill fill color
   *      @param {?number} fillStyle.opacity fill opacity
   *      @param {string} fillStyle.stroke stroke color
   *      @param {?number} fillStyle.stroke-opacity stroke opacity
   * @returns {Array.<object>} raphael object
   */
  renderArea(paper, path, fillStyle) {
    const area = paper.path(path);

    fillStyle = Object.assign(
      {
        'stroke-opacity': 0
      },
      fillStyle
    );
    area.attr(fillStyle);

    return area;
  },

  /**
   * Render circle.
   * @param {object} paper - raphael object
   * @param {{left: number, top: number}} position - position
   * @param {number} radius - radius
   * @param {object} attributes - attributes
   * @returns {object}
   */
  renderCircle(paper, position, radius, attributes) {
    const circle = paper.circle(position.left, position.top, radius);

    if (attributes) {
      circle.attr(attributes);
    }

    return circle;
  },

  /**
   * Render rect.
   * @param {object} paper - raphael object
   * @param {{left: number, top: number, width: number, height, number}} bound - bound
   * @param {object} attributes - attributes
   * @returns {*}
   */
  renderRect(paper, bound, attributes) {
    const rect = paper.rect(bound.left, bound.top, bound.width, bound.height);

    if (attributes) {
      rect.attr(attributes);
    }

    return rect;
  },

  /**
   * Update rect bound
   * @param {object} rect raphael object
   * @param {{left: number, top: number, width: number, height: number}} bound bound
   */
  updateRectBound(rect, bound) {
    rect.attr({
      x: bound.left,
      y: bound.top,
      width: bound.width,
      height: bound.height
    });
  },

  /**
   * Render items of line type chart.
   * @param {Array.<Array.<object>>} groupItems group items
   * @param {function} funcRenderItem function
   */
  forEach2dArray(groupItems, funcRenderItem) {
    if (groupItems) {
      groupItems.forEach((items, groupIndex) => {
        items.forEach((item, index) => {
          funcRenderItem(item, groupIndex, index);
        });
      });
    }
  },

  /**
   * Make changed luminance color.
   * @param {string} hex hax color
   * @param {number} lum luminance
   * @returns {string} changed color
   */
  makeChangedLuminanceColor(hex, lum) {
    hex = hex.replace('#', '');
    lum = lum || 0;

    const changedHex = snippet
      .range(3)
      .map(index => {
        const hd = parseInt(hex.substr(index * 2, 2), 16);
        let newHd = hd + hd * lum;

        newHd = Math.round(Math.min(Math.max(0, newHd), 255)).toString(16);

        return renderUtil.formatToZeroFill(newHd, 2);
      })
      .join('');

    return `#${changedHex}`;
  },

  /**
   * Get rendered text element size
   * @param {string} text text content
   * @param {number} fontSize font-size attribute
   * @param {string} fontFamily font-family attribute
   * @returns {{
   *     width: number,
   *     height: number
   * }}
   */
  getRenderedTextSize(text, fontSize = 11, fontFamily) {
    const { canvasElement } = storeForGetTextDimension;

    if (canvasElement) {
      return this._getTextDimensionWithCanvas(text, fontSize, fontFamily);
    }

    return this._getTextDimensionUseHtmlElement(text, fontSize, fontFamily);
  },

  /**
   * Get rendered text element size (Use Canvas)
   * @param {string} text text content
   * @param {number} fontSize font-size attribute
   * @param {string} fontFamily font-family attribute
   * @returns {{
   *     width: number,
   *     height: number
   * }}
   * @private
   */
  _getTextDimensionWithCanvas(text, fontSize, fontFamily) {
    const { canvasElement, cacheFontInfo } = storeForGetTextDimension;
    const ctx = canvasElement.getContext('2d');
    const fontInfo = `${fontSize}px ${fontFamily}`;

    if (cacheFontInfo !== fontInfo) {
      storeForGetTextDimension.cacheFontInfo = fontInfo;
      ctx.font = fontInfo;
    }

    return {
      width: ctx.measureText(text).width,
      height: fontSize * LINE_HEIGHT_FOR_CALCULATE
    };
  },

  /**
   * Get rendered text element size (Use HTMLElement)
   * @param {string} text text content
   * @param {number} fontSize font-size attribute
   * @param {string} fontFamily font-family attribute
   * @returns {{
   *     width: number,
   *     height: number
   * }}
   * @private
   */
  _getTextDimensionUseHtmlElement(text, fontSize, fontFamily) {
    const { cacheFontInfo } = storeForGetTextDimension;
    let { elementForTextSize } = storeForGetTextDimension;
    if (!elementForTextSize) {
      elementForTextSize = document.createElement('div');
      const elementStyle = elementForTextSize.style;
      this._setBasicHtmlElementStyleForGetTextSize(elementStyle);

      document.body.appendChild(elementForTextSize);
      storeForGetTextDimension.elementForTextSize = elementForTextSize;
    }

    const fontInfo = `${fontSize}px ${fontFamily}`;

    if (cacheFontInfo !== fontInfo) {
      const elementStyle = elementForTextSize.style;

      elementStyle.fontFamily = fontFamily;
      elementStyle.fontSize = `${fontSize}px`;

      storeForGetTextDimension.cacheFontInfo = fontInfo;
    }

    elementForTextSize.innerHTML = text;

    return {
      width: elementForTextSize.clientWidth,
      height: elementForTextSize.clientHeight
    };
  },

  /**
   * Set basic style for get text dimension element
   * @param {object} elementStyle style object for the element to get the text dimension
   */
  _setBasicHtmlElementStyleForGetTextSize(elementStyle) {
    elementStyle.visibility = 'hidden';
    elementStyle.position = 'absolute';
    elementStyle.margin = 0;
    elementStyle.padding = 0;
    elementStyle.lineHeight = LINE_HEIGHT_FOR_CALCULATE;
    elementStyle.whiteSpace = 'nowrap';
  },

  /**
   * Animate given element's opacity
   * @param {object} element element
   * @param {number} startOpacity endOpacity default is '0'
   * @param {number} endOpacity endOpacity default is '1'
   * @param {number} duration endOpacity default is '600'
   */
  animateOpacity(element, startOpacity, endOpacity, duration) {
    const animationDuration = isNumber(duration) ? duration : 600;
    const animationStartOpacity = isNumber(startOpacity) ? startOpacity : 0;
    const animationEndOpacity = isNumber(endOpacity) ? endOpacity : 1;
    const animation = raphael.animation(
      {
        opacity: animationEndOpacity
      },
      animationDuration
    );

    element.attr({
      opacity: animationStartOpacity
    });

    element.animate(animation);
  },
  /**
   * get default animation duration
   * @param {string} chartType - chart type
   * @returns {number} duration - default duration
   * @private
   */
  getDefaultAnimationDuration(chartType) {
    switch (chartType) {
      case 'boxplot':
      case 'combo':
      case 'pie':
      case 'scatter':
      case 'bubble':
      case 'area':
      case 'line':
      case 'column':
      case 'bar':
        return 700;
      case 'heatmap':
      case 'treemap':
        return 600;
      default:
        return 0;
    }
  }
};

/**
 * Return boolean value for given parameter is number or not
 * @param {*} numberSuspect number suspect
 * @returns {boolean}
 */
function isNumber(numberSuspect) {
  return snippet.isExisty(numberSuspect) && typeof numberSuspect === 'number';
}

/**
 * check supports canvas text
 * @returns {?HTMLElement}
 */
function getCanvasForTextDimension() {
  const isSupportCanvasContext = !!document.createElement('canvas').getContext;

  if (!isSupportCanvasContext) {
    return null;
  }

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  if (typeof context.fillText === 'function') {
    return canvas;
  }

  return null;
}
