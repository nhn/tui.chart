/**
 * @fileoverview Pie chart series component.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var Series = require('./series'),
    chartConst = require('../const'),
    renderUtil = require('../helpers/renderUtil'),
    eventListener = require('../helpers/eventListener');

var PieChartSeries = tui.util.defineClass(Series, /** @lends PieChartSeries.prototype */ {
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
        var result = tui.util.map(data.values, function(values) {
            var sum = tui.util.sum(values);
            return tui.util.map(values, function(value) {
                return value / sum;
            });
        });
        return result;
    },

    /**
     * To make sectors information.
     * @param {array.<number>} percentValues percent values
     * @param {{cx: number, cy: number, r: number}} circleBound circle bound
     * @returns {array.<object>} sectors information
     * @private
     */
    _makeSectorsInfo: function(percentValues, circleBound) {
        var cx = circleBound.cx,
            cy = circleBound.cy,
            r = circleBound.r,
            angle = 0,
            delta = 10,
            paths;

        paths = tui.util.map(percentValues, function(percentValue) {
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
                },
                positionData = {
                    cx: cx,
                    cy: cy,
                    angle: popupAngle
                };
            angle = endAngle;
            return {
                percentValue: percentValue,
                angles: angles,
                centerPosition: this._getArcPosition(tui.util.extend({
                    r: (r / 2) + delta
                }, positionData)),
                outerPosition: {
                    start: this._getArcPosition(tui.util.extend({
                        r: r
                    }, positionData)),
                    middle: this._getArcPosition(tui.util.extend({
                        r: r + delta
                    }, positionData))
                }
            };
        }, this);

        return paths;
    },

    /**
     * To make series data.
     * @param {{
     *      dimension: {width: number, height: number},
     *      position: {left: number, top: number}
     * }} bound series bound
     * @returns {{
     *      chartBackground: string,
     *      circleBound: ({cx: number, cy: number, r: number}),
     *      sectorsInfo: array.<object>
     * }} add data for graph rendering
     */
    makeSeriesData: function(bound) {
        var circleBound = this._makeCircleBound(bound.dimension, {
                showLabel: this.options.showLabel,
                legendType: this.options.legendType
            }),
            sectorsInfo = this._makeSectorsInfo(this.percentValues[0], circleBound);
        return {
            chartBackground: this.chartBackground,
            circleBound: circleBound,
            sectorsInfo: sectorsInfo
        };
    },

    /**
     * To make circle bound
     * @param {{width: number, height:number}} dimension chart dimension
     * @param {{showLabel: boolean, legendType: string}} options options
     * @returns {{cx: number, cy: number, r: number}} circle bounds
     * @private
     */
    _makeCircleBound: function(dimension, options) {
        var width = dimension.width,
            height = dimension.height,
            isSmallPie = options.legendType === chartConst.SERIES_LEGEND_TYPE_OUTER && options.showLabel,
            radiusRate = isSmallPie ? chartConst.PIE_GRAPH_SMALL_RATE : chartConst.PIE_GRAPH_DEFAULT_RATE,
            diameter = tui.util.multiplication(tui.util.min([width, height]), radiusRate);
        return {
            cx: tui.util.division(width, 2),
            cy: tui.util.division(height, 2),
            r: tui.util.division(diameter, 2)
        };
    },

    /**
     * Get arc position.
     * @param {object} params parameters
     *      @param {number} params.cx center x
     *      @param {number} params.cy center y
     *      @param {number} params.r radius
     *      @param {number} params.angle angle(degree)
     * @returns {{left: number, top: number}} arc position
     * @private
     */
    _getArcPosition: function(params) {
        return {
            left: params.cx + (params.r * Math.sin(params.angle * chartConst.RAD)),
            top: params.cy - (params.r * Math.cos(params.angle * chartConst.RAD))
        };
    },


    /**
     * To make add data for series label.
     * @param {object} seriesData series data
     * @returns {{
     *      container: HTMLElement,
     *      legendLabels: array.<string>,
     *      options: {legendType: string, showLabel: boolean},
     *      chartWidth: number,
     *      formattedValues: array
     * }} add data for make series label
     * @private
     */
    _makeSeriesDataForSeriesLabel: function(seriesData) {
        return tui.util.extend({
            legendLabels: this.data.legendLabels,
            options: {
                legendType: this.options.legendType,
                showLabel: this.options.showLabel
            },
            chartWidth: this.data.chartWidth,
            formattedValues: this.data.formattedValues[0]
        }, seriesData);
    },

    /**
     * To render raphael graph.
     * @param {{width: number, height: number}} dimension dimension
     * @param {object} seriesData series data
     * @private
     * @override
     */
    _renderGraph: function(dimension, seriesData) {
        var funcShowTooltip = tui.util.bind(this.showTooltip, this, {
                allowNegativeTooltip: !!this.allowNegativeTooltip,
                chartType: this.chartType
            }),
            funcHideTooltip = tui.util.bind(this.hideTooltip, this),
            params = this._makeParamsForGraphRendering(dimension, seriesData);

        this.paper = this.graphRenderer.render(this.paper, this.elSeriesArea, params, funcShowTooltip, funcHideTooltip);

        // series label mouse event 동작 시 사용
        this.showTooltip = funcShowTooltip;
        this.hideTooltip = funcHideTooltip;
    },

    /**
     * To render series component of pie chart.
     * @param {{
     *      dimension: {width: number, height: number},
     *      position: {left: number, top: number}
     * }} bound series bound
     * @param {object} data data for rendering
     * @param {object} paper object for graph drawing
     * @returns {HTMLElement} series element
     * @override
     */
    render: function() {
        var el = Series.prototype.render.apply(this, arguments);
        this.attachEvent(el);

        return el;
    },

    /**
     * Show tooltip (mouseover callback).
     * @param {object} params parameters
     *      @param {boolean} params.allowNegativeTooltip whether allow negative tooltip or not
     * @param {{top:number, left: number, width: number, height: number}} bound graph bound information
     * @param {number} groupIndex group index
     * @param {number} index index
     * @param {{clientX: number, clientY: number}} eventPosition mouse event position
     */
    showTooltip: function(params, bound, groupIndex, index, eventPosition) {
        this.fire('showTooltip', tui.util.extend({
            indexes: {
                groupIndex: groupIndex,
                index: index
            },
            bound: bound,
            eventPosition: eventPosition
        }, params));
    },

    /**
     * Hide tooltip (mouseout callback).
     * @param {string} id tooltip id
     */
    hideTooltip: function() {
        this.fire('hideTooltip');
    },

    /**
     * Get series label.
     * @param {object} params parameters
     *      @param {string} params.legend legend
     *      @param {string} params.label label
     *      @param {string} params.separator separator
     *      @param {{legendType: boolean, showLabel: boolean}} params.options options
     * @returns {string} series label
     * @private
     */
    _getSeriesLabel: function(params) {
        var seriesLabel = '';

        if (params.options.legendType) {
            seriesLabel = params.legend;
        }

        if (params.options.showLabel) {
            seriesLabel += (seriesLabel ? params.separator : '') + params.label;
        }

        return seriesLabel;
    },

    /**
     * Render center legend.
     * @param {object} params parameters
     *      @param {array.<object>} params.positions positions
     *      @param {array.<string>} params.legends legendLabels
     *      @param {array.<string>} params.formattedValues formatted values
     *      @param {string} params.separator separator
     *      @param {object} params.options options
     *      @param {function} params.funcMoveToPosition function
     * @param {HTMLElement} elSeriesLabelArea series label area element
     * @private
     */
    _renderLegendLabel: function(params, elSeriesLabelArea) {
        var positions = params.positions,
            formattedValues = params.formattedValues,
            html;
        html = tui.util.map(params.legendLabels, function(legend, index) {
            var label = this._getSeriesLabel({
                    legend: legend,
                    label: formattedValues[index],
                    separator: params.separator,
                    options: params.options
                }),
                position = params.funcMoveToPosition(positions[index], label);
            return this.makeSeriesLabelHtml(position, label, 0, index);
        }, this).join('');

        elSeriesLabelArea.innerHTML = html;
    },

    /**
     * Move to center position.
     * @param {{left: number, top: number}} position position
     * @param {string} label label
     * @returns {{left: number, top: number}} center position
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
     *      @param {object} params.sectorsInfo sector info
     * @param {HTMLElement} elSeriesLabelArea series label area element
     * @private
     */
    _renderCenterLegend: function(params, elSeriesLabelArea) {
        this._renderLegendLabel(tui.util.extend({
            positions: tui.util.pluck(params.sectorsInfo, 'centerPosition'),
            funcMoveToPosition: tui.util.bind(this._moveToCenterPosition, this),
            separator: '<br>'
        }, params), elSeriesLabelArea);
    },

    /**
     * Add end position.
     * @param {number} centerLeft center left
     * @param {array.<object>} positions positions
     * @private
     */
    _addEndPosition: function(centerLeft, positions) {
        tui.util.forEach(positions, function(position) {
            var end = tui.util.extend({}, position.middle);
            if (end.left < centerLeft) {
                end.left -= chartConst.SERIES_OUTER_LABEL_PADDING;
            } else {
                end.left += chartConst.SERIES_OUTER_LABEL_PADDING;
            }
            position.end = end;
        });
    },

    /**
     * Move to outer position.
     * @param {number} centerLeft center left
     * @param {object} position position
     * @param {string} label label
     * @returns {{left: number, top: number}} outer position
     * @private
     */
    _moveToOuterPosition: function(centerLeft, position, label) {
        var positionEnd = position.end,
            left = positionEnd.left,
            top = positionEnd.top - (renderUtil.getRenderedLabelHeight(label, this.theme.label) / 2);

        if (left < centerLeft) {
            left -= renderUtil.getRenderedLabelWidth(label, this.theme.label) + chartConst.SERIES_LABEL_PADDING;
        } else {
            left += chartConst.SERIES_LABEL_PADDING;
        }

        return {
            left: left,
            top: top
        };
    },

    /**
     * Render outer legend.
     * @param {object} params parameters
     *      @param {object} params.sectorsInfo sector info
     *      @param {number} params.chartWidth chart width
     * @param {HTMLElement} elSeriesLabelArea series label area element
     * @private
     */
    _renderOuterLegend: function(params, elSeriesLabelArea) {
        var outerPositions = tui.util.pluck(params.sectorsInfo, 'outerPosition'),
            centerLeft = params.chartWidth / 2;
        this._addEndPosition(centerLeft, outerPositions);
        this._renderLegendLabel(tui.util.extend({
            positions: outerPositions,
            funcMoveToPosition: tui.util.bind(this._moveToOuterPosition, this, centerLeft),
            separator: ':&nbsp;'
        }, params), elSeriesLabelArea);

        if (this.paper && !this.isRenderdLines) {
            this.isRenderdLines = true;
            this.graphRenderer.renderLegendLines(this.paper, outerPositions);
        }
    },

    /**
     * Render series label.
     * @param {object} params parameters
     * @param {HTMLElement} elSeriesLabelArea series label area element
     * @private
     */
    _renderSeriesLabel: function(params, elSeriesLabelArea) {
        if (params.options.legendType === chartConst.SERIES_LEGEND_TYPE_OUTER) {
            this._renderOuterLegend(params, elSeriesLabelArea);
        } else {
            this._renderCenterLegend(params, elSeriesLabelArea);
        }
    },

    /**
     * Get bound.
     * @returns {null} bound
     * @private
     */
    _getBound: function() {
        return null;
    },

    /**
     * Show series label area.
     */
    animateShowSeriesLabelArea: function() {
        this.graphRenderer.animateLegendLines();
        Series.prototype.animateShowSeriesLabelArea.call(this);
    },

    showSeriesLabelArea: function(seriesData) {
        var outerPositions = tui.util.pluck(seriesData.sectorsInfo, 'outerPosition'),
            centerLeft = this.data.chartWidth / 2;
        this._addEndPosition(centerLeft, outerPositions);
        this.graphRenderer.moveLegendLines(outerPositions);
        Series.prototype.showSeriesLabelArea.call(this);
    },

    /**
     * To handle mouse event.
     * @param {MouseEvent} e mouse event
     * @param {function} callback callback
     * @private
     */
    _handleMouseEvent: function(e, callback) {
        var elTarget = e.target || e.srcElement,
            elLabel = this._findLabelElement(elTarget),
            groupIndex, index;

        if (!elLabel) {
            return;
        }

        groupIndex = parseInt(elLabel.getAttribute('data-group-index'), 10);
        index = parseInt(elLabel.getAttribute('data-index'), 10);

        if (groupIndex === -1 || index === -1) {
            return;
        }

        callback(groupIndex, index);
    },

    /**
     * On click event handler.
     * @param {MouseEvent} e mouse event
     * @override
     */
    onClick: function(e) {
        var that = this;
        this._handleMouseEvent(e, function(groupIndex, index) {
            var legendData;
            if (that.options.legendType) {
                legendData = that.data.joinLegendLabels[index];
                that.userEvent.fire('selectLegend', {
                    legend: legendData.label,
                    chartType: legendData.chartType,
                    index: index
                });
            }
        });
    },

    /**
     * This is event handler for mouseover.
     * @param {MouseEvent} e mouse event
     */
    onMouseover: function(e) {
        var that = this;
        this._handleMouseEvent(e, function(groupIndex, index) {
            var bound = that._getBound(groupIndex, index) || that._makeLabelBound(e.clientX, e.clientY);
            that.showTooltip(bound, groupIndex, index);
        });
    },

    /**
     * This is event handler for mouseout.
     * @param {MouseEvent} e mouse event
     */
    onMouseout: function(e) {
        var that = this;
        this._handleMouseEvent(e, function(groupIndex, index) {
            that.hideTooltip(groupIndex, index);
        });
    },

    /**
     * Attach event
     * @param {HTMLElement} el target element
     */
    attachEvent: function(el) {
        eventListener.bindEvent('click', el, tui.util.bind(this.onClick, this));
        eventListener.bindEvent('mouseover', el, tui.util.bind(this.onMouseover, this));
        eventListener.bindEvent('mouseout', el, tui.util.bind(this.onMouseout, this));
    }
});

tui.util.CustomEvents.mixin(PieChartSeries);

module.exports = PieChartSeries;
