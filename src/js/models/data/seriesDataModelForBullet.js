/**
 * @fileoverview SeriesDataModel for Bullet Chart
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var SeriesItem = require('./seriesItem');
var SeriesDataModel = require('./seriesDataModel');
var chartConst = require('../../const');
var snippet = require('tui-code-snippet');

var SeriesDataModelForBullet = snippet.defineClass(SeriesDataModel, /** @lends SeriesDataModelForBullet.prototype */ {
    /**
     * SeriesDataModelForBullet is series model for boxplot chart
     * SeriesDataModel.groups has SeriesGroups.
     * @constructs SeriesDataModel
     * @param {rawSeriesData} rawSeriesData - raw series data
     * @param {string} chartType - chart type
     * @param {object} options - options
     * @param {Array.<function>} formatFunctions - format functions
     */
    init: function(rawSeriesData, chartType, options, formatFunctions) {
        SeriesDataModel.call(this, rawSeriesData, chartType, options, formatFunctions);
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
        var maxRangeCount = 0;
        var maxMarkerCount = 0;
        var baseGroups = snippet.map(this.rawSeriesData, function(rawDatum) {
            var items = [];
            var data = rawDatum.data;
            var markers = rawDatum.markers;
            var markerCount = markers.length;
            var ranges = rawDatum.ranges;
            var rangeCount = ranges.length;

            if (ranges && rangeCount) {
                snippet.map(ranges, function(range) {
                    items.push(new SeriesItem({
                        datum: range,
                        chartType: chartType,
                        formatFunctions: formatFunctions,
                        type: chartConst.BULLET_TYPE_RANGE
                    }));
                });
                maxRangeCount = Math.max(maxRangeCount, rangeCount);
            }

            if (data) {
                items.push(new SeriesItem({
                    datum: data,
                    chartType: chartType,
                    formatFunctions: formatFunctions,
                    type: chartConst.BULLET_TYPE_ACTUAL
                }));
            }

            if (markers && markerCount) {
                snippet.map(markers, function(marker) {
                    items.push(new SeriesItem({
                        datum: marker,
                        chartType: chartType,
                        formabutFunctions: formatFunctions,
                        type: chartConst.BULLET_TYPE_MARKER
                    }));
                });
                maxMarkerCount = Math.max(maxMarkerCount, markerCount);
            }

            return items;
        });

        this.maxMarkerCount = maxMarkerCount;
        this.maxRangeCount = maxRangeCount;

        return baseGroups;
    },

    /**
     * Create SeriesGroups from rawData.series.
     * @returns {Array.<SeriesGroup>}
     * @private
     */
    _createSeriesGroupsFromRawData: function() {
        return SeriesDataModel.prototype._createSeriesGroupsFromRawData.call(this);
    }
});

module.exports = SeriesDataModelForBullet;
