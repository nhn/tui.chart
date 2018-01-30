/**
 * @fileoverview Radial chart series component.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var Series = require('./series');
var chartConst = require('../../const');
var geom = require('../../helpers/geometric');
var snippet = require('tui-code-snippet');

var RadialChartSeries = snippet.defineClass(Series, /** @lends RadialChartSeries.prototype */ {
    /**
     * Line chart series component.
     * @constructs RadialChartSeries
     * @private
     * @extends Series
     * @param {object} params parameters
     *      @param {object} params.model series model
     *      @param {object} params.options series options
     *      @param {object} params.theme series theme
     */
    init: function() {
        Series.apply(this, arguments);

        this.options = snippet.extend({
            showDot: true,
            showArea: true
        }, this.options);

        /**
         * object for requestAnimationFrame
         * @type {null | {id: number}}
         */
        this.movingAnimation = null;

        this.drawingType = chartConst.COMPONENT_TYPE_RAPHAEL;
    },

    /**
     * Make positions data for radial series
     * @param {Array.<Array>} seriesGroups series data per category
     * @param {number} groupCount category count
     * @returns {Array.<Array.<object>>}
     * @private
     */
    _makePositionsForRadial: function(seriesGroups, groupCount) {
        var layout = this.layout;
        var dimension = layout.dimension;
        var width = dimension.width - chartConst.RADIAL_PLOT_PADDING - chartConst.RADIAL_MARGIN_FOR_CATEGORY;
        var height = dimension.height - chartConst.RADIAL_PLOT_PADDING - chartConst.RADIAL_MARGIN_FOR_CATEGORY;
        var centerX = (width / 2) + (chartConst.RADIAL_PLOT_PADDING / 2) + (chartConst.RADIAL_MARGIN_FOR_CATEGORY / 2)
            + layout.position.left;
        var centerY = (height / 2) - (chartConst.RADIAL_PLOT_PADDING / 2) - (chartConst.RADIAL_MARGIN_FOR_CATEGORY / 2)
            - layout.position.top;

        var stepAngle = 360 / groupCount;
        var radius;

        radius = Math.min(width, height) / 2;

        return snippet.map(seriesGroups, function(seriesGroup) {
            var positions = snippet.map(seriesGroup, function(seriesItem, index) {
                var position, y, angle, point, valueSize;

                if (!snippet.isNull(seriesItem.end)) {
                    valueSize = seriesItem.ratio * radius;

                    // center y + real vaule size
                    y = centerY + valueSize;

                    // turn angle to clockwise
                    angle = 360 - (stepAngle * index);

                    point = geom.rotatePointAroundOrigin(centerX, centerY, centerX, y, angle);

                    position = {
                        left: point.x,
                        top: height - point.y // convert y coordinate to top
                    };
                }

                return position;
            });

            positions.push(positions[0]);

            return positions;
        }, true);
    },

    /**
     * Get pivoted seriesGroups
     * @returns {Array.<Array>} series group
     * @private
     */
    _getSeriesGroups: function() {
        var seriesDataModel = this._getSeriesDataModel();

        return seriesDataModel.map(function(group) {
            return group.map(function(item) {
                return item;
            });
        }, true);
    },

    /**
     * Make series data for rendering graph and sending to mouse event detector.
     * @returns {object} series data
     * @private
     * @override
     */
    _makeSeriesData: function() {
        var groups = this._getSeriesGroups();
        var groupPositions = this._makePositionsForRadial(groups, this._getSeriesDataModel().getGroupCount());

        return {
            groupPositions: groupPositions,
            isAvailable: function() {
                return groupPositions && groupPositions.length > 0;
            }
        };
    },

    /**
     * Rerender.
     * @param {object} data - data for rerendering
     * @returns {Raphael.Paper} raphael paper
     * @override
     */
    rerender: function(data) {
        return Series.prototype.rerender.call(this, data);
    }
});

function radialSeriesFactory(params) {
    var chartType = params.chartOptions.chartType;
    var libType = params.chartOptions.libType;
    var chartTheme = params.chartTheme;

    params.libType = libType;
    params.chartType = chartType;
    params.chartBackground = chartTheme.background;

    return new RadialChartSeries(params);
}

radialSeriesFactory.componentType = 'series';
radialSeriesFactory.RadialChartSeries = RadialChartSeries;

module.exports = radialSeriesFactory;
