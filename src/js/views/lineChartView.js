/**
 * @fileoverview LineChartView render axis area, plot area and series area of line chart.
 * @author NHN Ent.
 *         FE Development Team <jiung.kang@nhnent.com>
 */

'use strict';

var AxisChartView = require('./axisChartView.js'),
    chartFactory = require('../factories/chartFactory.js'),
    LineChartModel = require('../models/lineChartModel.js'),
    SeriesView = require('./seriesView.js');


var LineChartView;

/**
 * @classdesc LineChartView render axis area, plot area and series area of line chart.
 * @class
 * @augments ChartView
 */
LineChartView = ne.util.defineClass(AxisChartView, {
    /**
     * constructor
     * @param {object} data bar chart data
     * @param {options} options bar chart options
     */
    init: function(data, options) {
        var theme = options.theme;

        /**
         * Bar chart className
         * @type {string}
         */
        this.className = 'ne-line-chart';

        /**
         * Bar chart model
         * @type {object}
         */
        this.model = new LineChartModel(data, options);

        /**
         * series view
         * @type {object}
         */
        this.seriesView = new SeriesView(this.model.series, {
            chartType: options.chartType
        }, theme.series);

        AxisChartView.call(this, data, options);
    },

    /**
     * Attach custom event
     * @private
     */
    _attachCustomEvent: function() {
        var popupView = this.popupView,
            seriesView = this.seriesView;
        popupView.on('showDot', seriesView.onShowDot, seriesView);
        popupView.on('hideDot', seriesView.onHideDot, seriesView);
        AxisChartView.prototype._attachCustomEvent.apply(this);
    }
});

module.exports = LineChartView;