/**
 * @fileoverview Data processor for map chart.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var DataProcessor = require('./dataProcessor'),
    renderUtil = require('./renderUtil');

/**
 * Raw data.
 * @typedef {Array.<{name: string, data: Array.<number>}>} rawSeriesData
 */

/**
 * @classdesc Data processor for map chart.
 * @class MapChartDataProcessor
 */
var MapChartDataProcessor = tui.util.defineClass(DataProcessor, /** @lends MapChartDataProcessor.prototype */{
    /**
     * Process raw data.
     * @param {{series: Array.<{code: string, name: ?string, data: number}>}} rawData raw data
     * @param {{chart: {format: string}}} options options
     */
    process: function(rawData, options) {
        var seriesData = rawData.series,
            valueMap = this._makeValueMap(seriesData, options);

        this.data = {
            valueMap: valueMap
        };
    },

    /**
     * Make value map.
     * @param {Array.<{code: string, name: ?string, data: number}>} rawSeriesData raw series data
     * @param {{chart: {format: string}}} options options
     * @returns {{value: number, formattedValue: string, name: ?string}} value map
     * @private
     */
    _makeValueMap: function(rawSeriesData, options) {
        var valueMap = {},
            format = options.chart && options.chart.format || '',
            formatFunctions = this._findFormatFunctions(format);

        tui.util.forEachArray(rawSeriesData, function(datum) {
            var result = {
                value: datum.data,
                formattedValue: renderUtil.formatValue(datum.data, formatFunctions)
            };

            if (datum.name) {
                result.name = datum.name;
            }

            if (datum.labelCoordinate) {
                result.labelCoordinate = datum.labelCoordinate;
            }

            valueMap[datum.code] = result;
        });

        return valueMap;
    },

    /**
     * Get value map.
     * @returns {number} value
     */
    getValueMap: function() {
        return this.data.valueMap;
    },

    /**
     * Get values.
     * @returns {Array.<number>} picked values.
     */
    getValues: function() {
        return tui.util.pluck(this.data.valueMap, 'value');
    },

    /**
     * Get valueMap datum.
     * @param {string} code map code
     * @returns {{code: string, name: string, formattedValue: number, labelCoordinate: {x: number, y: number}}} valueMap datum
     */
    getValueMapDatum: function(code) {
        return this.data.valueMap[code];
    },

    /**
     * Make percent value.
     * @param {{min: number, max: number}} limit axis limit
     */
    registerPercentValues: function(limit) {
        var min = limit.min,
            max = limit.max - min;
        tui.util.forEach(this.getValueMap(), function(map) {
            map.percentValue = (map.value - min) / max;
        }, this);
    }
});

module.exports = MapChartDataProcessor;
