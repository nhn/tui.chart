/**
 * @fileoverview Pie chart series component.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var Series = require('./series'),
    chartConst = require('../const'),
    predicate = require('../helpers/predicate'),
    renderUtil = require('../helpers/renderUtil');

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
    init: function(params) {
        /**
         * legend align option.
         * @type {boolean}
         */
        this.legendAlign = params.legendAlign;

        /**
         * chart background.
         * @type {string}
         */
        this.chartBackground = params.chartBackground;

        Series.call(this, params);
    },

    /**
     * Make sectors information.
     * @param {Array.<number>} percentValues percent values
     * @param {{cx: number, cy: number, r: number}} circleBound circle bound
     * @returns {Array.<object>} sectors information
     * @private
     */
    _makeSectorData: function(percentValues, circleBound) {
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
     * Make series data.
     * @returns {{
     *      chartBackground: string,
     *      circleBound: ({cx: number, cy: number, r: number}),
     *      sectorData: Array.<object>
     * }} add data for graph rendering
     * @private
     * @override
     */
    _makeSeriesData: function() {
        var circleBound = this._makeCircleBound(this.boundsMaker.getDimension('series'), {
                showLabel: this.options.showLabel,
                legendAlign: this.legendAlign
            }),
            sectorData = this._makeSectorData(this._getPercentValues()[0], circleBound);

        return {
            chartBackground: this.chartBackground,
            circleBound: circleBound,
            sectorData: sectorData
        };
    },

    /**
     * Make circle bound
     * @param {{width: number, height:number}} dimension chart dimension
     * @param {{showLabel: boolean, legendAlign: string}} options options
     * @returns {{cx: number, cy: number, r: number}} circle bounds
     * @private
     */
    _makeCircleBound: function(dimension, options) {
        var width = dimension.width,
            height = dimension.height,
            isSmallPie = predicate.isOuterLegendAlign(options.legendAlign) && options.showLabel,
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
     * Render raphael graph.
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
            callbacks = {
                funcShowTooltip: funcShowTooltip,
                funcHideTooltip: tui.util.bind(this.hideTooltip, this),
                funcSelectSeries: tui.util.bind(this.selectSeries, this)
            },
            params = this._makeParamsForGraphRendering(dimension, seriesData);

        this.graphRenderer.render(this.seriesContainer, params, callbacks);
    },

    /**
     * Resize.
     * @override
     */
    resize: function() {
        Series.prototype.resize.apply(this, arguments);
        this._moveLegendLines();
    },

    /**
     * showTooltip is mouseover event callback on series graph.
     * @param {object} params parameters
     *      @param {boolean} params.allowNegativeTooltip whether allow negative tooltip or not
     * @param {{top:number, left: number, width: number, height: number}} bound graph bound information
     * @param {number} groupIndex group index
     * @param {number} index index
     * @param {{left: number, top: number}} mousePosition mouse position
     */
    showTooltip: function(params, bound, groupIndex, index, mousePosition) {
        this.fire('showTooltip', tui.util.extend({
            indexes: {
                groupIndex: groupIndex,
                index: index
            },
            mousePosition: mousePosition
        }, params));
    },

    /**
     * hideTooltip is mouseout event callback on series graph.
     * @param {string} id tooltip id
     */
    hideTooltip: function() {
        this.fire('hideTooltip');
    },

    /**
     * Make series data by selection.
     * @param {number} index index
     * @returns {{indexes: {index: number, groupIndex: number}}} series data
     * @private
     */
    _makeSeriesDataBySelection: function(index) {
        return {
            indexes: {
                index: index,
                groupIndex: index
            }
        };
    },

    /**
     * selectSeries is click event callback on series graph.
     * @param {number} index index
     */
    selectSeries: function(index) {
        var seriesData = this._makeSeriesDataBySelection(index);
        if (this.selectedIndex === index) {
            this.onUnselectSeries(seriesData);
            delete this.selectedIndex;
        } else {
            if (!tui.util.isUndefined(this.selectedIndex)) {
                this.onUnselectSeries(this._makeSeriesDataBySelection(this.selectedIndex));
            }
            this.onSelectSeries(seriesData);
            this.selectedIndex = index;
        }
    },

    /**
     * Get series label.
     * @param {object} params parameters
     *      @param {string} params.legend legend
     *      @param {string} params.label label
     *      @param {string} params.separator separator
     *      @param {{legendAlign: ?string, showLabel: boolean}} params.options options
     * @returns {string} series label
     * @private
     */
    _getSeriesLabel: function(params) {
        var seriesLabel = '';

        if (this.legendAlign) {
            seriesLabel = '<span class="tui-chart-series-legend">' + params.legend + '</span>';
        }

        if (this.options.showLabel) {
            seriesLabel += (seriesLabel ? params.separator : '') + params.label;
        }

        return seriesLabel;
    },

    /**
     * Render center legend.
     * @param {object} params parameters
     *      @param {Array.<object>} params.positions positions
     *      @param {string} params.separator separator
     *      @param {object} params.options options
     *      @param {function} params.funcMoveToPosition function
     * @param {HTMLElement} seriesLabelContainer series label area element
     * @private
     */
    _renderLegendLabel: function(params, seriesLabelContainer) {
        var positions = params.positions,
            htmls;

        htmls = tui.util.map(this.dataProcessor.getLegendLabels(), function(legend, index) {
            var html = '',
                label, position;

            if (positions[index]) {
                label = this._getSeriesLabel({
                    legend: legend,
                    label: this.dataProcessor.getFormattedValue(0, index, this.chartType),
                    separator: params.separator
                });
                position = params.funcMoveToPosition(positions[index], label);
                html = this._makeSeriesLabelHtml(position, label, 0, index);
            }

            return html;
        }, this);
        seriesLabelContainer.innerHTML = htmls.join('');
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
     * Pick poistions from sector data.
     * @param {string} positionType position type
     * @returns {Array} positions
     * @private
     */
    _pickPositionsFromSectorData: function(positionType) {
        return tui.util.map(this.seriesData.sectorData, function(datum) {
            return datum.percentValue ? datum[positionType] : null;
        });
    },

    /**
     * Render center legend.
     * @param {HTMLElement} seriesLabelContainer series label area element
     * @private
     */
    _renderCenterLegend: function(seriesLabelContainer) {
        this._renderLegendLabel({
            positions: this._pickPositionsFromSectorData('centerPosition'),
            funcMoveToPosition: tui.util.bind(this._moveToCenterPosition, this),
            separator: '<br>'
        }, seriesLabelContainer);
    },

    /**
     * Add end position.
     * @param {number} centerLeft center left
     * @param {Array.<object>} positions positions
     * @private
     */
    _addEndPosition: function(centerLeft, positions) {
        tui.util.forEachArray(positions, function(position) {
            var end;

            if (!position) {
                return;
            }

            end = tui.util.extend({}, position.middle);
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
     * @param {HTMLElement} seriesLabelContainer series label area element
     * @private
     */
    _renderOuterLegend: function(seriesLabelContainer) {
        var centerLeft = this.boundsMaker.getDimension('chart').width / 2,
            outerPositions = this._pickPositionsFromSectorData('outerPosition'),
            filteredPositions = tui.util.filter(outerPositions, function(position) {
                return position;
            });

        this._addEndPosition(centerLeft, filteredPositions);
        this._renderLegendLabel({
            positions: outerPositions,
            funcMoveToPosition: tui.util.bind(this._moveToOuterPosition, this, centerLeft),
            separator: ':&nbsp;'
        }, seriesLabelContainer);

        this.graphRenderer.renderLegendLines(filteredPositions);
    },

    /**
     * Render series label.
     * @param {HTMLElement} seriesLabelContainer series label area element
     * @private
     */
    _renderSeriesLabel: function(seriesLabelContainer) {
        var legendAlign = this.legendAlign;

        if (predicate.isOuterLegendAlign(legendAlign)) {
            this._renderOuterLegend(seriesLabelContainer);
        } else {
            this._renderCenterLegend(seriesLabelContainer);
        }
    },

    /**
     * Animate showing about series label area.
     * @override
     */
    animateShowingAboutSeriesLabelArea: function() {
        this.graphRenderer.animateLegendLines();
        Series.prototype.animateShowingAboutSeriesLabelArea.call(this);
    },

    /**
     * Move legend lines.
     * @private
     * @override
     */
    _moveLegendLines: function() {
        var centerLeft = this.boundsMaker.getDimension('chart').width / 2,
            outerPositions = this._pickPositionsFromSectorData('outerPosition'),
            filteredPositions = tui.util.filter(outerPositions, function(position) {
                return position;
            });

        this._addEndPosition(centerLeft, filteredPositions);
        this.graphRenderer.moveLegendLines(filteredPositions);
    },

    /**
     * On click series.
     * @param {{left: number, top: number}} position mouse position
     */
    onClickSeries: function(position) {
        this._executeGraphRenderer(position, 'clickSeries');
    },

    /**
     * On move series.
     * @param {{left: number, top: number}} position mouse position
     */
    onMoveSeries: function(position) {
        this._executeGraphRenderer(position, 'moveMouseOnSeries');
    }
});

tui.util.CustomEvents.mixin(PieChartSeries);

module.exports = PieChartSeries;
