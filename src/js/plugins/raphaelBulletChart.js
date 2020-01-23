/**
 * @fileoverview Raphael bullet chart renderer.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */

import raphaelRenderUtil from './raphaelRenderUtil';
import chartConst from '../const';
import snippet from 'tui-code-snippet';
import renderUtil from '../helpers/renderUtil';

const { browser } = snippet;
const IS_LTE_IE8 = browser.msie && browser.version <= 8;
const EMPHASIS_OPACITY = 1;
const DE_EMPHASIS_OPACITY = 0.3;
const EVENT_DETECTOR_PADDING = 20;

/**
 * @classdesc RaphaelBulletChart is graph renderer for bullet chart.
 * @class RaphaelBulletChart
 * @private
 */
class RaphaelBulletChart {
  /**
   * Render function of bar chart
   * @param {object} paper paper object
   * @param {{size: object, model: object, options: object, tooltipPosition: string}} data chart data
   * @returns {Array.<object>} seriesSet
   */
  render(paper, data) {
    const { groupBounds, seriesDataModel } = data;

    if (!groupBounds || !groupBounds.length) {
      return null;
    }

    this.paper = paper;
    this.theme = data.theme;
    this.dimension = data.dimension;
    this.position = data.position;
    this.options = data.options;
    this.chartType = data.chartType;
    this.isVertical = data.isVertical;
    this.animationDuration = data.options.animationDuration;

    this.seriesDataModel = seriesDataModel;
    this.maxRangeCount = seriesDataModel.maxRangeCount;
    this.maxMarkerCount = seriesDataModel.maxMarkerCount;

    this._graphColors = [];

    this.rangeOpacities = {};

    this.paper.setStart();

    this._renderBounds(groupBounds);

    return this.paper.setFinish();
  }

  /**
   * Get range opacity by index
   * If rangeOpacities[index] not exists, create and store. then use it next time
   * @param {number} index - ranges index
   * @returns {number} - opacity of ranges bar at index
   * @private
   */
  _getRangeOpacity(index) {
    const { maxRangeCount } = this;
    if (this.prevMaxRangeCount !== maxRangeCount) {
      this._updateOpacityStep(maxRangeCount);
    }

    if (index < maxRangeCount && !this.rangeOpacities[index]) {
      this.rangeOpacities[index] = 1 - this.opacityStep * (index + 1);
    }

    return this.rangeOpacities[index];
  }

  /**
   * Update opacity step using maxRangeCount
   * @param {number} maxRangeCount - maximum count of ranges bar among series graphes
   * @private
   */
  _updateOpacityStep(maxRangeCount) {
    this.rangeOpacities = {};
    this.opacityStep = Number(1 / (maxRangeCount + 1)).toFixed(2);
    this.prevMaxRangeCount = maxRangeCount;
  }

  /**
   * Render bullet graph using groupBounds model
   * @param {Array.<object>} groupBounds - bounds data for rendering bullet graph
   * @private
   */
  _renderBounds(groupBounds) {
    const rangeThemes = this.theme.ranges;
    const { paper } = this;

    this.groupBars = [];
    this.groupLines = [];

    groupBounds.forEach((bounds, groupIndex) => {
      const seriesColor = this.theme.colors[groupIndex];
      let rangeIndex = 0;
      const barSet = paper.set();
      const lineSet = paper.set();

      bounds.forEach(bound => {
        const { type } = bound;

        if (type === chartConst.BULLET_TYPE_ACTUAL) {
          barSet.push(this._renderActual(bound, seriesColor));
        } else if (type === chartConst.BULLET_TYPE_RANGE) {
          barSet.push(this._renderRange(bound, seriesColor, rangeIndex, rangeThemes[rangeIndex]));
          rangeIndex += 1;
        } else if (type === chartConst.BULLET_TYPE_MARKER) {
          lineSet.push(this._renderMarker(bound, seriesColor));
        }
      });

      this.groupBars.push(barSet);
      this.groupLines.push(lineSet);
    }, this);
  }

  /**
   * Render actual bar
   * @param {object} bound - bound model on start point
   * @param {string} seriesColor - series color for painting actual bar
   * @returns {Element} - rendered actual bar
   * @private
   */
  _renderActual(bound, seriesColor) {
    if (!bound) {
      return null;
    }

    return this._renderBar(bound, seriesColor);
  }

