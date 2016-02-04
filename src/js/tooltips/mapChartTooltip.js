/**
 * @fileoverview Tooltip component for map chart.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var chartConst = require('../const'),
    TooltipBase = require('./tooltipBase'),
    singleTooltipMixer = require('./singleTooltipMixer'),
    tooltipTemplate = require('./tooltipTemplate');

/**
 * @classdesc MapChartTooltip component.
 * @class MapChartTooltip
 */
var MapChartTooltip = tui.util.defineClass(TooltipBase, /** @lends MapChartTooltip.prototype */ {
    /**
     * Map chart tooltip component.
     * @constructs MapChartTooltip
     * @param {object} params parameters
     *      @param {BoundsMaker} params.boundsMaker bounds maker
     *      @param {object} params.theme axis theme
     */
    init: function(params) {
        /**
         * Map model
         * @type {MapChartMapModel}
         */
        this.mapModel = null;

        TooltipBase.call(this, params);
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
        var datum = this.mapModel.getDatum(indexes.index);

        return this.templateFunc({
            name: datum.name || datum.code,
            value: datum.formattedValue
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

        params = tui.util.extend({
            chartType: this.chartType,
            code: datum.code,
            name: datum.name,
            value: datum.formattedValue,
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
    },

    /**
     * Render.
     * @param {{mapModel: MapChartMapModel}} data data for rendering
     * @returns {HTMLElement} tooltip element
     */
    render: function(data) {
        this.mapModel = data.mapModel;

        return TooltipBase.prototype.render.call(this);
    }
});

singleTooltipMixer.mixin(MapChartTooltip);
module.exports = MapChartTooltip;
