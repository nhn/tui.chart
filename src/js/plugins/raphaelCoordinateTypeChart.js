/**
 * @fileoverview Raphael bubble chart renderer.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';
var raphaelRenderUtil = require('./raphaelRenderUtil');

var raphael = window.Raphael;

var ANIMATION_DURATION = 700;
var CIRCLE_OPACITY = 0.5;
var STROKE_OPACITY = 0.3;
var EMPHASIS_OPACITY = 0.5;
var DE_EMPHASIS_OPACITY = 0.3;
var DEFAULT_LUMINANC = 0.2;
var OVERLAY_BORDER_WIDTH = 2;

/**
 * bound for circle
 * @typedef {{left: number, top: number, radius: number}} bound
 */

/**
 * Information for rendered circle
 * @typedef {{circle: object, color: string, bound: bound}} circleInfo
 */

/**
 * @classdesc RaphaelBubbleChart is graph renderer for bubble chart.
 * @class RaphaelBubbleChart
 */
var RaphaelBubbleChart = tui.util.defineClass(/** @lends RaphaelBubbleChart.prototype */ {
    /**
     * Render function of bubble chart
     * @param {HTMLElement} container - container element
     * @param {{
     *      dimension: {width: number, height: number},
     *      seriesDataModel: SeriesDataModel,
     *      groupBounds: Array.<Array.<bound>>,
     *      theme: object
     * }} data - data for rendering
     * @param {{showTooltip: function, hideTooltip: function}} callbacks - callbacks for toggle of tooltip.
     * @returns {object}
     */
    render: function(container, data, callbacks) {
        var dimension = data.dimension,
            paper;

        this.paper = paper = raphael(container, dimension.width, dimension.height);

        /**
         * container element
         * @type {HTMLElement}
         */
        this.container = container;

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
        this.groupCircleInfos = this._renderCircles();

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

        return paper;
    },

    /**
     * Render overlay.
     * @returns {object}
     * @private
     */
    _renderOverlay: function() {
        var position = {
            left: 0,
            top: 0
        };
        var attribute = {
            fill: 'none',
            stroke: '#fff',
            'stroke-opacity': STROKE_OPACITY,
            'stroke-width': 2
        };
        var circle = raphaelRenderUtil.renderCircle(this.paper, position, 0, attribute);

        return circle;
    },

    /**
     * Render circles.
     * @returns {Array.<Array.<circleInfo>>}
     * @private
     */
    _renderCircles: function() {
        var self = this;
        var colors = this.theme.colors;
        var singleColors = [];

        if ((this.groupBounds[0].length === 1) && this.theme.singleColors) {
            singleColors = this.theme.singleColors;
        }

        return tui.util.map(this.groupBounds, function(bounds, groupIndex) {
            var singleColor = singleColors[groupIndex];

            return tui.util.map(bounds, function(bound, index) {
                var circleInfo = null;
                var color, circle;

                if (bound) {
                    color = singleColor || colors[index];
                    circle = raphaelRenderUtil.renderCircle(self.paper, bound, 0, {
                        fill: color,
                        opacity: 0,
                        stroke: 'none'
                    });

                    circle.data('groupIndex', groupIndex);
                    circle.data('index', index);

                    circleInfo = {
                        circle: circle,
                        color: color,
                        bound: bound
                    };
                }

                return circleInfo;
            });
        });
    },

    /**
     * Animate circle
     * @param {object} circle - raphael object
     * @param {number} radius - radius of circle
     * @private
     */
    _animateCircle: function(circle, radius) {
        circle.animate({
            r: radius,
            opacity: CIRCLE_OPACITY
        }, ANIMATION_DURATION);
    },

    /**
     * Animate.
     * @param {function} onFinish - finish callback function
     */
    animate: function(onFinish) {
        var self = this;

        if (this.animationTimeoutId) {
            clearTimeout(this.animationTimeoutId);
            this.animationTimeoutId = null;
        }

        raphaelRenderUtil.forEach2dArray(this.groupCircleInfos, function(circleInfo) {
            if (!circleInfo) {
                return;
            }
            self._animateCircle(circleInfo.circle, circleInfo.bound.radius);
        });

        if (onFinish) {
            this.animationTimeoutId = setTimeout(function() {
                onFinish();
                this.animationTimeoutId = null;
            }, ANIMATION_DURATION);
        }
    },

    /**
     * Update circle bound
     * @param {object} circle - raphael object
     * @param {{left: number, top: number}} bound - bound
     * @private
     */
    _updatePosition: function(circle, bound) {
        circle.attr({
            cx: bound.left,
            cy: bound.top,
            r: bound.radius
        });
    },

    /**
     * Resize graph of bubble type chart.
     * @param {object} params parameters
     *      @param {{width: number, height:number}} params.dimension - dimension
     *      @param {Array.<Array.<bound>>} params.groupBounds - group bounds
     */
    resize: function(params) {
        var self = this;
        var dimension = params.dimension;
        var groupBounds = params.groupBounds;

        this.groupBounds = groupBounds;
        this.paper.setSize(dimension.width, dimension.height);

        raphaelRenderUtil.forEach2dArray(this.groupCircleInfos, function(circleInfo, groupIndex, index) {
            var bound = groupBounds[groupIndex][index];

            circleInfo.bound = bound;
            self._updatePosition(circleInfo.circle, bound);
        });
    },

    /**
     * Click series.
     * @param {{left: number, top: number}} position mouse position
     */
    clickSeries: function(position) {
        var circle = this.paper.getElementByPoint(position.left, position.top);
        var prevCircle = this.prevCircle;

        if (circle && prevCircle) {
            this._unselectSeries(prevCircle.data('groupIndex'), prevCircle.data('index'));
        }

        if (prevCircle === circle) {
            this.prevCircle = null;
        } else if (circle) {
            this._selectSeries(circle.data('groupIndex'), circle.data('index'));
            this.prevCircle = circle;
        }
    },

    /**
     * Get series container bound.
     * @returns {{left: number, top: number, width: number, height: number}}
     * @private
     */
    _getContainerBound: function() {
        if (!this.containerBound) {
            this.containerBound = this.container.getBoundingClientRect();
        }
        return this.containerBound;
    },

    /**
     * Whether changed or not.
     * @param {{left: number, top: number}} prevPosition - previous position
     * @param {{left: number, top: number}} position - position
     * @returns {boolean} result boolean
     * @private
     */
    _isChangedPosition: function(prevPosition, position) {
        return !prevPosition || prevPosition.left !== position.left || prevPosition.top !== position.top;
    },

    /**
     * Show overlay when mouse over a circle.
     * @param {number} groupIndex - index of circles group
     * @param {number} index - index of circles
     * @private
     */
    _showOverlay: function(groupIndex, index) {
        var circleInfo = this.groupCircleInfos[groupIndex][index];
        var bound = circleInfo.bound;

        this.overlay.attr({
            cx: bound.left,
            cy: bound.top,
            r: bound.radius + OVERLAY_BORDER_WIDTH,
            stroke: circleInfo.color,
            opacity: 1
        });
    },

    /**
     * Hide overlay.
     * @private
     */
    _hideOverlay: function() {
        this.overlay.attr({
            cx: 0,
            cy: 0,
            r: 0,
            opacity: 0
        });
    },

    /**
     * Find circle.
     * @param {{left: number, top: number}} position - position
     * @returns {?object}
     * @private
     */
    _findCircle: function(position) {
        var circles = [];
        var paper = this.paper;
        var foundCircle, circle;

        while (tui.util.isUndefined(foundCircle)) {
            circle = paper.getElementByPoint(position.left, position.top);

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
            foundCircle = circles[0];
        }

        tui.util.forEachArray(circles, function(_circle) {
            _circle.show();
        });

        return foundCircle;
    },

    /**
     * Move mouse on series.
     * @param {{left: number, top: number}} position - mouse position
     */
    moveMouseOnSeries: function(position) {
        var circle = this._findCircle(position);
        var containerBound, isChanged, groupIndex, index, args;

        if (circle && tui.util.isExisty(circle.data('groupIndex'))) {
            containerBound = this._getContainerBound();
            isChanged = (this.prevOverCircle !== circle);
            groupIndex = circle.data('groupIndex');
            index = circle.data('index');
            args = [{}, groupIndex, index, {
                left: position.left - containerBound.left,
                top: position.top - containerBound.top
            }];

            if (isChanged) {
                this._showOverlay(groupIndex, index);
            }

            if (this._isChangedPosition(this.prevPosition, position)) {
                this.callbacks.showTooltip.apply(null, args);
                this.prevOverCircle = circle;
            }
        } else if (this.prevOverCircle) {
            this._hideOverlay();
            this.callbacks.hideTooltip();
            this.prevOverCircle = null;
        }
        this.prevPosition = position;
    },

    /**
     * Select series.
     * @param {number} groupIndex - index of group
     * @param {number} index - index
     */
    _selectSeries: function(groupIndex, index) {
        var circleInfo = this.groupCircleInfos[groupIndex][index];
        var objColor = raphael.color(circleInfo.color);
        var themeColor = this.theme.selectionColor;
        var color = themeColor || raphaelRenderUtil.makeChangedLuminanceColor(objColor.hex, DEFAULT_LUMINANC);

        circleInfo.circle.attr({
            fill: color
        });
    },

    /**
     * Unselect series.
     * @param {number} groupIndex - index of group
     * @param {number} index - index
     */
    _unselectSeries: function(groupIndex, index) {
        var circleInfo = this.groupCircleInfos[groupIndex][index];

        circleInfo.circle.attr({
            fill: circleInfo.color
        });
    },

    /**
     * Select legend.
     * @param {?number} legendIndex - index of legend
     */
    selectLegend: function(legendIndex) {
        var noneSelected = tui.util.isNull(legendIndex);

        raphaelRenderUtil.forEach2dArray(this.groupCircleInfos, function(circleInfo, groupIndex, index) {
            var opacity;

            if (!circleInfo) {
                return;
            }

            opacity = (noneSelected || legendIndex === index) ? EMPHASIS_OPACITY : DE_EMPHASIS_OPACITY;

            circleInfo.circle.attr({opacity: opacity});
        });
    }
});

module.exports = RaphaelBubbleChart;
