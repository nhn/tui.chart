/**
 * @fileoverview Tooltip component for map chart.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var chartConst = require('../../const');
var TooltipBase = require('./tooltipBase');
var singleTooltipMixer = require('./singleTooltipMixer');
var tooltipTemplate = require('./tooltipTemplate');
var snippet = require('tui-code-snippet');

/**
 * @classdesc MapChartTooltip component.
 * @class MapChartTooltip
 * @private
 */
var MapChartTooltip = snippet.defineClass(TooltipBase, /** @lends MapChartTooltip.prototype */ {
    /**
     * Map chart tooltip component.
     * @constructs MapChartTooltip
     * @private
     * @override
     */
    init: function(params) {
        /**
         * Map model
         * @type {MapChartMapModel}
         */
        this.mapModel = params.mapModel;

        TooltipBase.apply(this, arguments);
    },

    /**
     * Make tooltip html.
     * @param {{name: string, value: number}} datum tooltip datum
     * @returns {string} tooltip html
     * @private
     */
    _makeTooltipHtml: function(datum) {
        return tooltipTemplate.tplMapChartDefault(datum);
    },

    /**
     * Make single tooltip html.
     * @param {string} chartType chart type
     * @param {{groupIndex: number, index: number}} indexes indexes
     * @returns {string} tooltip html
     * @private
     */
    _makeSingleTooltipHtml: function(chartType, indexes) {
        var datum = this.mapModel.getDatum(indexes.index),
            suffix = this.options.suffix ? ' ' + this.options.suffix : '';

        return this.templateFunc({
            name: datum.name || datum.code,
            value: datum.label,
            suffix: suffix
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
        var datum = this.mapModel.getDatum(indexes.index),
            params;

        params = snippet.extend({
            chartType: this.chartType,
            code: datum.code,
            name: datum.name,
            value: datum.label,
            index: indexes.index
        }, additionParams);

        return params;
    },

    /**
     * Set default align option of tooltip.
     * @private
     * @override
     */
    _setDefaultTooltipPositionOption: function() {
        if (!this.options.align) {
            this.options.align = chartConst.TOOLTIP_DEFAULT_ALIGN_OPTION;
        }
    }
});

singleTooltipMixer.mixin(MapChartTooltip);

function mapChartTooltipFactory(params) {
    return new MapChartTooltip(params);
}

mapChartTooltipFactory.componentType = 'tooltip';

module.exports = mapChartTooltipFactory;
