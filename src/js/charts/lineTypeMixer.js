/**
 * @fileoverview lineTypeMixer is mixer of line type chart(line, area).
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var ChartBase = require('./chartBase');
var chartConst = require('../const');
var axisDataMaker = require('../helpers/axisDataMaker');
var AreaTypeCustomEvent = require('../customEvents/areaTypeCustomEvent');

/**
 * lineTypeMixer is mixer of line type chart(line, area).
 * @mixin
 */
var lineTypeMixer = {
    /**
     * Initialize line type chart.
     * @param {Array.<Array>} rawData raw data
     * @param {object} theme chart theme
     * @param {object} options chart options
     * @private
     */
    _lineTypeInit: function(rawData, theme, options) {
        ChartBase.call(this, {
            rawData: rawData,
            theme: theme,
            options: options,
            hasAxes: true,
            isVertical: true
        });

        /**
         * checked legends.
         * @type {null | Array.<?boolean> | {line: ?Array.<boolean>, column: ?Array.<boolean>}}
         */
        this.checkedLegends = null;

        this._initForAutoTickInterval();

        this._addComponents(options.chartType);
    },

    /**
     * Initialize for auto tick interval option.
     * @private
     */
    _initForAutoTickInterval: function() {
        /**
         * previous updated xAxisData
         * @type {null | object}
         */
        this.prevUpdatedData = null;

        /**
         * first updated tick count
         */
        this.firstTickCount = null;
    },

    /**
     * Make map for AxisScaleMaker of axes(xAxis, yAxis).
     * @returns {Object.<string, AxisScaleMaker>}
     * @private
     */
    _makeAxisScaleMakerMap: function() {
        return {
            yAxis: this._createAxisScaleMaker(this.options.yAxis, 'yAxis')
        };
    },

    /**
     * Add custom event component for normal tooltip.
     * @private
     */
    _addCustomEventComponentForNormalTooltip: function() {
        this.componentManager.register('customEvent', AreaTypeCustomEvent, {
            chartType: this.chartType,
            isVertical: this.isVertical,
            zoomable: tui.util.pick(this.options.series, 'zoomable')
        });
    },

    /**
     * Add components
     * @param {string} chartType chart type
     * @private
     */
    _addComponents: function(chartType) {
        this._addComponentsForAxisType({
            chartType: chartType,
            axis: [
                {
                    name: 'yAxis',
                    isVertical: true
                },
                {
                    name: 'xAxis',
                    isLabel: true
                }
            ],
            series: [
                {
                    name: this.options.chartType + 'Series',
                    SeriesClass: this.Series
                }
            ],
            plot: true
        });
    },

    /**
     * Update axesData.
     * @private
     * @override
     */
    _updateAxesData: function() {
        var boundsMaker = this.boundsMaker;
        var axesData = boundsMaker.getAxesData();
        var xAxisData = axesData.xAxis;
        var seriesWidth = boundsMaker.getDimension('series').width;
        var shiftingOption = tui.util.pick(this.options.series, 'shifting');
        var prevUpdatedData = this.prevUpdatedData;

        if (shiftingOption || !prevUpdatedData) {
            axisDataMaker.updateLabelAxisDataForAutoTickInterval(xAxisData, seriesWidth, this.addedDataCount);
        } else {
            axisDataMaker.updateLabelAxisDataForStackingDynamicData(xAxisData, prevUpdatedData, this.firstTickCount);
        }

        this.prevUpdatedData = xAxisData;

        if (!this.firstTickCount) {
            this.firstTickCount = xAxisData.tickCount;
        }

        boundsMaker.registerAxesData(axesData);
    },

    /**
     * On change checked legend.
     * @param {Array.<?boolean> | {line: ?Array.<boolean>, column: ?Array.<boolean>}} checkedLegends checked legends
     * @param {?object} rawData rawData
     * @param {?object} boundsParams addition params for calculating bounds
     * @override
     */
    onChangeCheckedLegends: function(checkedLegends, rawData, boundsParams) {
        var self = this;
        var pastPaused = this.paused;

        if (!pastPaused) {
            this._pauseAnimationForAddingData();
        }

        this._rerender(checkedLegends, rawData, boundsParams);

        this.checkedLegends = checkedLegends;

        if (!pastPaused) {
            setTimeout(function() {
                self._restartAnimationForAddingData();
            }, chartConst.RERENDER_TIME);
        }
    },

    /**
     * Render for zoom.
     * @param {boolean} isResetZoom - whether reset zoom or not
     * @private
     */
    _renderForZoom: function(isResetZoom) {
        var self = this;

        this.boundsMaker.initBoundsData();
        this._render(function(renderingData) {
            renderingData.customEvent.isResetZoom = isResetZoom;
            self._renderComponents(renderingData, 'zoom');
        });
    },

    /**
     * On zoom.
     * @param {Array.<number>} indexRange - index range for zoom
     * @override
     */
    onZoom: function(indexRange) {
        this._pauseAnimationForAddingData();
        this.dataProcessor.updateRawDataForZoom(indexRange);
        this.axisScaleMakerMap = null;
        this._renderForZoom(false);
    },

    /**
     * On reset zoom.
     * @override
     */
    onResetZoom: function() {
        var rawData = this.dataProcessor.getOriginalRawData();

        if (this.checkedLegends) {
            rawData = this._filterCheckedRawData(rawData, this.checkedLegends);
        }

        this.axisScaleMakerMap = null;
        this.prevUpdatedData = null;
        this.firstTickCount = null;

        this.dataProcessor.initData(rawData);
        this.dataProcessor.initZoomedRawData();
        this.dataProcessor.addDataFromRemainDynamicData(tui.util.pick(this.options.series, 'shifting'));
        this._renderForZoom(true);
        this._restartAnimationForAddingData();
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

module.exports = lineTypeMixer;
