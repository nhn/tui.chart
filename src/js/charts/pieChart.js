/**
 * @fileoverview Pie chart.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var ChartBase = require('./chartBase'),
    Legend = require('../legends/legend'),
    Tooltip = require('../tooltips/tooltip'),
    Series = require('../series/pieChartSeries');

var PieChart = ne.util.defineClass(ChartBase, /** @lends PieChart.prototype */ {
    /**
     * Column chart.
     * @constructs PieChart
     * @extends ChartBase
     * @param {array.<array>} userData chart data
     * @param {object} theme chart theme
     * @param {object} options chart options
     */
    init: function(userData, theme, options) {
        var baseData = this.makeBaseData(userData, theme, options),
            convertedData = baseData.convertedData,
            bounds = baseData.bounds;

        this.className = 'ne-pie-chart';

        options.tooltip = options.tooltip || {};

        if (!options.tooltip.position) {
            options.tooltip.position = 'center middle';
        }

        ChartBase.call(this, {
            bounds: bounds,
            theme: theme,
            options: options
        });

        this._addComponents(convertedData, theme.chart.background, bounds, options);
    },

    /**
     * Add components
     * @param {object} convertedData converted data
     * @param {object} chartBackground chart background
     * @param {array.<object>} bounds bounds
     * @param {object} options chart options
     * @private
     */
    _addComponents: function(convertedData, chartBackground, bounds, options) {
        if (convertedData.joinLegendLabels && (!options.series || !options.series.legendType)) {
            this.addComponent('legend', Legend, {
                joinLegendLabels: convertedData.joinLegendLabels,
                legendLabels: convertedData.legendLabels,
                chartType: options.chartType
            });
        }

        this.addComponent('tooltip', Tooltip, {
            chartType: options.chartType,
            values: convertedData.formattedValues,
            labels: convertedData.labels,
            legendLabels: convertedData.legendLabels,
            chartId: this.chartId
        });

        this.addComponent('series', Series, {
            libType: options.libType,
            chartType: options.chartType,
            chartBackground: chartBackground,
            data: {
                values: convertedData.values,
                formattedValues: convertedData.formattedValues,
                legendLabels: convertedData.legendLabels,
                chartWidth: bounds.chart.dimension.width
            }
        });
    }
});

module.exports = PieChart;
