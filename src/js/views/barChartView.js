/**
 * @fileoverview BarChartView render axis area, plot area and series area of bar chart.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var AxisChartView = require('./axisChartView.js'),
    BarChartModel = require('../models/barChartModel.js'),
    SeriesView = require('./seriesView.js');

var BarChartView = ne.util.defineClass(AxisChartView, /** @lends BarChartView.prototype */ {
    /**
     * BarChartView render axis area, plot area and series area of bar chart.
     * @constructs BarChartView
     * @extends AxisChartView
     * @param {object} data bar chart data
     * @param {object} options bar chart options
     */
    init: function(data, options) {
        var theme = options.theme;

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
         * series view
         * @type {object}
         */
        this.seriesView = new SeriesView(this.model.series, {
            chartType: options.chartType
        }, theme.series);

        AxisChartView.call(this, data, options);
    }
});

module.exports = BarChartView;