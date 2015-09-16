/**
 * @fileoverview Line chart series component.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var Series = require('./series.js'),
    seriesTemplate = require('./seriesTemplate.js'),
    renderUtil = require('../helpers/renderUtil.js');

var LineChartSeries = ne.util.defineClass(Series, /** @lends Series.prototype */ {
    /**
     * Line chart series component.
     * @constructs LineChartSeries
     * @extends Series
     * @param {object} params parameters
     *      @param {object} params.model series model
     *      @param {object} params.options series options
     *      @param {object} params.theme series theme
     */
    init: function() {
        Series.apply(this, arguments);
    },

    /**
     * To make positions of line chart.
     * @param {{width: number, height:nunber}} dimension line chart dimension
     * @returns {array.<array.<object>>} positions
     */
    _makePositions: function(dimension) {
        var groupValues = this.percentValues,
            width = dimension.width,
            height = dimension.height,
            step = width / groupValues[0].length,
            start = step / 2,
            result = ne.util.map(groupValues, function(values) {
                return ne.util.map(values, function(value, index) {
                    return {
                        left: start + (step * index),
                        top: height - (value * height)
                    };
                });
            });
        return result;
    },

    /**
     * To make add data.
     * @returns {object} add data
     */
    makeAddData: function() {
        return {
            groupPositions: this._makePositions(this.bound.dimension)
        };
    },

    /**
     * Render series label.
     * @param {object} params parameters
     *      @param {HTMLElement} params.container container
     *      @param {array<array>} params.groupPositions group positions
     *      @param {array<array>} params.formattedValues formatted values
     * @private
     */
    _renderSeriesLabel: function(params) {
        var groupPositions = params.groupPositions,
            labelHeight = renderUtil.getRenderedLabelHeight(params.formattedValues[0][0], {
                fontSize: 12
            }),
            html;
        html = ne.util.map(params.formattedValues, function(values, groupIndex) {
            return ne.util.map(values, function(value, index) {
                var position = groupPositions[groupIndex][index],
                    labelWidth = renderUtil.getRenderedLabelWidth(value, {
                        fontSize: 12
                    }),
                    labelHtml = this._makeSeriesLabelHtml({
                        left: position.left - (labelWidth/2),
                        top: position.top - labelHeight
                    }, value, index, groupIndex);
                return labelHtml;
            }, this).join('');
        }, this).join('');

        params.container.innerHTML = seriesTemplate.TPL_SERIES_LABEL_AREA({
            html: html
        });

        // bound 정보를 얻어올 때 사용
        this.groupPositions = groupPositions;

        return params.container.firstChild;
    },

    /**
     * Get bound.
     * @param {number} groupIndex group index
     * @param {number} index index
     * @returns {left: number, top: number}
     * @private
     */
    _getBound: function(groupIndex, index) {
        return this.groupPositions[index][groupIndex];
    }
});

module.exports = LineChartSeries;
