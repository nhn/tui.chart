/**
 * @fileoverview axisTypeMixer is mixer for help to axis types charts like bar, column, line, area, bubble, combo.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var ChartBase = require('./chartBase');
var axisDataMaker = require('../helpers/axisDataMaker');
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
 * axisTypeMixer is mixer for help to axis types charts like bar, column, line, area, bubble, combo.
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
                isLabel: !!axis.isLabel,
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
     * @param {Array<object>} serieses serieses
     * @param {object} options options
     * @param {boolean} aligned whether aligned or not
     * @private
     */
    _addSeriesComponents: function(serieses, options) {
        var self = this,
            seriesBaseParams = {
                libType: options.libType,
                chartType: options.chartType,
                userEvent: this.userEvent,
                componentType: 'series'
            };

        tui.util.forEach(serieses, function(series) {
            var seriesParams = tui.util.extend(seriesBaseParams, series.data);
            self.componentManager.register(series.name, series.SeriesClass, seriesParams);
        });
    },

    /**
     * Add tooltip component
     * @private
     */
    _addTooltipComponent: function() {
        var TooltipClass = this.hasGroupTooltip ? GroupTooltip : Tooltip;
        this.componentManager.register('tooltip', TooltipClass, this._makeTooltipData());
    },

    /**
     * Add legend component.
     * @param {Array.<string>} chartTypes series chart types
     * @param {string} chartType chartType
     * @private
     */
    _addLegendComponent: function(chartTypes, chartType) {
        this.componentManager.register('legend', Legend, {
            chartTypes: chartTypes,
            chartType: chartType,
            userEvent: this.userEvent
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

        this.componentManager.register('plot', Plot);
        this._addAxisComponents(params.axes, aligned);
        if (options.legend.visible) {
            this._addLegendComponent(params.seriesNames, params.chartType);
        }
        this._addSeriesComponents(params.serieses, options);
        this._addTooltipComponent();
    },

    /**
     * Get limit map.
     * @param {{yAxis: object, xAxis: object}} axesData axes data
     * @param {Array.<string>} chartTypes chart types
     * @returns {{column: ?axisLimit, line: ?axisLimit}} limit map
     * @private
     */
    _getLimitMap: function(axesData, chartTypes) {
        var limitMap = {},
            yAxisLimit = axesData.yAxis ? axesData.yAxis.limit : axesData.rightYAxis.limit;

        limitMap[chartTypes[0]] = this.isVertical ? yAxisLimit : axesData.xAxis.limit;

        if (chartTypes.length > 1) {
            limitMap[chartTypes[1]] = axesData.rightYAxis ? axesData.rightYAxis.limit : yAxisLimit;
        }

        return limitMap;
    },

    /**
     * Get map for AxisScaleMaker of axes(xAxis, yAxis).
     * @returns {Object.<string, AxisScaleMaker>}
     * @private
     */
    _getAxisScaleMakerMap: function() {
        if (!this.axisScaleMakerMap) {
            this.axisScaleMakerMap = this._makeAxisScaleMakerMap();
        }

        return this.axisScaleMakerMap;
    },

    /**
     * Make axis data for rendering area of axis like yAxis, xAxis, rightYAxis.
     * @param {AxisScaleMaker} axisScaleMaker - AxisScaleMaker
     * @param {object} options - options for axis
     * @param {boolean} [isVertical] - whether vertical or not
     * @param {boolean} [isPositionRight] - whether right position or not
     * @returns {object}
     * @private
     */
    _makeAxisData: function(axisScaleMaker, options, isVertical, isPositionRight) {
        var aligned = predicate.isLineTypeChart(this.chartType);
        var axisData;

        if (axisScaleMaker) {
            axisData = axisDataMaker.makeValueAxisData({
                axisScaleMaker: axisScaleMaker,
                options: options,
                isVertical: !!isVertical,
                isPositionRight: !!isPositionRight,
                aligned: !!aligned
            });
        } else {
            axisData = axisDataMaker.makeLabelAxisData({
                labels: this.dataProcessor.getCategories(),
                options: options,
                isVertical: !!isVertical,
                isPositionRight: !!isPositionRight,
                aligned: !!aligned
            });
        }

        return axisData;
    },

    /**
     * Make axes data, used in a axis component like yAxis, xAxis, rightYAxis.
     * @returns {object} axes data
     * @private
     * @override
     */
    _makeAxesData: function() {
        var axisScaleMakerMap = this._getAxisScaleMakerMap();
        var options = this.options;
        var yAxisOptions = tui.util.isArray(options.yAxis) ? options.yAxis : [options.yAxis];
        var axesData = {
            xAxis: this._makeAxisData(axisScaleMakerMap.xAxis, options.xAxis),
            yAxis: this._makeAxisData(axisScaleMakerMap.yAxis, yAxisOptions[0], true)
        };

        if (this.hasRightYAxis) {
            axesData.rightYAxis = this._makeAxisData(null, yAxisOptions[1], true, true);
        }

        return axesData;
    },

    /**
     * Make series data for rendering.
     * @param {{yAxis: object, xAxis: object}} axesData axes data
     * @param {Array.<string>} chartTypes chart types
     * @param {boolean} isVertical whether vertical or not
     * @returns {object} series data
     * @private
     */
    _makeSeriesDataForRendering: function(axesData, chartTypes) {
        var limitMap = this._getLimitMap(axesData, chartTypes);
        var aligned = axesData.xAxis.aligned;
        var seriesData = {};

        tui.util.forEachArray(chartTypes, function(chartType) {
            seriesData[chartType + 'Series'] = {
                limit: limitMap[chartType],
                aligned: aligned,
                hasAxes: true
            };
        });

        return seriesData;
    },

    /**
     * Add data ratios.
     * @private
     * @override
     */
    _addDataRatios: function() {
        var self = this;
        var axesData = this.boundsMaker.getAxesData();
        var chartTypes = this.chartTypes || [this.chartType];
        var limitMap = this._getLimitMap(axesData, chartTypes);
        var stackType = tui.util.pick(this.options.series, 'stackType');

        tui.util.forEachArray(chartTypes, function(chartType) {
            self.dataProcessor.addDataRatios(limitMap[chartType], stackType, chartType);
        });
    },

    /**
     * Make rendering data for axis type chart.
     * @returns {object} data for rendering
     * @private
     * @override
     */
    _makeRenderingData: function() {
        var axesData = this.boundsMaker.getAxesData();
        var optionChartTypes = this.chartTypes || [this.chartType];
        var seriesData = this._makeSeriesDataForRendering(axesData, optionChartTypes, this.isVertical);
        var yAxis = axesData.yAxis ? axesData.yAxis : axesData.rightYAxis;

        return tui.util.extend({
            plot: {
                vTickCount: yAxis.validTickCount,
                hTickCount: axesData.xAxis.validTickCount
            },
            customEvent: {
                tickCount: this.isVertical ? axesData.xAxis.tickCount : yAxis.tickCount
            }
        }, seriesData, axesData);
    },

    /**
     * Add grouped event handler layer.
     * @private
     * @override
     */
    _addCustomEventComponentForGroupTooltip: function() {
        this.componentManager.register('customEvent', GroupTypeCustomEvent, {
            chartType: this.chartType,
            isVertical: this.isVertical
        });
    },

    /**
     * Add custom event component for normal tooltip.
     * @private
     */
    _addCustomEventComponentForNormalTooltip: function() {
        this.componentManager.register('customEvent', BoundsTypeCustomEvent, {
            chartType: this.chartType,
            isVertical: this.isVertical
        });
    },

    /**
     * Add custom event component.
     * @private
     */
    _addCustomEventComponent: function() {
        if (this.hasGroupTooltip) {
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
        var serieses = this.componentManager.where({componentType: 'series'}),
            customEvent = this.componentManager.get('customEvent'),
            tooltip = this.componentManager.get('tooltip');

        ChartBase.prototype._attachCustomEvent.call(this, serieses);

        if (this.hasGroupTooltip) {
            this._attachCustomEventForGroupTooltip(customEvent, tooltip, serieses);
        } else {
            this._attachCustomEventForNormalTooltip(customEvent, tooltip, serieses);
        }

        this._attachCustomEventForSeriesSelection(customEvent, serieses);
    },

    /**
     * Override for initializing to axisScaleMakerMap.
     * @private
     * @override
     */
    _rerender: function() {
        this.axisScaleMakerMap = null;
        ChartBase.prototype._rerender.apply(this, arguments);
    },

    /**
     * Mix in.
     * @param {function} func target function
     * @ignore
     */
    mixin: function(func) {
        tui.util.extend(func.prototype, this);
    }
};

module.exports = axisTypeMixer;
