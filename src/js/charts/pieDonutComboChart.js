/**
 * @fileoverview Pie and Donut Combo chart.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var ChartBase = require('./chartBase');
var pieTypeMixer = require('./pieTypeMixer');
var comboTypeMixer = require('./comboTypeMixer');
var predicate = require('../helpers/predicate');

var PieDonutComboChart = tui.util.defineClass(ChartBase, /** @lends PieDonutComboChart.prototype */ {
    /**
     * className
     * @type {string}
     */
    className: 'tui-combo-chart',

    /**
     * Pie and Donut Combo chart.
     * @constructs PieDonutComboChart
     * @extends ChartBase
     * @param {Array.<Array>} rawData raw data
     * @param {object} theme chart theme
     * @param {object} options chart options
     */
    init: function(rawData, theme, options) {
        /**
         * chart types.
         * @type {Array.<string>}
         */
        this.chartTypes = tui.util.keys(rawData.series).sort();

        ChartBase.call(this, {
            rawData: rawData,
            theme: theme,
            options: options,
            isVertical: true,
            seriesNames: this.chartTypes
        });

        this._addComponents();
    },

    /**
     * Make data for adding series component.
     * @returns {Array.<object>}
     * @private
     */
    _makeDataForAddingSeriesComponent: function() {
        var seriesNames = this.chartTypes;
        var optionsMap = this._makeOptionsMap(this.chartTypes);
        var themeMap = this._makeThemeMap(seriesNames);
        var dataProcessor = this.dataProcessor;
        var isShowOuterLabel = tui.util.any(optionsMap, predicate.isShowOuterLabel);
        var seriesData = tui.util.map(seriesNames, function(seriesName) {
            var chartType = dataProcessor.findChartType(seriesName);
            var additionalParams = {
                chartType: chartType,
                seriesName: seriesName,
                options: optionsMap[seriesName],
                isShowOuterLabel: isShowOuterLabel,
                isCombo: true,
                theme: themeMap[seriesName]
            };

            return {
                name: seriesName + 'Series',
                additionalParams: additionalParams
            };
        });

        return seriesData;
    },

    /**
     * Add components
     * @private
     */
    _addComponents: function() {
        this._addLegendComponent(this.chartTypes);
        this._addTooltipComponent();
        this._addSeriesComponents(this._makeDataForAddingSeriesComponent());
        this._addCustomEventComponent();
    },

    /**
     * Add data ratios.
     * @private
     * @override
     */
    _addDataRatios: function() {
        var self = this;
        var chartTypes = this.chartTypes || [this.chartType];

        tui.util.forEachArray(chartTypes, function(chartType) {
            self.dataProcessor.addDataRatiosOfPieChart(chartType);
        });
    },

    /**
     * Add custom event.
     * @private
     * @override
     */
    _attachCustomEvent: function() {
        var componentManager = this.componentManager;
        var serieses;

        ChartBase.prototype._attachCustomEvent.call(this);

        serieses = tui.util.map(this.chartTypes, function(seriesName) {
            return componentManager.get(seriesName + 'Series');
        });
        this._attachCustomEventForPieTypeChart(serieses);
    },

    /**
     * On change selected legend.
     * @param {Array.<?boolean> | {line: ?Array.<boolean>, column: ?Array.<boolean>}} checkedLegends checked legends
     * @override
     */
    onChangeCheckedLegends: function(checkedLegends) {
        var rawData = this._filterCheckedRawData(this.rawData, checkedLegends);

        this.chartTypes = this._pickChartTypes(rawData.series);

        ChartBase.prototype.onChangeCheckedLegends.call(this, checkedLegends, rawData, {
            seriesNames: this.chartTypes
        });
    }
});

pieTypeMixer.mixin(PieDonutComboChart);
comboTypeMixer.mixin(PieDonutComboChart);

module.exports = PieDonutComboChart;
