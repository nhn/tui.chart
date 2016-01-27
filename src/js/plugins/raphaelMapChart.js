/**
 * @fileoverview RaphaelPieCharts is graph renderer for map chart.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var raphaelRenderUtil = require('./raphaelRenderUtil');

var Raphael = window.Raphael;

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
     *      @param {{dimension: {width: number, height: number}, data: Array.<object>}} data.map mapData
     *      @param {object} data.valueMap valueMap
     *      @param {MapChartColorModel} data.colorModel color model
     * @return {object} paper raphael paper
     */
    render: function(container, data) {
        var dimension = data.dimension,
            mapDimension = data.map.dimension,
            paper;

        this.paper = paper = Raphael(container, dimension.width, dimension.height);
        this.sectors = this._renderMap(data);

        paper.setViewBox(0, 0, mapDimension.width, mapDimension.height, false);

        return paper;
    },

    /**
     * Render map graph.
     * @param {object} data data
     *      @param {{width: number, height: number}} data.dimension series dimension
     *      @param {{dimension: {width: number, height: number}, data: Array.<object>}} data.map mapData
     *      @param {object} data.valueMap valueMap
     *      @param {MapChartColorModel} data.colorModel color model
     * @returns {Array.<{sector: object, color: string, data: object}>} rendered map information
     * @private
     */
    _renderMap: function(data) {
        var colorModel = data.colorModel,
            valueMap = data.valueMap;

        return tui.util.map(data.map.data, function(datum, index) {
            var value = valueMap[datum.code],
                percentValue = value && value.percentValue || 0,
                color = colorModel.getColor(percentValue),
                sector = raphaelRenderUtil.renderArea(this.paper, datum.path, color, 1, '#555555', 1);

            sector.data('index', index);

            return {
                sector: sector,
                color: color,
                data: value
            };
        }, this);
    },

    /**
     * Whether changed or not.
     * @param {{left: number, top: number}} prevPosition previous position
     * @param {{left: number, top: number}} position position
     * @returns {boolean} result boolean
     * @private
     */
    _isChangedPosition: function(prevPosition, position) {
        return !prevPosition || prevPosition.left !== position.left || prevPosition.top !== position.top;
    },

    /**
     * Move mouse on series.
     * @param {{left: number, top: number}} position mouse position
     */
    moveMouseOnSeries: function(position) {
        var sector = this.paper.getElementByPoint(position.left, position.top),
            changedSector;

        if (sector && this.sectors[sector.data('index')]) {
            changedSector = this.prevMovedSector !== sector;
            if (changedSector) {
                if (this.prevMovedSector) {
                    this._restoreColor(this.prevMovedSector.data('index'));
                }
                this._changeColor(sector.data('index'));
            }

            if (this._isChangedPosition(this.prevPosition, position)) {
                // show tooltip
                this.prevMovedSector = sector;
            }
        } else if (this.prevMovedSector) {
            this._restoreColor(this.prevMovedSector.data('index'));
            delete this.prevMovedSector;
            // hide tooltip
        }
        this.prevPosition = position;
    },

    /**
     * Change color.
     * @param {number} index index
     * @private
     */
    _changeColor: function(index) {
        var sector = this.sectors[index];

        sector.sector.attr({
            fill: 'yellow'
        });
    },

    /**
     * Restore color.
     * @param {number} index index
     * @private
     */
    _restoreColor: function(index) {
        var sector = this.sectors[index];

        sector.sector.attr({
            fill: sector.color
        });
    },

    /**
     * Move map.
     * @param {{left: number, top: number}} position position
     */
    moveMap: function(position) {
        var viewBox = this.paper._viewBox;

        viewBox[0] = position.left;
        viewBox[1] = position.top;

        this.paper.setViewBox.apply(this.paper, viewBox);
    }
});

module.exports = RaphaelMapChart;
