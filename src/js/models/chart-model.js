/**
 * @fileoverview chart model
 * @author NHN Ent.
 *         FE Development Team <jiung.kang@nhnent.com>
 */

'use strict';

var ChartModel;

ChartModel = ne.util.defineClass({
    init: function(options) {
        this.options = options;
    },

    pickColors: function(count) {
        var colors;
        if (this.options && this.options.colors) {
            colors = this.options.colors;
        } else {
            colors = ['red', 'orange', 'yellow', 'green', 'blue'];
        }

        if (count && count > 0) {
            colors.length = count;
        }
        return colors;
    }
});

module.exports = ChartModel;
