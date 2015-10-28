/**
 * @fileoverview Tooltip component.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var TooltipBase = require('./tooltipBase'),
    chartConst = require('../const'),
    dom = require('../helpers/domHandler'),
    event = require('../helpers/eventListener'),
    templateMaker = require('../helpers/templateMaker'),
    tooltipTemplate = require('./tooltipTemplate');

var Tooltip = ne.util.defineClass(TooltipBase, /** @lends Tooltip.prototype */ {
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
        TooltipBase.call(this, params);
        this.tplTooltip = this._getTooltipTemplate(this.options.template);
        this._setDefaultTooltipPositionOption();
    },

    /**
     * Get tooltip template.
     * @param {object} optionTemplate template option
     * @returns {object} template
     * @private
     */
    _getTooltipTemplate: function(optionTemplate) {
        return optionTemplate ? templateMaker.template(optionTemplate) : tooltipTemplate.tplDefault;
    },

    /**
     * Set default position option of tooltip.
     * @private
     */
    _setDefaultTooltipPositionOption: function() {
        if (this.options.position) {
            return;
        }

        if (this.isVertical) {
            this.options.position = chartConst.TOOLTIP_DEFAULT_VERTICAL_POSITION_OPTION;
        } else {
            this.options.position = chartConst.TOOLTIP_DEFAULT_HORIZONTAL_POSITION_OPTION;
        }
    },

    /**
     * Render tooltip.
     * @param {{position: object}} bound tooltip bound
     * @returns {HTMLElement} tooltip element
     */
    render: function() {
        var el = TooltipBase.prototype.render.call(this);
        this.attachEvent(el);
        return el;
    },

    /**
     * To make tooltip data.
     * @returns {array.<object>} tooltip data
     */
    makeTooltipData: function() {
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
        var groupIndex = elTooltip.getAttribute('data-groupIndex'),
            index = elTooltip.getAttribute('data-index'),
            indexes;
        if (groupIndex && index) {
            indexes = {
                groupIndex: parseInt(groupIndex, 10),
                index: parseInt(index, 10)
            };
        }
        return indexes;
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

        indexes = this._getIndexesCustomAttribute(elTarget);

        this._setShowedCustomAttribute(elTarget, true);

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

        this.hideTooltip(elTarget);
    },

    /**
     * To calculate tooltip position abount pie chart.
     * @param {object} params parameters
     *      @param {{left: number, top: number}} params.bound bound
     *      @param {{clientX: number, clientY: number}} params.eventPosition mouse position
     * @returns {{top: number, left: number}} position
     * @private
     */
    _calculateTooltipPositionAboutPieChart: function(params) {
        params.bound.left = params.eventPosition.clientX - this.seriesPosition.left;
        params.bound.top = params.eventPosition.clientY - this.seriesPosition.top;
        return this._calculateTooltipPositionAboutNotBarChart(params);
    },

    /**
     * To calculate tooltip position about not bar chart.
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
     * To calculate tooltip position about bar chart.
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

        if (params.eventPosition) {
            return this._calculateTooltipPositionAboutPieChart(params);
        }

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

    _isChangedIndexes: function(prevIndexes, indexes) {
        return !!prevIndexes && (prevIndexes.groupIndex !== indexes.groupIndex || prevIndexes.index !== indexes.index);
    },

    /**
     * Show tooltip.
     * @param {HTMLElement} elTooltip tooltip element
     * @param {{indexes: {groupIndex: number, index: number}, bound: object}} params tooltip data
     * @param {{left: number, top: number}} prevPosition prev position
     */
    showTooltip: function(elTooltip, params, prevPosition) {
        var indexes = params.indexes,
            curIndexes = this._getIndexesCustomAttribute(elTooltip),
            position;

        if (elTooltip.id === this._getTooltipId() && this._isChangedIndexes(curIndexes, indexes)) {
            this._fireHideAnimation(curIndexes);
        }

        elTooltip.id = this._getTooltipId();
        elTooltip.innerHTML = this._makeTooltipHtml(indexes);

        this._setIndexesCustomAttribute(elTooltip, indexes);
        this._setShowedCustomAttribute(elTooltip, true);

        dom.addClass(elTooltip, 'show');

        position = this._calculateTooltipPosition(ne.util.extend({
            dimension: this.getTooltipDimension(elTooltip),
            addPosition: ne.util.extend({
                left: 0,
                top: 0
            }, this.options.addPosition),
            positionOption: this.options.position || '',
            eventPosition: params.eventPosition
        }, params));

        this.moveToPosition(elTooltip, position, prevPosition);
        this._fireShowAnimation(indexes);
    },

    /**
     * Hide tooltip.
     * @param {HTMLElement} elTooltip tooltip element
     * @param {function} callback callback
     */
    hideTooltip: function(elTooltip) {
        var that = this,
            indexes = this._getIndexesCustomAttribute(elTooltip);
        this._setShowedCustomAttribute(elTooltip, false);
        this._fireHideAnimation(indexes);

        if (this._isChangedIndexes(this.prevIndexes, indexes)) {
            delete this.prevIndexes;
        }

        setTimeout(function() {
            if (that._isShowedTooltip(elTooltip)) {
                return;
            }
            that.hideAnimation(elTooltip);

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
