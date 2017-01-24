/**
 * @fileoverview RaphaelPieCharts is graph renderer for map chart.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var raphaelRenderUtil = require('./raphaelRenderUtil');

var STROKE_COLOR = 'gray';
var ANIMATION_DURATION = 100;

/**
 * @classdesc RaphaelMapCharts is graph renderer for map chart.
 * @class RaphaelMapChart
 * @private
 */
var RaphaelMapChart = tui.util.defineClass(/** @lends RaphaelMapChart.prototype */ {
    /**
     * Render function of map chart.
     * @param {object} paper paper object
     * @param {object} data data
     *      @param {{width: number, height: number}} data.dimension series dimension
     *      @param {Array.<{code: string, path: string}>} data.map mapData
     *      @param {ColorSpectrum} data.colorSpectrum color model
     */
    render: function(paper, data) {
        var mapDimension = data.mapModel.getMapDimension();

        this.paper = paper;
        this.sectors = this._renderMap(data);
        this.overColor = data.theme.overColor;

        paper.setViewBox(0, 0, mapDimension.width, mapDimension.height, false);
    },

    /**
     * Render map graph.
     * @param {object} data data
     *      @param {{width: number, height: number}} data.dimension series dimension
     *      @param {Array.<{code: string, path: string}>} data.map mapData
     *      @param {ColorSpectrum} data.colorSpectrum color model
     * @returns {Array.<{sector: object, color: string, data: object}>} rendered map information
     * @private
     */
    _renderMap: function(data) {
        var paper = this.paper,
            colorSpectrum = data.colorSpectrum;

        return tui.util.map(data.mapModel.getMapData(), function(datum, index) {
            var ratio = datum.ratio || 0,
                color = colorSpectrum.getColor(ratio),
                sector = raphaelRenderUtil.renderArea(paper, datum.path, {
                    fill: color,
                    opacity: 1,
                    stroke: STROKE_COLOR,
                    'stroke-opacity': 1
                });

            sector.data('index', index);

            return {
                sector: sector,
                color: color,
                ratio: datum.ratio
            };
        });
    },

    /**
     * Find sector index.
     * @param {{left: number, top: number}} position position
     * @returns {?number} found index
     */
    findSectorIndex: function(position) {
        var sector = this.paper.getElementByPoint(position.left, position.top),
            foundIndex = sector && sector.data('index'),
            data = !tui.util.isUndefined(foundIndex) && this.sectors[foundIndex];

        return data && !tui.util.isUndefined(data.ratio) ? foundIndex : null;
    },

    /**
     * Change color.
     * @param {number} index index
     */
    changeColor: function(index) {
        var sector = this.sectors[index];

        sector.sector.animate({
            fill: this.overColor
        }, ANIMATION_DURATION);
    },

    /**
     * Restore color.
     * @param {number} index index
     */
    restoreColor: function(index) {
        var sector = this.sectors[index];

        sector.sector.animate({
            fill: sector.color
        }, ANIMATION_DURATION);
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
