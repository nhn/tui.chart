/**
 * @fileoverview RaphaelBoxTypeChart is graph renderer for box type chart(heatmap chart, treemap chart).
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';
var raphaelRenderUtil = require('./raphaelRenderUtil');

var raphael = window.Raphael;

var ANIMATION_DURATION = 100;

/**
 * @classdesc RaphaelBoxTypeChart is graph renderer for box type chart(heatmap chart, treemap chart).
 * @class RaphaelBarChart
 */
var RaphaelBoxTypeChart = tui.util.defineClass(/** @lends RaphaelBoxTypeChart.prototype */ {
    /**
     * Render function of bar chart
     * @param {HTMLElement} container container element
     * @param {{
     *      dimension: {width: number, height: number},
     *      colorModel: object,
     *      seriesDataModel: SeriesDataModel,
     *      groupBounds: (Array.<Array.<object>>|object.<string, object>),
     *      theme: object
     * }} seriesData - data for graph rendering
     * @returns {object}
     */
    render: function(container, seriesData) {
        var dimension = seriesData.dimension;

        this.paper = raphael(container, dimension.width, dimension.height);
        /**
         * theme
         * @type {*|{}}
         */
        this.theme = seriesData.theme || {};

        /**
         * color model
         * @type {Object}
         */
        this.colorModel = seriesData.colorModel;

        /**
         * border color for rendering box
         * @type {string}
         */
        this.borderColor = this.theme.borderColor || 'none';

        /**
         * group bounds
         * @type {Array.<Array.<object>>|object.<string, object>}
         */
        this.groupBounds = seriesData.groupBounds;

        if (seriesData.boundMap) {
            this.boundMap = seriesData.boundMap;
            this._getBound = this._getBoundFromBoundMap;
        } else {
            this._getBound = this._getBoundFromGroupBounds;
        }

        if (!this.colorModel) {
            this._getColor = this._getColorFromColors;
        }

        /**
         * boxes set
         * @type {Array.<Array.<{rect: Object, color: string}>>}
         */
        this.boxesSet = this._renderBoxes(seriesData.seriesDataModel, seriesData.startDepth, !!seriesData.isPivot);

        return this.paper;
    },

    /**
     * Get bound from groupBounds by indexes(groupIndex, index) of seriesItem.
     * @param {SeriesItem} seriesItem - seriesItem
     * @returns {{width: number, height: number, left: number, top: number}}
     * @private
     */
    _getBoundFromGroupBounds: function(seriesItem) {
        return this.groupBounds[seriesItem.groupIndex][seriesItem.index].end;
    },

    /**
     * Get bound from boundMap by id of seriesItem.
     * @param {SeriesItem} seriesItem - seriesItem
     * @returns {{width: number, height: number, left: number, top: number}}
     * @private
     */
    _getBoundFromBoundMap: function(seriesItem) {
        return this.boundMap[seriesItem.id];
    },

    /**
     * Get color from colorModel by ratio of seriesItem.
     * @param {SeriesItem} seriesItem - seriesItem
     * @returns {string}
     * @private
     */
    _getColor: function(seriesItem) {
        return this.colorModel.getColor(seriesItem.ratio);
    },

    /**
     * Get color from colors theme by group property of seriesItem.
     * @param {SeriesItem} seriesItem - seriesItem
     * @param {number} startDepth - start depth
     * @returns {string}
     * @private
     */
    _getColorFromColors: function(seriesItem, startDepth) {
        var color;

        if (seriesItem.depth === startDepth) {
            color = this.theme.colors[seriesItem.group];
        } else {
            color = 'none';
        }

        return color;
    },

    /**
     * Render rect.
     * @param {{width: number, height: number, left: number, top: number}} bound - bound
     * @param {string} color - color
     * @param {number} strokeWidth - stroke width
     * @returns {object}
     * @private
     */
    _renderRect: function(bound, color, strokeWidth) {
        return raphaelRenderUtil.renderRect(this.paper, bound, {
            fill: color,
            stroke: this.borderColor,
            'stroke-width': strokeWidth
        });
    },

    /**
     * Render boxes.
     * @param {SeriesDataModel} seriesDataModel - seriesDataModel
     * @param {number} startDepth - start depth
     * @param {boolean} isPivot - whether pivot or not
     * @returns {Array.<Array.<{rect: object, color: string}>>}
     * @private
     */
    _renderBoxes: function(seriesDataModel, startDepth, isPivot) {
        var self = this;

        return seriesDataModel.map(function(seriesGroup, groupIndex) {
            return seriesGroup.map(function(seriesItem, index) {
                var result = null;
                var strokeWidth = 1;
                var bound, color;

                if (seriesItem.depth === startDepth) {
                    strokeWidth = 3;
                }

                seriesItem.groupIndex = groupIndex;
                seriesItem.index = index;
                bound = self._getBound(seriesItem);

                if (bound) {
                    color = self._getColor(seriesItem, startDepth);
                    result = {
                        rect: self._renderRect(bound, color, strokeWidth),
                        seriesItem: seriesItem,
                        color: color
                    };
                }

                return result;
            });
        }, isPivot);
    },

    /**
     * Animate changing color of box.
     * @param {object} rect - raphael object
     * @param {string} [color] - fill color
     * @param {number} [opacity] - fill opacity
     * @private
     */
    _animateChangingColor: function(rect, color, opacity) {
        rect.animate({
            fill: color,
            'fill-opacity': opacity || 1
        }, ANIMATION_DURATION);
    },

    /**
     * Show animation.
     * @param {{groupIndex: number, index:number}} indexes - index info
     * @param {boolean} hasOpacity - whether has opacity property or not
     */
    showAnimation: function(indexes, hasOpacity) {
        var box = this.boxesSet[indexes.groupIndex][indexes.index];
        var color, opacity;

        if (!box) {
            return;
        }

        box.rect.toFront();

        if (hasOpacity) {
            color = box.color;
            opacity = 0.7;
        } else {
            color = this.theme.overColor;
            opacity = 1;
        }

        this._animateChangingColor(box.rect, color, opacity);
    },

    /**
     * Hide animation.
     * @param {{groupIndex: number, index:number}} indexes - index info
     */
    hideAnimation: function(indexes) {
        var box = this.boxesSet[indexes.groupIndex][indexes.index];

        if (!box) {
            return;
        }

        this._animateChangingColor(box.rect, box.color);
        box.rect.toBack();
    },

    /**
     * Resize.
     * @param {{
     *      dimension: {width: number, height: number},
     *      groupBounds: (Array.<Array.<object>>|object.<string, object>)
     * }} seriesData - data for graph rendering
     */
    resize: function(seriesData) {
        var self = this;
        var dimension = seriesData.dimension;

        this.groupBounds = seriesData.groupBounds;
        this.paper.setSize(dimension.width, dimension.height);

        raphaelRenderUtil.forEach2dArray(this.boxesSet, function(box, groupIndex, index) {
            var bound;

            if (!box) {
                return;
            }

            bound = self._getBound(box.seriesItem, groupIndex, index);

            if (bound) {
                raphaelRenderUtil.updateRectBound(box.rect, bound);
            }
        });
    }
});

module.exports = RaphaelBoxTypeChart;
