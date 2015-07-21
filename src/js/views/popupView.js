/**
 * @fileoverview PopupView render popup area.
 * @author NHN Ent.
 *         FE Development Team <jiung.kang@nhnent.com>
 */

'use strict';

var dom = require('./domHandler.js'),
    View = require('./view.js'),
    templateMaker = require('./templateMaker.js'),
    popupTemplate = require('./popupTemplate.js');

var POPUP_GAP = 5,
    HIDDEN_WIDTH = 1;

/**
 * @classdesc PopupView render popup area.
 * @class
 * @augments View
 */
var PopupView = ne.util.defineClass(View, {
    /**
     * constructor
     * @param {object} model popup model
     */
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

    /**
     * Popup view renderer.
     * @param {position: object} bound
     * @param {string} prefix
     * @returns {element}
     */
    render: function(bound, prefix) {
        this.renderPosition(bound.position);

        this.el.innerHTML = this._makePopupsHtml(this.model.data, prefix);

        return this.el;
    },

    /**
     * Makes popup html.
     * @param data
     * @param prefix
     * @returns {string}
     * @private
     */
    _makePopupsHtml: function(data, prefix) {
        var options = this.model.options,
            optionTemplate = options.template ? options.template : '',
            tplPopup = optionTemplate ? templateMaker.template(optionTemplate) :  popupTemplate.TPL_POPUP,
            html = ne.util.map(data, function(popupData) {
                var id = prefix + popupData.id,
                    elTemp = dom.createElement('DIV');

                popupData = ne.util.extend({
                    label: '',
                    legendLabel: '',
                    value: '',
                }, popupData);

                elTemp.innerHTML = tplPopup(popupData);
                elTemp.firstChild.id = id;

                return elTemp.innerHTML;
            }, this).join('');
        return html;
    },

    /**
     * Calculate popup position
     * @param {{bound: object, isVertical: boolean}} data graph information
     * @param {{width: number, height: number}} dimension popup dimension
     * @returns {{top: number, left: number}}
     */
    calculatePosition: function(data, dimension) {
        var isColumn = data.isColumn,
            bound = data.bound,
            result = {};

        if (isColumn) {
            result.top = bound.top - dimension.height - POPUP_GAP;
            result.left = bound.left + HIDDEN_WIDTH;
        } else {
            result.top = bound.top;
            result.left = bound.width + POPUP_GAP;
        }

        return result;
    },

    /**
     * On show.
     * @param {id: string, bound: object} data
     */
    onShow: function(data) {
        var elPopup = document.getElementById(data.id),
            dimension, position;

        dom.addClass(elPopup, 'show');
        dimension = {
            width: elPopup.offsetWidth,
            height: elPopup.offsetHeight
        };
        position = this.calculatePosition(data, dimension);

        elPopup.style.cssText = [
            ['left:', position.left, 'px'].join(''),
            ['top:', position.top, 'px'].join('')
        ].join(';');
    },

    /**
     * On hide
     * @param data
     */
    onHide: function(data) {
        var elPopup = document.getElementById(data.id);
        dom.removeClass(elPopup, 'show');
    }
});

module.exports = PopupView;