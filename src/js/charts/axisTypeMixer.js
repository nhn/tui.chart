/**
 * @fileoverview axisTypeMixer is mixer for help to axis types charts like bar, column, line, area,
 *                  bubble, column&line combo.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var ChartBase = require('./chartBase');
var renderUtil = require('../helpers/renderUtil');
var predicate = require('../helpers/predicate');
var Axis = require('../axes/axis');
var Plot = require('../plots/plot');
var Legend = require('../legends/legend');
var GroupTypeCustomEvent = require('../customEvents/groupTypeCustomEvent');
var BoundsTypeCustomEvent = require('../customEvents/boundsTypeCustomEvent');
var Tooltip = require('../tooltips/tooltip');
var GroupTooltip = require('../tooltips/groupTooltip');

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
                chartType: axis.chartType
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
                userEvent: this.userEvent,
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
     * @param {null | object} LegendClass - Legend type class
     * @param {Array.<string>} seriesNames - series names
     * @param {string} chartType - chart type
     * @param {?object} additionalParams - additional params
     * @private
     */
    _addLegendComponent: function(LegendClass, seriesNames, chartType, additionalParams) {
        this.componentManager.register('legend', LegendClass || Legend, tui.util.extend({
            seriesNames: seriesNames,
            chartType: chartType,
            userEvent: this.userEvent
        }, additionalParams));
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
        var LegendClass;

        if (params.plot) {
            this.componentManager.register('plot', Plot, {
                isVertical: this.isVertical,
                chartType: this.chartType,
                chartTypes: this.chartTypes,
                xAxisType: options.xAxis.type
            });
        }

        this._addAxisComponents(params.axis, aligned);

        if (options.legend.visible) {
            params.legend = params.legend || {};
            LegendClass = params.legend.LegendClass || null;
            this._addLegendComponent(LegendClass, params.seriesNames, params.chartType, params.legend.additionalParams);
        }

        this._addSeriesComponents(params.series, options);
        this._addTooltipComponent();
        this._addCustomEventComponent();
    },

    _findLimit: function(limitMap, seriesIndex) {
        var limit;

        if (seriesIndex === 0) {
            limit = this.isVertical ? limitMap.yAxis : limitMap.xAxis;
        } else {
            limit = limitMap.rightYAxis ? limitMap.rightYAxis : limitMap.yAxis;
        }

        return limit;
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
            addDataRatio = function(chartType, index) {
                var stackType = (seriesOption[chartType] || seriesOption).stackType;
                var limit = self._findLimit(limitMap, index);

                self.dataProcessor.addDataRatios(limit, stackType, chartType);
            };
        }

        tui.util.forEachArray(chartTypes, addDataRatio);
    },

    /**
     * Make series data for rendering.
     * @param {Array.<string>} chartTypes chart types
     * @param {object} limitMap - limit map
     * @param {boolean} aligned - aligned
     * @returns {object}
     * @private
     */
    _makeSeriesDataForRendering: function(chartTypes, limitMap, aligned) {
        var self = this;
        var seriesData = {};

        tui.util.forEachArray(chartTypes, function(chartType, index) {
            seriesData[chartType + 'Series'] = {
                limit: self._findLimit(limitMap, index),
                aligned: aligned
            };
        });

        return seriesData;
    },

    /**
     * Make rendering data for axis type chart.
     * @returns {object} data for rendering
     * @private
     * @override
     */
    _makeRenderingData: function(limitMap, axisDataMap) {
        var optionChartTypes = this.chartTypes || [this.chartType];
        var seriesData = this._makeSeriesDataForRendering(optionChartTypes, limitMap, axisDataMap.xAxis.aligned);
        var xAxis = axisDataMap.xAxis;

        return tui.util.extend({
            customEvent: {
                tickCount: this.isVertical ? (xAxis.eventTickCount || xAxis.tickCount) : axisDataMap.yAxis.tickCount
            }
        }, seriesData, axisDataMap);
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
        if (this.options.tooltip.grouped) {
            this._addCustomEventComponentForGroupTooltip();
        } else {
            this._addCustomEventComponentForNormalTooltip();
        }
    },

    /**
     * Attach coordinate event.
     * @param {CustomEvent} customEvent custom event component
     * @param {Tooltip} tooltip tooltip component
     * @param {Array.<Series>} serieses series components
     * @private
     */
    _attachCustomEventForGroupTooltip: function(customEvent, tooltip, serieses) {
        customEvent.on('showGroupTooltip', tooltip.onShow, tooltip);
        customEvent.on('hideGroupTooltip', tooltip.onHide, tooltip);

        tui.util.forEach(serieses, function(series) {
            if (series.onShowGroupTooltipLine) {
                tooltip.on('showGroupTooltipLine', series.onShowGroupTooltipLine, series);
                tooltip.on('hideGroupTooltipLine', series.onHideGroupTooltipLine, series);
            }
            tooltip.on('showGroupAnimation', series.onShowGroupAnimation, series);
            tooltip.on('hideGroupAnimation', series.onHideGroupAnimation, series);
        });
    },

    /**
     * Attach custom event for normal tooltip.
     * @param {CustomEvent} customEvent custom event component
     * @param {Tooltip} tooltip tooltip component
     * @param {Array.<Series>} serieses series components
     * @private
     */
    _attachCustomEventForNormalTooltip: function(customEvent, tooltip, serieses) {
        customEvent.on('showTooltip', tooltip.onShow, tooltip);
        customEvent.on('hideTooltip', tooltip.onHide, tooltip);

        tui.util.forEach(serieses, function(series) {
            var showAnimationEventName, hideAnimationEventName;

            if (series.onShowAnimation) {
                showAnimationEventName = renderUtil.makeCustomEventName('show', series.chartType, 'animation');
                hideAnimationEventName = renderUtil.makeCustomEventName('hide', series.chartType, 'animation');
                tooltip.on(showAnimationEventName, series.onShowAnimation, series);
                tooltip.on(hideAnimationEventName, series.onHideAnimation, series);
            }
        });
    },

    /**
     * Attach custom event for series selection.
     * @param {CustomEvent} customEvent custom event component
     * @param {Array.<Series>} serieses series components
     * @private
     */
    _attachCustomEventForSeriesSelection: function(customEvent, serieses) {
        tui.util.forEach(serieses, function(series) {
            var selectSeriesEventName = renderUtil.makeCustomEventName('select', series.chartType, 'series'),
                unselectSeriesEventName = renderUtil.makeCustomEventName('unselect', series.chartType, 'series');

            customEvent.on(selectSeriesEventName, series.onSelectSeries, series);
            customEvent.on(unselectSeriesEventName, series.onUnselectSeries, series);
        });
    },

    /**
     * Attach custom event.
     * @private
     * @override
     */
    _attachCustomEvent: function() {
        var seriesSet = this.componentManager.where({componentType: 'series'});
        var customEvent = this.componentManager.get('customEvent');
        var tooltip = this.componentManager.get('tooltip');

        ChartBase.prototype._attachCustomEvent.call(this, seriesSet);

        if (this.options.tooltip.grouped) {
            this._attachCustomEventForGroupTooltip(customEvent, tooltip, seriesSet);
        } else {
            this._attachCustomEventForNormalTooltip(customEvent, tooltip, seriesSet);
        }

        this._attachCustomEventForSeriesSelection(customEvent, seriesSet);
    }
};

module.exports = axisTypeMixer;
