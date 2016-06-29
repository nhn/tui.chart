/**
 * @fileoverview Tooltip component.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var TooltipBase = require('./tooltipBase');
var singleTooltipMixer = require('./singleTooltipMixer');
var chartConst = require('../const');
var predicate = require('../helpers/predicate');
var renderUtil = require('../helpers/renderUtil');
var tooltipTemplate = require('./tooltipTemplate');

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
        var template;

        if (predicate.isCoordinateTypeChart(this.chartType)) {
            template = tooltipTemplate.tplCoordinatetypeChart;
        } else {
            template = tooltipTemplate.tplDefault;
        }

        return template(tui.util.extend({
            category: category || ''
        }, item));
    },

    /**
     * Make html for value types like x, y, r
     * @param {{x: ?number, y: ?number, r: ?number}} data - data
     * @param {Array.<string>} valueTypes - types of value
     * @returns {string}
     * @private
     */
    _makeHtmlForValueTypes: function(data, valueTypes) {
        return tui.util.map(valueTypes, function(type) {
            return (data[type]) ? '<div>' + type + ': ' + data[type] + '</div>' : '';
        }).join('');
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

        data = tui.util.extend({
            suffix: this.suffix
        }, data);
        data.valueTypes = this._makeHtmlForValueTypes(data, ['x', 'y', 'r']);

        return this.templateFunc(data.category, data);
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
            legendData = this.dataProcessor.getLegendItem(legendIndex),
            params;

        if (!legendData) {
            return null;
        }

        params = tui.util.extend({
            chartType: legendData.chartType,
            legend: legendData.label,
            legendIndex: legendIndex,
            index: indexes.groupIndex
        }, additionParams);
        return params;
    },

    /**
     * Format value of valueMap
     * @param {object} valueMap - map of value like value, x, y, r
     * @returns {{}}
     * @private
     */
    _formatValueMap: function(valueMap) {
        var formattedValueMap = {};
        var formatFunctions = this.dataProcessor.getFormatFunctions();

        tui.util.forEach(valueMap, function(value, valueType) {
            formattedValueMap[valueType] = renderUtil.formatValue(value, formatFunctions, 'tooltip', valueType);
        });

        return formattedValueMap;
    },

    /**
     * Make tooltip datum.
     * @param {Array.<string>} legendLabels - legend labels
     * @param {string} category - category
     * @param {string} chartType - chart type
     * @param {SeriesItem} seriesItem - SeriesItem
     * @param {number} index - index
     * @returns {Object}
     * @private
     */
    _makeTooltipDatum: function(legendLabels, category, chartType, seriesItem, index) {
        var legend = legendLabels[chartType][index] || '';

        var labelPrefix = (legend && seriesItem.label) ? ':&nbsp;' : '';
        var label = seriesItem.label ? labelPrefix + seriesItem.label : '';
        var valueMap = this._formatValueMap(seriesItem.pickValueMap());

        return tui.util.extend({
            category: category,
            legend: legend,
            label: label
        }, valueMap);
    },

    /**
     * Make tooltip data.
     * @returns {Array.<object>} tooltip data
     * @override
     */
    _makeTooltipData: function() {
        var self = this;
        var orgLegendLabels = this.dataProcessor.getLegendLabels();
        var legendLabels = {};
        var tooltipData = {};

        if (tui.util.isArray(orgLegendLabels)) {
            legendLabels[this.chartType] = orgLegendLabels;
        } else {
            legendLabels = orgLegendLabels;
        }

        this.dataProcessor.eachBySeriesGroup(function(seriesGroup, groupIndex, chartType) {
            var data;

            chartType = chartType || self.chartType;

            data = seriesGroup.map(function(seriesItem, index) {
                var category = self.dataProcessor.getTooltipCategory(groupIndex, index, self.isVertical);

                return seriesItem ? self._makeTooltipDatum(legendLabels, category, chartType, seriesItem, index) : null;
            });

            if (!tooltipData[chartType]) {
                tooltipData[chartType] = [];
            }

            tooltipData[chartType].push(data);
        });

        return tooltipData;
    }
});

singleTooltipMixer.mixin(Tooltip);
module.exports = Tooltip;
