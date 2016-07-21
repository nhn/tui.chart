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
        this.label = rawSeriesDatum.label || '';
        this.group = rawSeriesDatum.group;
        this.isLeaf = !!rawSeriesDatum.isLeaf;
    },

    /**
     * Pick value map.
     * @returns {{value: number, label: string}}
     */
    pickValueMap: function() {
        return {
            value: this.value,
            label: (this.label ? this.label + ': ' : '') + this.value
        };
    }
});

module.exports = SeriesItemForTreemap;
