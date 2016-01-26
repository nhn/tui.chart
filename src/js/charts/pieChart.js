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
    Series = require('../series/pieChartSeries'),
    pieChartCustomEvent = require('../customEvents/pieChartCustomEvent');

var PieChart = tui.util.defineClass(ChartBase, /** @lends PieChart.prototype */ {
    /**
     * Column chart.
     * @constructs PieChart
     * @extends ChartBase
     * @param {Array.<Array>} rawData raw data
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

        this._addComponents(theme.chart.background, options);
    },

    /**
     * Add components
     * @param {object} chartBackground chart background
     * @param {object} options chart options
     * @private
     */
    _addComponents: function(chartBackground, options) {
        var legendAlign, isPieLegendType;
        options.legend = options.legend || {};
        legendAlign = options.legend && options.legend.align;
        isPieLegendType = predicate.isPieLegendAlign(legendAlign);

        if (!isPieLegendType && !options.legend.hidden) {
            this.component.register('legend', Legend, {
                chartType: options.chartType,
                userEvent: this.userEvent
            });
        }

        this.component.register('tooltip', Tooltip, this._makeTooltipData());

        this.component.register('pieSeries', Series, {
            libType: options.libType,
            chartType: options.chartType,
            componentType: 'series',
            chartBackground: chartBackground,
            userEvent: this.userEvent,
            legendAlign: isPieLegendType && !options.legend.hidden ? legendAlign : null
        });
    },

    /**
     * Add custom event component.
     * @private
     */
    _addCustomEventComponent: function() {
        this.component.register('customEvent', pieChartCustomEvent);
    },

    /**
     * Update percent values.
     * @private
     * @override
     */
    _updatePercentValues: function() {
        this.dataProcessor.registerPieChartPercentValues(this.options.chartType);
    },

    /**
     * Attach custom evnet.
     * @private
     * @override
     */
    _attachCustomEvent: function() {
        var customEvent, tooltip, serieses;

        ChartBase.prototype._attachCustomEvent.call(this);

        customEvent = this.component.get('customEvent');
        tooltip = this.component.get('tooltip');
        serieses = this.component.where({componentType: 'series'});

        tui.util.forEach(serieses, function (series) {
            series.on('showTooltip', tooltip.onShow, tooltip);
            series.on('hideTooltip', tooltip.onHide, tooltip);

            series.on('showTooltipContainer', tooltip.onShowTooltipContainer, tooltip);
            series.on('hideTooltipContainer', tooltip.onHideTooltipContainer, tooltip);

            customEvent.on(renderUtil.makeCustomEventName('click', series.chartType, 'series'), series.onClickSeries, series);
            customEvent.on(renderUtil.makeCustomEventName('move', series.chartType, 'series'), series.onMoveSeries, series);
        }, this);
    }
});

module.exports = PieChart;
