/**
 * @fileoverview Bullet chart series component.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var Series = require('./series');
var renderUtil = require('../../helpers/renderUtil');
var chartConst = require('../../const');
var snippet = require('tui-code-snippet');

var BulletChartSeries = snippet.defineClass(Series, /** @lends BulletChartSeries.prototype */ {
    /**
     * Bullet chart series component.
     * @constructs BulletChartSeries
     * @private
     * @extends Series
     * @param {object} params series initialization data
     */
    init: function(params) {
        Series.call(this, params);

        /**
         * true if graph stratches vertically
         * false if graph stratches horizontally
         * @type {boolean}
         */
        this.isVertical = params.isVertical;
    },

    /**
     * Create data for rendering series
     * @returns {object} - data for rendering series
     * @override
     * @private
     */
    _makeSeriesData: function() {
        var groupBounds = this._makeBounds();

        return {
            groupBounds: groupBounds,
            seriesDataModel: this._getSeriesDataModel(),
            isVertical: this.isVertical,
            isAvailable: function() {
                return groupBounds && groupBounds.length > 0;
            }
        };
    },

    /**
     * Create bounds data
     * @returns {Array.<Bound>} - bound data of bullet graph components
     * @private
     */
    _makeBounds: function() {
        var self = this;
        var seriesDataModel = this._getSeriesDataModel();
        var baseData = this._makeBaseDataForMakingBound();
        var iterationData = {
            renderedItemCount: 0,
            top: baseData.categoryAxisTop,
            left: baseData.categoryAxisLeft
        };

        return seriesDataModel.map(function(seriesGroup) {
            var iteratee = snippet.bind(self._makeBulletChartBound, self, baseData, iterationData);
            var bounds = seriesGroup.map(iteratee);

            self._updateIterationData(iterationData, baseData.itemWidth);

            return bounds;
        });
    },

    /**
     * prepare a base data before making a bound
     * @returns {object} - base data
     * @private
     */
    _makeBaseDataForMakingBound: function() {
        var groupCount = this._getSeriesDataModel().getGroupCount();
        var dimension = this.layout.dimension;
        var width = dimension.width;
        var height = dimension.height;
        var position = this.layout.position;
        var categoryAxisTop = position.top;
        var categoryAxisLeft = position.left;
        var categoryAxisWidth, valueAxisWidth, itemWidth;

        if (this.isVertical) {
            categoryAxisTop += height;
            categoryAxisWidth = width;
            valueAxisWidth = height;
        } else {
            categoryAxisWidth = height;
            valueAxisWidth = width;
        }

        itemWidth = categoryAxisWidth / groupCount;

        return {
            categoryAxisTop: categoryAxisTop,
            categoryAxisLeft: categoryAxisLeft,
            categoryAxisWidth: categoryAxisWidth,
            valueAxisWidth: valueAxisWidth,
            itemWidth: itemWidth
        };
    },

    /**
     * Create a bullet chart bound before making a base data
     * @param {object} baseData - base data for making a tooltip
     * @param {object} iterationData - increasing data while generating a graph data: index of item, graph position
     * @param {object} item - series item
     * @returns {Bound} - bullet graph bound
     * @private
     */
    _makeBulletChartBound: function(baseData, iterationData, item) {
        var type = item.type;
        var bound;

        if (type === chartConst.BULLET_TYPE_ACTUAL) {
            bound = this._makeBarBound(item, chartConst.BULLET_ACTUAL_HEIGHT_RATIO, baseData, iterationData);
        } else if (type === chartConst.BULLET_TYPE_RANGE) {
            bound = this._makeBarBound(item, chartConst.BULLET_RANGES_HEIGHT_RATIO, baseData, iterationData);
        } else if (type === chartConst.BULLET_TYPE_MARKER) {
            bound = this._makeLineBound(item, chartConst.BULLET_MARKERS_HEIGHT_RATIO, baseData, iterationData);
        }

        bound.type = type;

        return bound;
    },

    /**
     * Create bar type bound data
     * @param {object} model - series item data
     * @param {number} widthRatio - thickness compare to graph area
     * @param {object} baseData - base data needed for making a bar bound
     * @param {object} iterationData - data for setting up position
     * @returns {object} - bar type bound data
     * @private
     */
    _makeBarBound: function(model, widthRatio, baseData, iterationData) {
        var barWidth = baseData.itemWidth * widthRatio;
        var barHeight = baseData.valueAxisWidth * model.ratioDistance;
        var barEndHeight = baseData.valueAxisWidth * model.endRatio;
        var bound;

        if (this.isVertical) {
            bound = this._makeVerticalBarBound(iterationData, baseData, barWidth, barHeight, barEndHeight);
        } else {
            bound = this._makeHorizontalBarBound(iterationData, baseData, barWidth, barHeight, barEndHeight);
        }

        return bound;
    },

    /**
     * create a bound of bar type component, when it is virtical chart
     * @param {object} iterationData - increasing data while generating a graph data: graph position
     * @param {object} baseData - base data
     * @param {number} barWidth - width of bar
     * @param {number} barHeight - bar size from start position to end position
     * @param {number} barEndHeight - bar size from axis start point to end position
     * @returns {object} - bound data
     * @private
     */
    _makeVerticalBarBound: function(iterationData, baseData, barWidth, barHeight, barEndHeight) {
        return {
            top: iterationData.top - barEndHeight,
            left: iterationData.left + ((baseData.itemWidth - barWidth) / 2),
            width: barWidth,
            height: barHeight
        };
    },

    /**
     * create a bound of bar type component, when it is a horizontal chart
     * @param {object} iterationData - increasing data while generating a graph data: graph position
     * @param {object} baseData - base data
     * @param {number} barWidth - width of bar
     * @param {number} barHeight - bar size from start position to end position
     * @param {number} barEndHeight - bar size from axis start point to end position
     * @returns {object} - bound data
     * @private
     */
    _makeHorizontalBarBound: function(iterationData, baseData, barWidth, barHeight, barEndHeight) {
        return {
            top: iterationData.top + ((baseData.itemWidth - barWidth) / 2),
            left: iterationData.left + barEndHeight - barHeight,
            width: barHeight,
            height: barWidth
        };
    },

    /**
     * Create line type bound data
     * @param {object} model - series item data
     * @param {number} widthRatio - graph thickness compare to graph area
     * @param {object} baseData - base data needed for making a line bound
     * @param {object} iterationData - data for setting up position
     * @returns {object} - line type bound data
     * @private
     */
    _makeLineBound: function(model, widthRatio, baseData, iterationData) {
        var lineWidth = baseData.itemWidth * widthRatio;
        var endHeight = baseData.valueAxisWidth * model.endRatio;
        var width = chartConst.BULLET_MARKER_DETECT_PADDING;
        var height = chartConst.BULLET_MARKER_DETECT_PADDING;
        var top, left;

        if (this.isVertical) {
            top = iterationData.top - endHeight;
            left = iterationData.left + ((baseData.itemWidth - lineWidth) / 2);
            width = lineWidth;
        } else {
            top = iterationData.top + ((baseData.itemWidth - lineWidth) / 2);
            left = iterationData.left + endHeight;
            height = lineWidth;
        }

        return {
            top: top,
            left: left,
            length: lineWidth,
            width: width,
            height: height
        };
    },

    /**
     * update iterationData after making a graph bound
     * @param {object} iterationData - iteration data
     * @param {number} itemWidth - size of category axis area
     * @private
     */
    _updateIterationData: function(iterationData, itemWidth) {
        iterationData.renderedItemCount += 1;

        if (this.isVertical) {
            iterationData.left += itemWidth;
        } else {
            iterationData.top += itemWidth;
        }
    },

    /**
    * Render series area.
    * @param {object} paper - raphael object
    * @param {function} funcRenderGraph - function for graph rendering
    * @private
    */
    _renderSeriesArea: function(paper, funcRenderGraph) {
        Series.prototype._renderSeriesArea.call(this, paper, funcRenderGraph);

        this.dataProcessor.setGraphColors(this.graphRenderer.getGraphColors());
    },

    /**
     * Render series labels
     * Series labels are shown only when `options.series.showLabel` is enabled
     * @param {object} paper paper
     * @returns {Array.<SVGElement>} - svg label sets
     * @override
     * @private
     */
    _renderSeriesLabel: function(paper) {
        var theme = this.theme.label;
        var seriesDataModel = this._getSeriesDataModel();
        var groupLabels = this._getLabelTexts(seriesDataModel);
        var positionsSet = this._calculateLabelPositions(seriesDataModel, theme);

        return this.graphRenderer.renderSeriesLabel(paper, positionsSet, groupLabels, theme);
    },

    /**
     * Get label texts needed for enabling `options.series.showLabel` option
     * @param {object} seriesDataModel - seriesDataModel
     * @returns {Array.<string>} - actual data and marker data label
     * @private
     */
    _getLabelTexts: function(seriesDataModel) {
        return seriesDataModel.map(function(seriesGroup) {
            var seriesLabels = [];

            seriesGroup.each(function(seriesDatum) {
                if (seriesDatum.type !== chartConst.BULLET_TYPE_RANGE) {
                    seriesLabels.push(seriesDatum.endLabel);
                }
            });

            return seriesLabels;
        });
    },

    /**
     * calculate a label position
     * @param {object} seriesDataModel - bullet chart's series data model
     * @param {object} theme - style needed to calculate the size of the text
     * @returns {Array.<object>} - position of label text
     * @private
     */
    _calculateLabelPositions: function(seriesDataModel, theme) {
        var serieses = this.seriesData.groupBounds;
        var labelHeight = renderUtil.getRenderedLabelHeight(chartConst.MAX_HEIGHT_WORD, theme);

        return snippet.map(serieses, function(series) {
            var bounds = [];

            snippet.forEach(series, function(item) {
                if (item.type !== chartConst.BULLET_TYPE_RANGE) {
                    bounds.push(this._makePositionByBound(item, labelHeight));
                }
            }, this);

            return bounds;
        }, this);
    },

    /**
     * make position top, left data using bound data and label height
     * @param {object} bound - bound data
     * @param {number} labelHeight - label's height
     * @returns {object} - position top, left
     * @private
     */
    _makePositionByBound: function(bound, labelHeight) {
        var boundTop = bound.top;
        var boundLeft = bound.left;
        var width, height;
        var position = {};

        if (this.isVertical) {
            width = bound.width || bound.length;
            position.top = boundTop - labelHeight;
            position.left = boundLeft + (width / 2);
        } else {
            width = bound.width || 0;
            height = bound.height || bound.length;
            position.top = boundTop + (height / 2);
            position.left = boundLeft + 5 + (width || 0);
        }

        return position;
    }
});

/**
 * BulletChartSeries factory function
 * @param {object} params - series initialization data
 * @returns {BulletChartSeries} - bullet chart series
 */
function bulletSeriesFactory(params) {
    var chartTheme = params.chartTheme;

    params.libType = params.chartOptions.libType;
    params.chartType = 'bullet';
    params.chartBackground = chartTheme.chart.background;

    return new BulletChartSeries(params);
}

bulletSeriesFactory.componentType = 'series';
bulletSeriesFactory.BulletChartSeries = BulletChartSeries;

module.exports = bulletSeriesFactory;
