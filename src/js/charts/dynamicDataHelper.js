'use strict';

var chartConst = require('../const');
var predicate = require('../helpers/predicate');
var snippet = require('tui-code-snippet');

var DynamicDataHelper = snippet.defineClass(/** @lends DynamicDataHelper.prototype */ {
    init: function(chart) {
        var firstRenderCheck = snippet.bind(function() {
            this.isInitRenderCompleted = true;
            this.chart.off(firstRenderCheck);
        }, this);

        /**
         * chart instance
         * @type {ChartBase}
         */
        this.chart = chart;

        this.isInitRenderCompleted = false;

        this.chart.on('load', firstRenderCheck);

        this.reset();
    },
    reset: function() {
        /**
         * whether lookupping or not
         * @type {boolean}
         */
        this.lookupping = false;

        /**
         * whether paused or not
         * @type {boolean}
         */
        this.paused = false;

        /**
         * rendering delay timer id
         * @type {null}
         */
        this.rerenderingDelayTimerId = null;

        /**
         * added data count
         * @type {number}
         */
        this.addedDataCount = 0;

        /**
         * checked legends.
         * @type {null | Array.<?boolean> | {line: ?Array.<boolean>, column: ?Array.<boolean>}}
         */
        this.checkedLegends = null;

        /**
         * previous xAxis data
         * @type {null|object}
         */
        this.prevXAxisData = null;
    },
    /**
     * Calculate animate tick size.
     * @param {number} xAxisWidth - x axis width
     * @returns {number}
     * @private
     */
    _calculateAnimateTickSize: function(xAxisWidth) {
        var dataProcessor = this.chart.dataProcessor;
        var tickInterval = this.chart.options.xAxis.tickInterval;
        var shiftingOption = !!this.chart.options.series.shifting;
        var tickCount;

        if (dataProcessor.isCoordinateType()) {
            tickCount = dataProcessor.getValues(this.chart.chartType, 'x').length - 1;
        } else {
            tickCount = dataProcessor.getCategoryCount(false) - 1;
        }

        if (shiftingOption && !predicate.isAutoTickInterval(tickInterval)) {
            tickCount -= 1;
        }

        return xAxisWidth / tickCount;
    },

    /**
     * Animate for adding data.
     * @private
     */
    _animateForAddingData: function() {
        var chart = this.chart;
        var boundsAndScale = chart.readyForRender(true);
        var shiftingOption = !!this.chart.options.series.shifting;
        var tickSize;

        this.addedDataCount += 1;

        tickSize = this._calculateAnimateTickSize(boundsAndScale.dimensionMap.xAxis.width);

        chart.componentManager.render('animateForAddingData', boundsAndScale, {
            tickSize: tickSize,
            shifting: shiftingOption
        });

        if (shiftingOption) {
            chart.dataProcessor.shiftData();
        }
    },

    /**
     * Rerender for adding data.
     * @private
     */
    _rerenderForAddingData: function() {
        var chart = this.chart;
        var boundsAndScale = chart.readyForRender();
        chart.componentManager.render('rerender', boundsAndScale);
    },

    /**
     * Check for added data.
     * @private
     */
    _checkForAddedData: function() {
        var chart = this.chart;
        var self = this;
        var added = chart.dataProcessor.addDataFromDynamicData();

        if (!added) {
            this.lookupping = false;

            return;
        }

        if (this.paused) {
            if (chart.options.series.shifting) {
                chart.dataProcessor.shiftData();
            }

            return;
        }

        this._animateForAddingData();

        this.rerenderingDelayTimerId = setTimeout(function() {
            self.rerenderingDelayTimerId = null;
            self._rerenderForAddingData();
            self._checkForAddedData();
        }, 400);
    },

    /**
     * Change checked legend.
     * @param {Array.<?boolean> | {line: ?Array.<boolean>, column: ?Array.<boolean>}} checkedLegends checked legends
     * @param {?object} rawData rawData
     * @param {?object} boundsParams addition params for calculating bounds
     */
    changeCheckedLegends: function(checkedLegends, rawData, boundsParams) {
        var self = this;
        var chart = this.chart;
        var shiftingOption = !!chart.options.series.shifting;
        var pastPaused = this.paused;

        if (!pastPaused) {
            this.pauseAnimation();
        }

        this.checkedLegends = checkedLegends;
        chart.rerender(checkedLegends, rawData, boundsParams);

        if (!pastPaused) {
            setTimeout(function() {
                chart.dataProcessor.addDataFromRemainDynamicData(shiftingOption);
                self.restartAnimation();
            }, chartConst.RERENDER_TIME);
        }
    },

    /**
     * Pause animation for adding data.
     */
    pauseAnimation: function() {
        this.paused = true;

        if (this.rerenderingDelayTimerId) {
            clearTimeout(this.rerenderingDelayTimerId);
            this.rerenderingDelayTimerId = null;

            if (this.chart.options.series.shifting) {
                this.chart.dataProcessor.shiftData();
            }
        }
    },

    /**
     * Restart animation for adding data.
     */
    restartAnimation: function() {
        this.paused = false;
        this.lookupping = false;
        this._startLookup();
    },

    /**
     * Start lookup for checking added data.
     * @private
     */
    _startLookup: function() {
        if (this.lookupping) {
            return;
        }

        this.lookupping = true;

        this._checkForAddedData();
    },

    /**
     * Add data.
     * @param {string} category - category
     * @param {Array} values - values
     */
    addData: function(category, values) {
        if (!values) {
            values = category;
            category = null;
        }

        this.chart.dataProcessor.addDynamicData(category, values);

        // we should not animate for added data if initial render have not completed
        if (this.isInitRenderCompleted) {
            this._startLookup();
        } else if (values) {
            this.addedDataCount += 1;
        }
    }
});

module.exports = DynamicDataHelper;
