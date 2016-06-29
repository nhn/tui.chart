'use strict';

var chartConst = require('../const');

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
    },

    /**
     * Animate for adding data.
     * @private
     */
    _animateForAddingData: function() {
        var self = this;
        var boundsMaker = this.boundsMaker;
        var shiftingOption = !!tui.util.pick(this.options.series, 'shifting');
        var beforeAxesData = boundsMaker.getAxesData();
        var beforeSizeRatio = beforeAxesData.xAxis.sizeRatio || 1;

        this.addedDataCount += 1;
        this.axisScaleMakerMap = null;
        boundsMaker.initBoundsData();

        this._render(function() {
            var xAxisWidth = boundsMaker.getDimension('xAxis').width * beforeSizeRatio;
            var tickSize = (xAxisWidth / (self.dataProcessor.getCategoryCount(false) - 1));

            self._renderComponents({
                tickSize: tickSize + chartConst.OVERLAPPING_WIDTH,
                shifting: shiftingOption
            }, 'animateForAddingData');
        }, beforeAxesData);

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

        if (tui.util.pick(this.options.series, 'shifting')) {
            this.boundsMaker.initBoundsData();
        }

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
        this._initForAutoTickInterval();

        if (this.rerenderingDelayTimerId) {
            clearTimeout(this.rerenderingDelayTimerId);
            this.rerenderingDelayTimerId = null;

            if (tui.util.pick(this.options.series, 'shifting')) {
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
        this.dataProcessor.addDynamicData(category, values);
        this._startLookup();
    },

    /**
     * Mix in.
     * @param {function} func - target function
     * @ignore
     */
    mixin: function(func) {
        tui.util.extend(func.prototype, this);
    }
};

module.exports = addingDynamicDataMixer;
