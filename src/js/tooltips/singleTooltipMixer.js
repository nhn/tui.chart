/**
 * @fileoverview singleTooltipMixer is single tooltip mixer of map chart.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var chartConst = require('../const'),
    predicate = require('../helpers/predicate'),
    dom = require('../helpers/domHandler'),
    renderUtil = require('../helpers/renderUtil');

/**
 * singleTooltipMixer is single tooltip mixer of map chart.
 * @mixin
 */
var singleTooltipMixer = {

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
     * Make left position of not bar chart.
     * @param {number} baseLeft base left
     * @param {string} alignOption align option
     * @param {number} minusWidth minus width
     * @param {number} lineGap line gap
     * @returns {number} left position value
     * @private
     */
    _makeLeftPositionOfNotBarChart: function(baseLeft, alignOption, minusWidth, lineGap) {
        var left = baseLeft;

        if (alignOption.indexOf('left') > -1) {
            left -= minusWidth + lineGap;
        } else if (alignOption.indexOf('center') > -1) {
            left -= minusWidth / 2;
        } else {
            left += lineGap;
        }

        return left;
    },

    /**
     * Make top position of not bar chart.
     * @param {number} baseTop base top
     * @param {string} alignOption align option
     * @param {number} tooltipHeight tooltip height
     * @param {number} lineGap line gap
     * @returns {number} top position value
     * @private
     */
    _makeTopPositionOfNotBarChart: function(baseTop, alignOption, tooltipHeight, lineGap) {
        var top = baseTop;

        if (alignOption.indexOf('bottom') > -1) {
            top += tooltipHeight + lineGap;
        } else if (alignOption.indexOf('middle') > -1) {
            top += tooltipHeight / 2;
        } else {
            top -= chartConst.TOOLTIP_GAP;
        }

        return top;
    },

    /**
     * Make tooltip position of not bar chart.
     * @param {object} params parameters
     *      @param {{bound: object}} params.data graph information
     *      @param {{width: number, height: number}} params.dimension tooltip dimension
     *      @param {string} params.alignOption position option (ex: 'left top')
     * @returns {{top: number, left: number}} position
     * @private
     */
    _makeTooltipPositionOfNotBarChart: function(params) {
        var bound = params.bound,
            positionOption = params.positionOption,
            minusWidth = params.dimension.width - (bound.width || 0),
            lineGap = bound.width ? 0 : chartConst.TOOLTIP_GAP,
            alignOption = params.alignOption || '',
            tooltipHeight = params.dimension.height,
            baseLeft = bound.left + positionOption.left,
            baseTop = bound.top - tooltipHeight + positionOption.top;

        return {
            left: this._makeLeftPositionOfNotBarChart(baseLeft, alignOption, minusWidth, lineGap),
            top: this._makeTopPositionOfNotBarChart(baseTop, alignOption, tooltipHeight, lineGap)
        };
    },

    /**
     * Make tooltip position to event position.
     * @param {object} params parameters
     *      @param {{left: number, top: number}} params.bound bound
     *      @param {{left: number, top: number}} params.mousePosition mouse position
     * @returns {{top: number, left: number}} position
     * @private
     */
    _makeTooltipPositionToMousePosition: function(params) {
        params.bound = params.bound || {};
        tui.util.extend(params.bound, params.mousePosition);
        return this._makeTooltipPositionOfNotBarChart(params);
    },

    /**
     * Make left position of bar chart.
     * @param {number} baseLeft base left
     * @param {string} alignOption align option
     * @param {number} tooltipWidth tooltip width
     * @returns {number} left position value
     * @private
     */
    _makeLeftPositionOfBarChart: function(baseLeft, alignOption, tooltipWidth) {
        var left = baseLeft;

        if (alignOption.indexOf('left') > -1) {
            left -= tooltipWidth;
        } else if (alignOption.indexOf('center') > -1) {
            left -= tooltipWidth / 2;
        } else {
            left += chartConst.TOOLTIP_GAP;
        }

        return left;
    },

    /**
     * Make top position of bar chart.
     * @param {number} baseTop base top
     * @param {string} alignOption align option
     * @param {number} minusHeight minus width
     * @returns {number} top position value
     * @private
     */
    _makeTopPositionOfBarChart: function(baseTop, alignOption, minusHeight) {
        var top = baseTop;

        if (alignOption.indexOf('top') > -1) {
            top -= minusHeight;
        } else if (alignOption.indexOf('middle') > -1) {
            top -= minusHeight / 2;
        }

        return top;
    },

    /**
     * Make tooltip position of bar chart.
     * @param {object} params parameters
     *      @param {{bound: object}} params.data graph information
     *      @param {{width: number, height: number}} params.dimension tooltip dimension
     *      @param {string} params.alignOption position option (ex: 'left top')
     * @returns {{top: number, left: number}} position
     * @private
     */
    _makeTooltipPositionOfBarChart: function(params) {
        var bound = params.bound,
            positionOption = params.positionOption,
            minusHeight = params.dimension.height - (bound.height || 0),
            alignOption = params.alignOption || '',
            tooltipWidth = params.dimension.width,
            baseLeft = bound.left + bound.width + positionOption.left,
            baseTop = bound.top + positionOption.top;

        return {
            left: this._makeLeftPositionOfBarChart(baseLeft, alignOption, tooltipWidth),
            top: this._makeTopPositionOfBarChart(baseTop, alignOption, minusHeight)
        };
    },

    /**
     * Adjust position.
     * @param {{width: number, height: number}} tooltipDimension tooltip dimension
     * @param {{left: number, top: number}} position position
     * @returns {{left: number, top: number}} adjusted position
     * @private
     */
    _adjustPosition: function(tooltipDimension, position) {
        var chartDimension = this.boundsMaker.getDimension('chart'),
            areaPosition = this.boundsMaker.getPosition('tooltip');

        position.left = Math.max(position.left, -areaPosition.left);
        position.left = Math.min(position.left, chartDimension.width - areaPosition.left - tooltipDimension.width);
        position.top = Math.max(position.top, -areaPosition.top);
        position.top = Math.min(position.top, chartDimension.height - areaPosition.top - tooltipDimension.height);
        return position;
    },

    /**
     * Make tooltip position.
     * @param {object} params parameters
     *      @param {{left: number, top: number, width: number, height: number}} params.bound graph bound
     *      @param {string} params.chartType chart type
     *      @param {boolean} params.allowNegativeTooltip whether allow negative tooltip or not
     *      @param {{width: number, height: number}} params.dimension tooltip dimension
     *      @param {string} params.alignOption position option (ex: 'left top')
     * @returns {{top: number, left: number}} position
     * @private
     */
    _makeTooltipPosition: function(params) {
        var position = {},
            sizeType, positionType, addPadding;

        if (params.mousePosition) {
            position = this._makeTooltipPositionToMousePosition(params);
        } else {
            if (predicate.isBarChart(params.chartType)) {
                position = this._makeTooltipPositionOfBarChart(params);
                sizeType = 'width';
                positionType = 'left';
                addPadding = 1;
            } else {
                position = this._makeTooltipPositionOfNotBarChart(params);
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

            position = this._adjustPosition(params.dimension, position);
        }

        return position;
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
            value = this.dataProcessor.getValue(params.indexes.groupIndex, params.indexes.index, params.chartType),
            tooltipSizeHalf, barPosition, barSizeHalf, movedPositionValue;

        if (value < 0) {
            tooltipSizeHalf = params.dimension[sizeType] / 2;
            barPosition = bound[positionType];
            barSizeHalf = bound[sizeType] / 2;
            movedPositionValue = (barPosition + barSizeHalf - tooltipSizeHalf) * 2 - position[positionType];
            position[positionType] = movedPositionValue;
        }

        return position;
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
     * @private
     */
    _showTooltip: function(elTooltip, params, prevPosition) {
        var indexes = params.indexes,
            prevIndexes = this._getIndexesCustomAttribute(elTooltip),
            prevChartType, position;

        if (this._isChangedIndexes(prevIndexes, indexes)) {
            prevChartType = elTooltip.getAttribute('data-chart-type');
            this._fireHideAnimation(prevIndexes, prevChartType);
        }

        elTooltip.innerHTML = this._makeSingleTooltipHtml(params.chartType, indexes);

        elTooltip.setAttribute('data-chart-type', params.chartType);
        this._setIndexesCustomAttribute(elTooltip, indexes);
        this._setShowedCustomAttribute(elTooltip, true);

        this._fireBeforeShowTooltip(indexes);

        dom.addClass(elTooltip, 'show');

        position = this._makeTooltipPosition(tui.util.extend({
            dimension: this.getTooltipDimension(elTooltip),
            positionOption: tui.util.extend({
                left: 0,
                top: 0
            }, this.options.position),
            alignOption: this.options.align || ''
        }, params));

        this._moveToPosition(elTooltip, position, prevPosition);
        this._fireShowAnimation(indexes, params.chartType);
        this._fireAfterShowTooltip(indexes, {
            element: elTooltip,
            position: position
        });
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
     * @param {HTMLElement} tooltipElement tooltip element
     * @private
     */
    _hideTooltip: function(tooltipElement) {
        var self = this,
            indexes = this._getIndexesCustomAttribute(tooltipElement),
            chartType = tooltipElement.getAttribute('data-chart-type');

        if (predicate.isMousePositionChart(chartType)) {
            dom.removeClass(tooltipElement, 'show');
        } else if (chartType) {
            this._setShowedCustomAttribute(tooltipElement, false);
            this._fireHideAnimation(indexes, chartType);

            if (this._isChangedIndexes(this.prevIndexes, indexes)) {
                delete this.prevIndexes;
            }

            setTimeout(function() {
                if (self._isShowedTooltip(tooltipElement)) {
                    return;
                }

                dom.removeClass(tooltipElement, 'show');
                tooltipElement.style.cssText = '';

                indexes = null;
            }, chartConst.HIDE_DELAY);
        }
    },

    /**
     * On show tooltip container.
     */
    onShowTooltipContainer: function() {
        this.tooltipContainer.style.zIndex = chartConst.TOOLTIP_ZINDEX;
    },

    /**
     * On hide tooltip container.
     */
    onHideTooltipContainer: function() {
        this.tooltipContainer.style.zIndex = 0;
    },

    /**
     * Mix in.
     * @param {function} func target function
     * @ignore
     */
    mixin: function(func) {
        tui.util.extend(func.prototype, this);
    }
};

module.exports = singleTooltipMixer;
