/**
 * @fileoverview Raphael bubble chart renderer.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */

import raphaelRenderUtil from './raphaelRenderUtil';
import snippet from 'tui-code-snippet';
import raphael from 'raphael';

const CIRCLE_OPACITY = 0.8;
const STROKE_OPACITY = 1;
const EMPHASIS_OPACITY = 0.8;
const DE_EMPHASIS_OPACITY = 0.3;
const DEFAULT_LUMINANC = 0.2;
const OVERLAY_BORDER_WIDTH = 2;
const TOOLTIP_OFFSET_VALUE = 20;

/**
 * bound for circle
 * @typedef {{left: number, top: number, radius: number}} bound
 * @private
 */

/**
 * Information for rendered circle
 * @typedef {{circle: object, color: string, bound: bound}} circleInfo
 * @private
 */

/**
 * @classdesc RaphaelBubbleChart is graph renderer for bubble chart.
 * @class RaphaelBubbleChart
 * @private
 */
class RaphaelBubbleChart {
  /**
   * Render function of bubble chart
   * @param {object} paper - Raphael paper
   * @param {{
   *      dimension: {width: number, height: number},
   *      seriesDataModel: SeriesDataModel,
   *      groupBounds: Array.<Array.<bound>>,
   *      theme: object
   * }} data - data for rendering
   * @param {{showTooltip: function, hideTooltip: function}} callbacks - callbacks for toggle of tooltip.
   * @returns {object}
   */
  render(paper, data, callbacks) {
    const circleSet = paper.set();

    this.paper = paper;
    this.animationDuration = data.options.animationDuration;

    /**
     * theme
     * @type {object}
     */
    this.theme = data.theme;

    /**
     * seriesDataModel
     * @type {SeriesDataModel}
     */
    this.seriesDataModel = data.seriesDataModel;

    /**
     * group bounds
     * @type {Array.<Array.<bound>>}
     */
    this.groupBounds = data.groupBounds;

    /**
     * callbacks for toggle of tooltip.
     * @type {{showTooltip: Function, hideTooltip: Function}}
     */
    this.callbacks = callbacks;

    /**
     * overlay is circle object of raphael, that using for mouseover.
     * @type {object}
     */
    this.overlay = this._renderOverlay();

    /**
     * two-dimensional array by circleInfo
     * @type {Array.<Array.<circleInfo>>}
     */
    this.groupCircleInfos = this._renderCircles(circleSet);

    /**
     * previous selected circle
     * @type {?object}
     */
    this.prevCircle = null;

    /**
     * previous over circle
     * @type {?object}
     */
    this.prevOverCircle = null;

    /**
     * animation timeout id
     * @type {?number}
     */
    this.animationTimeoutId = null;

    /**
     * selected legend
     * @type {?number}
     */
    this.selectedLegend = null;

    if (this.paper.raphael.svg) {
      this.appendShadowFilterToDefs();
    }

    return circleSet;
  }

  /**
   * Render overlay.
   * @returns {object}
   * @private
   */
  _renderOverlay() {
    const position = {
      left: 0,
      top: 0
    };
    const attribute = {
      fill: 'none',
      stroke: '#fff',
      'stroke-opacity': STROKE_OPACITY,
      'stroke-width': 2
    };
    const circle = raphaelRenderUtil.renderCircle(this.paper, position, 0, attribute);

    return circle;
  }

  /**
   * Render circles.
   * @param {object} circleSet - circle set
   * @returns {Array.<Array.<circleInfo>>}
   * @private
   */
  _renderCircles(circleSet) {
    const { colors } = this.theme;

    return this.groupBounds.map((bounds, groupIndex) =>
      bounds.map((bound, index) => {
        let circleInfo = null;

        if (bound) {
          const color = colors[index];
          const circle = raphaelRenderUtil.renderCircle(
            this.paper,
            bound,
            this.animationDuration ? 0 : bound.radius,
            {
              fill: color,
              opacity: this.animationDuration ? 0 : CIRCLE_OPACITY,
              stroke: 'none'
            }
          );

          circleSet.push(circle);

          circle.data('groupIndex', groupIndex);
          circle.data('index', index);
          circleInfo = {
            circle,
            color,
            bound
          };
        }

        return circleInfo;
      })
    );
  }

