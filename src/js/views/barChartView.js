/**
 * @fileoverview BarChartView render axis area, plot area and series area of bar chart.
 * @author NHN Ent.
 *         FE Development Team <jiung.kang@nhnent.com>
 */

'use strict';

var ChartView = require('./chartView.js'),
    chartFactory = require('../factories/chartFactory.js'),
    BarChartModel = require('../models/barChartModel.js'),
    PlotView = require('./plotView.js'),
    AxisView = require('./axisView.js'),
    SeriesView = require('./seriesView.js');


var BarChartView,
    V_AXIS_WIDTH = 100,
    H_AXIS_HEIGHT = 50,
    CHART_PADDING = 20;

/**
 * @classdesc BarChartView render axis area, plot area and series area of bar chart.
 * @class
 * @augments ChartView
 */
BarChartView = ne.util.defineClass(ChartView, {
    /**
     * constructor
     * @param {object} data bar chart data
     * @param {options} options bar chart options
     */
    init: function(data, options) {
        options = options || {};

        /**
         * Chart options
         * @type {object}
         */
        this.options = options;

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
        this.plotView = new PlotView(this.model.plot);

        /**
         * Vertical axis view
         * @type {object}
         */
        this.vAxisView = new AxisView(this.model.vAxis);

        /**
         * Horizontal axis view
         * @type {object}
         */
        this.hAxisView = new AxisView(this.model.hAxis);

        /**
         * series view
         * @type {object}
         */
        this.seriesView = new SeriesView(this.model.series, {
            chartType: 'bar',
            bars: options.bars
        });

        ChartView.call(this, data, options);
    },

    /**
     * Bar chart renderer
     * @returns {element}
     */
    render: function() {
        var vTitleAreaWidth = this.model.title ? 50 : 0,
            labels = this.model.vAxis.labels,
            vAxisWidth = this.getRenderedLabelsMaxWidth(labels) + vTitleAreaWidth + 10,
            width = this.size.width - CHART_PADDING * 2,
            height = this.size.height - CHART_PADDING * 2,
            plotSize = {width: width - vAxisWidth, height: height - H_AXIS_HEIGHT},
            vAxisSize = {width: vAxisWidth, height: height - H_AXIS_HEIGHT},
            hAxisSize = {width: width - vAxisWidth, height: H_AXIS_HEIGHT},
            elPlot = this.plotView.render(plotSize),
            elVAxis = this.vAxisView.render(vAxisSize, vTitleAreaWidth),
            elHAxis = this.hAxisView.render(hAxisSize),
            elSeries = this.seriesView.render(plotSize);

        this.el.appendChild(elPlot);
        this.el.appendChild(elVAxis);
        this.el.appendChild(elHAxis);
        this.el.appendChild(elSeries);
        this.renderSize(this.size);
        return this.el;
    }
});

chartFactory.register('Bar', BarChartView);
module.exports = BarChartView;