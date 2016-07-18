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
        this.boxesSet = this._renderBoxes(seriesData.seriesDataModel, !!seriesData.isPivot);

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
     * @returns {string}
     * @private
     */
    _getColorFromColors: function(seriesItem) {
        return this.theme.colors[seriesItem.group];
    },

    /**
     * Render rect.
     * @param {{width: number, height: number, left: number, top: number}} bound - bound
     * @param {string} color - color
     * @returns {object}
     * @private
     */
    _renderRect: function(bound, color) {
        return raphaelRenderUtil.renderRect(this.paper, bound, {
            fill: color,
            stroke: this.borderColor
        });
    },

    /**
     * Render boxes.
     * @param {SeriesDataModel} seriesDataModel - seriesDataModel
     * @returns {Array.<Array.<{rect: object, color: string}>>}
     * @private
     */
    _renderBoxes: function(seriesDataModel, isPivot) {
        var self = this;

        return seriesDataModel.map(function(seriesGroup, groupIndex) {
            return seriesGroup.map(function(seriesItem, index) {
                var result = null;
                var bound, color;

                seriesItem.groupIndex = groupIndex;
                seriesItem.index = index;
                bound = self._getBound(seriesItem);

                if (bound) {
                    color = self._getColor(seriesItem);
                    result = {
                        rect: self._renderRect(bound, color),
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
     * @param {{groupIndex: number, index:number}} indexes - index info
     * @param {string} [color] - fill color
     * @private
     */
    _animateChangingColor: function(indexes, color) {
        var box = this.boxesSet[indexes.groupIndex][indexes.index];

        color = color || box.color;

        box.rect.animate({
            fill: color
        }, ANIMATION_DURATION);
    },

    /**
     * Show animation.
     * @param {{groupIndex: number, index:number}} indexes - index info
     */
    showAnimation: function(indexes) {
        this._animateChangingColor(indexes, this.theme.overColor);
    },

    /**
     * Hide animation.
     * @param {{groupIndex: number, index:number}} indexes - index info
     */
    hideAnimation: function(indexes) {
        this._animateChangingColor(indexes);
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
