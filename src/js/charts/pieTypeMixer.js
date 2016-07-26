/**
 * @fileoverview pieTypeMixer is mixer of pie type chart.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var renderUtil = require('../helpers/renderUtil');
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
     * @param {Array.<string>} [chartTypes] - chart types
     * @private
     */
    _addLegendComponent: function(chartTypes) {
        var legendOption = this.options.legend || {};

        if (legendOption.visible) {
            this.componentManager.register('legend', Legend, {
                seriesNames: chartTypes,
                chartType: this.chartType,
                userEvent: this.userEvent
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
            chartBackground: this.theme.chart.background,
            userEvent: this.userEvent
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
    },

    /**
     * Add custom event.
     * @param {Array.<object>} seriesComponents - series components
     * @private
     */
    _attachCustomEventForPieTypeChart: function(seriesComponents) {
        var clickEventName = renderUtil.makeCustomEventName('click', this.chartType, 'series');
        var moveEventName = renderUtil.makeCustomEventName('move', this.chartType, 'series');
        var customEvent = this.componentManager.get('customEvent');
        var tooltip = this.componentManager.get('tooltip');
        var eventMap = {};

        tui.util.forEachArray(seriesComponents, function(series) {
            eventMap[clickEventName] = series.onClickSeries;
            eventMap[moveEventName] = series.onMoveSeries;
            customEvent.on(eventMap, series);

            series.on({
                showTooltip: tooltip.onShow,
                hideTooltip: tooltip.onHide,
                showTooltipContainer: tooltip.onShowTooltipContainer,
                hideTooltipContainer: tooltip.onHideTooltipContainer
            }, tooltip);
        });
    }
};

module.exports = pieTypeMixer;
