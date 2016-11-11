/**
 * @fileoverview pieTypeMixer is mixer of pie type chart.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

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
            this.componentManager.register('legend', {
                seriesNames: seriesNames,
                chartType: this.chartType,
                classType: 'legend'
            });
        }
    },

    /**
     * Add tooltip component.
     * @private
     */
    _addTooltipComponent: function() {
        this.componentManager.register('tooltip', this._makeTooltipData('tooltip'));
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
            chartBackground: this.theme.chart.background,
            classType: 'pieSeries'
        };

        tui.util.forEach(seriesData, function(seriesDatum) {
            var seriesParams = tui.util.extend(seriesBaseParams, seriesDatum.additionalParams);

            componentManager.register(seriesDatum.name, seriesParams);
        });
    },

    /**
     * Add mouse event detector component.
     * @private
     * @override
     */
    _addMouseEventDetectorComponent: function() {
        this.componentManager.register('mouseEventDetector', {
            chartType: this.chartType,
            classType: 'simpleEventDetector'
        });
    }
};

module.exports = pieTypeMixer;
