/**
 * @fileoverview Pie chart series component.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var Series = require('./series.js'),
    seriesTemplate = require('./seriesTemplate.js'),
    renderUtil = require('../helpers/renderUtil.js');

var ANGLE_360 = 360,
    RAD = Math.PI / 180;

var PieChartSeries = ne.util.defineClass(Series, /** @lends Series.prototype */ {
    /**
     * Line chart series component.
     * @constructs PieChartSeries
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
     * To make percent value.
     * @param {{values: array, scale: {min: number, max: number}}} data series data
     * @returns {array.<array.<number>>} percent values
     * @private
     */
    _makePercentValues: function(data) {
        var result = ne.util.map(data.values, function(values) {
            var sum = ne.util.sum(values);
            return ne.util.map(values, function(value) {
                return value / sum;
            });
        });
        return result;
    },

    /**
     * To make add data.
     * @returns {{
     *      formattedValues: array,
     *      chartBackground: string,
     *      circleBound: ({cx: number, cy: number, r: number}),
     *      sectorsInfo: array<object>
     * }}
     */
    makeAddData: function() {
        var circleBound = this._makeCircleBound(this.bound.dimension),
            sectorsInfo = this._makeSectorsInfo(this.percentValues[0], circleBound);

        this.popupPositions = ne.util.pluck(sectorsInfo, 'popupPosition');
        return {
            formattedValues: this.data.formattedValues[0],
            chartBackground: this.chartBackground,
            circleBound: circleBound,
            sectorsInfo: sectorsInfo
        };
    },

    /**
     * To make circle bound
     * @param {{width: number, height:number}} dimension chart dimension
     * @returns {{cx: number, cy: number, r: number}} circle bounds
     * @private
     */
    _makeCircleBound: function(dimension) {
        var width = dimension.width,
            height = dimension.height,
            stdSize = ne.util.multiplication(ne.util.min([width, height]), 0.8);
        return {
            cx: ne.util.division(width, 2),
            cy: ne.util.division(height, 2),
            r: ne.util.division(stdSize, 2)
        };
    },

    /**
     *
     * @param {object} params parameters
     *      @param {number} params.cx center x
     *      @param {number} params.cy center y
     *      @param {number} params.r radius
     *      @param {number} params.angle angle(degree)
     * @returns {{left: number, top: number}}
     * @private
     */
    _getArcPosition: function(params) {
        return {
            left: params.cx + params.r * Math.sin(params.angle * RAD),
            top: params.cy - params.r * Math.cos(params.angle * RAD)
        };
    },

    /**
     * To make sectors infomation.
     * @param percentValues
     * @param circleBound
     * @returns {Array|*}
     * @private
     */
    _makeSectorsInfo: function(percentValues, circleBound) {
        var cx = circleBound.cx,
            cy = circleBound.cy,
            r = circleBound.r,
            angle = 0,
            delta = 10,
            paths;

        paths = ne.util.map(percentValues, function(percentValue, index) {
            var addAngle = ANGLE_360 * percentValue,
                endAngle = angle + addAngle,
                popupAngle = angle + (addAngle / 2),
                angles = {
                    start: {
                        startAngle: angle,
                        endAngle: angle
                    },
                    end: {
                        startAngle: angle,
                        endAngle: endAngle
                    }
                };
            angle = endAngle;
            return {
                percentValue: percentValue,
                angles: angles,
                popupPosition: this._getArcPosition({
                    cx: cx,
                    cy: cy,
                    r: r + delta,
                    angle: popupAngle
                }),
                centerPosition: this._getArcPosition({
                    cx: cx,
                    cy: cy,
                    r: r / 2 + delta,
                    angle: popupAngle
                })
            };
        }, this);

        return paths;
    },

    /**
     * Move to center position.
     * @param {{left: number, top: number}} position position
     * @param {string} label label
     * @returns {{left: number, top: number}}
     * @private
     */
    _moveToCenterPosition: function(position, label) {
        var left = position.left - (renderUtil.getRenderedLabelWidth(label) / 2),
            top = position.top - (renderUtil.getRenderedLabelHeight(label) / 2);
        return {
            left: left,
            top: top
        };
    },

    /**
     * Render center legend.
     * @param {object} params parameters
     *      @param {HTMLElement} container container
     *      @param {array<string>} legends legends
     *      @param {array<object>} centerPositions center positions
     * @private
     */
    _renderCenterLegend: function(params) {
        var centerPositions = params.centerPositions,
            formattedValues = params.formattedValues,
            showLabel = params.showLabel,
            html;
        html = ne.util.map(params.legendLabels, function(legend, index) {
            var label = legend + (showLabel ? '<br>' + formattedValues[index] : ''),
                position = this._moveToCenterPosition(centerPositions[index], label);
            return seriesTemplate.TPL_SERIES_LABEL({
                cssText: seriesTemplate.TPL_CSS_POSITION(position),
                groupIndex: 0,
                index: index,
                value: label
            })
        }, this).join('');
        html = seriesTemplate.TPL_SERIES_LABEL_AREA({
            html: html
        });
        params.container.innerHTML = html;

        return params.container.firstChild;
    },

    _renderLegend: function(params) {
        var elArea;
        if (params.options.showLegend === 'outer') {

        } else {
            elArea = this._renderCenterLegend({
                container: params.container,
                legendLabels: params.legendLabels,
                centerPositions: ne.util.pluck(params.sectorsInfo, 'centerPosition'),
                formattedValues: params.formattedValues,
                showLabel: params.options.showLabel
            });
        }

        return elArea;
    },

    /**
     * Get bound.
     * @param {number} groupIndex group index
     * @param {number} index index
     * @returns {left: number, top: number}
     * @private
     */
    _getBound: function(groupIndex, index) {
        if (groupIndex === -1 || index === -1) {
            return null;
        }
        return this.popupPositions[index];
    }
});

module.exports = PieChartSeries;
