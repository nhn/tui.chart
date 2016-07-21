/**
 * @fileoverview Treemap chart is graphical representation of hierarchical data by using rectangles.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var ChartBase = require('./chartBase');
var TreemapChartSeries = require('../series/treemapChartSeries');
var Tooltip = require('../tooltips/tooltip');
var BoundsTypeCustomEvent = require('../customEvents/boundsTypeCustomEvent');

var TreemapChart = tui.util.defineClass(ChartBase, /** @lends TreemapChart.prototype */ {
    /**
     * className
     * @type {string}
     */
    className: 'tui-treemap-chart',
    /**
     * Treemap chart is graphical representation of hierarchical data by using rectangles.
     * @constructs TreemapChart
     * @extends ChartBase
     * @param {Array.<Array>} rawData raw data
     * @param {object} theme chart theme
     * @param {object} options chart options
     */
    init: function(rawData, theme, options) {
        options.series = options.series || {};
        options.tooltip = options.tooltip || {};
        options.tooltip.grouped = false;

        if (tui.util.isUndefined(options.series.zoomable)) {
            options.series.zoomable = true;
        }

        ChartBase.call(this, {
            rawData: rawData,
            theme: theme,
            options: options,
            hasAxes: false,
            isVertical: true
        });

        this._addComponents(options.chartType);
    },

    /**
     * Add components.
     * @private
     */
    _addComponents: function() {
        this.componentManager.register('series', TreemapChartSeries, {
            chartType: this.chartType,
            userEvent: this.userEvent
        });

        this.componentManager.register('tooltip', Tooltip, tui.util.extend({
            labelTheme: tui.util.pick(this.theme, 'series', 'label')
        }, this._makeTooltipData()));

        this.componentManager.register('customEvent', BoundsTypeCustomEvent, {
            chartType: this.chartType,
            isVertical: this.isVertical
        });
    },

    /**
     * Attach custom event.
     * @private
     * @override
     */
    _attachCustomEvent: function() {
        var series = this.componentManager.get('series');
        var customEvent = this.componentManager.get('customEvent');
        var tooltip = this.componentManager.get('tooltip');

        ChartBase.prototype._attachCustomEvent.call(this);

        customEvent.on('showTooltip', tooltip.onShow, tooltip);
        customEvent.on('hideTooltip', tooltip.onHide, tooltip);

        tooltip.on('showTreemapAnimation', series.onShowAnimation, series);
        tooltip.on('hideTreemapAnimation', series.onHideAnimation, series);

        series.on('afterZoom', customEvent.onAfterZoom, customEvent);
    },

    /**
     * On zoom.
     * @param {number} index - index of target seriesItem
     */
    onZoom: function(index) {
        this._renderComponents({
            'series': {
                index: index
            }
        }, 'zoom');
        this._sendSeriesData();
    }
});

module.exports = TreemapChart;
