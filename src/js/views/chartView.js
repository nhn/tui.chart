/**
 * @fileoverview ChartView is parent of all chart.
 * @author NHN Ent.
 *         FE Development Team <jiung.kang@nhnent.com>
 */

'use strict';

var View = require('./view.js');

/**
 * @classdesc ChartView is parent of all chart.
 * @class
 * @augments View
 */
var ChartView = ne.util.defineClass(View, {
    /**
     * Chart size
     * @type {{width: number, height: number}
     */
    size: {
        width: 500,
        height: 300
    },

    /**
     * constructor
     * @param {object} data chart data
     * @param {options} options chart options
     */
    init: function(data, options) {
        options = options || {};
        this.size = ne.util.extend(this.size, options.size);
        View.call(this);
        this.addClass(this.el, 'ne-chart');
    }
});

module.exports = ChartView;