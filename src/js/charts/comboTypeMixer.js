/**
 * @fileoverview comboTypeMixer is mixer of combo type chart.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

/**
 * comboTypeMixer is mixer of combo type chart.
 * @mixin
 * @private */
var comboTypeMixer = {
    /**
     * Get base series options.
     * @param {object.<string, object>} seriesOptions - series options
     * @param {Array.<string>} seriesTypes - seriens names
     * @returns {object}
     * @private
     */
    _getBaseSeriesOptions: function(seriesOptions, seriesTypes) {
        var baseSeriesOptions = tui.util.extend({}, seriesOptions);

        tui.util.forEachArray(seriesTypes, function(seriesType) {
            delete baseSeriesOptions[seriesType];
        });

        return baseSeriesOptions;
    },

    /**
     * Make options map
     * @param {Array.<string>} seriesTypes - series types
     * @returns {object}
     * @private
     */
    _makeOptionsMap: function(seriesTypes) {
        var seriesOptions = this.options.series;
        var baseSeriesOptions = this._getBaseSeriesOptions(seriesOptions, seriesTypes);
        var optionsMap = {};

        tui.util.forEachArray(seriesTypes, function(seriesType) {
            optionsMap[seriesType] = tui.util.extend({}, baseSeriesOptions, seriesOptions[seriesType]);
        });

        return optionsMap;
    }
};

module.exports = comboTypeMixer;
