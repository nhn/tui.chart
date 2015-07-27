/**
 * @fileoverview BarChartView render axis area, plot area and series area of bar chart.
 * @author NHN Ent.
 *         FE Development Team <jiung.kang@nhnent.com>
 */

'use strict';

var chartConst = require('../const.js'),
    ChartView = require('./chartView.js'),
    BarChartModel = require('../models/barChartModel.js'),
    PlotView = require('./plotView.js'),
    AxisView = require('./axisView.js'),
    SeriesView = require('./seriesView.js'),
    LegendView = require('./legendView.js'),
    PopupView = require('./popupView.js');

var POPUP_PREFIX = 'ne-chart-popup-',
    CHART_PADDING = 10,
    HIDDEN_WIDTH = 1;

/**
 * @classdesc BarChartView render axis area, plot area and series area of bar chart.
 * @class
 * @augments ChartView
 */
var BarChartView = ne.util.defineClass(ChartView, {
    /**
     * constructor
     * @param {object} data bar chart data
     * @param {options} options bar chart options
     */
    init: function(data, options) {
        var theme = options.theme;

        this.options = options.chart;
        this.options.barType = options.barType;

        this.theme = theme;

        /**
         * Bar chart className
         * @type {string}
         */
        this.className = 'ne-bar-chart';

        /**
         * Bar chart model
         * @type {object}
         */
        this.model = new BarChartModel(data, options);

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
         * series view
         * @type {object}
         */
        this.seriesView = new SeriesView(this.model.series, {
            chartType: options.chartType,
            barType: options.barType
        }, theme.series);

        /**
         * legend view
         * @type {object}
         */
        this.legendView = new LegendView(this.model.legend, theme.legend);

        /**
         * legend view
         * @type {object}
         */
        this.popupView = new PopupView(this.model.popup);

        options = options.chart || {};
        ChartView.call(this, data, options);
    },

    /**
     * Bar chart renderer
     * @returns {HTMLElement} bar chart element
     */
    render: function() {
        var popupPrefix = POPUP_PREFIX + (new Date()).getTime() + '-',
            isColumn = this.options.barType === chartConst.BAR_TYPE_COLUMN,
            bounds = this.getViewsBound(),
            elTitle = this.renderTitleArea(),
            elPlot = this.plotView.render(bounds.plot),
            elVAxis = this.vAxisView.render(bounds.vAxis),
            elHAxis = this.hAxisView.render(bounds.hAxis),
            elSeries = this.seriesView.render(bounds.series, popupPrefix, isColumn),
            elLegend = this.legendView.render(bounds.legend),
            elPopup = this.popupView.render(bounds.popup, popupPrefix);

        this.append(elTitle);
        this.append(elPlot);
        this.append(elVAxis);
        this.append(elHAxis);
        this.append(elSeries);
        this.append(elLegend);
        this.append(elPopup);
        this.renderDimension(this.dimension);
        this.renderBackground(this.options.background);
        this.renderChartFont(this.options.fontFamily);

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
                popup: {
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
        var popupView = this.popupView;
        this.seriesView.on('showPopup', popupView.onShow, popupView);
        this.seriesView.on('hidePopup', popupView.onHide, popupView);
    }
});

module.exports = BarChartView;