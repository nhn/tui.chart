/**
 * @fileoverview pieTypeMixer is mixer of pie type chart.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var Legend = require('../legends/legend');
var Tooltip = require('../tooltips/tooltip');
var PieChartSeries = require('../series/pieChartSeries');
var SimpleCustomEvent = require('../customEvents/simpleCustomEvent');

/**
 * pieTypeMixer is mixer of pie type chart.
 * @mixin
 */
var pieTypeMixer = {
    /**
     * Add legend component.
     * @param {Array.<string>} [seriesNames] - series names
     * @private
     */
    _addLegendComponent: function(seriesNames) {
        var legendOption = this.options.legend || {};

        if (legendOption.visible) {
            this.componentManager.register('legend', Legend, {
                seriesNames: seriesNames,
                chartType: this.chartType
            });
        }
    },

    /**
     * Add tooltip component.
     * @private
     */
    _addTooltipComponent: function() {
        this.componentManager.register('tooltip', Tooltip, this._makeTooltipData());
    },

    /**
     * Add series components.
     * @param {Array.<{name: string, additionalParams: ?object}>} seriesData - data for adding series component
     * @private
     */
    _addSeriesComponents: function(seriesData) {
        var componentManager = this.componentManager;
        var seriesBaseParams = {
            libType: this.options.libType,
            componentType: 'series',
            chartBackground: this.theme.chart.background
        };

        tui.util.forEach(seriesData, function(seriesDatum) {
            var seriesParams = tui.util.extend(seriesBaseParams, seriesDatum.additionalParams);

            componentManager.register(seriesDatum.name, PieChartSeries, seriesParams);
        });
    },

    /**
     * Add custom event component.
     * @private
     * @override
     */
    _addCustomEventComponent: function() {
        this.componentManager.register('customEvent', SimpleCustomEvent, {
            chartType: this.chartType
        });
    }
};

module.exports = pieTypeMixer;
