/**
 * @fileoverview This model is axis chart model for management of axis type chart data.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var ChartModel = require('./chartModel.js'),
    AxisModel = require('./axisModel.js'),
    PlotModel = require('./plotModel.js'),
    LegendModel = require('./legendModel.js'),
    SeriesModel = require('./seriesModel.js'),
    TooltipModel = require('./tooltipModel.js');

var AxisChartModel = ne.util.defineClass(ChartModel, /** @lends AxisChartModel.prototype */ {
    /**
     * This model is axis chart model for management of axis type chart data.
     * @constructs AxisChartModel
     * @extends ChartModel
     * @param {object} data user chart data
     * @param {object} options chart options
     */
    init: function(data, options) {
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
         * TooltipModel instance
         * @type {object}
         */
        this.tooltip = null;

        ChartModel.call(this, data, options);
    },

    /**
     * Set bar chart data.
     * @param {object} data user chart data
     * @private
     */
    _setData: function(data) {
        var options = this.options || {},
            chartOptions = options.chart || {},
            axisData = this.pickAxisData(data),
            labels = this.pickLabels(data[0]),
            values = this.pickValues(axisData),
            legendLabels = this.pickLegendLabels(axisData),
            formatFns = this.findFormatFns(chartOptions.format),
            formatValues = chartOptions.format ? this.formatValues(values, formatFns) : values,
            axisInfo;
        
        axisInfo = this._setAxis(labels, values, formatFns, this.dimension, options);
        this._setPlot(axisInfo.hAxis.getValidTickCount(), axisInfo.vAxis.getValidTickCount());
        this._setLegend(legendLabels);
        this._setSeries(values, formatValues, axisInfo.valueScale, this.isVertical, options.series);
        this._setTooltip(formatValues, labels, legendLabels, options.tooltip);
    },

    /**
     * Set Axis.
     * @param {array.<string>} labels labels
     * @param {array.<array.<number>>} values chart values
     * @param {object} options axis options
     * @returns {{vAxis: object, hAxis: object, valueScale: object}} axis info
     * @private
     */
    _setAxis: function(labels, values, formatFns, chartDimension, options) {
        var valueData = {
                values: values,
                chartDimension: chartDimension,
                formatFns: formatFns
            },
            labelData = {
                labels: labels
            },
            vAxis, hAxis, valueScale, axisInfo;
        if (this.isVertical) {
            valueData.isVertical = true;
            vAxis = new AxisModel(valueData, options.vAxis);
            hAxis = new AxisModel(labelData, options.hAxis);
            valueScale = vAxis.scale;
        } else {
            labelData.isVertical = true;
            vAxis = new AxisModel(labelData, options.vAxis);
            hAxis = new AxisModel(valueData, options.hAxis);
            valueScale = hAxis.scale;
        }

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
     * Set plot model.
     * @param {number} hTickCount horizontal tick count
     * @param {number} vTickCount vertical tick count
     * @param {object} options plot options
     * @private
     */
    _setPlot: function(hTickCount, vTickCount, options) {
        this.plot = new PlotModel({
            hTickCount: hTickCount,
            vTickCount: vTickCount
        }, options);
    },

    /**
     * Set legend model.
     * @param {array.<string>} labels legend labels
     * @param {array.<string>} colors legend colors
     * @private
     */
    _setLegend: function(labels) {
        this.legend = new LegendModel({
            labels: labels
        });
    },

    /**
     * Set series model.
     * @param {array.<array.<number>>} values chart values
     * @param {array.<array.<string>>} formatValues formatting values
     * @param {{min: number, max: number}} scale axis scale
     * @param {boolean} isVertical is vertical
     * @param {object} options series options
     * @private
     */
    _setSeries: function(values, formatValues, scale, isVertical, options) {
        this.series = new SeriesModel({
            values: values,
            formatValues: formatValues,
            scale: scale,
            isVertical: isVertical
        }, options);
    },

    /**
     * Set tooltip model.
     * @param {array.<array.<string>>} values chart values
     * @param {array.<string>} labels chart labels
     * @param {array.<string>} legendLabels chart legend labels
     * @param {object} options tooltip options
     * @private
     */
    _setTooltip: function(values, labels, legendLabels, options) {
        this.tooltip = new TooltipModel({
            values: values,
            labels: labels,
            legendLabels: legendLabels
        }, options);
    }
});

module.exports = AxisChartModel;
