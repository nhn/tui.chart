/**
 * @fileoverview autoTickMixer is mixer for making auto tick.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var axisDataMaker = require('../helpers/axisDataMaker');

/**
 * autoTickMixer is mixer for making auto tick.
 * @mixin
 */
var autoTickMixer = {
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
    }
};

module.exports = autoTickMixer;
