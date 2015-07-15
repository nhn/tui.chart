/**
 * @fileoverview View is parent of all view.
 * @author NHN Ent.
 *         FE Development Team <jiung.kang@nhnent.com>
 */

'use strict';

var DOMHandler = require('./domHandler.js'),
    neConst = require('../const.js');

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
    },

    /**
     * Calculate rendered label width.
     * @param {string} label label
     * @param {number} fontSize font size
     * @returns {number}
     */
    calculateRenderedLabelWidth: function(label, fontSize) {
        var elDiv = document.createElement('DIV'),
            elSpan = document.createElement('SPAN'),
            labelWidth;
        elDiv.appendChild(elSpan);
        elDiv.style.cssText = 'position:relative;top:10000px;left:10000px';
        elSpan.innerHTML = label;
        elSpan.style.fontSize = (fontSize || neConst.DEFAULT_LABEL_FONT_SIZE) + 'px';
        document.body.appendChild(elDiv);
        labelWidth = elSpan.offsetWidth;
        document.body.removeChild(elDiv);

        return labelWidth;
    },

    /**
     * Get rendered labels max width.
     * @param {array} labels labels
     * @param {number} fontSize font size
     * @returns {number}
     */
    getRenderedLabelsMaxWidth: function(labels, fontSize) {
        var widths = ne.util.map(labels, function(label) {
                return this.calculateRenderedLabelWidth(label, fontSize);
            }, this),
            result = ne.util.max(widths);
        return result;
    }
});

DOMHandler.mixin(View);

module.exports = View;