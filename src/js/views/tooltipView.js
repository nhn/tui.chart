/**
 * @fileoverview TooltipView render tooltip area.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var dom = require('./domHandler.js'),
    View = require('./view.js'),
    event = require('./eventListener.js'),
    templateMaker = require('./templateMaker.js'),
    tooltipTemplate = require('./tooltipTemplate.js');

var POPUP_GAP = 5,
    HIDDEN_WIDTH = 1,
    TOOLTIP_CLASS_NAME = 'ne-chart-tooltip',
    HIDE_DELAY = 0;

var TooltipView = ne.util.defineClass(View, /** @lends TooltipView.prototype */ {
    /**
     * TooltipView render tooltip area.
     * @constructs TooltipView
     * @extends View
     * @param {object} model tooltip model
     * @param {object} theme tooltip theme
     */
    init: function(model, theme) {
        /**
         * Tooltip model
         * @type {object}
         */
        this.model = model;

        this.theme = theme;

        /**
         * Tooltip view className
         * @type {string}
         */
        this.className = 'ne-chart-tooltip-area';

        View.call(this);
    },

    /**
     * Tooltip view renderer.
     * @param {{position: object}} bound tooltip bound
     * @param {string} prefix tooltip id prefix
     * @returns {HTMLElement} tooltip element
     */
    render: function(bound, prefix) {
        this.renderPosition(bound.position);

        this.el.innerHTML = this._makeTooltipsHtml(this.model.data, prefix);

        this.attachEvent();
        return this.el;
    },

    /**
     * To make html of tooltip.
     * @param {object} data tooltip data
     * @param {string} prefix tooltip id prefix
     * @returns {string} html
     * @private
     */
    _makeTooltipsHtml: function(data, prefix) {
        var options = this.model.options,
            optionTemplate = options.template ? options.template : '',
            tplOuter = tooltipTemplate.TPL_TOOLTIP,
            tplTooltip = optionTemplate ? templateMaker.template(optionTemplate) : tooltipTemplate.TPL_DEFAULT_TEMPLATE,
            suffix = options.suffix ? '&nbsp;' + options.suffix : '',
            html = ne.util.map(data, function(tooltipData) {
                var id = prefix + tooltipData.id,
                    tooltipHtml;

                tooltipData = ne.util.extend({
                    label: '',
                    legendLabel: '',
                    value: '',
                    suffix: suffix
                }, tooltipData);
                tooltipHtml = tplTooltip(tooltipData);

                return tplOuter({
                    id: id,
                    html: tooltipHtml
                });
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
     * @param {string} id tooltip id
     * @returns {array.<number>} indexes
     * @private
     */
    _getIndexFromId: function(id) {
        var ids = id.split('-'),
            sliceIndex = ids.length - 2;
        return ids.slice(sliceIndex);
    },

    /**
     * Fire custom event showDot.
     * @param {string} id tooltip id
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
     * Fire custom event hideDot.
     * @param {string} id tooltip id
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
     * On mouseover event handler for tooltip area
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
     * On mouseout event handler for tooltip area
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
     * Calculate tooltip position.
     * @param {{bound: object, isVertical: boolean}} data graph information
     * @param {{width: number, height: number}} dimension tooltip dimension
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
     * onShow is callback of custom event showTooltip for SeriesView.
     * @param {{id: string, bound: object}} data tooltip data
     */
    onShow: function(data) {
        var elTooltip = document.getElementById(data.id),
            addPosition = ne.util.extend({
                left: 0,
                top: 0
            }, this.model.options.addPosition),
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
            this.concatStr('left:', position.left + addPosition.left, 'px'),
            this.concatStr('top:', position.top + addPosition.top, 'px')
        ].join(';');

        this._fireShowDot(data.id);
    },

    /**
     * onHide is callback of custom event hideTooltip for SeriesView
     * @param {{id: string}} data tooltip data
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

module.exports = TooltipView;