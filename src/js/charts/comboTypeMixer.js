/**
 * @fileoverview comboTypeMixer is mixer of combo type chart.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

/**
 * comboTypeMixer is mixer of combo type chart.
 * @mixin
 */
var comboTypeMixer = {
    /**
     * Get base series options.
     * @param {object.<string, object>} seriesOptions - series options
     * @param {Array.<string>} seriesNames - seriens names
     * @returns {object}
     * @private
     */
    _getBaseSeriesOptions: function(seriesOptions, seriesNames) {
        var baseSeriesOptions = tui.util.extend({}, seriesOptions);

        tui.util.forEachArray(seriesNames, function(seriesName) {
            delete baseSeriesOptions[seriesName];
        });

        return baseSeriesOptions;
    },

    /**
     * Make options map
     * @param {Array.<string>} seriesNames - series names
     * @returns {object}
     * @private
     */
    _makeOptionsMap: function(seriesNames) {
        var seriesOptions = this.options.series;
        var baseSeriesOptions = this._getBaseSeriesOptions(seriesOptions, seriesNames);
        var optionsMap = {};

        tui.util.forEachArray(seriesNames, function(chartType) {
            optionsMap[chartType] = tui.util.extend({}, baseSeriesOptions, seriesOptions[chartType]);
        });

        return optionsMap;
    }
};

module.exports = comboTypeMixer;
