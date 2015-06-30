/**
 * @fileoverview bar chart model
 * @author jiung.kang@nhnent.com
 */

'user strict';

var ChartModel = require('./chart-model.js'),
    BarChartModel;

BarChartModel = ne.util.defineClass(ChartModel, {
    /**
     * picked series data from user initial data
     * series data is pairs of label and value​
     * @param {Object} data user initial data
     * @return {Object} series data;
     */
    pickSeriesData: function(data) {
        var aps = Array.prototype.slice,
            titleItems = data[0],
            lastTitleItem = titleItems[titleItems.length-1],
            seriesData = aps.call(data);

        seriesData.shift();

        if (typeof lastTitleItem === 'object') {
            seriesData = ne.util.map(seriesData, function(items) {
                items = aps.call(items);
                items.length = items.length - 1;
                return items;
            });
        }

        return seriesData;
    },

    /**
     * picked labels from seriesData
     * @param {Object} seriesData
     * @returns {Array}
     */
    pickLabels: function(seriesData) {
        var labels = ne.util.map(seriesData, function(items) {
            return items[0];
        });
        return labels;
    },

    pickValues: function(seriesData) {
        var values = ne.util.map(seriesData, function(items) {
            return items[1];
        });
        return values;
    }
});

module.exports = BarChartModel;
