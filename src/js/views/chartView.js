/**
 * @fileoverview ChartView is parent of all chart.
 * @author NHN Ent.
 *         FE Development Team <jiung.kang@nhnent.com>
 */

'use strict';

var View = require('./view.js');

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
        this.size.width = options.width || this.size.width;
        this.size.height = options.height || this.size.height;
        View.prototype.init.call(this);
        this.addClass(this.el, 'ne-chart');
    }
});

module.exports = ChartView;