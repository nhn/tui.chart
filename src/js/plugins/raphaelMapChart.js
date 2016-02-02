/**
 * @fileoverview RaphaelPieCharts is graph renderer for map chart.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var raphaelRenderUtil = require('./raphaelRenderUtil');

var raphael = window.Raphael;

/**
 * @classdesc RaphaelMapCharts is graph renderer for map chart.
 * @class RaphaelMapChart
 */
var RaphaelMapChart = tui.util.defineClass(/** @lends RaphaelMapChart.prototype */ {
    /**
     * Render function of map chart.
     * @param {HTMLElement} container container
     * @param {object} data data
     *      @param {{width: number, height: number}} data.dimension series dimension
     *      @param {Array.<{code: string, path: string}>} data.map mapData
     *      @param {object} data.valueMap valueMap
     *      @param {MapChartColorModel} data.colorModel color model
     * @returns {object} paper raphael paper
     */
    render: function(container, data) {
        var dimension = data.dimension,
            mapDimension = data.mapModel.getMapDimension(),
            paper;

        this.paper = paper = raphael(container, dimension.width, dimension.height);
        this.sectors = this._renderMap(data);

        paper.setViewBox(0, 0, mapDimension.width, mapDimension.height, false);

        return paper;
    },

    /**
     * Render map graph.
     * @param {object} data data
     *      @param {{width: number, height: number}} data.dimension series dimension
     *      @param {Array.<{code: string, path: string}>} data.map mapData
     *      @param {object} data.valueMap valueMap
     *      @param {MapChartColorModel} data.colorModel color model
     * @returns {Array.<{sector: object, color: string, data: object}>} rendered map information
     * @private
     */
    _renderMap: function(data) {
        var colorModel = data.colorModel;

        return tui.util.map(data.mapModel.getMapData(), function(datum, index) {
            var percentValue = datum.percentValue || 0,
                color = colorModel.getColor(percentValue),
                sector = raphaelRenderUtil.renderArea(this.paper, datum.path, color, 1, '#555555', 1);

            sector.data('index', index);

            return {
                sector: sector,
                color: color,
                percentValue: datum.percentValue
            };
        }, this);
    },

    /**
     * Find sector index.
     * @param {{left: number, top: number}} position position
     * @returns {?number} found index
     */
    findSectorIndex: function(position) {
        var sector = this.paper.getElementByPoint(position.left, position.top),
            foundIndex = (sector && !tui.util.isUndefined(sector.data('index'))) ? sector.data('index') : null,
            data = foundIndex && this.sectors[foundIndex];

        return data && !tui.util.isUndefined(data.percentValue) ? foundIndex : null;
    },

    /**
     * Change color.
     * @param {number} index index
     */
    changeColor: function(index) {
        var sector = this.sectors[index];

        sector.sector.attr({
            fill: 'yellow'
        });
    },

    /**
     * Restore color.
     * @param {number} index index
     */
    restoreColor: function(index) {
        var sector = this.sectors[index];

        sector.sector.attr({
            fill: sector.color
        });
    },

    /**
     * Set size
     * @param {{width: number, height: number}} dimension dimension
     */
    setSize: function(dimension) {
        this.paper.setSize(dimension.width, dimension.height);
    }
});

module.exports = RaphaelMapChart;
