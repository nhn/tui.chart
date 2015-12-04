/**
 * @fileoverview Pie chart.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var ChartBase = require('./chartBase'),
    chartConst = require('../const'),
    predicate = require('../helpers/predicate'),
    renderUtil = require('../helpers/renderUtil'),
    Legend = require('../legends/legend'),
    Tooltip = require('../tooltips/tooltip'),
    Series = require('../series/pieChartSeries');

var PieChart = tui.util.defineClass(ChartBase, /** @lends PieChart.prototype */ {
    /**
     * Column chart.
     * @constructs PieChart
     * @extends ChartBase
     * @param {array.<array>} rawData raw data
     * @param {object} theme chart theme
     * @param {object} options chart options
     */
    init: function(rawData, theme, options) {
        this.className = 'tui-pie-chart';

        options.tooltip = options.tooltip || {};

        if (!options.tooltip.align) {
            options.tooltip.align = chartConst.TOOLTIP_DEFAULT_ALIGN_OPTION;
        }

        ChartBase.call(this, {
            rawData: rawData,
            theme: theme,
            options: options
        });

        this._addComponents(this.processedData, theme.chart.background, options);
    },

    /**
     * Add components
     * @param {object} processedData processed data
     * @param {object} chartBackground chart background
     * @param {object} options chart options
     * @private
     */
    _addComponents: function(processedData, chartBackground, options) {
        var legendAlign, isPieLegendType;
        options.legend = options.legend || {};
        legendAlign = options.legend && options.legend.align;
        isPieLegendType = predicate.isPieLegendAlign(legendAlign);
        if (processedData.joinLegendLabels && !isPieLegendType && !options.legend.hidden) {
            this._addComponent('legend', Legend, {
                joinLegendLabels: processedData.joinLegendLabels,
                legendLabels: processedData.legendLabels,
                chartType: options.chartType,
                userEvent: this.userEvent
            });
        }

        this._addComponent('tooltip', Tooltip, this._makeTooltipData(processedData, options.chartType));

        this._addComponent('series', Series, {
            libType: options.libType,
            chartType: options.chartType,
            componentType: 'series',
            chartBackground: chartBackground,
            userEvent: this.userEvent,
            legendAlign: isPieLegendType && !options.legend.hidden ? legendAlign : null,
            data: this._makeSeriesData(processedData)
        });
    },

    /**
     * Make rendering data for pie chart.
     * @param {object} bounds chart bounds
     * @return {object} data for rendering
     * @private
     * @override
     */
    _makeRenderingData: function(bounds) {
        return {
            tooltip: {
                seriesPosition: bounds.series.position,
                chartDimension: bounds.chart.dimension
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
        var tooltip, serieses;

        ChartBase.prototype._attachCustomEvent.call(this);

        tooltip = this.componentMap.tooltip;
        serieses = tui.util.filter(this.componentMap, function (component) {
            return component.componentType === 'series';
        });
        tui.util.forEach(serieses, function (series) {
            series.on('showTooltip', tooltip.onShow, tooltip);
            series.on('hideTooltip', tooltip.onHide, tooltip);

            if (series.onShowAnimation) {
                tooltip.on(renderUtil.makeCustomEventName('show', series.chartType, 'animation'), series.onShowAnimation, series);
                tooltip.on(renderUtil.makeCustomEventName('hide', series.chartType, 'animation'), series.onHideAnimation, series);
            }
        }, this);
    }
});

module.exports = PieChart;
