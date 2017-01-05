/**
 * @fileoverview axisTypeMixer is mixer for help to axis types charts like bar, column, line, area,
 *                  bubble, column&line combo.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var predicate = require('../helpers/predicate');

/**
 * Axis limit value.
 * @typedef {{min: number, max: number}} axisLimit
 */

/**
 * axisTypeMixer is mixer for help to axis types charts like bar, column, line, area, bubble, column&line combo.
 * @mixin
 * @private */
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
                seriesType: axis.seriesType || self.chartType,
                classType: 'axis'
            };

            if (axis.name === 'rightYAxis') {
                axisParams.componentType = 'yAxis';
                axisParams.index = 1;
            }

            self.componentManager.register(axis.name, axisParams);
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

            seriesParams.classType = series.name;
            self.componentManager.register(series.name, seriesParams);
        });
    },

    /**
     * Add tooltip component.
     * @private
     */
    _addTooltipComponent: function() {
        var classType = this.options.tooltip.grouped ? 'groupTooltip' : 'tooltip';
        this.componentManager.register('tooltip', this.makeTooltipData(classType));
    },

    /**
     * Add legend component.
     * @param {{LegendClass: ?function, additionalParams: ?object}} legendData - data for register legend
     * @private
     */
    _addLegendComponent: function(legendData) {
        var classType = legendData.classType || 'legend';

        this.componentManager.register('legend', tui.util.extend({
            seriesTypes: this.seriesTypes,
            chartType: this.chartType,
            classType: classType
        }, legendData.additionalParams));
    },

    /**
     * Add plot component.
     * @param {?string} xAxisTypeOption - xAxis type option like 'datetime'
     * @private
     */
    _addPlotComponent: function(xAxisTypeOption) {
        this.componentManager.register('plot', {
            chartType: this.chartType,
            chartTypes: this.chartTypes,
            xAxisTypeOption: xAxisTypeOption,
            classType: 'plot'
        });
    },

    /**
     * Add chartExportMenu component.
     * @private
     */
    _addChartExportMenuComponent: function() {
        var chartOption = this.options.chart;
        var chartTitle = chartOption && chartOption.title ? chartOption.title.text : 'chart';

        this.componentManager.register('chartExportMenu', {
            chartTitle: chartTitle,
            classType: 'chartExportMenu'
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
            this._addLegendComponent(params.legend || {});
        }

        if (options.chartExportMenu.visible) {
            this._addChartExportMenuComponent(options.chartExportMenu);
        }

        this._addSeriesComponents(params.series, options);
        this._addTooltipComponent();
        this._addMouseEventDetectorComponent();
    },

    /**
     * Add data ratios.
     * @override
     */
    addDataRatios: function(limitMap) {
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
     * Add simple mouseEventDetector component.
     * @private
     */
    _addSimpleEventDetectorComponent: function() {
        this.componentManager.register('mouseEventDetector', {
            chartType: this.chartType,
            classType: 'simpleEventDetector'
        });
    },

    /**
     * Add mouseEventDetector components for group tooltip.
     * @private
     */
    _addMouseEventDetectorComponentForGroupTooltip: function() {
        var seriesOptions = this.options.series;

        this.componentManager.register('mouseEventDetector', {
            chartType: this.chartType,
            isVertical: this.isVertical,
            chartTypes: this.chartTypes,
            zoomable: seriesOptions.zoomable,
            allowSelect: seriesOptions.allowSelect,
            classType: 'groupTypeEventDetector'
        });
    },

    /**
     * Add mouse event detector component for normal(single) tooltip.
     * @private
     */
    _addMouseEventDetectorComponentForNormalTooltip: function() {
        this.componentManager.register('mouseEventDetector', {
            chartType: this.chartType,
            isVertical: this.isVertical,
            allowSelect: this.options.series.allowSelect,
            classType: 'boundsTypeEventDetector'
        });
    },

    /**
     * Add mouse event detector component.
     * @private
     */
    _addMouseEventDetectorComponent: function() {
        if (predicate.isCoordinateTypeChart(this.chartType)) {
            this._addSimpleEventDetectorComponent();
        } else if (this.options.tooltip.grouped) {
            this._addMouseEventDetectorComponentForGroupTooltip();
        } else {
            this._addMouseEventDetectorComponentForNormalTooltip();
        }
    }
};

module.exports = axisTypeMixer;
