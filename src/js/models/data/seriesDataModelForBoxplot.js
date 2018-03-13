/**
 * @fileoverview SeriesDataModelForBoxplot is boxplot series model for drawing graph of chart series area,
 *                  and create from rawSeriesData by user,
 * SeriesDataModel.groups has SeriesGroups.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

/*
 * Raw series datum.
 * @typedef {{name: ?string, data: Array.<number>, stack: ?string}} rawSeriesDatum
 */

/*
 * Raw series data.
 * @typedef {Array.<rawSeriesDatum>} rawSeriesData
 */

/*
 * Groups.
 * @typedef {Array.<SeriesGroup>} groups
 */

/*
 * SeriesGroup is a element of SeriesDataModel.groups.
 * SeriesGroup.items has SeriesItem.
 */

/*
 * SeriesItem is a element of SeriesGroup.items.
 * SeriesItem has processed terminal data like value, ratio, etc.
 */

var SeriesItemForBoxplot = require('./seriesItemForBoxplot');
var SeriesDataModel = require('./seriesDataModel');
var snippet = require('tui-code-snippet');

var concat = Array.prototype.concat;

var SeriesDataModelForBoxplot = snippet.defineClass(SeriesDataModel, /** @lends SeriesDataModelForBoxplot.prototype */{
    /**
     * SeriesDataModelForBoxplot is series model for boxplot chart
     * SeriesDataModel.groups has SeriesGroups.
     * @constructs SeriesDataModel
     * @param {rawSeriesData} rawSeriesData - raw series data
     * @param {string} chartType - chart type
     * @param {object} options - options
     * @param {Array.<function>} formatFunctions - format functions
     */
    init: function(rawSeriesData, chartType, options, formatFunctions) {
        /**
         * chart type
         * @type {string}
         */
        this.chartType = chartType;

        /**
         * chart options
         * @type {Object}
         */
        this.options = options || {};

        /**
         * functions for formatting
         * @type {Array.<function>}
         */
        this.formatFunctions = formatFunctions;

        /**
         * rawData.series
         * @type {rawSeriesData}
         */
        this.rawSeriesData = rawSeriesData || [];

        /**
         * baseGroups is base data for making SeriesGroups.
         * SeriesGroups is made by pivoted baseGroups, lf line type chart.
         * @type {Array.Array<SeriesItem>}
         */
        this.baseGroups = null;

        /**
         * groups has SeriesGroups.
         * @type {Array.<SeriesGroup>}
         */
        this.groups = null;

        this.options.series = this.options.series || {};

        /**
         * map of values by value type like value, x, y, r.
         * @type {object.<string, Array.<number>>}
         */
        this.valuesMap = {};
    },

    /**
     * Create base groups.
     * Base groups is two-dimensional array by seriesItems.
     * @returns {Array.<Array.<(SeriesItem | SeriesItemForCoordinateType)>>}
     * @private
     * @override
     */
    _createBaseGroups: function() {
        var chartType = this.chartType;
        var formatFunctions = this.formatFunctions;

        return snippet.map(this.rawSeriesData, function(rawDatum) {
            var data = snippet.isArray(rawDatum) ? rawDatum : [].concat(rawDatum.data);
            var items = snippet.map(data, function(datum, index) {
                return new SeriesItemForBoxplot({
                    datum: datum,
                    chartType: chartType,
                    formatFunctions: formatFunctions,
                    index: index,
                    legendName: rawDatum.name
                });
            });

            return items;
        });
    },

    /**
     * Create values that picked value from SeriesItems of SeriesGroups.
     * @returns {Array.<number>}
     * @private
     * * @override
     */
    _createValues: function() {
        var values = [];
        this.map(function(seriesGroup) {
            return snippet.forEach(seriesGroup.items, function(group) {
                values.push(group.min);
                values.push(group.max);
                values.push(group.uq);
                values.push(group.lq);
                values.push(group.median);
            });
        });

        values = concat.apply([], values);

        return snippet.filter(values, function(value) {
            return !isNaN(value);
        });
    }
});

module.exports = SeriesDataModelForBoxplot;
