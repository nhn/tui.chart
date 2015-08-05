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
            chartOptions = options.chart || {},
            axisData = data.slice(1),
            labels = data[0].slice(1),
            values = this.pickValues(axisData),
            legendLabels = this.pickLegendLabels(axisData),
            formatFunctions = this.findFormatFunctions(chartOptions.format),
            formatValues = chartOptions.format ? this.formatValues(values, formatFunctions) : values,
            tooltipPosition = options.tooltip && options.tooltip.position || '',
            seriesOption = options.series || {},
            axisInfo;

        seriesOption.tooltipPositon = tooltipPosition;

        axisInfo = this._setAxis(labels, values, formatFunctions, this.dimension, options);
        this._setPlot(axisInfo.hAxis.getValidTickCount(), axisInfo.vAxis.getValidTickCount());
        this._setLegend(legendLabels);
        this._setSeries(values, formatValues, axisInfo.valueScale, this.isVertical, tooltipPosition, seriesOption);
        this._setTooltip(formatValues, labels, legendLabels, options.tooltip);
    },

    /**
     * Set Axis.
     * @param {array.<string>} labels axis labels
     * @param {array.<array.<number>>} values chart values
     * @param {array.<function>} formatFunctions format functions
     * @param {{width: number, height: number}} chartDimension chart dimension
     * @param {{title: string, min: number}} options axis options
     * @returns {{vAxis: object, hAxis: object, valueScale: object}} axis info
     * @private
     */
    _setAxis: function(labels, values, formatFunctions, chartDimension, options) {
        var valueData = {
                values: values,
                chartDimension: chartDimension,
                formatFunctions: formatFunctions
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
     * @param {array.<array.<string>>} formatValues formatted values
     * @param {{min: number, max: number}} scale axis scale
     * @param {boolean} isVertical whether vertical or not
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
