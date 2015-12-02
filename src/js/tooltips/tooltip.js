/**
 * @fileoverview Tooltip component.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var TooltipBase = require('./tooltipBase'),
    chartConst = require('../const'),
    predicate = require('../helpers/predicate'),
    dom = require('../helpers/domHandler'),
    eventListener = require('../helpers/eventListener'),
    renderUtil = require('../helpers/renderUtil'),
    templateMaker = require('../helpers/templateMaker'),
    tooltipTemplate = require('./tooltipTemplate');

var Tooltip = tui.util.defineClass(TooltipBase, /** @lends Tooltip.prototype */ {
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
        var values;

        TooltipBase.call(this, params);
        this.tplTooltip = this._getTooltipTemplate(this.options.template);
        if (tui.util.isArray(this.values)) {
            values = this.values;
            this.values = {};
            this.values[this.chartType] = values;
        }
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
     * Set default align option of tooltip.
     * @private
     * @override
     */
    _setDefaultTooltipPositionOption: function() {
        if (this.options.align) {
            return;
        }

        if (this.isVertical) {
            this.options.align = chartConst.TOOLTIP_DEFAULT_ALIGN_OPTION;
        } else {
            this.options.align = chartConst.TOOLTIP_DEFAULT_HORIZONTAL_ALIGN_OPTION;
        }
    },

    /**
     * Render tooltip component.
     * @param {{position: object}} bound tooltip bound
     * @param {?{seriesPosition: {left: number, top: number}}} data rendering data
     * @returns {HTMLElement} tooltip element
     * @override
     */
    render: function(bound, data) {
        var el = TooltipBase.prototype.render.call(this, bound, data);

        if (data) {
            this.seriesPosition = data.seriesPosition;
        }

        this._attachEvent(el);
        return el;
    },

    /**
     * Resize tooltip component.
     * @param {{position: object}} bound tooltip bound
     * @param {?{seriesPosition: {left: number, top: number}}} data rendering data
     * @override
     */
    resize: function(bound, data) {
        if (data) {
            this.seriesPosition = data.seriesPosition;
        }
        TooltipBase.prototype.resize.call(this, bound, data);
    },

    /**
     * Make tooltip data.
     * @returns {array.<object>} tooltip data
     * @override
     */
    makeTooltipData: function() {
        var labels = this.labels,
            tooltipData = {},
            legendLabels = {};

        if (tui.util.isArray(this.formattedValues)) {
            tooltipData[this.chartType] = this.formattedValues;
            legendLabels[this.chartType] = this.legendLabels;
        } else {
            tooltipData = this.formattedValues;
            legendLabels = this.legendLabels;
        }

        tui.util.forEach(tooltipData, function(groupValues, chartType) {
            tooltipData[chartType] = tui.util.map(groupValues, function(values, groupIndex) {
                return tui.util.map(values, function(value, index) {
                    return {
                        category: labels ? labels[groupIndex] : '',
                        legend: legendLabels[chartType][index],
                        value: value
                    };
                });
            });
        });
        return tooltipData;
    },

    /**
     * Fire custom event showAnimation.
     * @param {{groupIndex: number, index: number}} indexes indexes
     * @param {string} chartType chart type
     * @private
     */
    _fireShowAnimation: function(indexes, chartType) {
        var eventName = renderUtil.makeCustomEventName('show', chartType, 'animation');

        this.fire(eventName, indexes);
    },

    /**
     * Fire custom event hideAnimation.
     * @param {{groupIndex: number, index: number}} indexes indexes
     * @param {string} chartType chart type
     * @private
     */
    _fireHideAnimation: function(indexes, chartType) {
        var eventName = renderUtil.makeCustomEventName('hide', chartType, 'animation');

        this.fire(eventName, indexes);
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
            indexes = null;

        if (!tui.util.isNull(groupIndex) && !tui.util.isNull(index)) {
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
        var isShowed = elTooltip.getAttribute('data-showed');

        return isShowed === 'true' || isShowed === true; // ie7에서는 boolean형태의 true를 반환함
    },

    /**
     * On mouseover event handler for tooltip area
     * @private
     * @param {MouseEvent} e mouse event
     */
    _onMouseover: function(e) {
        var elTarget = e.target || e.srcElement,
            indexes, chartType;

        if (!dom.hasClass(elTarget, chartConst.TOOLTIP_PREFIX)) {
            elTarget = dom.findParentByClass(elTarget, chartConst.TOOLTIP_PREFIX);
        }

        indexes = this._getIndexesCustomAttribute(elTarget);
        chartType = elTarget.getAttribute('data-chart-type');

        this._setShowedCustomAttribute(elTarget, true);
        this._fireShowAnimation(indexes, chartType);
    },

    /**
     * On mouseout event handler for tooltip area
     * @private
     * @param {MouseEvent} e mouse event
     */
    _onMouseout: function(e) {
        var elTarget = e.target || e.srcElement;

        if (!dom.hasClass(elTarget, chartConst.TOOLTIP_PREFIX)) {
            elTarget = dom.findParentByClass(elTarget, chartConst.TOOLTIP_PREFIX);
        }

        this.hideTooltip(elTarget);
    },

    /**
     * Calculate tooltip position abount pie chart.
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
     * Calculate tooltip position about not bar chart.
     * @param {object} params parameters
     *      @param {{bound: object}} params.data graph information
     *      @param {{width: number, height: number}} params.dimension tooltip dimension
     *      @param {string} params.alignOption position option (ex: 'left top')
     * @returns {{top: number, left: number}} position
     * @private
     */
    _calculateTooltipPositionAboutNotBarChart: function(params) {
        var bound = params.bound,
            positionOption = params.positionOption,
            minusWidth = params.dimension.width - (bound.width || 0),
            lineGap = bound.width ? 0 : chartConst.TOOLTIP_GAP,
            alignOption = params.alignOption || '',
            tooltipHeight = params.dimension.height,
            result = {};

        result.left = bound.left + positionOption.left;
        result.top = bound.top - tooltipHeight + positionOption.top;

        if (alignOption.indexOf('left') > -1) {
            result.left -= minusWidth + lineGap;
        } else if (alignOption.indexOf('center') > -1) {
            result.left -= minusWidth / 2;
        } else {
            result.left += lineGap;
        }

        if (alignOption.indexOf('bottom') > -1) {
            result.top += tooltipHeight + lineGap;
        } else if (alignOption.indexOf('middle') > -1) {
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
     *      @param {string} params.alignOption position option (ex: 'left top')
     * @returns {{top: number, left: number}} position
     * @private
     */
    _calculateTooltipPositionAboutBarChart: function(params) {
        var bound = params.bound,
            positionOption = params.positionOption,
            minusHeight = params.dimension.height - (bound.height || 0),
            alignOption = params.alignOption || '',
            tooltipWidth = params.dimension.width,
            result = {};

        result.left = bound.left + bound.width + positionOption.left;
        result.top = bound.top + positionOption.top;

        // TODO : alignOptions을 객체로 만들어서 검사하도록 변경하기 ex) alignOption.left = true
        if (alignOption.indexOf('left') > -1) {
            result.left -= tooltipWidth;
        } else if (alignOption.indexOf('center') > -1) {
            result.left -= tooltipWidth / 2;
        } else {
            result.left += chartConst.TOOLTIP_GAP;
        }

        if (alignOption.indexOf('top') > -1) {
            result.top -= minusHeight;
        } else if (alignOption.indexOf('middle') > -1) {
            result.top -= minusHeight / 2;
        }

        return result;
    },

    /**
     * Adjust position.
     * @param {{width: number, height: number}} chartDimension chart dimension
     * @param {{left: number, top: number}} areaPosition area position
     * @param {{width: number, height: number}} tooltipDimension tooltip dimension
     * @param {{left: number, top: number}} position position
     * @returns {{left: number, top: number}} adjusted position
     * @private
     */
    _adjustPosition: function(chartDimension, areaPosition, tooltipDimension, position) {
        position.left = tui.util.max([position.left, -areaPosition.left]);
        position.left = tui.util.min([position.left, chartDimension.width - areaPosition.left - tooltipDimension.width]);
        position.top = tui.util.max([position.top, -areaPosition.top]);
        position.top = tui.util.min([position.top, chartDimension.height - areaPosition.top - tooltipDimension.height]);
        return position;
    },

    /**
     * Calculate tooltip position.
     * @param {object} params parameters
     *      @param {{left: number, top: number, width: number, height: number}} params.bound graph bound
     *      @param {string} params.chartType chart type
     *      @param {boolean} params.allowNegativeTooltip whether allow negative tooltip or not
     *      @param {{width: number, height: number}} params.dimension tooltip dimension
     *      @param {string} params.alignOption position option (ex: 'left top')
     * @returns {{top: number, left: number}} position
     * @private
     */
    _calculateTooltipPosition: function(params) {
        var position = {},
            sizeType, positionType, addPadding;

        if (params.eventPosition) {
            return this._calculateTooltipPositionAboutPieChart(params);
        }

        if (predicate.isBarChart(params.chartType)) {
            position = this._calculateTooltipPositionAboutBarChart(params);
            sizeType = 'width';
            positionType = 'left';
            addPadding = 1;
        } else {
            position = this._calculateTooltipPositionAboutNotBarChart(params);
            sizeType = 'height';
            positionType = 'top';
            addPadding = -1;
        }

        if (params.allowNegativeTooltip) {
            position = this._moveToSymmetry(position, {
                bound: params.bound,
                indexes: params.indexes,
                dimension: params.dimension,
                chartType: params.chartType,
                sizeType: sizeType,
                positionType: positionType,
                addPadding: addPadding
            });
        }

        position = this._adjustPosition(this.chartDimension, this.bound.position, params.dimension, position);
        return position;
    },

    /**
     * Get value by indexes.
     * @param {{groupIndex: number, index: number}} indexes indexes
     * @param {string} chartType chart type
     * @returns {(string | number)} value
     * @private
     */
    _getValueByIndexes: function(indexes, chartType) {
        return this.values[chartType][indexes.groupIndex][indexes.index];
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
            value = this._getValueByIndexes(params.indexes, params.chartType),
            center;

        if (value < 0) {
            center = bound[positionType] + (bound[sizeType] / 2) + (params.addPadding || 0);
            position[positionType] = position[positionType] - (position[positionType] - center) * 2 - params.dimension[sizeType];
        }
        return position;
    },

    /**
     * Make tooltip html.
     * @param {string} chartType chart type
     * @param {{groupIndex: number, index: number}} indexes indexes
     * @returns {string} tooltip html
     * @private
     */
    _makeTooltipHtml: function(chartType, indexes) {
        var data = this.data[chartType][indexes.groupIndex][indexes.index];

        data.suffix = this.suffix;

        return this.tplTooltip(data);
    },

    /**
     * Whether changed indexes or not.
     * @param {{groupIndex: number, index: number}} prevIndexes prev indexes
     * @param {{groupIndex: number, index: number}} indexes indexes
     * @returns {boolean} whether changed or not
     * @private
     */
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
            prevIndexes = this._getIndexesCustomAttribute(elTooltip),
            prevChartType, position;

        if (this._isChangedIndexes(prevIndexes, indexes)) {
            prevChartType = elTooltip.getAttribute('data-chart-type');
            this._fireHideAnimation(prevIndexes, prevChartType);
        }

        elTooltip.innerHTML = this._makeTooltipHtml(params.chartType, indexes);

        elTooltip.setAttribute('data-chart-type', params.chartType);
        this._setIndexesCustomAttribute(elTooltip, indexes);
        this._setShowedCustomAttribute(elTooltip, true);

        this._fireBeforeShowTooltip(indexes);

        dom.addClass(elTooltip, 'show');

        position = this._calculateTooltipPosition(tui.util.extend({
            dimension: this.getTooltipDimension(elTooltip),
            positionOption: tui.util.extend({
                left: 0,
                top: 0
            }, this.options.position),
            alignOption: this.options.align || ''
        }, params));

        this.moveToPosition(elTooltip, position, prevPosition);
        this._fireShowAnimation(indexes, params.chartType);
        this._fireAfterShowTooltip(indexes, {
            element: elTooltip,
            position: position
        });
    },

    /**
     * Make parameters for show tooltip user event.
     * @param {{groupIndex: number, index: number}} indexes indexes
     * @param {object} additionParams addition parameters
     * @returns {{chartType: string, legend: string, legendIndex: number, index: number}} parameters for show tooltip
     * @private
     */
    _makeShowTooltipParams: function(indexes, additionParams) {
        var legendIndex = indexes.index,
            legendData = this.joinLegendLabels[legendIndex],
            params;

        params = tui.util.extend({
            chartType: legendData.chartType,
            legend: legendData.label,
            legendIndex: legendIndex,
            index: indexes.groupIndex
        }, additionParams);
        return params;
    },

    /**
     * To call beforeShowTooltip callback of userEvent.
     * @param {{groupIndex: number, index: number}} indexes indexes
     * @private
     */
    _fireBeforeShowTooltip: function(indexes) {
        var params = this._makeShowTooltipParams(indexes);

        this.userEvent.fire('beforeShowTooltip', params);
    },

    /**
     * To call afterShowTooltip callback of userEvent.
     * @param {{groupIndex: number, index: number}} indexes indexes
     * @param {object} additionParams addition parameters
     * @private
     */
    _fireAfterShowTooltip: function(indexes, additionParams) {
        var params = this._makeShowTooltipParams(indexes, additionParams);

        this.userEvent.fire('afterShowTooltip', params);
    },

    /**
     * Hide tooltip.
     * @param {HTMLElement} elTooltip tooltip element
     * @param {function} callback callback
     */
    hideTooltip: function(elTooltip) {
        var that = this,
            indexes = this._getIndexesCustomAttribute(elTooltip),
            chartType = elTooltip.getAttribute('data-chart-type');

        this._setShowedCustomAttribute(elTooltip, false);
        this._fireHideAnimation(indexes, chartType);

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
     * @private
     */
    _attachEvent: function(el) {
        eventListener.bindEvent('mouseover', el, tui.util.bind(this._onMouseover, this));
        eventListener.bindEvent('mouseout', el, tui.util.bind(this._onMouseout, this));
    }
});

module.exports = Tooltip;
