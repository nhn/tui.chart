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

        axisDataMaker.updateLabelAxisDataForAdjustingTickCount(axesData.xAxis, seriesWidth);
    },

    /**
     * Render for zoom.
     * @param {boolean} isResetZoom - whether reset zoom or not
     * @private
     */
    _renderForZoom: function(isResetZoom) {
        var self = this;

        this.boundsMaker.initBoundsData();
        this._render(function(renderingData) {
            renderingData.customEvent.isResetZoom = isResetZoom;
            self._renderComponents(renderingData, 'zoom');
        });
    },

    /**
     * On zoom.
     * @param {Array.<number>} indexRange - index range for zoom
     * @override
     */
    onZoom: function(indexRange) {
        this.dataProcessor.updateRawDataForZoom(indexRange);
        this.axisScaleMakerMap = null;
        this._renderForZoom(false);
    },

    /**
     * On reset zoom.
     * @override
     */
    onResetZoom: function() {
        var rawData = this.dataProcessor.getOriginalRawData();

        this.axisScaleMakerMap = null;
        this.indexRange = null;

        this.dataProcessor.initData(rawData);
        this.dataProcessor.initZoomedRawData();
        this._renderForZoom(true);
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
