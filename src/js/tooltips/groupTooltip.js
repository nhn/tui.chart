/**
 * @fileoverview Group tooltip component.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var TooltipBase = require('./tooltipBase'),
    chartConst = require('../const'),
    dom = require('../helpers/domHandler'),
    renderUtil = require('../helpers/renderUtil'),
    defaultTheme = require('../themes/defaultTheme'),
    tooltipTemplate = require('./tooltipTemplate');

var GroupTooltip = ne.util.defineClass(TooltipBase, /** @lends GroupTooltip.prototype */ {
    /**
     * Group tooltip component.
     * @constructs GroupTooltip
     * @param {object} params parameters
     *      @param {array.<number>} params.values converted values
     *      @param {array} params.labels labels
     *      @param {array} params.legendLabels legend labels
     *      @param {object} params.bound axis bound
     *      @param {object} params.theme axis theme
     */
    init: function(params) {
        TooltipBase.call(this, params);
    },

    /**
     * To make tooltip data.
     * @returns {array.<object>} tooltip data
     * @override
     */
    makeTooltipData: function() {
        return ne.util.map(this.joinFormattedValues, function(values, index) {
            return {
                category: this.labels[index],
                values: values
            };
        }, this);
    },

    /**
     * To make colors.
     * @param {array.<string>} legendLabels legend labels
     * @param {object} theme tooltip theme
     * @returns {array.<string>} colors
     * @private
     */
    _makeColors: function(legendLabels, theme) {
        var colorIndex = 0,
            defaultColors, colors, prevChartType;
        if (theme.colors) {
            return theme.colors;
        }

        defaultColors = defaultTheme.series.colors.slice(0, legendLabels.length);

        return ne.util.map(ne.util.pluck(legendLabels, 'chartType'), function(chartType) {
            var color;
            if (prevChartType !== chartType) {
                colors = theme[chartType] ? theme[chartType].colors : defaultColors;
                colorIndex = 0;
            }
            prevChartType = chartType;
            color = colors[colorIndex];
            colorIndex += 1;
            return color;
        });
    },

    /**
     * To make tooltip html.
     * @param {number} groupIndex group index
     * @returns {string} tooltip html
     * @private
     */
    _makeTooltipHtml: function(groupIndex) {
        var item = this.data[groupIndex],
            template = tooltipTemplate.tplGroupItem,
            cssTextTemplate = tooltipTemplate.tplGroupCssText,
            colors = this._makeColors(this.joinLegendLabels, this.theme),
            itemsHtml;

        itemsHtml = ne.util.map(item.values, function(value, index) {
            var legendLabel = this.joinLegendLabels[index];
            return template({
                value: value,
                legend: legendLabel.label,
                chartType: legendLabel.chartType,
                cssText: cssTextTemplate({color: colors[index]}),
                suffix: this.suffix
            });
        }, this).join('');

        return tooltipTemplate.tplGroup({
            category: item.category,
            items: itemsHtml
        });
    },

    /**
     * To calculate vertical position.
     * @param {{width: number, height: number}} dimension dimension
     * @param {{index: number, range: {start: number, end: number},
     *          size: number, direction: string, isVertical: boolean
     *        }} params coordinate event parameters
     * @returns {{left: number, top: number}} position
     * @private
     */
    _calculateVerticalPosition: function(dimension, params) {
        var range = params.range,
            isLine = (range.start === range.end),
            padding = isLine ? 6 : 0,
            left = chartConst.SERIES_EXPAND_SIZE;
        if (params.direction === chartConst.TOOLTIP_DIRECTION_FORWORD) {
            left += range.start + padding;
        } else {
            left += range.end - dimension.width - padding;
        }
        return {
            left: left,
            top: (params.size - dimension.height) / 2
        };
    },

    /**
     * To calculate horizontal position.
     * @param {{width: number, height: number}} dimension dimension
     * @param {{index: number, range: {start: number, end: number},
     *          size: number, direction: string, isVertical: boolean
     *        }} params coordinate event parameters
     * @returns {{left: number, top: number}} position
     * @private
     */
    _calculateHorizontalPosition: function(dimension, params) {
        var range = params.range,
            top = 0;
        if (params.direction === chartConst.TOOLTIP_DIRECTION_FORWORD) {
            top += range.start;
        } else {
            top += range.end - dimension.height;
        }
        return {
            left: (params.size - dimension.width) / 2 + chartConst.SERIES_EXPAND_SIZE,
            top: top
        };
    },

    /**
     * To calculate position.
     * @param {{width: number, height: number}} dimension dimension
     * @param {{index: number, range: {start: number, end: number},
     *          size: number, direction: string, isVertical: boolean
     *        }} params coordinate event parameters
     * @returns {{left: number, top: number}} position
     * @private
     */
    _calculateTooltipPosition: function(dimension, params) {
        var position;
        if (params.isVertical) {
            position = this._calculateVerticalPosition(dimension, params);
        } else {
            position = this._calculateHorizontalPosition(dimension, params);
        }
        return position;
    },

    /**
     * Create tooltip element.
     * @returns {HTMLElement} tooltip element
     * @private
     */
    _createTooltipSectorElement: function() {
        var elTooltipBlock;
        if (!this.elLayout.childNodes.length < 2) {
            elTooltipBlock = dom.create('DIV', 'ne-chart-group-tooltip-sector');
            dom.append(this.elLayout, elTooltipBlock);
        } else {
            elTooltipBlock = this.elLayout.lastChild;
        }
        return elTooltipBlock;
    },

    /**
     * Get tooltip sector element.
     * @returns {HTMLElement} sector element
     * @private
     */
    _getTooltipSectorElement: function() {
        if (!this.elTooltipBlock) {
            this.elTooltipBlock = this._createTooltipSectorElement();
        }
        return this.elTooltipBlock;
    },

    /**
     * To make bound about tooltip sector of vertical type chart.
     * @param {number} height height
     * @param {{start: number, end: number}} range range
     * @param {boolean} isLine whether line or not
     * @returns {{dimension: {width: number, height: number}, position: {left: number, top: number}}} bound
     * @private
     */
    _makeVerticalTooltipSectorBound: function(height, range, isLine) {
        var width, moveLeft;
        if (isLine) {
            width = 1;
            height += 6;
            moveLeft = 0;
        } else {
            width = range.end - range.start + 1;
            moveLeft = 1;
        }
        return {
            dimension: {
                width: width,
                height: height
            },
            position: {
                left: range.start + chartConst.SERIES_EXPAND_SIZE - moveLeft,
                top: 0
            }
        };
    },

    /**
     * To make bound about tooltip sector of horizontal type chart.
     * @param {number} width width
     * @param {{start: number, end:number}} range range
     * @returns {{dimension: {width: number, height: number}, position: {left: number, top: number}}} bound
     * @private
     */
    _makeHorizontalTooltipSectorBound: function(width, range) {
        return {
            dimension: {
                width: width,
                height: range.end - range.start + 1
            },
            position: {
                left: chartConst.SERIES_EXPAND_SIZE,
                top: range.start
            }
        };
    },

    /**
     * To make bound about tooltip sector.
     * @param {number} size width or height
     * @param {{start: number, end:number}} range range
     * @param {boolean} isVertical whether vertical or not
     * @param {boolean} isLine whether line type or not
     * @returns {{dimension: {width: number, height: number}, position: {left: number, top: number}}} bound
     * @private
     */
    _makeTooltipSectorBound: function(size, range, isVertical, isLine) {
        var bound;
        if (isVertical) {
            bound = this._makeVerticalTooltipSectorBound(size, range, isLine);
        } else {
            bound = this._makeHorizontalTooltipSectorBound(size, range);
        }
        return bound;
    },

    /**
     * Show tooltip sector.
     * @param {number} size width or height
     * @param {{start: number, end:number}} range range
     * @param {boolean} isVertical whether vertical or not
     * @param {number} index index
     * @private
     */
    _showTooltipSector: function(size, range, isVertical, index) {
        var elTooltipBlock = this._getTooltipSectorElement(),
            isLine = (range.start === range.end),
            bound = this._makeTooltipSectorBound(size, range, isVertical, isLine);
        if (isLine) {
            this.fire('showGroupAnimation', index, bound);
        } else {
            renderUtil.renderDimension(elTooltipBlock, bound.dimension);
            renderUtil.renderPosition(elTooltipBlock, bound.position);
            dom.addClass(elTooltipBlock, 'show');
        }
    },

    /**
     * Hide tooltip sector.
     * @param {number} index index
     * @private
     */
    _hideTooltipSector: function(index) {
        var elTooltipBlock = this._getTooltipSectorElement();
        dom.removeClass(elTooltipBlock, 'show');
        this.fire('hideGroupAnimation', index);
    },

    /**
     * Show tooltip.
     * @param {HTMLElement} elTooltip tooltip element
     * @param {{index: number, range: {start: number, end: number},
     *          size: number, direction: string, isVertical: boolean
     *        }} params coordinate event parameters
     * @param {{left: number, top: number}} prevPosition prev position
     */
    showTooltip: function(elTooltip, params, prevPosition) {
        var dimension, position;

        if (!ne.util.isUndefined(this.prevIndex)) {
            this.fire('hideGroupAnimation', this.prevIndex);
        }
        elTooltip.innerHTML = this._makeTooltipHtml(params.index);
        dom.addClass(elTooltip, 'show');

        this._showTooltipSector(params.size, params.range, params.isVertical, params.index);
        dimension = this.getTooltipDimension(elTooltip);

        position = this._calculateTooltipPosition(dimension, params);

        this.moveToPosition(elTooltip, position, prevPosition);
        this.prevIndex = params.index;
    },

    /**
     * Hide tooltip.
     * @param {HTMLElement} elTooltip tooltip element
     * @param {number} index index
     */
    hideTooltip: function(elTooltip, index) {
        delete this.prevIndex;
        this._hideTooltipSector(index);
        this.hideAnimation(elTooltip);
    }
});

ne.util.CustomEvents.mixin(GroupTooltip);

module.exports = GroupTooltip;
