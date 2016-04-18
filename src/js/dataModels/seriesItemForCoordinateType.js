/**
 * @fileoverview SeriesItemForCoordinateType is a element of SeriesGroup.items.
 * SeriesItemForCoordinateType has processed terminal data like x, y, r, xRatio, yRatio, rRatio.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var SeriesItemForCoordinateType = tui.util.defineClass(/** @lends SeriesItemForCoordinateType.prototype */{
    /**
     * SeriesItemForCoordinateType is a element of SeriesGroup.items.
     * SeriesItemForCoordinateType has processed terminal data like x, y, r, xRatio, yRatio, rRatio.
     * @constructs SeriesItemForCoordinateType
     * @param {object} rawSeriesDatum - value
     */
    init: function(rawSeriesDatum) {
        this._initData(rawSeriesDatum);
    },

    /**
     * Initialize data of item.
     * @param {{x: ?number, y: ?number, r: ?number}} rawSeriesDatum - rawSeriesDatum for bubble chart
     * @private
     */
    _initData: function(rawSeriesDatum) {
        this.x = rawSeriesDatum.x;
        this.y = rawSeriesDatum.y;
        this.r = rawSeriesDatum.r;
        this.label = rawSeriesDatum.label || '';

        this.ratioMap = {};
    },

    /**
     * Add ratio.
     * @param {?number} maxX - maximum x value
     * @param {?number} maxY - maximum y value
     * @param {?number} maxRadius - maximum radius value
     */
    addRatio: function(valueType, distance, subValue) {
        if (!tui.util.isExisty(this.ratioMap[valueType]) && distance) {
            this.ratioMap[valueType] = (this[valueType] - subValue) / distance;
        }
    }
});

module.exports = SeriesItemForCoordinateType;
