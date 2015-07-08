/**
 * @fileoverview This model is bar chart model for management of bar chart data.
 * @author NHN Ent.
 *         FE Development Team <jiung.kang@nhnent.com>
 */

'use strict';

var ChartModel = require('./chart-model.js'),
    AxisModel = require('./axis-model.js'),
    PlotModel = require('./plot-model.js'),
    LegendModel = require('./legend-model.js'),
    SeriesModel = require('./series-model.js'),
    BarChartModel;

BarChartModel = ne.util.defineClass(ChartModel, {
    /**
     * Constructor
     * @param {object} data user chart data
     * @param {object} options chart options
     */
    init: function(data, options) {
        options = options || {};

        /**
         * Horizontal AxisModel instance
         * @type {object}
         */
        this.hAxis = null;

        /**
         * Vertical AxisModel instance
         * @type {object}
         */
        this.vAxis = null;

        /**
         * Legend Model instance
         * @type {object}
         */
        this.legend = null;

        /**
         * PlotModel instance
         * @type {object}
         */
        this.plot = null;

        /**
         * SeriesModel instance
         * @type {object}
         */
        this.series = null;

        /**
         * Bar chart type
         * vertical or horizontal
         * @type {string}
         */
        this.bars = 'vertical';

        this._setBars(options.bars || this.bars);

        ChartModel.prototype.init.call(this, data, options);
    },

    /**
     * Set bar chart data.
     * @param {object} data user chart data
     * @private
     */
    _setData: function(data) {
        var options = this.options || {},
            axisData = this._pickAxisData(data),
            labels = this._pickLabels(axisData),
            values = this._pickValues(axisData),
            legendLabels = this._pickLegendLabels(data[0]),
            hAxis = new AxisModel({labels: labels}, options.hAxis),
            vAxis = new AxisModel({values: values}, options.vAxis),
            axisScale = vAxis.scale,
            colors = this._pickColors(legendLabels.length);

        this._setAxis(hAxis, vAxis, this.bars);
        this._setPlot(this.hAxis.tickCount, this.vAxis.tickCount);
        this._setLegend(legendLabels, colors);
        this._setSeries(values, axisScale, colors);
    },

    /**
     * Set bars.
     * @param {string} bars
     * @private
     */
    _setBars: function(bars) {
        this.bars = bars;
    },

    /**
     * Set axis.
     * @param {object} hAxis horizontal axis
     * @param {object} vAxis vertical axis
     * @param {object} bars bar type
     * @private
     */
    _setAxis: function(hAxis, vAxis, bars) {
        if (bars === 'vertical') {
            this.hAxis = hAxis;
            this.vAxis = vAxis;
        } else {
            this.hAxis = vAxis;
            this.vAxis = hAxis;
        }
    },

    /**
     * Set plot.
     * @param {number} hTickcount horizontal tick count
     * @param {number} vTickCount vertical tick count
     * @private
     */
    _setPlot: function(hTickcount, vTickCount) {
        this.plot = new PlotModel({
            hTickCount: hTickcount,
            vTickCount: vTickCount
        });
    },

    /**
     * Set legend.
     * @param {array} labels legend labels
     * @param {array} colors legend colors
     * @private
     */
    _setLegend: function(labels, colors) {
        this.legend = new LegendModel({
            labels: labels,
            colors: colors
        });
    },

    /**
     * Set series
     * @param {[array, ...]} values chart values
     * @param {{min: number, max: number}} scale axis scale
     * @param {array} colors series colors
     * @private
     */
    _setSeries: function(values, scale, colors) {
        this.series = new SeriesModel({
            values: values,
            scale: scale,
            colors: colors
        });
    }
});

module.exports = BarChartModel;
