/**
 * @fileoverview PopupView render popup area.
 * @author NHN Ent.
 *         FE Development Team <jiung.kang@nhnent.com>
 */

'use strict';

var dom = require('./domHandler.js'),
    View = require('./view.js'),
    event = require('./eventListener.js'),
    templateMaker = require('./templateMaker.js'),
    popupTemplate = require('./popupTemplate.js');

var POPUP_GAP = 5,
    HIDDEN_WIDTH = 1,
    TOOLTIP_CLASS_NAME = 'ne-chart-popup',
    HIDE_DELAY = 0;

/**
 * @classdesc PopupView render popup area.
 * @class
 * @augments View
 */
var PopupView = ne.util.defineClass(View, {
    /**
     * Constructor
     * @param {object} model popup model
     * @param {object} theme popup theme
     */
    init: function(model, theme) {
        /**
         * Popup model
         * @type {object}
         */
        this.model = model;

        this.theme = theme;

        /**
         * Popup view className
         * @type {string}
         */
        this.className = 'ne-chart-popup-area';

        View.call(this);
    },

    /**
     * Popup view renderer.
     * @param {{position: object}} bound popup bound
     * @param {string} prefix popup id prefix
     * @returns {HTMLElement} popup element
     */
    render: function(bound, prefix) {
        this.renderPosition(bound.position);

        this.el.innerHTML = this._makePopupsHtml(this.model.data, prefix);

        this.attachEvent();
        return this.el;
    },

    /**
     * Makes popup html.
     * @param {object} data popup data
     * @param {string} prefix popup id prefix
     * @returns {string} html
     * @private
     */
    _makePopupsHtml: function(data, prefix) {
        var options = this.model.options,
            optionTemplate = options.template ? options.template : '',
            tplPopup = optionTemplate ? templateMaker.template(optionTemplate) : popupTemplate.TPL_POPUP,
            suffix = options.suffix ? '&nbsp;' + options.suffix : '',
            html = ne.util.map(data, function(popupData) {
                var id = prefix + popupData.id,
                    elTemp = dom.createElement('DIV');

                popupData = ne.util.extend({
                    label: '',
                    legendLabel: '',
                    value: '',
                    suffix: suffix
                }, popupData);

                elTemp.innerHTML = tplPopup(popupData);
                elTemp.firstChild.id = id;

                return elTemp.innerHTML;
            }, this).join('');
        return html;
    },

    /**
     * Attach event
     */
    attachEvent: function() {
        event.bindEvent('mouseover', this.el, ne.util.bind(this.onMouseover, this));
        event.bindEvent('mouseout', this.el, ne.util.bind(this.onMouseout, this));
    },

    /**
     * Get index from id
     * @param {string} id id
     * @returns {array} indexes
     * @private
     */
    _getIndexFromId: function(id) {
        var ids = id.split('-'),
            sliceIndex = ids.length - 2;
        return ids.slice(sliceIndex);
    },

    /**
     * Fire showDot custom event.
     * @param {string} id id
     * @private
     */
    _fireShowDot: function(id) {
        var indexes = this._getIndexFromId(id);
        this.fire('showDot', {
            groupIndex: indexes[0],
            index: indexes[1]
        });
    },

    /**
     * Fire hideDot custom event.
     * @param {string} id id
     * @private
     */
    _fireHideDot: function(id) {
        var indexes = this._getIndexFromId(id);
        this.fire('hideDot', {
            groupIndex: indexes[0],
            index: indexes[1]
        });
    },

    /**
     * On mouseover
     * @param {MouseEvent} e mouse event
     */
    onMouseover: function(e) {
        var elTarget = e.target || e.srcElement,
            id;

        if (!dom.hasClass(elTarget, TOOLTIP_CLASS_NAME)) {
            elTarget = dom.findParentByClass(elTarget, TOOLTIP_CLASS_NAME);
        }

        this.showedId = id = elTarget.id;
        this._fireShowDot(id);
    },

    /**
     * On mouseout
     * @param {MouseEvent} e mouse event
     */
    onMouseout: function(e) {
        var elTarget = e.target || e.srcElement,
            that = this,
            indexes;

        if (!dom.hasClass(elTarget, TOOLTIP_CLASS_NAME)) {
            elTarget = dom.findParentByClass(elTarget, TOOLTIP_CLASS_NAME);
        }

        indexes = this._getIndexFromId(elTarget.id);

        this._hideTooltip(elTarget, function() {
            that.fire('hideDot', {
                groupIndex: indexes[0],
                index: indexes[1]
            });
        });
    },

    /**
     * Calculate popup position
     * @param {{bound: object, isVertical: boolean}} data graph information
     * @param {{width: number, height: number}} dimension popup dimension
     * @returns {{top: number, left: number}} position
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
     * This is custom event callback of SeriesView.
     * @param {{id: string, bound: object}} data popup data
     */
    onShow: function(data) {
        var elTooltip = document.getElementById(data.id),
            dimension, position;

        if (this.showedId) {
            dom.removeClass(elTooltip, 'show');
            this._fireHideDot(this.showedId);
        }

        this.showedId = data.id;
        dom.addClass(elTooltip, 'show');
        dimension = {
            width: elTooltip.offsetWidth,
            height: elTooltip.offsetHeight
        };
        position = this.calculatePosition(data, dimension);

        elTooltip.style.cssText = [
            this.concatStr('left:', position.left, 'px'),
            this.concatStr('top:', position.top, 'px')
        ].join(';');

        this._fireShowDot(data.id);
    },

    /**
     * This is custom event callback of SeriesView.
     * @param {{id: string}} data popup data
     */
    onHide: function(data) {
        var elTooltip = document.getElementById(data.id),
            that = this;

        this._hideTooltip(elTooltip, function() {
            var indexes = that._getIndexFromId(data.id);

            that.fire('hideDot', {
                groupIndex: indexes[0],
                index: indexes[1]
            });

            data = null;
            elTooltip = null;
            that = null;
        });
    },

    /**
     * Hide tooltip.
     * @param {HTMLElement} elTooltip tooltip element
     * @param {function} callback callback
     * @private
     */
    _hideTooltip: function(elTooltip, callback) {
        var that = this;
        delete this.showedId;
        setTimeout(function() {
            if (that.showedId === elTooltip.id) {
                return;
            }

            dom.removeClass(elTooltip, 'show');
            if (callback) {
                callback();
            }

            that = null;
        }, HIDE_DELAY);
    }
});

module.exports = PopupView;