/**
 * @fileoverview Pie chart series component.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var Series = require('./series'),
    seriesTemplate = require('./seriesTemplate'),
    chartConst = require('../const'),
    dom = require('../helpers/domHandler'),
    renderUtil = require('../helpers/renderUtil');

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
     * To make sectors information.
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
            var addAngle = chartConst.ANGLE_360 * percentValue,
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
                }),
                outerPosition: {
                    start: this._getArcPosition({
                        cx: cx,
                        cy: cy,
                        r: r,
                        angle: popupAngle
                    }),
                    middle: this._getArcPosition({
                        cx: cx,
                        cy: cy,
                        r: r + 10,
                        angle: popupAngle
                    })
                }
            };
        }, this);

        return paths;
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
        var circleBound = this._makeCircleBound(this.bound.dimension, {
                shownLabel: this.options.shownLabel,
                legendType: this.options.legendType
            }),
            sectorsInfo = this._makeSectorsInfo(this.percentValues[0], circleBound);

        this.popupPositions = ne.util.pluck(sectorsInfo, 'popupPosition');
        return {
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
    _makeCircleBound: function(dimension, options) {
        var width = dimension.width,
            height = dimension.height,
            isSmallPie = options.legendType === chartConst.SERIES_LEGEND_TYPE_OUTER && options.shownLabel,
            radiusRate = isSmallPie ? chartConst.PIE_GRAPH_SMALL_RATE : chartConst.PIE_GRAPH_DEFAULT_RATE,
            diameter = ne.util.multiplication(ne.util.min([width, height]), radiusRate);
        return {
            cx: ne.util.division(width, 2),
            cy: ne.util.division(height, 2),
            r: ne.util.division(diameter, 2)
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
            left: params.cx + params.r * Math.sin(params.angle * chartConst.RAD),
            top: params.cy - params.r * Math.cos(params.angle * chartConst.RAD)
        };
    },


    /**
     * To make add data for series label.
     * @param {HTMLElement} el container
     * @returns {{container: *, legendLabels: *, options: {legendType: (*|string|boolean), shownLabel: (*|boolean)}, chartWidth: (*|number), formattedValues: *}}
     * @private
     */
    _makeAddDataForSeriesLabel: function(container) {
        return {
            container: container,
            legendLabels: this.data.legendLabels,
            options: {
                legendType: this.options.legendType,
                shownLabel: this.options.shownLabel
            },
            chartWidth: this.data.chartWidth,
            formattedValues: this.data.formattedValues[0],
        };
    },

    /**
     * Get series label.
     * @param {object} params
     *      @param {string} params.legend
     *      @param {string} params.lable
     *      @param {string} params.separator
     *      @param {{legendType: boolean, shownLabel: boolean}} params.options
     * @returns {string}
     * @private
     */
    _getSeriesLabel: function(params) {
        var seriesLabel = '';
        if (params.options.legendType) {
            seriesLabel = params.legend;
        }

        if (params.options.shownLabel) {
            seriesLabel += (seriesLabel ? params.separator : '') + params.label;
        }

        return seriesLabel
    },

    /**
     * Render center legend.
     * @param {object} params parameters
     *      @param {HTMLElement} container container
     *      @param {array<string>} legends legends
     *      @param {array<object>} centerPositions center positions
     * @private
     */
    _renderLegendLabel: function(params) {
        var positions = params.positions,
            formattedValues = params.formattedValues,
            elSeriesLabelArea = dom.create('div', 'ne-chart-series-label-area'),
            html;

        html = ne.util.map(params.legendLabels, function(legend, index) {
            var label = this._getSeriesLabel({
                    legend: legend,
                    label: formattedValues[index],
                    separator: params.separator,
                    options: params.options
                }),
                position = params.moveToPosition(positions[index], label);
            return this._makeSeriesLabelHtml(position, label, 0, index);
        }, this).join('');

        elSeriesLabelArea.innerHTML = html;
        params.container.appendChild(elSeriesLabelArea);

        return elSeriesLabelArea;
    },

    /**
     * Move to center position.
     * @param {{left: number, top: number}} position position
     * @param {string} label label
     * @returns {{left: number, top: number}}
     * @private
     */
    _moveToCenterPosition: function(position, label) {
        var left = position.left - (renderUtil.getRenderedLabelWidth(label, this.theme.label) / 2),
            top = position.top - (renderUtil.getRenderedLabelHeight(label, this.theme.label) / 2);
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
        var elArea = this._renderLegendLabel(ne.util.extend({
            positions: ne.util.pluck(params.sectorsInfo, 'centerPosition'),
            moveToPosition: ne.util.bind(this._moveToCenterPosition, this),
            separator: '<br>'
        }, params));

        return elArea;
    },

    /**
     * Add end position.
     * @param {number} centerLeft center left
     * @param {array<object>} positions positions
     * @private
     */
    _addEndPosition: function(centerLeft, positions) {
        ne.util.forEach(positions, function(position) {
            var end = ne.util.extend({}, position.middle);
            if (end.left < centerLeft) {
                end.left -= chartConst.SERIES_OUTER_LABEL_PADDING;
            } else {
                end.left += chartConst.SERIES_OUTER_LABEL_PADDING;
            }
            position.end = end;
        });
    },

    /**
     * Mode to outer position.
     * @param {number} centerLeft center left
     * @param {array<object>} positions positions
     * @param {string} label label
     * @returns {{left: number, top: number}}
     * @private
     */
    _moveToOuterPosition: function(centerLeft, position , label) {
        var positionEnd = position.end,
            left = positionEnd.left,
            top = positionEnd.top - (renderUtil.getRenderedLabelHeight(label, this.theme.label) / 2);

        if (left < centerLeft) {
            left -= renderUtil.getRenderedLabelWidth(label, this.theme.label) + 5;
        } else {
            left += 5;
        }

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
    _renderOuterLegend: function(params) {
        var outerPositions = ne.util.pluck(params.sectorsInfo, 'outerPosition'),
            centerLeft = params.chartWidth / 2,
            elArea;

        this._addEndPosition(centerLeft, outerPositions);
        elArea = this._renderLegendLabel(ne.util.extend({
            positions: outerPositions,
            moveToPosition: ne.util.bind(this._moveToOuterPosition, this, centerLeft),
            separator: ':&nbsp;'
        }, params));

        if (this.paper) {
            this.graphRenderer.renderLegendLines(this.paper, outerPositions);
        }

        return elArea;
    },

    /**
     * Render series label.
     * @param params
     * @returns {*}
     * @private
     */
    _renderSeriesLabel: function(params) {
        var elArea;
        if (params.options.legendType === chartConst.SERIES_LEGEND_TYPE_OUTER) {
            elArea = this._renderOuterLegend(params);
        } else {
            elArea = this._renderCenterLegend(params);
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
    },

    /**
     * Show series label area.
     */
    showSeriesLabelArea: function() {
        this.graphRenderer.animateLegendLines();
        Series.prototype.showSeriesLabelArea.call(this);
    }
});

module.exports = PieChartSeries;
