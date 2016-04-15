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
        this.x = rawSeriesDatum.x || 0;
        this.y = rawSeriesDatum.y || 0;
        this.r = rawSeriesDatum.r || 0;
        this.label = rawSeriesDatum.label || '';
    },

    /**
     * Add ratio.
     * @param {?number} maxX - maximum x value
     * @param {?number} maxY - maximum y value
     * @param {?number} maxRadius - maximum radius value
     */
    addRatio: function(maxX, maxY, maxRadius) {
        this.xRatio = this.x / maxX;
        this.yRatio = this.y / maxY;
        this.rRatio = this.r / maxRadius;
    }
});

module.exports = SeriesItemForCoordinateType;
