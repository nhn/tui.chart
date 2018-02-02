/**
 * @fileoverview NormalTooltip component.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var TooltipBase = require('./tooltipBase');
var singleTooltipMixer = require('./singleTooltipMixer');
var chartConst = require('../../const');
var predicate = require('../../helpers/predicate');
var tooltipTemplate = require('./tooltipTemplate');
var snippet = require('tui-code-snippet');

/**
 * @classdesc NormalTooltip component.
 * @class NormalTooltip
 * @private
 */
var NormalTooltip = snippet.defineClass(TooltipBase, /** @lends NormalTooltip.prototype */ {
    /**
     * NormalTooltip component.
     * @constructs NormalTooltip
     * @private
     * @override
     */
    init: function() {
        TooltipBase.apply(this, arguments);
    },

    /**
     * Make tooltip html.
     * @param {string} category category
     * @param {{value: string, legend: string, chartType: string, suffix: ?string}} item item data
     * @returns {string} tooltip html
     * @private
     */
    _makeTooltipHtml: function(category, item) {
        var template = this._getTooltipTemplate(item);

        return template(snippet.extend({
            categoryVisible: category ? 'show' : 'hide',
            category: category
        }, item));
    },

    /**
     * get tooltip template from a templates collection
     * @param {{value: string, legend: string, chartType: string, suffix: ?string}} item item data
     * @returns {string} tooltip template
     * @private
     */
    _getTooltipTemplate: function(item) {
        var template = tooltipTemplate.tplDefault;

        if (predicate.isBoxplotChart(this.chartType)) {
            template = this._getBoxplotTooltipTemplate(item);
        } else if (predicate.isPieChart(this.chartType) ||
            predicate.isPieDonutComboChart(this.chartType, this.chartTypes)) {
            template = tooltipTemplate.tplPieChart;
        } else if (this.dataProcessor.coordinateType) {
            template = tooltipTemplate.tplCoordinatetypeChart;
        } else if (predicate.isBulletChart(this.chartType)) {
            template = tooltipTemplate.tplBulletChartDefault;
        }

        return template;
    },

    /**
     * Get tooltip template of box plot chart
     * If item has outlierIndex, return outlier template
     * Otherwise, return box plot default template
     * @param {{value: string, legend: string, chartType: string, suffix: ?string}} item item data
     * @returns {string} tooltip template
     * @private
     */
    _getBoxplotTooltipTemplate: function(item) {
        var template = tooltipTemplate.tplBoxplotChartDefault;

        if (snippet.isNumber(item.outlierIndex)) {
            template = tooltipTemplate.tplBoxplotChartOutlier;
            item.label = item.outliers[item.outlierIndex].label;
        }

        return template;
    },

    /**
     * Make html for value types like x, y, r
     * @param {{x: ?number, y: ?number, r: ?number}} data - data
     * @param {Array.<string>} valueTypes - types of value
     * @returns {string}
     * @private
     */
    _makeHtmlForValueTypes: function(data, valueTypes) {
        return snippet.map(valueTypes, function(type) {
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
        var groupIndex = indexes.groupIndex;
        var data = snippet.extend({}, snippet.pick(this.data, chartType, indexes.groupIndex, indexes.index));

        if (predicate.isBoxplotChart(this.chartType) && snippet.isNumber(indexes.outlierIndex)) {
            data.outlierIndex = indexes.outlierIndex;
        }

        data = snippet.extend({
            suffix: this.suffix
        }, data);
        data.valueTypes = this._makeHtmlForValueTypes(data, ['x', 'y', 'r']);

        return this.templateFunc(data.category, data, this.getRawCategory(groupIndex));
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
        var legendIndex = indexes.index;
        var legendData = this.dataProcessor.getLegendItem(legendIndex);
        var chartType;

        var params;

        if (!legendData) {
            return null;
        }

        chartType = legendData.chartType;
        params = snippet.extend({
            chartType: chartType,
            legend: legendData.label,
            legendIndex: legendIndex,
            index: indexes.groupIndex
        }, additionParams);

        if (predicate.isBoxplotChart(chartType) &&
            snippet.isNumber(indexes.outlierIndex)) {
            params.outlierIndex = indexes.outlierIndex;
        }

        return params;
    },

    /**
     * Make tooltip datum.
     * @param {string} legendLabel - legend label
     * @param {string} category - category
     * @param {SeriesItem} seriesItem - SeriesItem
     * @returns {Object}
     * @private
     */
    _makeTooltipDatum: function(legendLabel, category, seriesItem) {
        var labelPrefix = (legendLabel && seriesItem.label) ? ':&nbsp;' : '';
        var tooltipLabel = seriesItem.tooltipLabel;
        var labelFormatter = this.labelFormatter;
        var tooltipDatum = {
            legend: legendLabel || '',
            label: tooltipLabel || (seriesItem.label ? labelPrefix + seriesItem.label : ''),
            category: category || ''
        };

        if (labelFormatter) {
            tooltipDatum = labelFormatter(seriesItem, tooltipDatum, labelPrefix);
        }

        tooltipDatum.category = category || '';

        return snippet.extend(tooltipDatum, seriesItem.pickValueMapForTooltip());
    },

    /**
     * Make tooltip data.
     * @returns {Array.<object>} tooltip data
     * @override
     */
    makeTooltipData: function() {
        var self = this;
        var orgLegendLabels = this.dataProcessor.getLegendLabels();
        var isPivot = predicate.isTreemapChart(this.chartType);
        var legendLabels = {};
        var tooltipData = {};

        if (snippet.isArray(orgLegendLabels)) {
            legendLabels[this.chartType] = orgLegendLabels;
        } else {
            legendLabels = orgLegendLabels;
        }

        this.dataProcessor.eachBySeriesGroup(function(seriesGroup, groupIndex, chartType) {
            var data, isBulletChart;

            chartType = chartType || self.chartType;
            isBulletChart = predicate.isBulletChart(chartType);

            data = seriesGroup.map(function(seriesItem, index) {
                var category = self.dataProcessor.makeTooltipCategory(groupIndex, index, self.isVertical);
                var legendIndex = isBulletChart ? groupIndex : index;

                if (!seriesItem) {
                    return null;
                }

                return self._makeTooltipDatum(legendLabels[chartType][legendIndex], category, seriesItem);
            });

            if (!tooltipData[chartType]) {
                tooltipData[chartType] = [];
            }

            tooltipData[chartType].push(data);
        }, isPivot);

        return tooltipData;
    }
});

singleTooltipMixer.mixin(NormalTooltip);

function normalTooltipFactory(params) {
    return new NormalTooltip(params);
}

normalTooltipFactory.componentType = 'tooltip';
normalTooltipFactory.NormalTooltip = NormalTooltip;

module.exports = normalTooltipFactory;
