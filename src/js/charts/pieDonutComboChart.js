/**
 * @fileoverview Pie and Donut Combo chart.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var predicate = require('../helpers/predicate');
var ChartBase = require('./chartBase');
var pieTypeMixer = require('./pieTypeMixer');
var comboTypeMixer = require('./comboTypeMixer');

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
        this.chartTypes = this._pickChartTypes(rawData.series);

        ChartBase.call(this, {
            rawData: rawData,
            theme: theme,
            options: options,
            isVertical: true,
            seriesChartTypes: this.chartTypes
        });

        this._addComponents();
    },

    /**
     * Pick chart types from rawData.series
     * @param {object} rawSeriesData rawData.series
     * @returns {object} chart types map
     * @private
     */
    _pickChartTypes: function(rawSeriesData) {
        return tui.util.keys(rawSeriesData).sort(function(a, b) {
            return b - a;
        });
    },

    /**
     * Make options map for pie donut combo chart.
     * @returns {object}
     * @private
     */
    _makeOptionsMapForPieDonutCombo: function() {
        var optionsMap = this._makeOptionsMap(this.chartTypes);
        var donutRadiusRatio;

        optionsMap.pie = tui.util.extend({
            radiusRatio: 0.7
        }, optionsMap.pie);
        optionsMap.donut = tui.util.extend({
            holeRatio: 0.7
        }, optionsMap.donut);

        donutRadiusRatio = optionsMap.donut.radiusRatio;
        optionsMap.pie.radiusRatio = Math.min(optionsMap.pie.radiusRatio, optionsMap.donut.holeRatio);

        if (optionsMap.pie.radiusRatio && donutRadiusRatio) {
            optionsMap.pie.radiusRatio *= donutRadiusRatio;
        }

        return optionsMap;
    },

    /**
     * Make data for adding series component.
     * @returns {Array.<object>}
     * @private
     */
    _makeDataForAddingSeriesComponent: function() {
        var chartTypes = this.chartTypes;
        var optionsMap = this._makeOptionsMapForPieDonutCombo();
        var themeMap = this._makeThemeMap(chartTypes);
        var seriesData = tui.util.map(chartTypes, function(chartType) {
            var additionalParams = {
                chartType: chartType,
                options: optionsMap[chartType],
                isInner: predicate.isPieChart(chartType),
                isCombo: true,
                theme: themeMap[chartType]
            };

            return {
                name: chartType + 'Series',
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
        var pieSeries = this.componentManager.get('pieSeries');
        var donutSeries = this.componentManager.get('donutSeries');

        ChartBase.prototype._attachCustomEvent.call(this);
        this._attachCustomEventForPieTypeChart([pieSeries, donutSeries]);
    },

    /**
     * On change selected legend.
     * @param {Array.<?boolean> | {line: ?Array.<boolean>, column: ?Array.<boolean>}} checkedLegends checked legends
     * @override
     */
    onChangeCheckedLegends: function(checkedLegends) {
        var rawData = this._filterRawData(this.rawData, checkedLegends);

        this.chartTypes = this._pickChartTypes(rawData.series);

        ChartBase.prototype.onChangeCheckedLegends.call(this, checkedLegends, rawData, {
            seriesChartTypes: this.chartTypes
        });
    }
});

pieTypeMixer.mixin(PieDonutComboChart);
comboTypeMixer.mixin(PieDonutComboChart);

module.exports = PieDonutComboChart;
