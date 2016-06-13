/**
 * @fileoverview lineTypeMixer is mixer of line type chart(line, area).
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var ChartBase = require('./chartBase');
var axisDataMaker = require('../helpers/axisDataMaker');
var AreaTypeCustomEvent = require('../customEvents/areaTypeCustomEvent');

/**
 * lineTypeMixer is mixer of line type chart(line, area).
 * @mixin
 */
var lineTypeMixer = {
    /**
     * Initialize line type chart.
     * @param {Array.<Array>} rawData raw data
     * @param {object} theme chart theme
     * @param {object} options chart options
     * @private
     */
    _lineTypeInit: function(rawData, theme, options) {
        ChartBase.call(this, {
            rawData: rawData,
            theme: theme,
            options: options,
            hasAxes: true,
            isVertical: true
        });

        this.indexRangeForZoom = null;

        this._addComponents(options.chartType);
    },

    /**
     * Make map for AxisScaleMaker of axes(xAxis, yAxis).
     * @returns {Object.<string, AxisScaleMaker>}
     * @private
     */
    _makeAxisScaleMakerMap: function() {
        return {
            yAxis: this._createAxisScaleMaker(this.options.yAxis, 'yAxis')
        };
    },

    /**
     * Add custom event component for normal tooltip.
     * @private
     */
    _addCustomEventComponentForNormalTooltip: function() {
        this.componentManager.register('customEvent', AreaTypeCustomEvent, {
            chartType: this.chartType,
            isVertical: this.isVertical,
            useLargeData: tui.util.pick(this.options.chart, 'useLargeData')
        });
    },

    /**
     * Add components
     * @param {string} chartType chart type
     * @private
     */
    _addComponents: function(chartType) {
        this._addComponentsForAxisType({
            axes: [
                {
                    name: 'yAxis'
                },
                {
                    name: 'xAxis',
                    isLabel: true
                }
            ],
            chartType: chartType,
            serieses: [
                {
                    name: this.options.chartType + 'Series',
                    SeriesClass: this.Series
                }
            ]
        });
    },

    /**
     * Update axesData.
     * @private
     * @override
     */
    _updateAxesData: function() {
        var boundsMaker = this.boundsMaker;
        var axesData = boundsMaker.getAxesData();
        var seriesWidth = boundsMaker.getDimension('series').width;

        axisDataMaker.updateLabelAxisDataForAdjustTickCount(axesData.xAxis, seriesWidth);
    },

    /**
     * Render for zoom.
     * @param {{series: Array.<object>, categories: Array.<string>}} rawData - raw data
     * @param {boolean} isResetZoom - whether reset zoom or not
     * @private
     */
    _renderForZoom: function(rawData, isResetZoom) {
        var self = this;

        this.dataProcessor.initData(rawData);
        this._render(function(renderingData) {
            renderingData.customEvent.isResetZoom = isResetZoom;
            self._renderComponents(renderingData, 'zoom');
        });
    },

    /**
     * Filter raw data for zoom.
     * @param {{series: Array.<object>, categories: Array.<string>}} rawData - raw data
     * @param {Array.<number>} indexRange - index range for zoom
     * @returns {*}
     * @private
     */
    _filterRawDataForZoom: function(rawData, indexRange) {
        var startIndex = indexRange[0];
        var endIndex = indexRange[1];

        rawData.series = tui.util.map(rawData.series, function(seriesData) {
            seriesData.data = seriesData.data.slice(startIndex, endIndex + 1);
            return seriesData;
        });
        rawData.categories = rawData.categories.slice(startIndex, endIndex + 1);

        return rawData;
    },

    /**
     * Zoom.
     * @param {Array.<number>} indexRange - index range for zoom
     * @private
     */
    _zoom: function(indexRange) {
        var rawData = this.dataProcessor.getRawData();

        this.axisScaleMakerMap = null;
        this.indexRangeForZoom = indexRange;

        rawData = this._filterRawDataForZoom(rawData, indexRange);

        this._renderForZoom(rawData, false);
    },

    /**
     * On zoom.
     * @param {Array.<number>} indexRange - index range for zoom
     * @override
     */
    onZoom: function(indexRange) {
        this._zoom(indexRange);
    },

    /**
     * Reset zoom.
     * @private
     */
    _resetZoom: function() {
        var rawData = this.dataProcessor.getOriginalRawData();

        this.axisScaleMakerMap = null;
        this.indexRange = null;

        this._renderForZoom(rawData, true);
    },

    /**
     * On reset zoom.
     * @override
     */
    onResetZoom: function() {
        this._resetZoom();
    },

    /**
     * Mix in.
     * @param {function} func target function
     * @ignore
     */
    mixin: function(func) {
        tui.util.extend(func.prototype, this);
    }
};

module.exports = lineTypeMixer;
