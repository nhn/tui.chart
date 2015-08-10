/**
 * @fileoverview AxisChartModel is model about axis chart for management of axis type chart data.
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
     * This model is about axis chart for management of axis type chart data.
     * @constructs AxisChartModel
     * @extends ChartModel
     * @param {array.<array>} data user chart data
     * @param {{
     *   chart: {
     *     width: number,
     *     height: number,
     *     title: string,
     *     format: string
     *   },
     *   vAxis: {
     *     title: string,
     *     min: number
     *   },
     *   hAxis: {
     *     title: strig,
     *     min: number
     *   },
     *   tooltip: {
     *     suffix: string,
     *     template: string
     *   },
     *   theme: string
     * }} options chart options
     */
    init: function(data, options) {
        /**
         * Horizontal axis model instance
         * @type {object}
         */
        this.hAxis = null;

        /**
         * Vertical axis model instance
         * @type {object}
         */
        this.vAxis = null;

        /**
         * Legend model instance
         * @type {object}
         */
        this.legend = null;

        /**
         * Plot model instance
         * @type {object}
         */
        this.plot = null;

        /**
         * Series model instance
         * @type {object}
         */
        this.series = null;

        /**
         * Tooltip model instance
         * @type {object}
         */
        this.tooltip = null;

        ChartModel.call(this, data, options);
    },

    /**
     * Set bar chart data.
     * @param {array.<array>} data user chart data
     * @private
     */
    _setData: function(data) {
        var options = this.options || {},
            chartType = options.chartType,
            chartOptions = options.chart || {},
            axisData = data.slice(1),
            labels = data[0].slice(1),
            values = this.pickValues(axisData),
            legendLabels = this.pickLegendLabels(axisData),
            formatFunctions = this.findFormatFunctions(chartOptions.format),
            formatValues = chartOptions.format ? this.formatValues(values, formatFunctions) : values,
            axisInfo;

        axisInfo = this._setAxis({
            labels: labels,
            values: values,
            formatFunctions: formatFunctions,
            chartDimension: this.dimension,
            chartType: chartType
        }, options);
        this._setPlot(axisInfo.hAxis.getValidTickCount(), axisInfo.vAxis.getValidTickCount());
        this._setLegend(legendLabels);
        this._setSeries({
            values: values,
            formatValues: formatValues,
            scale: axisInfo.valueScale,
            isVertical: this.isVertical
        }, options.series);
        this._setTooltip({
            values: formatValues,
            labels: labels,
            legendLabels: legendLabels
        }, options);
    },

    /**
     * Set Axis.
     * @param {object} data axis setting data
     *      @param {array.<string>} data.labels axis labels
     *      @param {array.<array.<number>>} data.values chart values
     *      @param {array.<function>} data.formatFunctions format functions
     *      @param {{width: number, height: number}} data.chartDimension chart dimension
     *      @param {string} data.chartType chart type
     *      @param {string} data.stacked stacked type
     * @param {{title: string, min: number}} options axis options
     * @returns {{vAxis: object, hAxis: object, valueScale: object}} axis info
     * @private
     */
    _setAxis: function(data, options) {
        var seriesOptions = options.series || {},
            valueData = {
                values: data.values,
                chartDimension: data.chartDimension,
                formatFunctions: data.formatFunctions,
                chartType: data.chartType,
                stacked: seriesOptions.stacked
            },
            labelData = {
                labels: data.labels,
                chartType: data.chartType
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
     * @param {object} data series setting data
     *      @param {array.<array.<number>>} data.values chart values
     *      @param {array.<array.<string>>} data.formatValues formatted values
     *      @param {{min: number, max: number}} data.scale axis scale
     *      @param {boolean} data.isVertical whether vertical or not
     * @param {object} options series options
     * @private
     */
    _setSeries: function(data, options) {
        this.series = new SeriesModel(data, options);
    },

    /**
     * Set tooltip model.
     * @param {object} data tooltip setting data
     *      @param {array.<array.<string>>} data.values chart values
     *      @param {array.<string>} data.labels chart labels
     *      @param {array.<string>} data.legendLabels chart legend labels
     * @param {object} options chart options
     * @private
     */
    _setTooltip: function(data, options) {
        var seriesOptions = options.series || {};
        data.stacked = seriesOptions.stacked;
        this.tooltip = new TooltipModel(data, options.tooltip);
    }
});

module.exports = AxisChartModel;
