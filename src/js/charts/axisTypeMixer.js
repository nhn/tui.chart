/**
 * @fileoverview axisTypeMixer is mixer for help to axis types charts like bar, column, line, area,
 *                  bubble, column&line combo.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var predicate = require('../helpers/predicate');
var Axis = require('../components/axes/axis');
var Plot = require('../components/plots/plot');
var Legend = require('../components/legends/legend');
var SimpleCustomEvent = require('../components/customEvents/simpleCustomEvent');
var GroupTypeCustomEvent = require('../components/customEvents/groupTypeCustomEvent');
var BoundsTypeCustomEvent = require('../components/customEvents/boundsTypeCustomEvent');
var Tooltip = require('../components/tooltips/tooltip');
var GroupTooltip = require('../components/tooltips/groupTooltip');

/**
 * Axis limit value.
 * @typedef {{min: number, max: number}} axisLimit
 */

/**
 * axisTypeMixer is mixer for help to axis types charts like bar, column, line, area, bubble, column&line combo.
 * @mixin
 */
var axisTypeMixer = {
    /**
     * Add axis components.
     * @param {Array.<object>} axes axes option
     * @param {boolean} aligned whether aligned or not
     * @private
     */
    _addAxisComponents: function(axes, aligned) {
        var self = this;
        tui.util.forEach(axes, function(axis) {
            var axisParams = {
                aligned: aligned,
                isVertical: !!axis.isVertical,
                seriesName: axis.seriesName || self.chartType
            };

            if (axis.name === 'rightYAxis') {
                axisParams.componentType = 'yAxis';
                axisParams.index = 1;
            }

            self.componentManager.register(axis.name, Axis, axisParams);
        });
    },

    /**
     * Add series components
     * @param {Array<object>} seriesSet - series set
     * @param {object} options - options
     * @private
     */
    _addSeriesComponents: function(seriesSet, options) {
        var self = this,
            seriesBaseParams = {
                libType: options.libType,
                chartType: options.chartType,
                componentType: 'series',
                chartBackground: this.theme.chart.background
            };

        tui.util.forEach(seriesSet, function(series) {
            var seriesParams = tui.util.extend(seriesBaseParams, series.data);
            self.componentManager.register(series.name, series.SeriesClass, seriesParams);
        });
    },

    /**
     * Add tooltip component.
     * @private
     */
    _addTooltipComponent: function() {
        var TooltipClass = this.options.tooltip.grouped ? GroupTooltip : Tooltip;
        this.componentManager.register('tooltip', TooltipClass, this._makeTooltipData());
    },

    /**
     * Add legend component.
     * @param {{?LegendClass: function, ?additionalParams: object}} legendData - data for register legend
     * @private
     */
    _addLegendComponent: function(legendData) {
        var LegendClass = legendData.LegendClass || Legend;

        this.componentManager.register('legend', LegendClass, tui.util.extend({
            seriesNames: this.seriesNames,
            chartType: this.chartType
        }, legendData.additionalParams));
    },

    /**
     * Add plot component.
     * @param {?string} xAxisTypeOption - xAxis type option like 'datetime'
     * @private
     */
    _addPlotComponent: function(xAxisTypeOption) {
        this.componentManager.register('plot', Plot, {
            chartType: this.chartType,
            chartTypes: this.chartTypes,
            xAxisTypeOption: xAxisTypeOption
        });
    },

    /**
     * Add components for axis type chart.
     * @param {object} params parameters
     *      @param {object} params.axes axes data
     *      @param {object} params.plotData plot data
     *      @param {function} params.serieses serieses
     * @private
     */
    _addComponentsForAxisType: function(params) {
        var options = this.options;
        var aligned = !!params.aligned;

        if (params.plot) {
            this._addPlotComponent(options.xAxis.type);
        }

        this._addAxisComponents(params.axis, aligned);

        if (options.legend.visible) {
            this._addLegendComponent(params.legend || {}, params.seriesNames);
        }

        this._addSeriesComponents(params.series, options);
        this._addTooltipComponent();
        this._addCustomEventComponent();
    },

    /**
     * Add data ratios.
     * @private
     * @override
     */
    _addDataRatios: function(limitMap) {
        var self = this;
        var chartTypes = this.chartTypes || [this.chartType];
        var seriesOption = this.options.series || {};
        var addDataRatio;

        if (this.dataProcessor.isCoordinateType()) {
            addDataRatio = function(chartType) {
                var hasRadius = predicate.isBubbleChart(chartType);
                self.dataProcessor.addDataRatiosForCoordinateType(chartType, limitMap, hasRadius);
            };
        } else {
            addDataRatio = function(chartType) {
                var stackType = (seriesOption[chartType] || seriesOption).stackType;

                self.dataProcessor.addDataRatios(limitMap[chartType], stackType, chartType);
            };
        }

        tui.util.forEachArray(chartTypes, addDataRatio);
    },

    /**
     * Add simple customEvent component.
     * @private
     */
    _addSimpleCustomEventComponent: function() {
        this.componentManager.register('customEvent', SimpleCustomEvent, {
            chartType: this.chartType
        });
    },

    /**
     * Add grouped event handler layer.
     * @private
     * @override
     */
    _addCustomEventComponentForGroupTooltip: function() {
        var seriesOptions = this.options.series;

        this.componentManager.register('customEvent', GroupTypeCustomEvent, {
            chartType: this.chartType,
            isVertical: this.isVertical,
            chartTypes: this.chartTypes,
            zoomable: seriesOptions.zoomable,
            allowSelect: seriesOptions.allowSelect
        });
    },

    /**
     * Add custom event component for normal tooltip.
     * @private
     */
    _addCustomEventComponentForNormalTooltip: function() {
        this.componentManager.register('customEvent', BoundsTypeCustomEvent, {
            chartType: this.chartType,
            isVertical: this.isVertical,
            allowSelect: this.options.series.allowSelect
        });
    },

    /**
     * Add custom event component.
     * @private
     */
    _addCustomEventComponent: function() {
        if (predicate.isCoordinateTypeChart(this.chartType)) {
            this._addSimpleCustomEventComponent();
        } else if (this.options.tooltip.grouped) {
            this._addCustomEventComponentForGroupTooltip();
        } else {
            this._addCustomEventComponentForNormalTooltip();
        }
    }
};

module.exports = axisTypeMixer;
