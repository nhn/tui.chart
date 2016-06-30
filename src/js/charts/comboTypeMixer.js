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
     * Make options map
     * @param {object} chartTypes chart types
     * @returns {object} options map
     * @private
     */
    _makeOptionsMap: function(chartTypes) {
        var seriesOptions = this.options.series || {};
        var optionsMap = {};

        tui.util.forEachArray(chartTypes, function(chartType) {
            optionsMap[chartType] = seriesOptions[chartType] || seriesOptions;
        });

        return optionsMap;
    },

    /**
     * Make theme map
     * @param {object} chartTypes chart types
     * @returns {object} theme map
     * @private
     */
    _makeThemeMap: function(chartTypes) {
        var dataProcessor = this.dataProcessor;
        var theme = this.theme;
        var themeMap = {};
        var colorCount = 0;

        tui.util.forEachArray(chartTypes, function(chartType) {
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

module.exports = comboTypeMixer;
