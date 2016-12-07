/**
 * @fileoverview Pie chart series component.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var Series = require('./series');
var chartConst = require('../../const');
var predicate = require('../../helpers/predicate');
var renderUtil = require('../../helpers/renderUtil');

var PieChartSeries = tui.util.defineClass(Series, /** @lends PieChartSeries.prototype */ {
    /**
     * Line chart series component.
     * @constructs PieChartSeries
     * @private
     * @extends Series
     * @param {object} params parameters
     *      @param {object} params.model series model
     *      @param {object} params.options series options
     *      @param {object} params.theme series theme
     */
    init: function(params) {
        Series.call(this, params);

        this.isCombo = !!params.isCombo;

        this.isShowOuterLabel = !!params.isShowOuterLabel || predicate.isShowOuterLabel(this.options);

        /**
         * range for quadrant.
         * @type {?number}
         */
        this.quadrantRange = null;

        /**
         * previous clicked index.
         * @type {?number}
         */
        this.prevClickedIndex = null;

        this._setDefaultOptions();
    },

    /**
     * Make valid angle.
     * @param {number} angle - angle
     * @param {number} defaultAngle - default angle
     * @returns {number}
     * @private
     */
    _makeValidAngle: function(angle, defaultAngle) {
        if (tui.util.isUndefined(angle)) {
            angle = defaultAngle;
        } else if (angle < 0) {
            angle = chartConst.ANGLE_360 - (Math.abs(angle) % chartConst.ANGLE_360);
        } else if (angle > 0) {
            angle = angle % chartConst.ANGLE_360;
        }

        return angle;
    },

    /**
     * Transform radius range.
     * @param {Array.<number>} radiusRange - radius range
     * @returns {Array}
     * @private
     */
    _transformRadiusRange: function(radiusRange) {
        radiusRange = radiusRange || ['0%', '100%'];

        return tui.util.map(radiusRange, function(percent) {
            var ratio = parseInt(percent, 10) * 0.01;

            return Math.max(Math.min(ratio, 1), 0);
        });
    },

    /**
     * Set default options for series of pie type chart.
     * @private
     */
    _setDefaultOptions: function() {
        var options = this.options;

        options.startAngle = this._makeValidAngle(options.startAngle, 0);
        options.endAngle = this._makeValidAngle(options.endAngle, options.startAngle);
        options.radiusRange = this._transformRadiusRange(options.radiusRange);

        if (options.radiusRange.length === 1) {
            options.radiusRange.unshift(0);
        }
    },

    /**
     * Calculate angle for rendering.
     * @returns {number}
     * @private
     */
    _calculateAngleForRendering: function() {
        var startAngle = this.options.startAngle;
        var endAngle = this.options.endAngle;
        var renderingAngle;

        if (startAngle < endAngle) {
            renderingAngle = endAngle - startAngle;
        } else if (startAngle > endAngle) {
            renderingAngle = chartConst.ANGLE_360 - (startAngle - endAngle);
        } else {
            renderingAngle = chartConst.ANGLE_360;
        }

        return renderingAngle;
    },

    /**
     * Make sectors information.
     * @param {{cx: number, cy: number, r: number}} circleBound circle bound
     * @returns {Array.<object>} sectors information
     * @private
     */
    _makeSectorData: function(circleBound) {
        var self = this;
        var seriesGroup = this._getSeriesDataModel().getFirstSeriesGroup();
        var cx = circleBound.cx;
        var cy = circleBound.cy;
        var r = circleBound.r;
        var angle = this.options.startAngle;
        var angleForRendering = this._calculateAngleForRendering();
        var delta = 10;
        var holeRatio = this.options.radiusRange[0];
        var centerR = r * 0.5;
        var paths;

        if (holeRatio) {
            centerR += centerR * holeRatio;
        }

        paths = seriesGroup.map(function(seriesItem) {
            var currentAngle = angleForRendering * seriesItem.ratio;
            var endAngle = angle + currentAngle;
            var popupAngle = angle + (currentAngle / 2);
            var angles = {
                start: {
                    startAngle: angle,
                    endAngle: angle
                },
                end: {
                    startAngle: angle,
                    endAngle: endAngle
                }
            };
            var positionData = {
                cx: cx,
                cy: cy,
                angle: popupAngle
            };

            angle = endAngle;

            return {
                ratio: seriesItem.ratio,
                angles: angles,
                centerPosition: self._getArcPosition(tui.util.extend({
                    r: centerR
                }, positionData)),
                outerPosition: {
                    start: self._getArcPosition(tui.util.extend({
                        r: r
                    }, positionData)),
                    middle: self._getArcPosition(tui.util.extend({
                        r: r + delta
                    }, positionData))
                }
            };
        });

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
        var circleBound = this._makeCircleBound();
        var sectorData = this._makeSectorData(circleBound);

        return {
            chartBackground: this.chartBackground,
            circleBound: circleBound,
            sectorData: sectorData,
            isAvailable: function() {
                return sectorData && sectorData.length > 0;
            }
        };
    },

    /**
     * Get quadrant from angle.
     * @param {number} angle - angle
     * @param {boolean} isEnd whether end quadrant
     * @returns {number}
     * @private
     */
    _getQuadrantFromAngle: function(angle, isEnd) {
        var quadrant = parseInt(angle / chartConst.ANGLE_90, 10) + 1;

        if (isEnd && (angle % chartConst.ANGLE_90 === 0)) {
            quadrant += (quadrant === 1) ? 3 : -1;
        }

        return quadrant;
    },

    /**
     * Get range for quadrant.
     * @returns {{start: number, end: number}}
     * @private
     */
    _getRangeForQuadrant: function() {
        if (!this.quadrantRange) {
            this.quadrantRange = {
                start: this._getQuadrantFromAngle(this.options.startAngle),
                end: this._getQuadrantFromAngle(this.options.endAngle, true)
            };
        }

        return this.quadrantRange;
    },

    /**
     * Whether in range for quadrant.
     * @param {number} start - start quadrant
     * @param {number} end - end quadrant
     * @returns {boolean}
     * @private
     */
    _isInQuadrantRange: function(start, end) {
        var quadrantRange = this._getRangeForQuadrant();

        return quadrantRange.start === start && quadrantRange.end === end;
    },

    /**
     * Calculate base size.
     * @returns {number}
     * @private
     */
    _calculateBaseSize: function() {
        var dimension = this.layout.dimension;
        var width = dimension.width;
        var height = dimension.height;
        var quadrantRange;

        if (!this.isCombo) {
            quadrantRange = this._getRangeForQuadrant();
            if (this._isInQuadrantRange(2, 3) || this._isInQuadrantRange(4, 1)) {
                height *= 2;
            } else if (this._isInQuadrantRange(1, 2) || this._isInQuadrantRange(3, 4)) {
                width *= 2;
            } else if (quadrantRange.start === quadrantRange.end) {
                width *= 2;
                height *= 2;
            }
        }

        return Math.min(width, height);
    },

    /**
     * Calculate radius.
     * @returns {number}
     * @private
     */
    _calculateRadius: function() {
        var radiusRatio = this.isShowOuterLabel ? chartConst.PIE_GRAPH_SMALL_RATIO : chartConst.PIE_GRAPH_DEFAULT_RATIO;
        var baseSize = this._calculateBaseSize();

        return baseSize * radiusRatio * this.options.radiusRange[1] / 2;
    },

    /**
     * Calculate center x, y.
     * @param {number} radius - radius
     * @returns {{cx: number, cy: number}}
     * @private
     */
    _calculateCenterXY: function(radius) {
        var dimension = this.layout.dimension;
        var halfRadius = radius / 2;
        var cx = dimension.width / 2;
        var cy = dimension.height / 2;

        if (!this.isCombo) {
            if (this._isInQuadrantRange(1, 1)) {
                cx -= halfRadius;
                cy += halfRadius;
            } else if (this._isInQuadrantRange(1, 2)) {
                cx -= halfRadius;
            } else if (this._isInQuadrantRange(2, 2)) {
                cx -= halfRadius;
                cy -= halfRadius;
            } else if (this._isInQuadrantRange(2, 3)) {
                cy -= halfRadius;
            } else if (this._isInQuadrantRange(3, 3)) {
                cx += halfRadius;
                cy -= halfRadius;
            } else if (this._isInQuadrantRange(3, 4)) {
                cx += halfRadius;
            } else if (this._isInQuadrantRange(4, 1)) {
                cy += halfRadius;
            } else if (this._isInQuadrantRange(4, 4)) {
                cx += halfRadius;
                cy += halfRadius;
            }
        }

        return {
            cx: cx,
            cy: cy
        };
    },

    /**
     * Make circle bound
     * @returns {{cx: number, cy: number, r: number}} circle bounds
     * @private
     */
    _makeCircleBound: function() {
        var radius = this._calculateRadius();
        var centerXY = this._calculateCenterXY(radius);

        return tui.util.extend({
            r: radius
        }, centerXY);
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
    _renderGraph: function(dimension, seriesData, paper) {
        var showTootltip = tui.util.bind(this.showTooltip, this, {
            allowNegativeTooltip: !!this.allowNegativeTooltip,
            seriesName: this.seriesName,
            chartType: this.chartType
        });
        var callbacks = {
            showTooltip: showTootltip,
            hideTooltip: tui.util.bind(this.hideTooltip, this)
        };
        var params = this._makeParamsForGraphRendering(dimension, seriesData);

        params.paper = paper;

        return this.graphRenderer.render(this.seriesContainer, params, callbacks);
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
        this.eventBus.fire('showTooltip', tui.util.extend({
            indexes: {
                groupIndex: groupIndex,
                index: index
            },
            mousePosition: mousePosition
        }, params));
    },

    /**
     * hideTooltip is mouseout event callback on series graph.
     */
    hideTooltip: function() {
        this.eventBus.fire('hideTooltip');
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
     * Get series label.
     * @param {object} params parameters
     *      @param {string} params.legend legend
     *      @param {string} params.label label
     *      @param {string} params.separator separator
     * @returns {string} series label
     * @private
     */
    _getSeriesLabel: function(params) {
        var seriesLabel = '';

        if (this.options.showLegend) {
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
        var self = this;
        var dataProcessor = this.dataProcessor;
        var seriesDataModel = this._getSeriesDataModel();
        var positions = params.positions;
        var htmls = tui.util.map(dataProcessor.getLegendLabels(this.seriesName), function(legend, index) {
            var html = '',
                label, position;

            if (positions[index]) {
                label = self._getSeriesLabel({
                    legend: legend,
                    label: seriesDataModel.getSeriesItem(0, index).label,
                    separator: params.separator
                });
                position = params.funcMoveToPosition(positions[index], label);
                html = self._makeSeriesLabelHtml(position, label, index);
            }

            return html;
        });

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
            return datum.ratio ? datum[positionType] : null;
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
        var centerLeft = this.getSeriesData().circleBound.cx;
        var outerPositions = this._pickPositionsFromSectorData('outerPosition');
        var filteredPositions = tui.util.filter(outerPositions, function(position) {
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
        if (predicate.isLabelAlignOuter(this.options.labelAlign)) {
            this._renderOuterLegend(seriesLabelContainer);
        } else {
            this._renderCenterLegend(seriesLabelContainer);
        }
    },

    /**
     * Animate series label area.
     * @override
     */
    animateSeriesLabelArea: function() {
        this.graphRenderer.animateLegendLines(this.selectedLegendIndex);
        Series.prototype.animateSeriesLabelArea.call(this);
    },

    /**
     * Move legend lines.
     * @private
     * @override
     */
    _moveLegendLines: function() {
        var centerLeft = this.dimensionMap.chart.width / 2,
            outerPositions = this._pickPositionsFromSectorData('outerPosition'),
            filteredPositions = tui.util.filter(outerPositions, function(position) {
                return position;
            });

        this._addEndPosition(centerLeft, filteredPositions);
        this.graphRenderer.moveLegendLines(filteredPositions);
    },

    /**
     * Whether detected label element or not.
     * @param {{left: number, top: number}} position - mouse position
     * @returns {boolean}
     * @private
     */
    _isDetectedLabel: function(position) {
        var labelElement = document.elementFromPoint(position.left, position.top);

        return tui.util.isString(labelElement.className);
    },

    /**
     * On click series.
     * @param {{left: number, top: number}} position mouse position
     */
    onClickSeries: function(position) {
        var sectorInfo = this._executeGraphRenderer(position, 'findSectorInfo');
        var prevIndex = this.prevClickedIndex;
        var allowSelect = this.options.allowSelect;
        var foundIndex, shouldSelect;

        if ((sectorInfo || this._isDetectedLabel(position)) && tui.util.isExisty(prevIndex) && allowSelect) {
            this.onUnselectSeries({
                indexes: {
                    index: prevIndex
                }
            });
            this.prevClickedIndex = null;
        }

        if (!sectorInfo || sectorInfo.chartType !== this.chartType) {
            return;
        }

        foundIndex = sectorInfo.index;
        shouldSelect = foundIndex > -1 && (foundIndex !== prevIndex);

        if (allowSelect && !shouldSelect) {
            return;
        }

        this.onSelectSeries({
            indexes: {
                index: foundIndex
            }
        }, shouldSelect);

        if (allowSelect && foundIndex > -1) {
            this.prevClickedIndex = foundIndex;
        }
    },

    /**
     * On move series.
     * @param {{left: number, top: number}} position mouse position
     */
    onMoveSeries: function(position) {
        this._executeGraphRenderer(position, 'moveMouseOnSeries');
    }
});

module.exports = PieChartSeries;
