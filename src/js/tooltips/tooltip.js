/**
 * @fileoverview Tooltip component.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var TooltipBase = require('./tooltipBase'),
    singleTooltipMixer = require('./singleTooltipMixer'),
    chartConst = require('../const'),
    tooltipTemplate = require('./tooltipTemplate');

/**
 * @classdesc Tooltip component.
 * @class Tooltip
 */
var Tooltip = tui.util.defineClass(TooltipBase, /** @lends Tooltip.prototype */ {
    /**
     * Tooltip component.
     * @constructs Tooltip
     * @param {object} params parameters
     *      @param {BoundsMaker} params.boundsMaker bounds maker
     *      @param {object} params.theme axis theme
     */
    init: function(params) {
        TooltipBase.call(this, params);
    },

    /**
     * Make tooltip html.
     * @param {string} category category
     * @param {{value: string, legend: string, chartType: string, suffix: ?string}} item item data
     * @returns {string} tooltip html
     * @private
     */
    _makeTooltipHtml: function(category, item) {
        return tooltipTemplate.tplDefault(tui.util.extend({
            category: category || ''
        }, item));
    },

    /**
     * Make single tooltip html.
     * @param {string} chartType chart type
     * @param {{groupIndex: number, index: number}} indexes indexes
     * @returns {string} tooltip html
     * @private
     */
    _makeSingleTooltipHtml: function(chartType, indexes) {
        var data = tui.util.pick(this.data, chartType, indexes.groupIndex, indexes.index);
        return this.templateFunc(data.category, {
            value: data.value,
            legend: data.legend,
            suffix: this.suffix
        });
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
     * Make parameters for show tooltip user event.
     * @param {{groupIndex: number, index: number}} indexes indexes
     * @param {object} additionParams addition parameters
     * @returns {{chartType: string, legend: string, legendIndex: number, index: number}} parameters for show tooltip
     * @private
     */
    _makeShowTooltipParams: function(indexes, additionParams) {
        var legendIndex = indexes.index,
            legendData = this.dataProcessor.getLegendData(legendIndex),
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
     * Make tooltip data.
     * @returns {Array.<object>} tooltip data
     * @override
     */
    _makeTooltipData: function() {
        var self = this,
            categories = this.dataProcessor.getCategories(),
            itemGroup = this.dataProcessor.getItemGroup(),
            orgLegendLabels = this.dataProcessor.getLegendLabels(),
            legendLabels = {},
            tooltipData = {};

        if (tui.util.isArray(orgLegendLabels)) {
            legendLabels[this.chartType] = orgLegendLabels;
        } else {
            legendLabels = orgLegendLabels;
        }

        itemGroup.each(function(items, groupIndex, chartType) {
            var datum;

            chartType = chartType || self.chartType;

            if (!tooltipData[chartType]) {
                tooltipData[chartType] = [];
            }

            datum = items.map(function(item, index) {
                return {
                    category: categories ? categories[groupIndex] : '',
                    legend: legendLabels[chartType][index],
                    value: item.formattedValue
                };
            });

            tooltipData[chartType].push(datum);
        });

        return tooltipData;
    }
});

singleTooltipMixer.mixin(Tooltip);
module.exports = Tooltip;
