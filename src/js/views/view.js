/**
 * @fileoverview View is parent of all view.
 * @author NHN Ent.
 *         FE Development Team <jiung.kang@nhnent.com>
 */

'use strict';

var DOMHandler = require('./domHandler.js');

/**
 * @classdesc View is parent of all view.
 * @class
 */
var View = ne.util.defineClass({
    init: function() {
        this.el = this.createElement('DIV', this.className || '');
    },

    /**
     * Size(width, height) rendering
     * @param {number} width area width
     * @param {number} height area height
     */
    renderSize: function(size) {
        this.el.style.cssText = [
            ['width:', size.width, 'px'].join(''),
            ['height:', size.height, 'px'].join(''),
        ].join(';');
    }
});

DOMHandler.mixin(View);

module.exports = View;