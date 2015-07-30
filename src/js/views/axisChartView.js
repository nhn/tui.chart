/**
 * @fileoverview AxisChartView render axis area, plot area and series area of axis type chart.
 * @author NHN Ent.
 *         FE Development Team <jiung.kang@nhnent.com>
 */

'use strict';

var ChartView = require('./chartView.js'),
    PlotView = require('./plotView.js'),
    AxisView = require('./axisView.js'),
    LegendView = require('./legendView.js'),
    TooltipView = require('./tooltipView.js');


var AxisChartView,
    TOOLTIP_PREFIX = 'ne-chart-tooltip-',
    CHART_PADDING = 10,
    HIDDEN_WIDTH = 1;

/**
 * @classdesc BarChartView render axis area, plot area and series area of axis type chart.
 * @class
 * @augments ChartView
 */
AxisChartView = ne.util.defineClass(ChartView, {
    /**
     * constructor
     * @param {object} data bar chart data
     * @param {options} options bar chart options
     */
    init: function(data, options) {
        var theme = options.theme;

        this.theme = theme;

        /**
         * Plot view
         * @type {object}
         */
        this.plotView = new PlotView(this.model.plot, theme.plot);

        /**
         * Vertical axis view
         * @type {object}
         */
        this.vAxisView = new AxisView(this.model.vAxis, theme.vAxis);

        /**
         * Horizontal axis view
         * @type {object}
         */
        this.hAxisView = new AxisView(this.model.hAxis, theme.hAxis);

        /**
         * legend view
         * @type {object}
         */
        this.legendView = new LegendView(this.model.legend, theme.legend);

        /**
         * legend view
         * @type {object}
         */
        this.tooltipView = new TooltipView(this.model.tooltip);

        options = options.chart || {};

        this.options = options;
        ChartView.call(this, data, options, theme.chart);
    },

    /**
     * Bar chart renderer
     * @returns {HTMLElement} bar chart element
     */
    render: function() {
        var tooltipPrefix = TOOLTIP_PREFIX + (new Date()).getTime() + '-',
            bounds = this.getViewsBound(),
            elTitle = this.renderTitleArea(),
            elPlot = this.plotView.render(bounds.plot),
            elVAxis = this.vAxisView.render(bounds.vAxis),
            elHAxis = this.hAxisView.render(bounds.hAxis),
            elSeries = this.seriesView.render(bounds.series, tooltipPrefix, this.model.isVertical),
            elLegend = this.legendView.render(bounds.legend),
            elTooltip = this.tooltipView.render(bounds.tooltip, tooltipPrefix);
        this.appends([elTitle, elPlot, elVAxis, elHAxis, elSeries, elLegend, elTooltip]);
        this.renderDimension(this.dimension);
        this.renderBackground(this.theme.background);
        this.renderChartFont(this.theme.fontFamily);

        this._attachCustomEvent();

        return this.el;
    },

    /**
     * Get views bound information.
     * @returns {{
     *   plot: {
     *     dimension: {width: number, height: number},
     *     position: {top: number, right: number}
     *   },
     *   vAxis: {
     *     dimension: {width: (number), height: number},
     *     position: {top: number}
     *   },
     *   hAxis: {
     *     dimension: {width: number, height: (number)},
     *     position: {right: number}
     *   },
     *   series: {
     *     dimension: {width: number, height: number},
     *     position: {top: number, right: number}
     *   },
     *   legend: {
     *     position: {top: number}
     *   }
     * }} bounds
     */
    getViewsBound: function() {
        var titleHeight = this.getRenderedTitleHeight(),
            vAxisWidth = this.vAxisView.getVAxisAreaWidth(),
            hAxisHeight = this.hAxisView.getHAxisAreaHeight(),
            legendWidth = this.legendView.getLegendAreaWidth(),
            plotWidth = this.dimension.width - (CHART_PADDING * 2) - vAxisWidth - legendWidth,
            plotHeight = this.dimension.height - (CHART_PADDING * 2) - titleHeight - hAxisHeight,
            top = titleHeight + CHART_PADDING,
            right = legendWidth + CHART_PADDING,
            bounds = {
                plot: {
                    dimension: {width: plotWidth, height: plotHeight},
                    position: {top: top, right: right}
                },
                vAxis: {
                    dimension: {width: vAxisWidth, height: plotHeight},
                    position: {top: top}
                },
                hAxis: {
                    dimension: {width: plotWidth, height: hAxisHeight},
                    position: {top: top + plotHeight - HIDDEN_WIDTH, right: right}
                },
                series: {
                    dimension: {width: plotWidth, height: plotHeight},
                    position: {top: top, right: right}
                },
                legend: {
                    position: {top: titleHeight, right: CHART_PADDING}
                },
                tooltip: {
                    dimension: {width: plotWidth, height: plotHeight},
                    position: {top: top, left: vAxisWidth + CHART_PADDING}
                }
            };
        return bounds;
    },

    /**
     * Attach custom event
     * @private
     */
    _attachCustomEvent: function() {
        var tooltipView = this.tooltipView,
            seriesView = this.seriesView;
        seriesView.on('showTooltip', tooltipView.onShow, tooltipView);
        seriesView.on('hideTooltip', tooltipView.onHide, tooltipView);
    }
});

module.exports = AxisChartView;