  /**
   * Animate circle
   * @param {object} circle - raphael object
   * @param {number} radius - radius of circle
   * @param {number} animationDuration - animation duration
   * @private
   */
  _animateCircle(circle, radius, animationDuration) {
    circle.animate(
      {
        r: radius,
        opacity: CIRCLE_OPACITY
      },
      animationDuration,
      '>'
    );
  }

  /**
   * Animate.
   */
  animate() {
    raphaelRenderUtil.forEach2dArray(this.groupCircleInfos, circleInfo => {
      if (!circleInfo) {
        return;
      }
      if (this.animationDuration) {
        this._animateCircle(circleInfo.circle, circleInfo.bound.radius, this.animationDuration);
      }
    });
  }

  /**
   * Update circle bound
   * @param {object} circle - raphael object
   * @param {{left: number, top: number}} bound - bound
   * @private
   */
  _updatePosition(circle, bound) {
    circle.attr({
      cx: bound.left,
      cy: bound.top,
      r: bound.radius
    });
  }

  /**
   * Resize graph of bubble type chart.
   * @param {object} params parameters
   *      @param {{width: number, height:number}} params.dimension - dimension
   *      @param {Array.<Array.<bound>>} params.groupBounds - group bounds
   */
  resize(params) {
    const { dimension, groupBounds } = params;

    this.groupBounds = groupBounds;
    this.paper.setSize(dimension.width, dimension.height);

    raphaelRenderUtil.forEach2dArray(this.groupCircleInfos, (circleInfo, groupIndex, index) => {
      const bound = groupBounds[groupIndex][index];
      if (circleInfo) {
        circleInfo.bound = bound;
        this._updatePosition(circleInfo.circle, bound);
      }
    });
  }

  /**
   * Find data indexes of rendered circle by position.
   * @param {{left: number, top: number}} position - mouse position
   * @returns {{index: number, groupIndex: number}}
   */
  findIndexes(position) {
    const circle = this.paper.getElementByPoint(position.left, position.top);
    let foundIndexes = null;

    if (circle) {
      foundIndexes = {
        index: circle.data('index'),
        groupIndex: circle.data('groupIndex')
      };
    }

    return foundIndexes;
  }

  appendShadowFilterToDefs() {
    const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
    const feOffset = document.createElementNS('http://www.w3.org/2000/svg', 'feOffset');
    const feGaussianBlur = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
    const feBlend = document.createElementNS('http://www.w3.org/2000/svg', 'feBlend');

    filter.setAttributeNS(null, 'id', 'shadow');
    filter.setAttributeNS(null, 'x', '-50%');
    filter.setAttributeNS(null, 'y', '-50%');
    filter.setAttributeNS(null, 'width', '180%');
    filter.setAttributeNS(null, 'height', '180%');
    feOffset.setAttributeNS(null, 'result', 'offOut');
    feOffset.setAttributeNS(null, 'in', 'SourceAlpha');
    feOffset.setAttributeNS(null, 'dx', '0');
    feOffset.setAttributeNS(null, 'dy', '0');
    feGaussianBlur.setAttributeNS(null, 'result', 'blurOut');
    feGaussianBlur.setAttributeNS(null, 'in', 'offOut');
    feGaussianBlur.setAttributeNS(null, 'stdDeviation', '2');
    feBlend.setAttributeNS(null, 'in', 'SourceGraphic');
    feBlend.setAttributeNS(null, 'in2', 'blurOut');
    feBlend.setAttributeNS(null, 'mode', 'normal');
    filter.appendChild(feOffset);
    filter.appendChild(feGaussianBlur);
    filter.appendChild(feBlend);
    this.paper.defs.appendChild(filter);
  }

  /**
   * Whether changed or not.
   * @param {{left: number, top: number}} prevPosition - previous position
   * @param {{left: number, top: number}} position - position
   * @returns {boolean} result boolean
   * @private
   */
  _isChangedPosition(prevPosition, position) {
    return (
      !prevPosition || prevPosition.left !== position.left || prevPosition.top !== position.top
    );
  }

