/**
 * @fileoverview Pie chart.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var ChartBase = require('./chartBase'),
    chartConst = require('../const'),
    dataConverter = require('../helpers/dataConverter'),
    renderUtil = require('../helpers/renderUtil'),
    Legend = require('../legends/legend'),
    Tooltip = require('../tooltips/tooltip'),
    Series = require('../series/pieChartSeries');

var PieChart = tui.util.defineClass(ChartBase, /** @lends PieChart.prototype */ {
    /**
     * Column chart.
     * @constructs PieChart
     * @extends ChartBase
     * @param {array.<array>} userData chart data
     * @param {object} theme chart theme
     * @param {object} options chart options
     */
    init: function(userData, theme, options) {
        this.className = 'tui-pie-chart';

        options.tooltip = options.tooltip || {};

        if (!options.tooltip.position) {
            options.tooltip.position = chartConst.TOOLTIP_DEFAULT_POSITION_OPTION;
        }

        ChartBase.call(this, {
            userData: userData,
            theme: theme,
            options: options
        });

        this._addComponents(this.convertedData, theme.chart.background, options);
    },

    /**
     * Add components
     * @param {object} convertedData converted data
     * @param {object} chartBackground chart background
     * @param {object} options chart options
     * @private
     */
    _addComponents: function(convertedData, chartBackground, options) {
        if (convertedData.joinLegendLabels && (!options.series || !options.series.legendType)) {
            this.addComponent('legend', Legend, {
                joinLegendLabels: convertedData.joinLegendLabels,
                legendLabels: convertedData.legendLabels,
                chartType: options.chartType,
                userEvent: this.userEvent
            });
        }

        this.addComponent('tooltip', Tooltip, {
            values: convertedData.values,
            formattedValues: convertedData.formattedValues,
            labels: convertedData.labels,
            legendLabels: convertedData.legendLabels,
            chartType: options.chartType
        });

        this.addComponent('series', Series, {
            libType: options.libType,
            chartType: options.chartType,
            componentType: 'series',
            chartBackground: chartBackground,
            userEvent: this.userEvent,
            data: {
                values: convertedData.values,
                formattedValues: convertedData.formattedValues,
                legendLabels: convertedData.legendLabels,
                joinLegendLabels: convertedData.joinLegendLabels
            }
        });
    },

    /**
     * To make rendering data for pie chart.
     * @param {object} bounds chart bounds
     * * @param {object} bounds chart bounds
     * @return {object} data for rendering
     * @private
     * @override
     */
    _makeRenderingData: function(bounds) {
        return {
            tooltip: {
                seriesPosition: bounds.series.position
            },
            series: {
                chartWidth: bounds.chart.dimension.width
            }
        };
    },

    /**
     * Attach custom evnet.
     * @private
     * @override
     */
    _attachCustomEvent: function() {
        var tooltip = this.componentMap.tooltip,
            serieses = tui.util.filter(this.componentMap, function(component) {
                return component.componentType === 'series';
            });
        tui.util.forEach(serieses, function(series) {
            series.on('showTooltip', tooltip.onShow, tooltip);
            series.on('hideTooltip', tooltip.onHide, tooltip);

            if (series.onShowAnimation) {
                tooltip.on(renderUtil.makeCustomEventName('show', series.chartType, 'animation'), series.onShowAnimation, series);
                tooltip.on(renderUtil.makeCustomEventName('hide', series.chartType, 'animation'), series.onHideAnimation, series);
            }
        }, this);
    },
});

module.exports = PieChart;
