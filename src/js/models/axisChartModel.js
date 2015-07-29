/**
 * @fileoverview This model is axis chart model for management of bar chart data.
 * @author NHN Ent.
 *         FE Development Team <jiung.kang@nhnent.com>
 */

'use strict';

var ChartModel = require('./chartModel.js'),
    AxisModel = require('./axisModel.js'),
    PlotModel = require('./plotModel.js'),
    LegendModel = require('./legendModel.js'),
    SeriesModel = require('./seriesModel.js'),
    TooltipModel = require('./tooltipModel.js');

var BarChartModel = ne.util.defineClass(ChartModel, {
    /**
     * Constructor
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
            axisData = this.pickAxisData(data),
            labels = this.pickLabels(data[0]),
            values = this.pickValues(axisData),
            legendLabels = this.pickLegendLabels(axisData),
            lastItemStyles = this.pickLastItemStyles(data),
            axisInfo;

        axisInfo = this._setAxis(labels, values, options);
        this._setPlot(axisInfo.hAxis.getValidTickCount(), axisInfo.vAxis.getValidTickCount());
        this._setLegend(legendLabels);
        this._setSeries(values, axisInfo.valueScale, lastItemStyles, this.isVertical, options.series);
        this._setTooltip(values, labels, legendLabels, options.tooltip);
    },

    /**
     * Set Axis.
     * @param {array} labels labels
     * @param {[array]} values chart values
     * @param {object} options axis options
     * @returns {{vAxis: object, hAxis: object, valueScale: object}} axis info
     * @private
     */
    _setAxis: function(labels, values, options) {
        var vAxis, hAxis, valueScale, axisInfo;
        if (this.isVertical) {
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
     * Set series model.
     * @param {[array]} values chart values
     * @param {{min: number, max: number}} scale axis scale
     * @param {array} lastItemStyles last item styles
     * @param {boolean} isVertical is vertical
     * @param {object} options series options
     * @private
     */
    _setSeries: function(values, scale, lastItemStyles, isVertical, options) {
        this.series = new SeriesModel({
            values: values,
            scale: scale,
            lastItemStyles: lastItemStyles,
            isVertical: isVertical,
        }, options);
    },

    /**
     * Set tooltip model.
     * @param {array.array} values chart values
     * @param {array} labels chart labels
     * @param {array} legendLabels chart legend labels
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

module.exports = BarChartModel;
