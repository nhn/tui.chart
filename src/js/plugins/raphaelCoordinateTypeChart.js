/**
 * @fileoverview Raphael bubble chart renderer.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var raphaelRenderUtil = require('./raphaelRenderUtil');
var snippet = require('tui-code-snippet');
var raphael = require('raphael');

var ANIMATION_DURATION = 700;
var CIRCLE_OPACITY = 0.5;
var STROKE_OPACITY = 0.3;
var EMPHASIS_OPACITY = 0.5;
var DE_EMPHASIS_OPACITY = 0.3;
var DEFAULT_LUMINANC = 0.2;
var OVERLAY_BORDER_WIDTH = 2;
var TOOLTIP_OFFSET_VALUE = 20;

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
var RaphaelBubbleChart = snippet.defineClass(/** @lends RaphaelBubbleChart.prototype */ {
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
    render: function(paper, data, callbacks) {
        var circleSet = paper.set();

        this.paper = paper;

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

        return circleSet;
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
     * @param {object} circleSet - circle set
     * @returns {Array.<Array.<circleInfo>>}
     * @private
     */
    _renderCircles: function(circleSet) {
        var self = this;
        var colors = this.theme.colors;

        return snippet.map(this.groupBounds, function(bounds, groupIndex) {
            return snippet.map(bounds, function(bound, index) {
                var circleInfo = null;
                var color, circle;

                if (bound) {
                    color = colors[index];
                    circle = raphaelRenderUtil.renderCircle(self.paper, bound, 0, {
                        fill: color,
                        opacity: 0,
                        stroke: 'none'
                    });

                    circleSet.push(circle);

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
        }, ANIMATION_DURATION, '>');
    },

    /**
     * Animate.
     */
    animate: function() {
        var self = this;

        raphaelRenderUtil.forEach2dArray(this.groupCircleInfos, function(circleInfo) {
            if (!circleInfo) {
                return;
            }
            self._animateCircle(circleInfo.circle, circleInfo.bound.radius);
        });
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
            if (circleInfo) {
                circleInfo.bound = bound;
                self._updatePosition(circleInfo.circle, bound);
            }
        });
    },

    /**
     * Find data indexes of rendered circle by position.
     * @param {{left: number, top: number}} position - mouse position
     * @returns {{index: number, groupIndex: number}}
     */
    findIndexes: function(position) {
        var circle = this.paper.getElementByPoint(position.left, position.top);
        var foundIndexes = null;

        if (circle) {
            foundIndexes = {
                index: circle.data('index'),
                groupIndex: circle.data('groupIndex')
            };
        }

        return foundIndexes;
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
     * Show overlay with animation.
     * @param {object} indexes - indexes
     *      @param {number} indexes.groupIndex - index of circles group
     *      @param {number} indexes.index - index of circles
     */
    showAnimation: function(indexes) {
        var circleInfo = this.groupCircleInfos[indexes.groupIndex][indexes.index];
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
     * Hide overlay with animation.
     * @private
     */
    hideAnimation: function() {
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

        while (snippet.isUndefined(foundCircle)) {
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

        snippet.forEachArray(circles, function(_circle) {
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
        var groupIndex, index, args;

        if (circle && snippet.isExisty(circle.data('groupIndex'))) {
            groupIndex = circle.data('groupIndex');
            index = circle.data('index');
            args = [{}, groupIndex, index, {
                left: position.left - TOOLTIP_OFFSET_VALUE,
                top: position.top - TOOLTIP_OFFSET_VALUE
            }];

            if (this._isChangedPosition(this.prevPosition, position)) {
                this.callbacks.showTooltip.apply(null, args);
                this.prevOverCircle = circle;
            }
        } else if (this.prevOverCircle) {
            this.callbacks.hideTooltip();
            this.prevOverCircle = null;
        }
        this.prevPosition = position;
    },

    /**
     * Select series.
     * @param {{index: number, groupIndex: number}} indexes - index map
     */
    selectSeries: function(indexes) {
        var groupIndex = indexes.groupIndex;
        var index = indexes.index;
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
     * @param {{index: number, groupIndex: number}} indexes - index map
     */
    unselectSeries: function(indexes) {
        var groupIndex = indexes.groupIndex;
        var index = indexes.index;
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
        var noneSelected = snippet.isNull(legendIndex);

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
