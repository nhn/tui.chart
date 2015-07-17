/**
 * @fileoverview PopupView render popup area.
 * @author NHN Ent.
 *         FE Development Team <jiung.kang@nhnent.com>
 */

'use strict';

var View = require('./view.js'),
    popupTemplate = require('./popupTemplate.js');

/**
 * @classdesc PopupView render popup area.
 * @class
 * @augments View
 */
var PopupView = ne.util.defineClass(View, {
    init: function(model) {
        /**
         * Popup model
         * @type {object}
         */
        this.model = model;

        /**
         * Popup view className
         * @type {string}
         */
        this.className = 'ne-chart-popup-area';

        View.call(this);
    },

    render: function(bound, prefix) {
        this.renderPosition(bound.position);

        this.el.innerHTML = this._makePopupsHtml(this.model.data, prefix);

        return this.el;
    },

    _makePopupsHtml: function(data, prefix) {
        var html = ne.util.map(data, function(popupData) {
            popupData.id = prefix + '-' + popupData.id;
            return popupTemplate.TPL_POPUP(popupData);
        }).join('');
        return html;
    }
});

module.exports = PopupView;