/**
 * @fileoverview SeriesItem for treemap.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var SeriesItemForTreemap = tui.util.defineClass(/** @lends SeriesItemForTreemap.prototype */{
    /**
     * SeriesItem for treemap.
     * @constructs SeriesItemForTreemap
     * @param {object} rawSeriesDatum - value
     */
    init: function(rawSeriesDatum) {
        this.id = rawSeriesDatum.id;
        this.parent = rawSeriesDatum.parent;
        this.value = rawSeriesDatum.value;
        this.depth = rawSeriesDatum.depth;
        this.label = rawSeriesDatum.label || this.id;
        this.group = rawSeriesDatum.group;
    }
});

module.exports = SeriesItemForTreemap;
