/**
 * @fileoverview Radial chart.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var ChartBase = require('./chartBase');
var Series = require('../components/series/lineChartSeries');

var RadialChart = tui.util.defineClass(ChartBase, /** @lends RadialChart.prototype */ {
    /**
     * className
     * @type {string}
     */
    className: 'tui-radial-chart',

    /**
     * Series class
     * @type {function}
     */
    Series: Series,

    /**
     * Radial chart.
     * @constructs RadialChart
     * @extends ChartBase
     * @param {Array.<Array>} rawData raw data
     * @param {object} theme chart theme
     * @param {object} options chart options
     */
    init: function(rawData, theme, options) {
        ChartBase.call(this, {
            rawData: rawData,
            theme: theme,
            options: options,
            hasAxes: true,
            isVertical: true
        });
    },

    /**
     * Add components
     * @private
     * @override
     */
    _addComponents: function() {
        this.componentManager.register('series', {
            libType: this.options.libType,
            chartType: this.options.chartType,
            componentType: 'series',
            classType: 'radialSeries',
            chartBackground: this.theme.chart.background
        });

        this.componentManager.register('tooltip', this._makeTooltipData('tooltip'));

        this.componentManager.register('plot', {
            componentType: 'plot',
            classType: 'radialPlot'
        });

        this.componentManager.register('mouseEventDetector', {
            chartType: this.chartType,
            isVertical: true,
            allowSelect: true,
            classType: 'areaTypeEventDetector'
        });

        this.componentManager.register('legend', tui.util.extend({
            seriesNames: this.seriesNames,
            chartType: this.chartType,
            classType: 'legend'
        }));

        this.componentManager.register('chartExportMenu', {
            chartTitle: this.options.chart && this.options.chart.title ? this.options.chart.title.text : 'chart',
            classType: 'chartExportMenu'
        });
    },

    /**
     * Add data ratios.
     * @private
     * @override
     */
    _addDataRatios: function(limitMap) {
        this.dataProcessor.addDataRatios(limitMap[this.chartType], null, this.chartType);
    },

    /**
     * Get scale option.
     * @returns {{xAxis: ?{valueType:string}, yAxis: ?(boolean|{valueType:string})}}
     * @private
     * @override
     */
    _getScaleOption: function() {
        return {
            yAxis: {}
        };
    }
});

tui.util.extend(RadialChart.prototype);

module.exports = RadialChart;
