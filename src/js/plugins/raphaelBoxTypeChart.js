/**
 * @fileoverview RaphaelBoxTypeChart is graph renderer for box type chart(heatmap chart, treemap chart).
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';
var raphaelRenderUtil = require('./raphaelRenderUtil');

var raphael = window.Raphael;

var ANIMATION_TIME = 100;

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
     *      theme: object
 *      }} seriesData - data for graph rendering
     * @returns {object}
     */
    render: function(container, seriesData) {
        var dimension = seriesData.dimension;

        this.paper = raphael(container, dimension.width, dimension.height);
        this.theme = seriesData.theme;
        this.boxesSet = this._renderBoxes(seriesData);

        return this.paper;
    },

    /**
     * Render boxes.
     * @param {{gropudBounds: Array, seriesDataModel: SeriesDataModel}} seriesData - series data for rendering graph
     * @returns {Array.<Array.<{rect: object, color: string}>>}
     * @private
     */
    _renderBoxes: function(seriesData) {
        var paper = this.paper;
        var groupBounds = seriesData.groupBounds;
        var seriesDataModel = seriesData.seriesDataModel;
        var colorModel = seriesData.colorModel;
        var borderColor = this.theme.borderColor || 'none';

        return seriesDataModel.map(function(seriesGroup, groupIndex) {
            return seriesGroup.map(function(seriesItem, index) {
                var bound = groupBounds[groupIndex][index].end;
                var color = colorModel.getColor(seriesItem.ratio);
                var rect = raphaelRenderUtil.renderRect(paper, bound, {
                    fill: color,
                    stroke: borderColor
                });

                return {
                    rect: rect,
                    color: color
                };
            }, true);
        });
    },

    /**
     * Show animation.
     * @param {{groupIndex: number, index:number}} indexes - index info
     */
    showAnimation: function(indexes) {
        var box = this.boxesSet[indexes.groupIndex][indexes.index];

        box.rect.animate({
            fill: this.theme.overColor
        }, ANIMATION_TIME);
    },

    /**
     * Hide animation.
     * @param {{groupIndex: number, index:number}} indexes - index info
     */
    hideAnimation: function(indexes) {
        var box = this.boxesSet[indexes.groupIndex][indexes.index];

        box.rect.animate({
            fill: box.color
        }, ANIMATION_TIME);
    }
});

module.exports = RaphaelBoxTypeChart;
