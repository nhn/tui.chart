'use strict';

var chartConst = require('../const');
var predicate = require('../helpers/predicate');

/**
 * addingDynamicData is mixer for adding dynamic data.
 * @mixin
 */
var addingDynamicDataMixer = {
    /**
     * Initialize for adding data.
     * @private
     */
    _initForAddingData: function() {
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
    },

    /**
     * Animate for adding data.
     * @private
     */
    _animateForAddingData: function() {
        var self = this;
        var dataProcessor = this.dataProcessor;
        var boundsMaker = this.boundsMaker;
        var shiftingOption = !!this.options.series.shifting;
        var xAxisOptions = this.options.xAxis;

        this.addedDataCount += 1;

        this._render(function() {
            var xAxisWidth = boundsMaker.getDimension('xAxis').width;
            var tickCount, tickSize;

            if (dataProcessor.isCoordinateType()) {
                tickCount = dataProcessor.getValues(self.chartType, 'x').length - 1;
            } else {
                tickCount = dataProcessor.getCategoryCount(false) - 1;
            }

            if (shiftingOption && !predicate.isAutoTickInterval(xAxisOptions.tickInterval)) {
                tickCount -= 1;
            }

            tickSize = (xAxisWidth / tickCount);

            self._renderComponents({
                tickSize: tickSize,
                shifting: shiftingOption
            }, 'animateForAddingData');
        }, true);

        if (shiftingOption) {
            this.dataProcessor.shiftData();
        }
    },

    /**
     * Rerender for adding data.
     * @private
     */
    _rerenderForAddingData: function() {
        var self = this;

        this._render(function(renderingData) {
            renderingData.animatable = false;
            self._renderComponents(renderingData, 'rerender');
        });
    },

    /**
     * Check for added data.
     * @private
     */
    _checkForAddedData: function() {
        var self = this;
        var added = this.dataProcessor.addDataFromDynamicData();

        if (!added) {
            this.lookupping = false;

            return;
        }

        if (this.paused) {
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
     * Pause animation for adding data.
     * @private
     */
    _pauseAnimationForAddingData: function() {
        this.paused = true;
        this.scaleModel.initForAutoTickInterval();

        if (this.rerenderingDelayTimerId) {
            clearTimeout(this.rerenderingDelayTimerId);
            this.rerenderingDelayTimerId = null;

            if (this.options.series.shifting) {
                this.dataProcessor.shiftData();
            }
        }
    },

    /**
     * Restart animation for adding data.
     * @private
     */
    _restartAnimationForAddingData: function() {
        this.paused = false;
        this.lookupping = false;
        this._startLookup();
    },

    /**
     * Start lookup.
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

        this.dataProcessor.addDynamicData(category, values);
        this._startLookup();
    },


    /**
     * Change checked legend.
     * @param {Array.<?boolean> | {line: ?Array.<boolean>, column: ?Array.<boolean>}} checkedLegends checked legends
     * @param {?object} rawData rawData
     * @param {?object} boundsParams addition params for calculating bounds
     * @override
     */
    _changeCheckedLegends: function(checkedLegends, rawData, boundsParams) {
        var self = this;
        var pastPaused = this.paused;

        if (!pastPaused) {
            this._pauseAnimationForAddingData();
        }

        this.checkedLegends = checkedLegends;
        this._rerender(checkedLegends, rawData, boundsParams);


        if (!pastPaused) {
            setTimeout(function() {
                self._restartAnimationForAddingData();
            }, chartConst.RERENDER_TIME);
        }
    }
};

module.exports = addingDynamicDataMixer;
