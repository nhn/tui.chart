/**
 * @fileoverview This model is bar chart model for management of bar chart data.
 * @author NHN Ent.
 *         FE Development Team <jiung.kang@nhnent.com>
 */

'use strict';

var chartConst = require('../const.js'),
    ChartModel = require('./chartModel.js'),
    AxisModel = require('./axisModel.js'),
    PlotModel = require('./plotModel.js'),
    LegendModel = require('./legendModel.js'),
    SeriesModel = require('./seriesModel.js'),
    PopupModel = require('./popupModel.js');

var BarChartModel = ne.util.defineClass(ChartModel, {
    /**
     * Constructor
     * @param {object} data user chart data
     * @param {object} options chart options
     */
    init: function(data, options) {
        options = options || {};
        options.barType  = options.barType  || chartConst.BAR_TYPE_BAR;

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
         * PopupModel instance
         * @type {object}
         */
        this.popup = null;

        /**
         * Bar chart type
         * vertical or horizontal
         * @type {string}
         */
        this.barType = options.barType;

        ChartModel.call(this, data, options);
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
            vAxis = new AxisModel({labels: labels}, options.hAxis),
            hAxis = new AxisModel({values: values}, options.vAxis),
            axisScale = hAxis.scale,
            colors = this._pickColors(legendLabels.length),
            lastItemStyles = this._pickLastItemStyles(data);

        this._setAxis(hAxis, vAxis, this.barType);
        this._setPlot(this.hAxis, this.vAxis, options.plot);
        this._setLegend(legendLabels, colors, options.legend);
        this._setSeries(values, axisScale, colors, lastItemStyles);
        this._setPopup(values, labels, legendLabels, options.popup);
    },

    /**
     * Set axis.
     * @param {object} hAxis horizontal axis
     * @param {object} vAxis vertical axis
     * @param {object} barType bar type
     * @private
     */
    _setAxis: function(hAxis, vAxis, barType) {
        if (barType === chartConst.BAR_TYPE_COLUMN) {
            this.hAxis = vAxis;
            this.vAxis = hAxis;
        } else {
            this.hAxis = hAxis;
            this.vAxis = vAxis;
        }
        this.vAxis.changeVerticalState(true);
    },

    /**
     * Set plot.
     * @param {number} hTickcount horizontal tick count
     * @param {number} vTickCount vertical tick count
     * @private
     */
    _setPlot: function(hAxis, vAxis, options) {
        this.plot = new PlotModel({
            hTickCount: hAxis.getValidTickCount(),
            vTickCount: vAxis.getValidTickCount()
        }, options);
    },

    /**
     * Set legend.
     * @param {array} labels legend labels
     * @param {array} colors legend colors
     * @private
     */
    _setLegend: function(labels, colors, options) {
        this.legend = new LegendModel({
            labels: labels,
            colors: colors
        }, options);
    },

    /**
     * Set series
     * @param {[array, ...]} values chart values
     * @param {{min: number, max: number}} scale axis scale
     * @param {array} colors series colors
     * @private
     */
    _setSeries: function(values, scale, colors, lastItemStyles) {
        this.series = new SeriesModel({
            values: values,
            scale: scale,
            colors: colors,
            lastItemStyles: lastItemStyles
        });
    },

    _setPopup: function(values, labels, legendLabels, options) {
        this.popup = new PopupModel({
            values: values,
            labels: labels,
            legendLabels: legendLabels
        }, options);
    }
});

module.exports = BarChartModel;
