/**
 * @fileoverview SeriesItem for treemap.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var calculator = require('../../helpers/calculator');
var renderUtil = require('../../helpers/renderUtil');
var snippet = require('tui-code-snippet');

var SeriesItemForTreemap = snippet.defineClass(/** @lends SeriesItemForTreemap.prototype */{
    /**
     * SeriesItem for treemap.
     * @constructs SeriesItemForTreemap
     * @private
     * @param {object} rawSeriesDatum - value
     * @param {?Array.<function>} formatFunctions - format functions
     * @param {string} chartType - type of chart
     */
    init: function(rawSeriesDatum, formatFunctions, chartType) {
        /**
         * type of chart
         * @type {string}
         */
        this.chartType = chartType;

        /**
         * format functions
         * @type {Array.<function>}
         */
        this.formatFunctions = formatFunctions;
        this.id = rawSeriesDatum.id;
        this.parent = rawSeriesDatum.parent;
        this.value = rawSeriesDatum.value;
        this.ratio = rawSeriesDatum.ratio;
        this.colorValue = rawSeriesDatum.colorValue;
        this.depth = rawSeriesDatum.depth;
        this.label = rawSeriesDatum.label || '';
        this.group = rawSeriesDatum.group;
        this.hasChild = !!rawSeriesDatum.hasChild;
        this.indexes = rawSeriesDatum.indexes;
    },

    /**
     * Add ratio.
     * @param {number} divNumber - number for division
     * @param {?number} subNumber - number for subtraction
     */
    addRatio: function(divNumber, subNumber) {
        divNumber = divNumber || 1;
        subNumber = subNumber || 0;

        this.colorRatio = calculator.calculateRatio(this.colorValue, divNumber, subNumber, 1) || -1;
    },

    /**
     * Pick value map for tooltip.
     * @returns {{value: number, label: string}}
     */
    pickValueMapForTooltip: function() {
        var formatFunctions = this.formatFunctions;
        var chartType = this.chartType;
        var colorValue = this.colorValue;
        var formattedValue = renderUtil.formatValue({
            value: this.value,
            formatFunctions: formatFunctions,
            chartType: chartType,
            areaType: 'tooltipValue'
        });
        var label = (this.label ? this.label + ': ' : '') + formattedValue;
        var valueMap = {
            value: formattedValue,
            label: label,
            ratio: this.ratio
        };

        if (snippet.isExisty(colorValue)) {
            valueMap.colorValue = renderUtil.formatValue({
                value: colorValue,
                formatFunctions: formatFunctions,
                chartType: chartType,
                areaType: 'tooltipColorValue'
            });
            valueMap.colorRatio = this.colorRatio;
        }

        return valueMap;
    },

    /**
     * Pick data for label template.
     * @param {number} total - value total
     * @returns {{value: number, ratio: number, label: string, colorValue: ?number, colorValueRatio: ?number}}
     */
    pickLabelTemplateData: function() {
        var templateData = {
            value: this.value,
            ratio: this.ratio,
            label: this.label
        };

        if (snippet.isExisty(this.colorValue)) {
            templateData.colorValue = this.colorValue;
            templateData.colorValueRatio = this.ratio;
        }

        return templateData;
    }
});

module.exports = SeriesItemForTreemap;