  /**
   * Render range bar
   * @param {object} bound - bound model on start point
   * @param {string} seriesColor - series color for painting range bar
   * @param {number} rangeIndex - ranges index
   * @param {object} rangeTheme - range theme
   * @returns {Element} - rendered range bar
   * @private
   */
  _renderRange(bound, seriesColor, rangeIndex, rangeTheme) {
    const opacity = this._getRangeOpacity(rangeIndex);
    const attr = { opacity };
    let color = seriesColor;

    if (!bound) {
      return null;
    }

    if (rangeTheme) {
      color = rangeTheme.color || color;
      attr.opacity = rangeTheme.opacity || opacity;
    }

    return this._renderBar(bound, color, attr);
  }

  /**
   * Create bar type element using passing arguments
   * @param {object} bound - bound data for render rect element
   * @param {string} color - hex type color string
   * @param {object} attributes - styling attributes
   * @returns {Element} - svg rect element
   * @private
   */
  _renderBar(bound, color, attributes) {
    if (bound.width < 0 || bound.height < 0) {
      return null;
    }

    return raphaelRenderUtil.renderRect(
      this.paper,
      bound,
      snippet.extend(
        {
          fill: color,
          stroke: 'none'
        },
        attributes
      )
    );
  }

  /**
   * Render marker
   * @param {object} bound - bound model of marker
   * @param {string} seriesColor - series color for painting marker
   * @returns {Element} - rendered marker
   * @private
   */
  _renderMarker(bound, seriesColor) {
    if (!bound) {
      return null;
    }

    return this._renderLine(bound, seriesColor);
  }

  /**
   * Create line element using passing arguments
   * @param {object} bound - bound data for render path element
   * @param {string} color - hex type color string
   * @returns {Element} - svg rect element
   * @private
   */
  _renderLine(bound, color) {
    const { top, left, length } = bound;
    const endPosition = this.isVertical ? `L${left + length},${top}` : `L${left},${top + length}`;
    const path = `M${left},${top + endPosition}`;

    return raphaelRenderUtil.renderLine(
      this.paper,
      path,
      color,
      chartConst.BULLET_MARKER_STROKE_TICK
    );
  }

  /**
   * Animate.
   * @param {function} onFinish finish callback function
   * @param {Array.<object>} seriesSet series set
   */
  animate(onFinish, seriesSet) {
    const { paper, dimension, position, animationDuration } = this;
    const clipRectId = this._getClipRectId();
    const clipRectWidth = dimension.width - EVENT_DETECTOR_PADDING;
    const clipRectHeight = dimension.height - EVENT_DETECTOR_PADDING;
    const startDimension = {};
    const animateAttr = {};
    let { clipRect } = this;

    if (this.isVertical) {
      startDimension.width = clipRectWidth;
      startDimension.height = animationDuration ? 0 : clipRectHeight;
      animateAttr.height = clipRectHeight;
    } else {
      startDimension.width = animationDuration ? 0 : clipRectWidth;
      startDimension.height = clipRectHeight;
      animateAttr.width = clipRectWidth;
    }

    // Animation was implemented using <clipPath> SVG element
    // As Browser compatibility of <clipPath> is IE9+,
    // No Animation on IE8
    if (!IS_LTE_IE8 && dimension) {
      if (!clipRect) {
        clipRect = createClipPathRectWithLayout(paper, position, startDimension, clipRectId);
        this.clipRect = clipRect;
      } else {
        clipRect.attr({
          x: position.left,
          y: position.top
        });
        clipRect.attr(startDimension);
      }

      seriesSet.forEach(element => {
        if (element.type === 'set') {
          element.forEach(item => {
            item.node.setAttribute('clip-path', `url(#${clipRectId})`);
          });
        } else {
          element.node.setAttribute('clip-path', `url(#${clipRectId})`);
        }
      });

      if (animationDuration) {
        clipRect.animate(animateAttr, animationDuration, '>', onFinish);
      }
    }

    if (onFinish) {
      this.callbackTimeout = setTimeout(() => {
        onFinish();
        delete this.callbackTimeout;
      }, animationDuration);
    }
  }

  /**
   * Resize bullet chart
   * @param {object} params parameters
   *      @param {{width: number, height:number}} params.dimension dimension
   *      @param {Array.<Array.<{
   *                  left:number, top:number, width: number, height: number
   *              }>>} params.groupBounds group bounds
   */
  resize(params) {
    const { dimension, groupBounds } = params;
    const { width, height } = dimension;

    this.dimension = params.dimension;
    this.groupBounds = groupBounds;
    this.resizeClipRect(width, height);
    this.paper.setSize(width, height);
  }