  /**
   * Show overlay with animation.
   * @param {object} indexes - indexes
   *      @param {number} indexes.groupIndex - index of circles group
   *      @param {number} indexes.index - index of circles
   */
  showAnimation(indexes) {
    const circleInfo = this.groupCircleInfos[indexes.groupIndex][indexes.index];
    const { bound } = circleInfo;
    this.circle = circleInfo.circle;

    this.overlay.attr({
      fill: circleInfo.color,
      cx: bound.left,
      cy: bound.top,
      r: bound.radius + OVERLAY_BORDER_WIDTH,
      stroke: '#fff',
      opacity: 1
    });

    this.circle.attr({
      opacity: 1
    });

    this.overlay.node.setAttribute('filter', 'url(#shadow)');
    this.overlay.toFront();
    this.circle.toFront();
  }

  /**
   * Hide overlay with animation.
   * @param {object} indexes - indexes
   *      @param {number} indexes.groupIndex - index of circles group
   *      @param {number} indexes.index - index of circles
   */
  hideAnimation(indexes) {
    let changeOpacity = DE_EMPHASIS_OPACITY;
    this.overlay.attr({
      cx: 0,
      cy: 0,
      r: 0,
      opacity: 0
    });

    if (snippet.isNull(this.selectedLegend) || indexes.index === this.selectedLegend) {
      changeOpacity = EMPHASIS_OPACITY;
    }

    this.circle.attr({
      opacity: changeOpacity
    });
  }

  /**
   * Find circle.
   * @param {{left: number, top: number}} position - position
   * @returns {?object}
   * @private
   */
  _findCircle(position) {
    const circles = [];
    const { paper } = this;
    let foundCircle;

    while (snippet.isUndefined(foundCircle)) {
      const circle = paper.getElementByPoint(position.left, position.top);

      if (circle) {
        if (circle.attrs.opacity > DE_EMPHASIS_OPACITY) {
          foundCircle = circle;
        } else {
          circles.push(circle);
          circle.hide();
        }
      } else {
        foundCircle = null;
      }
    }

    if (!foundCircle) {
      [foundCircle] = circles;
    }

    circles.forEach(_circle => {
      _circle.show();
    });

    return foundCircle;
  }

  /**
   * Move mouse on series.
   * @param {{left: number, top: number}} position - mouse position
   */
  moveMouseOnSeries(position) {
    const circle = this._findCircle(position);

    if (circle && snippet.isExisty(circle.data('groupIndex'))) {
      const groupIndex = circle.data('groupIndex');
      const index = circle.data('index');
      const args = [
        {},
        groupIndex,
        index,
        {
          left: position.left - TOOLTIP_OFFSET_VALUE,
          top: position.top - TOOLTIP_OFFSET_VALUE
        }
      ];

      if (this._isChangedPosition(this.prevPosition, position)) {
        this.callbacks.showTooltip.apply(null, args);
        this.prevOverCircle = circle;
      }
    } else if (this.prevOverCircle) {
      this.callbacks.hideTooltip();
      this.prevOverCircle = null;
    }
    this.prevPosition = position;
  }

  /**
   * Select series.
   * @param {{index: number, groupIndex: number}} indexes - index map
   */
  selectSeries(indexes) {
    const { groupIndex, index } = indexes;
    const circleInfo = this.groupCircleInfos[groupIndex][index];
    const objColor = raphael.color(circleInfo.color);
    const themeColor = this.theme.selectionColor;
    const color =
      themeColor || raphaelRenderUtil.makeChangedLuminanceColor(objColor.hex, DEFAULT_LUMINANC);

    circleInfo.circle.attr({
      fill: color
    });
  }

  /**
   * Unselect series.
   * @param {{index: number, groupIndex: number}} indexes - index map
   */
  unselectSeries(indexes) {
    const { groupIndex, index } = indexes;
    const circleInfo = this.groupCircleInfos[groupIndex][index];

    circleInfo.circle.attr({
      fill: circleInfo.color
    });
  }

  /**
   * Select legend.
   * @param {?number} legendIndex - index of legend
   */
  selectLegend(legendIndex) {
    const noneSelected = snippet.isNull(legendIndex);

    this.selectedLegend = legendIndex;

    raphaelRenderUtil.forEach2dArray(this.groupCircleInfos, (circleInfo, groupIndex, index) => {
      if (!circleInfo) {
        return;
      }

      const opacity =
        noneSelected || legendIndex === index ? EMPHASIS_OPACITY : DE_EMPHASIS_OPACITY;

      circleInfo.circle.attr({ opacity });
    });
  }
}

export default RaphaelBubbleChart;
