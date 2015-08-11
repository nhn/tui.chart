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

var TOOLTIP_GAP = 5,
    LINE_TOOLTIP_GAP = 3,
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
     * Calculate tooltip position of vertical type chart
     * @param {object} params parameters
     *      @param {{bound: object, isVertical: boolean}} params.data graph information
     *      @param {{width: number, height: number}} params.dimension tooltip dimension
     *      @param {string} params.positionOption position option (ex: 'left top')
     * @returns {{top: number, left: number}} position
     * @private
     */
    _calculateVerticalPosition: function(params) {
        var bound = params.data.bound,
            minusWidth = params.dimension.width - (bound.width || 0),
            lineGap = bound.width ? 0 : TOOLTIP_GAP,
            positionOption = params.positionOption || '',
            tooltipHeight = params.dimension.height,
            result = {};

        result.left = bound.left + (HIDDEN_WIDTH * 2);
        result.top = bound.top - tooltipHeight;

        if (positionOption.indexOf('left') > -1) {
            result.left -= minusWidth + lineGap;
        } else if (positionOption.indexOf('center') > -1) {
            result.left -= minusWidth / 2;
        } else {
            result.left += lineGap;
        }

        if (positionOption.indexOf('bottom') > -1) {
            result.top += tooltipHeight - HIDDEN_WIDTH + lineGap;
        } else if (positionOption.indexOf('middle') > -1) {
            result.top += tooltipHeight / 2;
        } else {
            result.top -= TOOLTIP_GAP + HIDDEN_WIDTH;
        }

        return result;
    },

    /**
     * Calculate tooltip position of bar chart
     * @param {object} params parameters
     *      @param {{bound: object, isVertical: boolean}} params.data graph information
     *      @param {{width: number, height: number}} params.dimension tooltip dimension
     *      @param {string} params.positionOption position option (ex: 'left top')
     * @returns {{top: number, left: number}} position
     * @private
     */
    _calculateBarPosition: function(params) {
        var bound = params.data.bound,
            minusHeight = params.dimension.height - (bound.height || 0),
            positionOption = params.positionOption || '',
            tooltipWidth = params.dimension.width,
            result = {};

        result.left = bound.left + bound.width;
        result.top = bound.top;

        if (positionOption.indexOf('left') > -1) {
            result.left -= tooltipWidth;
        } else if (positionOption.indexOf('center') > -1) {
            result.left -= tooltipWidth / 2;
        } else {
            result.left += TOOLTIP_GAP;
        }

        if (positionOption.indexOf('top') > -1) {
            result.top -= minusHeight + HIDDEN_WIDTH;
        } else if (positionOption.indexOf('middle') > -1) {
            result.top -= minusHeight / 2;
        } else {
            result.top -= HIDDEN_WIDTH * 2;
        }
        return result;
    },

    /**
     * Calculate tooltip position.
     * @param {object} params parameters
     *      @param {{bound: object, isVertical: boolean}} params.data graph information
     *      @param {{width: number, height: number}} params.dimension tooltip dimension
     *      @param {string} params.positionOption position option (ex: 'left top')
     * @returns {{top: number, left: number}} position
     * @private
     */
    _calculatePosition: function(params) {
        var result = {};

        if (params.data.isVertical) {
            result = this._calculateVerticalPosition(params);
        } else {
            result = this._calculateBarPosition(params);
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
            positionOption = this.model.options.position || this.model.defaultPosition,
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

        position = this._calculatePosition({
            data: data,
            dimension: dimension,
            positionOption: positionOption || ''
        });

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