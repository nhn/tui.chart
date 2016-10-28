/**
 * @fileoverview SeriesItem for treemap.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var calculator = require('../../helpers/calculator');
var renderUtil = require('../../helpers/renderUtil');

var SeriesItemForTreemap = tui.util.defineClass(/** @lends SeriesItemForTreemap.prototype */{
    /**
     * SeriesItem for treemap.
     * @constructs SeriesItemForTreemap
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

        this.ratio = calculator.calculateRatio(this.colorValue, divNumber, subNumber, 1) || -1;
    },

    /**
     * Pick value map.
     * @returns {{value: number, label: string}}
     */
    pickValueMap: function() {
        var areaType = 'makingTooltipLabel';
        var formattedValue = renderUtil.formatValue(this.value, this.formatFunctions, this.chartType, areaType);
        var label = (this.label ? this.label + ': ' : '') + formattedValue;

        return {
            value: this.value,
            label: label
        };
    },

    /**
     * Pick data for label template.
     * @param {number} total - value total
     * @returns {{value: number, ratio: number, label: string, colorValue: ?number, colorValueRatio: ?number}}
     */
    pickLabelTemplateData: function(total) {
        var templateData = {
            value: this.value,
            ratio: (this.value / total),
            label: this.label
        };

        if (tui.util.isExisty(this.colorValue)) {
            templateData.colorValue = this.colorValue;
            templateData.colorValueRatio = this.ratio;
        }

        return templateData;
    }
});

module.exports = SeriesItemForTreemap;
