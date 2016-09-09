/**
 * @fileoverview lineTypeMixer is mixer of line type chart(line, area).
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var ChartBase = require('./chartBase');
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

        if (this.dataProcessor.isCoordinateType()) {
            delete this.options.xAxis.tickInterval;
            this.options.tooltip.grouped = false;
            this.options.series.shifting = false;
        }

        this._addComponents(options.chartType);
    },

    /**
     * Add scale data for y axis.
     * @private
     * @override
     */
    _addScaleDataForYAxis: function() {
        this.scaleModel.addScale('yAxis', this.options.yAxis, {
            valueType: this.dataProcessor.isCoordinateType() ? 'y' : 'value'
        });
    },

    /**
     * Add scale data for x axis.
     * @private
     * @override
     */
    _addScaleDataForXAxis: function() {
        if (this.dataProcessor.isCoordinateType()) {
            this.scaleModel.addScale('xAxis', this.options.xAxis, {
                valueType: 'x'
            });
        }
    },

    /**
     * Add custom event component for normal tooltip.
     * @private
     */
    _addCustomEventComponentForNormalTooltip: function() {
        var seriesOptions = this.options.series;

        this.componentManager.register('customEvent', AreaTypeCustomEvent, {
            chartType: this.chartType,
            isVertical: this.isVertical,
            zoomable: seriesOptions.zoomable,
            allowSelect: seriesOptions.allowSelect
        });
    },

    /**
     * Add components
     * @param {string} chartType chart type
     * @private
     */
    _addComponents: function(chartType) {
        this._addComponentsForAxisType({
            chartType: chartType,
            axis: [
                {
                    name: 'yAxis',
                    isVertical: true
                },
                {
                    name: 'xAxis'
                }
            ],
            series: [
                {
                    name: this.options.chartType + 'Series',
                    SeriesClass: this.Series
                }
            ],
            plot: true
        });
    },

    /**
     * Add plot line.
     * @param {{index: number, color: string, id: string}} data - data
     * @override
     * @api
     */
    addPlotLine: function(data) {
        this.componentManager.get('plot').addPlotLine(data);
    },

    /**
     * Add plot band.
     * @param {{range: Array.<number>, color: string, id: string}} data - data
     * @override
     * @api
     */
    addPlotBand: function(data) {
        this.componentManager.get('plot').addPlotBand(data);
    },

    /**
     * Remove plot line.
     * @param {string} id - line id
     * @override
     * @api
     */
    removePlotLine: function(id) {
        this.componentManager.get('plot').removePlotLine(id);
    },

    /**
     * Remove plot band.
     * @param {string} id - band id
     * @override
     * @api
     */
    removePlotBand: function(id) {
        this.componentManager.get('plot').removePlotBand(id);
    }
};

module.exports = lineTypeMixer;
