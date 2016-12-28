/**
 * @fileoverview Pie and Donut Combo chart.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var ChartBase = require('./chartBase');
var rawDataHandler = require('../models/data/rawDataHandler');
var pieTypeMixer = require('./pieTypeMixer');
var comboTypeMixer = require('./comboTypeMixer');
var predicate = require('../helpers/predicate');
var arrayUtil = require('../helpers/arrayUtil');

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
        this.seriesNames = tui.util.keys(rawData.series).sort();

        /**
         * chart types
         * @type {Object}
         */
        this.chartTypes = ['pie', 'pie'];

        ChartBase.call(this, {
            rawData: rawData,
            theme: theme,
            options: options,
            isVertical: true
        });
    },

    /**
     * Make data for adding series component.
     * @returns {Array.<object>}
     * @private
     */
    _makeDataForAddingSeriesComponent: function() {
        var seriesNames = this.seriesNames;
        var optionsMap = this._makeOptionsMap(seriesNames);
        var dataProcessor = this.dataProcessor;
        var isShowOuterLabel = arrayUtil.any(optionsMap, predicate.isShowOuterLabel);
        var seriesData = tui.util.map(seriesNames, function(seriesName) {
            var chartType = dataProcessor.findChartType(seriesName);
            var additionalParams = {
                chartType: chartType,
                seriesName: seriesName,
                options: optionsMap[seriesName],
                isShowOuterLabel: isShowOuterLabel,
                isCombo: true
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
        this._addLegendComponent(this.seriesNames);
        this._addTooltipComponent({
            labelFormatter: this.labelFormatter
        });
        this._addSeriesComponents(this._makeDataForAddingSeriesComponent());
        this._addMouseEventDetectorComponent();
    },

    /**
     * Add data ratios.
     * @private
     * @override
     */
    _addDataRatios: function() {
        var self = this;
        var seriesNames = this.seriesNames || [this.chartType];

        tui.util.forEachArray(seriesNames, function(chartType) {
            self.dataProcessor.addDataRatiosOfPieChart(chartType);
        });
    },

    /**
     * On change selected legend.
     * @param {Array.<?boolean> | {line: ?Array.<boolean>, column: ?Array.<boolean>}} checkedLegends checked legends
     * @override
     */
    onChangeCheckedLegends: function(checkedLegends) {
        var originalRawData = this.dataProcessor.getOriginalRawData();
        var rawData = rawDataHandler.filterCheckedRawData(originalRawData, checkedLegends);

        ChartBase.prototype.onChangeCheckedLegends.call(this, checkedLegends, rawData, {
            seriesNames: this.seriesNames
        });
    }
});

tui.util.extend(PieDonutComboChart.prototype, pieTypeMixer, comboTypeMixer);

module.exports = PieDonutComboChart;
