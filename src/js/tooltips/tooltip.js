/**
 * @fileoverview Tooltip component.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var chartConst = require('../const'),
    state = require('../helpers/state'),
    dom = require('../helpers/domHandler'),
    renderUtil = require('../helpers/renderUtil'),
    event = require('../helpers/eventListener'),
    templateMaker = require('../helpers/templateMaker'),
    tooltipTemplate = require('./tooltipTemplate');

var Tooltip = ne.util.defineClass(/** @lends Tooltip.prototype */ {
    /**
     * Tooltip component.
     * @constructs Tooltip
     * @param {object} params parameters
     *      @param {array.<number>} params.values converted values
     *      @param {array} params.labels labels
     *      @param {array} params.legendLabels legend labels
     *      @param {object} params.bound axis bound
     *      @param {object} params.theme axis theme
     */
    init: function(params) {
        var optionTemplate;
        ne.util.extend(this, params);
        /**
         * Tooltip view className
         * @type {string}
         */
        this.className = 'ne-chart-tooltip-area';

        /**
         * Tooltip container.
         * @type {HTMLElement}
         */
        this.container = null;

        /**
         * Tooltip base data.
         * @type {array.<array.<object>>}
         */
        this.data = this._makeTooltipData();

        optionTemplate = this.options.template || '';
        this.tplTooltip = optionTemplate ? templateMaker.template(optionTemplate) : tooltipTemplate.tplDefaultTemplate;
        this.suffix = this.options.suffix ? '&nbsp;' + this.options.suffix : '';
    },

    /**
     * Get tooltip layout element.
     * @returns {HTMLElement} layout element
     * @private
     */
    _getTooltipLayoutElement: function() {
        var elLayout = document.getElementById(this.chartId);
        if (!elLayout) {
            elLayout = dom.create('DIV', this.className);
            elLayout.id = this.chartId;
        }
        return elLayout;
    },

    /**
     * Render tooltip.
     * @param {{position: object}} bound tooltip bound
     * @returns {HTMLElement} tooltip element
     */
    render: function() {
        var el = this._getTooltipLayoutElement(),
            bound = this.bound;

        renderUtil.renderPosition(el, bound.position);

        this.elLayout = el;

        this.attachEvent(el);

        return el;
    },

    /**
     * To make tooltip data.
     * @returns {array.<object>} tooltip data
     * @private
     */
    _makeTooltipData: function() {
        var labels = this.labels,
            groupValues = this.values,
            legendLabels = this.legendLabels;

        return ne.util.map(groupValues, function(values, groupIndex) {
            return ne.util.map(values, function(value, index) {
                return {
                    category: labels ? labels[groupIndex] : '',
                    legend: legendLabels[index],
                    value: value
                };
            });
        });
    },

    /**
     * Fire custom event showAnimation.
     * @param {{groupIndex: number, index: number}} indexes indexes
     * @private
     */
    _fireShowAnimation: function(indexes) {
        this.fire('showAnimation', indexes);
    },

    /**
     * Fire custom event hideAnimation.
     * @param {{groupIndex: number, index: number}} indexes indexes
     * @private
     */
    _fireHideAnimation: function(indexes) {
        this.fire('hideAnimation', indexes);
    },

    /**
     * Set data indexes.
     * @param {HTMLElement} elTooltip tooltip element
     * @param {{groupIndex: number, index:number}} indexes indexes
     * @private
     */
    _setIndexesCustomAttribute: function(elTooltip, indexes) {
        elTooltip.setAttribute('data-groupIndex', indexes.groupIndex);
        elTooltip.setAttribute('data-index', indexes.index);
    },

    /**
     * Get data indexes
     * @param {HTMLElement} elTooltip tooltip element
     * @returns {{groupIndex: number, index: number}} indexes
     * @private
     */
    _getIndexesCustomAttribute: function(elTooltip) {
        var groupIndex = parseInt(elTooltip.getAttribute('data-groupIndex'), 10),
            index = parseInt(elTooltip.getAttribute('data-index'), 10);

        return {
            groupIndex: groupIndex,
            index: index
        };
    },

    /**
     * Set showed custom attribute.
     * @param {HTMLElement} elTooltip tooltip element
     * @param {boolean} status whether showed or not
     * @private
     */
    _setShowedCustomAttribute: function(elTooltip, status) {
        elTooltip.setAttribute('data-showed', status);
    },

    /**
     * Whether showed tooltip or not.
     * @param {HTMLElement} elTooltip tooltip element
     * @returns {boolean} whether showed tooltip or not
     * @private
     */
    _isShowedTooltip: function(elTooltip) {
        return elTooltip.getAttribute('data-showed') === 'true';
    },

    /**
     * On mouseover event handler for tooltip area
     * @param {MouseEvent} e mouse event
     */
    onMouseover: function(e) {
        var elTarget = e.target || e.srcElement,
            indexes;

        if (!dom.hasClass(elTarget, chartConst.TOOLTIP_PREFIX)) {
            elTarget = dom.findParentByClass(elTarget, chartConst.TOOLTIP_PREFIX);
        }

        if (elTarget.id !== this._getTooltipId()) {
            return;
        }

        this._setShowedCustomAttribute(elTarget, true);
        indexes = this._getIndexesCustomAttribute(elTarget);
        this._fireShowAnimation(indexes);
    },

    /**
     * On mouseout event handler for tooltip area
     * @param {MouseEvent} e mouse event
     */
    onMouseout: function(e) {
        var elTarget = e.target || e.srcElement;


        if (!dom.hasClass(elTarget, chartConst.TOOLTIP_PREFIX)) {
            elTarget = dom.findParentByClass(elTarget, chartConst.TOOLTIP_PREFIX);
        }

        if (elTarget.id !== this._getTooltipId()) {
            return;
        }

        this._hideTooltip(elTarget);
    },

    /**
     * Calculate tooltip position about not bar chart.
     * @param {object} params parameters
     *      @param {{bound: object}} params.data graph information
     *      @param {{width: number, height: number}} params.dimension tooltip dimension
     *      @param {string} params.positionOption position option (ex: 'left top')
     * @returns {{top: number, left: number}} position
     * @private
     */
    _calculateTooltipPositionAboutNotBarChart: function(params) {
        var bound = params.bound,
            addPosition = params.addPosition,
            minusWidth = params.dimension.width - (bound.width || 0),
            lineGap = bound.width ? 0 : chartConst.TOOLTIP_GAP,
            positionOption = params.positionOption || '',
            tooltipHeight = params.dimension.height,
            result = {};
        result.left = bound.left + addPosition.left;
        result.top = bound.top - tooltipHeight + addPosition.top;

        if (positionOption.indexOf('left') > -1) {
            result.left -= minusWidth + lineGap;
        } else if (positionOption.indexOf('center') > -1) {
            result.left -= minusWidth / 2;
        } else {
            result.left += lineGap;
        }

        if (positionOption.indexOf('bottom') > -1) {
            result.top += tooltipHeight + lineGap;
        } else if (positionOption.indexOf('middle') > -1) {
            result.top += tooltipHeight / 2;
        } else {
            result.top -= chartConst.TOOLTIP_GAP;
        }

        return result;
    },

    /**
     * Calculate tooltip position about bar chart.
     * @param {object} params parameters
     *      @param {{bound: object}} params.data graph information
     *      @param {{width: number, height: number}} params.dimension tooltip dimension
     *      @param {string} params.positionOption position option (ex: 'left top')
     * @returns {{top: number, left: number}} position
     * @private
     */
    _calculateTooltipPositionAboutBarChart: function(params) {
        var bound = params.bound,
            addPosition = params.addPosition,
            minusHeight = params.dimension.height - (bound.height || 0),
            positionOption = params.positionOption || '',
            tooltipWidth = params.dimension.width,
            result = {};

        result.left = bound.left + bound.width + addPosition.left;
        result.top = bound.top + addPosition.top;

        // TODO : positionOptions을 객체로 만들어서 검사하도록 변경하기 ex) positionOption.left = true
        if (positionOption.indexOf('left') > -1) {
            result.left -= tooltipWidth;
        } else if (positionOption.indexOf('center') > -1) {
            result.left -= tooltipWidth / 2;
        } else {
            result.left += chartConst.TOOLTIP_GAP;
        }

        if (positionOption.indexOf('top') > -1) {
            result.top -= minusHeight;
        } else if (positionOption.indexOf('middle') > -1) {
            result.top -= minusHeight / 2;
        }

        return result;
    },

    /**
     * Calculate tooltip position.
     * @param {object} params parameters
     *      @param {{left: number, top: number, width: number, height: number}} params.bound graph bound
     *      @param {string} params.chartType chart type
     *      @param {boolean} params.allowNegativeTooltip whether allow negative tooltip or not
     *      @param {{width: number, height: number}} params.dimension tooltip dimension
     *      @param {string} params.positionOption position option (ex: 'left top')
     * @returns {{top: number, left: number}} position
     * @private
     */
    _calculateTooltipPosition: function(params) {
        var result = {},
            sizeType, positionType, addPadding;
        if (params.chartType === chartConst.CHART_TYPE_BAR) {
            result = this._calculateTooltipPositionAboutBarChart(params);
            sizeType = 'width';
            positionType = 'left';
            addPadding = 1;
        } else {
            result = this._calculateTooltipPositionAboutNotBarChart(params);
            sizeType = 'height';
            positionType = 'top';
            addPadding = -1;
        }

        if (params.allowNegativeTooltip) {
            result = this._moveToSymmetry(result, {
                bound: params.bound,
                indexes: params.indexes,
                dimension: params.dimension,
                sizeType: sizeType,
                positionType: positionType,
                addPadding: addPadding
            });
        }
        return result;
    },

    /**
     * Get value by indexes.
     * @param {{groupIndex: number, index: number}} indexes indexes
     * @returns {(string | number)} value
     * @private
     */
    _getValueByIndexes: function(indexes) {
        return this.values[indexes.groupIndex][indexes.index];
    },

    /**
     * Move to symmetry.
     * @param {{left: number, top: number}} position tooltip position
     * @param {object} params parameters
     *      @param {{left: number, top: number, width: number, height: number}} params.bound graph bound
     *      @param {string} params.id tooltip id
     *      @param {{width: number, height: number}} params.dimension tooltip dimension
     *      @param {string} params.sizeType size type (width or height)
     *      @param {string} params.positionType position type (left or top)
     *      @param {number} params.addPadding add padding
     * @returns {{left: number, top: number}} moved position
     * @private
     */
    _moveToSymmetry: function(position, params) {
        var bound = params.bound,
            sizeType = params.sizeType,
            positionType = params.positionType,
            value = this._getValueByIndexes(params.indexes),
            center;

        if (value < 0) {
            center = bound[positionType] + (bound[sizeType] / 2) + (params.addPadding || 0);
            position[positionType] = position[positionType] - (position[positionType] - center) * 2 - params.dimension[sizeType];
        }

        return position;
    },

    /**
     * Create tooltip element.
     * @returns {HTMLElement} tooltip element
     * @private
     */
    _createTooltipElement: function() {
        if (!this.elLayout.firstChild) {
            this.elLayout.innerHTML = tooltipTemplate.tplTooltip();
        }
        return this.elLayout.firstChild;
    },

    /**
     * Get tooltip element.
     * @returns {HTMLElement} tooltip element
     * @private
     */
    _getTooltipElement: function() {
        if (!this.elTooltip) {
            this.elTooltip = this._createTooltipElement();
        }
        return this.elTooltip;
    },

    /**
     * Get tooltip id.
     * @returns {string} tooltip id
     * @private
     */
    _getTooltipId: function() {
        if (!this.tooltipId) {
            this.tooltipId = chartConst.TOOLTIP_ID_PREFIX + '-' + (new Date()).getTime();
        }
        return this.tooltipId;
    },

    /**
     * To make tooltip html.
     * @param {{groupIndex: number, index: number}} indexes indexes
     * @returns {string} tooltip html
     * @private
     */
    _makeTooltipHtml: function(indexes) {
        var data = this.data[indexes.groupIndex][indexes.index];
        data.suffix = this.suffix;
        return this.tplTooltip(data);
    },

    /**
     * onShow is callback of custom event showTooltip for SeriesView.
     * @param {{indexes: {groupIndex: number, index: number}, bound: object}} params tooltip data
     */
    onShow: function(params) {
        var elTooltip = this._getTooltipElement(),
            prevPosition;
        if (elTooltip.offsetWidth) {
            prevPosition = {
                left: elTooltip.offsetLeft,
                top: elTooltip.offsetTop
            };
        }

        this._showTooltip(elTooltip, params, prevPosition);
    },

    /**
     * Show tooltip.
     * @param {HTMLElement} elTooltip tooltip element
     * @param {{indexes: {groupIndex: number, index: number}, bound: object}} params tooltip data
     * @param {{left: number, top: number}} prevPosition prev position
     * @private
     */
    _showTooltip: function(elTooltip, params, prevPosition) {
        var indexes = params.indexes;
        elTooltip.id = this._getTooltipId();
        elTooltip.innerHTML = this._makeTooltipHtml(indexes);

        this._setIndexesCustomAttribute(elTooltip, indexes);
        this._setShowedCustomAttribute(elTooltip, true);
        dom.addClass(elTooltip, 'show');

        this._moveToPosition(elTooltip, params, prevPosition);
        this._fireShowAnimation(indexes);
    },

    /**
     * Move to Position.
     * @param {HTMLElement} elTooltip tooltip element
     * @param {{indexes: {groupIndex: number, index: number}, bound: object}} params tooltip data
     * @param {{left: number, top: number}} prevPosition prev position
     * @private
     */
    _moveToPosition: function(elTooltip, params, prevPosition) {
        var addPosition = ne.util.extend({
                left: 0,
                top: 0
            }, this.options.addPosition),
            positionOption = this.options.position || '',
            position = this._calculateTooltipPosition(ne.util.extend({
                dimension: {
                    width: elTooltip.offsetWidth,
                    height: elTooltip.offsetHeight
                },
                addPosition: addPosition,
                positionOption: positionOption || ''
            }, params));
        if (prevPosition) {
            if (this.activeHider) {
                window.clearInterval(this.activeHider.timerId);
                this.activeHider.setOpacity(1);
            }
            this._slideTooltip(elTooltip, prevPosition, position);
        } else {
            elTooltip.style.cssText = [
                renderUtil.concatStr('left:', position.left, 'px'),
                renderUtil.concatStr('top:', position.top, 'px')
            ].join(';');
        }
    },

    /**
     * Get slider.
     * @param {HTMLElement} element element
     * @param {string} type slide type (horizontal or vertical)
     * @returns {object} effect object
     * @private
     */
    _getSlider: function(element, type) {
        if (!this.slider) {
            this.slider = {};
        }

        if (!this.slider[type]) {
            this.slider[type] = new ne.component.Effects.Slide({
                flow: type,
                element: element,
                duration: 100
            });
        }
        return this.slider[type];
    },

    /**
     * Slide tooltip
     * @param {HTMLElement} elTooltip tooltip element
     * @param {{left: number, top: number}} prevPosition prev position
     * @param {{left: number, top: number}} position position
     * @private
     */
    _slideTooltip: function(elTooltip, prevPosition, position) {
        var vSlider = this._getSlider(elTooltip, 'vertical'),
            hSlider = this._getSlider(elTooltip, 'horizontal'),
            moveTop = prevPosition.top - position.top,
            moveLeft = prevPosition.left - position.left,
            vDirection = moveTop > 0 ? 'forword' : 'backword',
            hDirection = moveTop > 0 ? 'forword' : 'backword';

        if (moveTop) {
            vSlider.setDistance(moveTop);
            vSlider.action({
                direction: vDirection,
                start: prevPosition.top,
                complete: function() {}
            });
        }

        if (moveLeft) {
            hSlider.setDistance(moveLeft);
            hSlider.action({
                direction: hDirection,
                start: prevPosition.left,
                complete: function() {}
            });
        }
    },

    /**
     * onHide is callback of custom event hideTooltip for SeriesView
     * @param {{id: string}} data tooltip data
     */
    onHide: function() {
        var elTooltip = this._getTooltipElement();
        this._hideTooltip(elTooltip);
    },

    /**
     * Get hider.
     * @param {HTMLElement} element element
     * @returns {object} effect object
     * @private
     */
    _getHider: function(element) {
        if (!this.hider) {
            this.hider = new ne.component.Effects.Fade({
                element: element,
                duration: 100
            });
        }

        return this.hider;
    },

    /**
     * Hide tooltip.
     * @param {HTMLElement} elTooltip tooltip element
     * @param {function} callback callback
     * @private
     */
    _hideTooltip: function(elTooltip) {
        var that = this,
            indexes = this._getIndexesCustomAttribute(elTooltip);
        this._setShowedCustomAttribute(elTooltip, false);
        this._fireHideAnimation(indexes);

        if (this.prevIndexes === indexes) {
            delete this.prevIndexes;
        }
        setTimeout(function() {
            if (that._isShowedTooltip(elTooltip)) {
                return;
            }
            that.activeHider = that._getHider(elTooltip);
            that.activeHider.action({
                start: 1,
                end: 0,
                complete: function() {
                    dom.removeClass(elTooltip, 'show');
                    elTooltip.style.cssText = '';
                }
            });

            that = null;
            indexes = null;
        }, chartConst.HIDE_DELAY);
    },

    /**
     * Attach event
     * @param {HTMLElement} el target element
     */
    attachEvent: function(el) {
        event.bindEvent('mouseover', el, ne.util.bind(this.onMouseover, this));
        event.bindEvent('mouseout', el, ne.util.bind(this.onMouseout, this));
    }
});

ne.util.CustomEvents.mixin(Tooltip);

module.exports = Tooltip;
