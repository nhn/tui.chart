/**
 * @fileoverview LineChartView render axis area, plot area and series area of line chart.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var AxisChartView = require('./axisChartView.js'),
    LineChartModel = require('../models/lineChartModel.js'),
    SeriesView = require('./seriesView.js');

var LineChartView = ne.util.defineClass(AxisChartView, /** @lends LineChartView.prototype */ {
    /**
     * LineChartView render axis area, plot area and series area of line chart.
     * @constructs LineChartView
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
        this.className = 'ne-line-chart';

        /**
         * Bar chart model
         * @type {object}
         */
        this.model = new LineChartModel(data, options);

        /**
         * Series view
         * @type {object}
         */
        this.seriesView = new SeriesView(this.model.series, {
            chartType: options.chartType,
            libType: options.libType
        }, theme.series);

        AxisChartView.call(this, data, options);
    },

    /**
     * Attach custom event
     * @private
     */
    _attachCustomEvent: function() {
        var tooltipView = this.tooltipView,
            seriesView = this.seriesView;
        tooltipView.on('showDot', seriesView.onShowDot, seriesView);
        tooltipView.on('hideDot', seriesView.onHideDot, seriesView);
        AxisChartView.prototype._attachCustomEvent.apply(this);
    }
});

module.exports = LineChartView;