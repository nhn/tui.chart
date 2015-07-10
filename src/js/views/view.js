/**
 * @fileoverview View
 * @author NHN Ent.
 *         FE Development Team <jiung.kang@nhnent.com>
 */

'use strict';

var DOMHandler = require('./domHandler.js');
//    EventHandler = require('./eventListener.js');

var View = ne.util.defineClass({
    init: function() {
        this.el = this.createElement('DIV', this.className || '');
    },

    /**
     * size rendering
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
//EventHandler.mixin(View);

module.exports = View;