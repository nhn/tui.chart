/**
 * @fileoverview comboTypeMixer is mixer of combo type chart.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var defaultTheme = require('../themes/defaultTheme');

/**
 * comboTypeMixer is mixer of combo type chart.
 * @mixin
 */
var comboTypeMixer = {
    /**
     * Get base series options.
     * @param {object.<string, object>} seriesOptions - series options
     * @param {Array.<string>} chartTypes - chart types
     * @returns {object}
     * @private
     */
    _getBaseSeriesOptions: function(seriesOptions, chartTypes) {
        var baseSeriesOptions = tui.util.extend({}, seriesOptions);

        tui.util.forEachArray(chartTypes, function(chartType) {
            delete baseSeriesOptions[chartType];
        });

        return baseSeriesOptions;
    },

    /**
     * Make options map
     * @param {Array.<string>} chartTypes - chart types
     * @returns {object}
     * @private
     */
    _makeOptionsMap: function(chartTypes) {
        var seriesOptions = this.options.series;
        var baseSeriesOptions = this._getBaseSeriesOptions(seriesOptions, chartTypes);
        var optionsMap = {};

        tui.util.forEachArray(chartTypes, function(chartType) {
            optionsMap[chartType] = tui.util.extend({}, baseSeriesOptions, seriesOptions[chartType]);
        });

        return optionsMap;
    },

    /**
     * Make theme map
     * @param {object} seriesNames - series names
     * @returns {object} theme map
     * @private
     */
    _makeThemeMap: function(seriesNames) {
        var dataProcessor = this.dataProcessor;
        var theme = this.theme;
        var themeMap = {};
        var colorCount = 0;

        tui.util.forEachArray(seriesNames, function(chartType) {
            var chartTheme = JSON.parse(JSON.stringify(theme));
            var removedColors;

            if (chartTheme.series[chartType]) {
                themeMap[chartType] = chartTheme.series[chartType];
            } else if (!chartTheme.series.colors) {
                themeMap[chartType] = JSON.parse(JSON.stringify(defaultTheme.series));
                themeMap[chartType].label.fontFamily = chartTheme.chart.fontFamily;
            } else {
                removedColors = chartTheme.series.colors.splice(0, colorCount);
                chartTheme.series.colors = chartTheme.series.colors.concat(removedColors);
                themeMap[chartType] = chartTheme.series;
                colorCount += dataProcessor.getLegendLabels(chartType).length;
            }
        });

        return themeMap;
    }
};

module.exports = comboTypeMixer;
