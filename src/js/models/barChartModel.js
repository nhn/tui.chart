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
        this.barType = options.barType || chartConst.BAR_TYPE_BAR;

        ChartModel.call(this, data, options);
    },

    /**
     * Set bar chart data.
     * @param {object} data user chart data
     * @private
     */
    _setData: function(data) {
        var options = this.options || {},
            axisData = this.pickAxisData(data),
            labels = this.pickLabels(axisData),
            values = this.pickValues(axisData),
            legendLabels = this.pickLegendLabels(data[0]),
            lastItemStyles = this.pickLastItemStyles(data),
            axisInfo;

        axisInfo = this._setAxis(labels, values, options);
        this._setPlot(axisInfo.hAxis, axisInfo.vAxis);
        this._setLegend(legendLabels);
        this._setSeries(values, axisInfo.valueScale, lastItemStyles, options.series);
        this._setPopup(values, labels, legendLabels, options.tooltip);
    },

    /**
     *
     * @param {array} labels labels
     * @param {[array, ...] values values
     * @param {object} options options
     * @returns {{vAxis: object, hAxis: object, valueScale: object}}
     * @private
     */
    _setAxis: function(labels, values, options) {
        var vAxis, hAxis, valueScale, axisInfo;
        if (options.barType === chartConst.BAR_TYPE_COLUMN) {
            vAxis = new AxisModel({values: values}, options.vAxis);
            hAxis = new AxisModel({labels: labels}, options.hAxis);
            valueScale = vAxis.scale;
        } else {
            vAxis = new AxisModel({labels: labels}, options.vAxis);
            hAxis = new AxisModel({values: values}, options.hAxis);
            valueScale = hAxis.scale;
        }

        vAxis.changeVerticalState(true);

        this.vAxis = vAxis;
        this.hAxis = hAxis;

        axisInfo = {
            vAxis: vAxis,
            hAxis: hAxis,
            valueScale: valueScale
        };

        return axisInfo;
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
    _setLegend: function(labels) {
        this.legend = new LegendModel({
            labels: labels
        });
    },

    /**
     * Set series
     * @param {[array, ...]} values chart values
     * @param {{min: number, max: number}} scale axis scale
     * @param {array} colors series colors
     * @private
     */
    _setSeries: function(values, scale, lastItemStyles, options) {
        this.series = new SeriesModel({
            values: values,
            scale: scale,
            lastItemStyles: lastItemStyles
        }, options);
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
