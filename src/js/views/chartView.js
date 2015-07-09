/**
 * @fileoverview ChartView
 * @author NHN Ent.
 *         FE Development Team <jiung.kang@nhnent.com>
 */

'use strict';

var View = require('./view.js');

var ChartView = ne.util.defineClass(View, {
    width: 500,
    height: 300,
    init: function(data, options) {
        this.width = options.width || this.width;
        this.height = options.height || this.height;
        View.prototype.init.call(this);
    },

    renderSize: function() {
        this.el.style.cssText = [
            ['width:', this.width, 'px'].join(''),
            ['height:', this.height, 'px'].join(''),
        ].join(';');
    }
});

module.exports = ChartView;