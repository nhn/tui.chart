/**
 * @fileoverview Data processor for map chart.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var DataProcessor = require('./dataProcessor'),
    renderUtil = require('./renderUtil');

/**
 * Raw series data.
 * @typedef {Array.<{code: string, name: ?string, data: number}>} rawSeriesData
 */

/**
 * Value map.
 * @typedef {{value: number, formattedValue: string, name: ?string}} valueMap
 */

var MapChartDataProcessor = tui.util.defineClass(DataProcessor, /** @lends MapChartDataProcessor.prototype */{
    /**
     * Data processor for map chart.
     * @constructs MapChartDataProcessor
     * @extends DataProcessor
     */
    init: function() {
        DataProcessor.apply(this, arguments);
    },

    /**
     * Update raw data.
     * @param {{series: rawSeriesData}} rawData raw data
     */
    updateRawData: function(rawData) {
        this.rawData = rawData;

        /**
         * value map
         * @type {valueMap}
         */
        this.valueMap = null;
    },

    /**
     * Make value map.
     * @returns {valueMap} value map
     * @private
     */
    _makeValueMap: function() {
        var rawSeriesData = this.rawData.series,
            valueMap = {},
            formatFunctions = this._findFormatFunctions();

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
        if (!this.valueMap) {
            this.valueMap = this._makeValueMap();
        }
        return this.valueMap;
    },

    /**
     * Get values.
     * @returns {Array.<number>} picked values.
     */
    getValues: function() {
        return tui.util.pluck(this.getValueMap(), 'value');
    },

    /**
     * Get valueMap datum.
     * @param {string} code map code
     * @returns {{code: string, name: string, formattedValue: number,
     *              labelCoordinate: {x: number, y: number}}} valueMap datum
     */
    getValueMapDatum: function(code) {
        return this.getValueMap()[code];
    },

    /**
     * Add data ratios of map chart.
     * @param {{min: number, max: number}} limit axis limit
     */
    addDataRatios: function(limit) {
        var min = limit.min,
            max = limit.max - min;
        tui.util.forEach(this.getValueMap(), function(map) {
            map.ratio = (map.value - min) / max;
        });
    }
});

module.exports = MapChartDataProcessor;
