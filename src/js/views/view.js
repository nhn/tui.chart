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
    }
});

DOMHandler.mixin(View);
//EventHandler.mixin(View);

module.exports = View;