/**
 * @fileoverview Group tooltip component.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var TooltipBase = require('./tooltipBase'),
    chartConst = require('../const'),
    dom = require('../helpers/domHandler'),
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
            left = chartConst.SERIES_EXPAND_SIZE;
        if (params.direction === chartConst.TOOLTIP_DIRECTION_FORWORD) {
            left += range.start;
        } else {
            left += range.end - dimension.width;
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
     * Show tooltip.
     * @param {HTMLElement} elTooltip tooltip element
     * @param {{index: number, range: {start: number, end: number},
     *          size: number, direction: string, isVertical: boolean
     *        }} params coordinate event parameters
     * @param {{left: number, top: number}} prevPosition prev position
     */
    showTooltip: function(elTooltip, params, prevPosition) {
        var dimension, position;
        elTooltip.innerHTML = this._makeTooltipHtml(params.index);
        dom.addClass(elTooltip, 'show');

        dimension = this.getTooltipDimension(elTooltip);
        position = this._calculateTooltipPosition(dimension, params);

        this.moveToPosition(elTooltip, position, prevPosition);
    },

    /**
     * Hide tooltip.
     * @param {HTMLElement} elTooltip tooltip element
     * @param {function} callback callback
     */
    hideTooltip: function(elTooltip) {
        this.hideAnimation(elTooltip);
    }
});

ne.util.CustomEvents.mixin(GroupTooltip);

module.exports = GroupTooltip;