  /**
   * Resize clip rect size
   * @param {number} width series width
   * @param {number} height series height
   */
  resizeClipRect(width, height) {
    const clipRect = this.paper.getById(`${this._getClipRectId()}_rect`);

    // Animation was implemented using <clipPath> SVG element
    // As Browser compatibility of <clipPath> is IE9+,
    // No Animation on IE8
    if (clipRect) {
      clipRect.attr({
        width,
        height
      });
    }
  }

  /**
   * Set clip rect id
   * @returns {string} id - clip rect id
   * @private
   */
  _getClipRectId() {
    if (!this.clipRectId) {
      this.clipRectId = renderUtil.generateClipRectId();
    }

    return this.clipRectId;
  }

  /**
   * Change borders color.
   * @param {Array.<object>} lines raphael objects
   * @param {borderColor} borderColor border color
   * @private
   */
  _changeBordersColor(lines, borderColor) {
    lines.forEach(line => {
      line.attr({ stroke: borderColor });
    });
  }

  /**
   * Select legend.
   * @param {?number} legendIndex legend index
   */
  selectLegend(legendIndex) {
    const allEmphasized = snippet.isNull(legendIndex);

    this.groupBars.forEach((bars, groupIndex) => {
      const opacity =
        allEmphasized || legendIndex === groupIndex ? EMPHASIS_OPACITY : DE_EMPHASIS_OPACITY;

      this.groupBars[groupIndex].attr({ 'fill-opacity': opacity });
      this.groupLabels[groupIndex].attr({ opacity });

      this.groupLabels[groupIndex].forEach(label => {
        label.attr({ opacity });
      });
    });
  }

  /**
   * @param {object} paper - raphael paper
   * @param {Array.<object>} positionData - series label positions
   * @param {Array.<string>} labelData - series labels
   * @param {object} labelTheme - series text theme
   * @returns {object} - rendered label set
   */
  renderSeriesLabel(paper, positionData, labelData, labelTheme) {
    const attributes = {
      'font-size': labelTheme.fontSize,
      'font-family': labelTheme.fontFamily,
      'font-weight': labelTheme.fontWeight,
      fill: labelTheme.color,
      opacity: 0,
      'text-anchor': this.isVertical ? 'middle' : 'start'
    };
    const set = paper.set();

    this.groupLabels = labelData.map((labels, groupIndex) => {
      const labelSet = paper.set();
      labels.forEach((label, index) => {
        const labelElement = this._renderLabel(
          paper,
          positionData[groupIndex][index],
          attributes,
          label
        );
        labelSet.push(labelElement);
        set.push(labelElement);
      });

      return labelSet;
    }, this);

    return set;
  }

  /**
   * @param {object} paper - raphael paper
   * @param {Array.<object>} position - series label positions
   * @param {Array.<string>} attributes - label text attributes
   * @param {string} labelText - label text
   * @returns {object} - rendered label object
   * @private
   */
  _renderLabel(paper, position, attributes, labelText) {
    const label = raphaelRenderUtil.renderText(paper, position, labelText, attributes);
    const { node } = label;
    const { style } = node;
    style.userSelect = 'none';
    style.cursor = 'default';
    node.setAttribute('filter', 'url(#glow)');

    return label;
  }

  /**
   * @param {number} index - series index
   * @returns {Array.<object>} - color and opacity of series
   */
  getGraphColors() {
    if (!this._graphColors.length) {
      this._graphColors = this.groupBars.map((barSet, groupIndex) => {
        const barColors = [];
        const markerCount = this.groupLines[groupIndex].length;

        barSet.forEach(item => {
          barColors.push(item.attrs.fill);
        });

        const legendColor = barColors[barColors.length - 1];

        for (let i = 0; i <= markerCount; i += 1) {
          barColors.push(legendColor);
        }

        return barColors;
      });
    }

    return this._graphColors;
  }
}

/**
 * Create clip rect with layout
 * @param {object} paper Raphael paper
 * @param {object} position position
 * @param {object} dimension dimension
 * @param {string} id ID string
 * @returns {object}
 * @ignore
 */
function createClipPathRectWithLayout(paper, position, dimension, id) {
  const clipPath = document.createElementNS('http://www.w3.org/2000/svg', 'clipPath');
  const rect = paper.rect(position.left, position.top, dimension.width, dimension.height);

  rect.id = `${id}_rect`;
  clipPath.id = id;

  clipPath.appendChild(rect.node);
  paper.defs.appendChild(clipPath);

  return rect;
}

export default RaphaelBulletChart;
