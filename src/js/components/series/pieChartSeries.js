/**
 * @fileoverview Pie chart series component.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var Series = require('./series');
var chartConst = require('../../const');
var predicate = require('../../helpers/predicate');
var snippet = require('tui-code-snippet');
var raphaelRenderUtil = require('../../plugins/raphaelRenderUtil');
var COMBO_PIE1 = 'pie1';

var PieChartSeries = snippet.defineClass(Series, /** @lends PieChartSeries.prototype */ {
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

        this.isShowOuterLabel = predicate.isShowOuterLabel(this.options);

        this.isLabelAlignOuter = predicate.isLabelAlignOuter(this.options.labelAlign);

        this.legendMaxWidth = params.legendMaxWidth;

        this.drawingType = chartConst.COMPONENT_TYPE_RAPHAEL;

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

        /**
         * series legend names
         * @type {Array}
         */
        this.legendLabels = [];

        /**
         * series values.
         * @type {Array}
         */
        this.valueLabels = [];

        /**
         * max legend width
         * @type {number}
         */
        this.legendLongestWidth = 0;

        /**
         * labelTheme
         * @type {object}
         */
        this.labelTheme = this.theme.label;

        this._setDefaultOptions();
    },

    /**
     * Make legendlabes
     * @returns {Array.<string>}
     * @private
     */
    _getLegendLabels: function() {
        return snippet.map(this.dataProcessor.getLegendLabels(this.seriesType), function(legendName) {
            return raphaelRenderUtil.getEllipsisText(legendName, this.legendMaxWidth, this.labelTheme);
        }, this);
    },

    /**
     * Make valid angle.
     * @param {number} angle - angle
     * @param {number} defaultAngle - default angle
     * @returns {number}
     * @private
     */
    _makeValidAngle: function(angle, defaultAngle) {
        if (snippet.isUndefined(angle)) {
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

        return snippet.map(radiusRange, function(percent) {
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
        var cx = circleBound.cx;
        var cy = circleBound.cy;
        var r = circleBound.r;
        var angle = this.options.startAngle;
        var angleForRendering = this._calculateAngleForRendering();
        var seriesGroup = this._getSeriesDataModel().getFirstSeriesGroup();
        var holeRatio = this.options.radiusRange[0];
        var centerR = r * 0.5;
        var paths;

        if (holeRatio) {
            centerR += centerR * holeRatio;
        }

        if (!seriesGroup) {
            return null;
        }
        paths = seriesGroup.map(function(seriesItem) {
            var ratio = seriesItem ? seriesItem.ratio : 0;
            var currentAngle = angleForRendering * ratio;
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
                ratio: ratio,
                angles: angles,
                centerPosition: self._getArcPosition(snippet.extend({
                    r: centerR
                }, positionData)),
                outerPosition: self._getArcPosition(snippet.extend({
                    r: r + (self.legendLongestWidth / 2) + chartConst.PIE_GRAPH_LEGEND_LABEL_INTERVAL
                }, positionData))
            };
        });

        return paths;
    },
    /**
     * Make value labels
     * @returns {Array.<string>}
     * @private
     */
    _makeValueLabel: function() {
        var seriesGroup = this._getSeriesDataModel().getFirstSeriesGroup();

        return seriesGroup.map(function(seriesItem) {
            return seriesItem.label;
        }, this);
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
        var circleBound, sectorData;

        this.valueLabels = this._makeValueLabel();
        this.legendLabels = this._getLegendLabels();
        this.legendLongestWidth = this._getMaxLengthLegendWidth();

        circleBound = this._makeCircleBound();
        sectorData = this._makeSectorData(circleBound);

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
        var isComboPie1 = this.isCombo && (this.seriesType === COMBO_PIE1);
        var isShowOuterLabel = this.isShowOuterLabel;
        var baseSize = this._calculateBaseSize();
        var radiusRatio = 0;

        if (isComboPie1) {
            isShowOuterLabel = this.dataProcessor.isComboDonutShowOuterLabel();
        }

        radiusRatio = isShowOuterLabel ? chartConst.PIE_GRAPH_SMALL_RATIO : chartConst.PIE_GRAPH_DEFAULT_RATIO;

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
        var position = this.layout.position;
        var halfRadius = radius / 2;
        var cx = (dimension.width / 2) + position.left;
        var cy = (dimension.height / 2) + position.top;

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

        return snippet.extend({
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
     * @param {object} paper paper object
     * @private
     * @override
     */
    _renderGraph: function(dimension, seriesData, paper) {
        var showTootltip = snippet.bind(this.showTooltip, this, {
            allowNegativeTooltip: !!this.allowNegativeTooltip,
            seriesType: this.seriesType,
            chartType: this.chartType
        });
        var callbacks = {
            showTooltip: showTootltip,
            hideTooltip: snippet.bind(this.hideTooltip, this)
        };
        var params = this._makeParamsForGraphRendering(dimension, seriesData);
        var currentSeriesName = this.seriesType;
        var seriesDataModelMap = this.dataProcessor.seriesDataModelMap;
        var pastSeriesNames = [];
        var pastIndex = 0;

        snippet.forEach(this.dataProcessor.seriesTypes, function(seriesType) {
            var needNext = true;

            if (seriesType !== currentSeriesName) {
                pastSeriesNames.push(seriesType);
            } else {
                needNext = false;
            }

            return needNext;
        });

        snippet.forEach(pastSeriesNames, function(seriesType) {
            pastIndex += seriesDataModelMap[seriesType].baseGroups.length;
        });

        params.additionalIndex = pastIndex;

        return this.graphRenderer.render(paper, params, callbacks);
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
        this.eventBus.fire('showTooltip', snippet.extend({
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
     * legendh max length width
     * @returns {number} max width
     * @private
     */
    _getMaxLengthLegendWidth: function() {
        var lableWidths = snippet.map(this.legendLabels, function(label) {
            return raphaelRenderUtil.getRenderedTextSize(
                label,
                this.labelTheme.fontSize,
                this.labelTheme.fontFamily
            ).width;
        }, this);

        lableWidths.sort(function(prev, next) {
            return prev - next;
        });

        return lableWidths[lableWidths.length - 1];
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
     * Pick poistions from sector data.
     * @param {string} positionType position type
     * @param {string} dataType legend or value label
     * @returns {Array} positions
     * @private
     */
    _pickPositionsFromSectorData: function(positionType, dataType) {
        var options = this.options;
        var legendLabelHeight = raphaelRenderUtil.getRenderedTextSize(this.legendLabels[0], this.labelTheme.fontSize,
            this.labelTheme.fontFamily).height;

        var valueLabelHeight = raphaelRenderUtil.getRenderedTextSize(this.valueLabels[0],
            chartConst.PIE_GRAPH_LEGEND_LABEL_SIZE, this.labelTheme.fontFamily).height;

        return snippet.map(this.seriesData.sectorData, function(datum) {
            var position = datum.ratio ? snippet.extend({}, datum[positionType]) : null;
            if (options.showLegend && options.showLabel && !this.isLabelAlignOuter) {
                if (dataType === 'value') {
                    position.top -= valueLabelHeight / 2;
                } else if (dataType === 'legend') {
                    position.top += legendLabelHeight / 2;
                }
            }

            return position;
        }, this);
    },

    /**
     * Add end position.
     * @param {number} centerLeft center left
     * @param {Array.<object>} positions positions
     * @private
     */
    _addEndPosition: function(centerLeft, positions) {
        snippet.forEachArray(positions, function(position) {
            var end;

            if (!position) {
                return;
            }

            end = snippet.extend({}, position.middle);
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
        var positionEnd = position.end;
        var left = positionEnd.left;
        var top = positionEnd.top;
        var OffsetX = (this.graphRenderer.getRenderedLabelWidth(label, this.labelTheme) / 2)
            + chartConst.SERIES_LABEL_PADDING;

        if (left < centerLeft) {
            left -= OffsetX;
        } else {
            left += OffsetX;
        }

        return {
            left: left,
            top: top
        };
    },

    /**
     * set series position
     * @param {object} params position infos
     * @param {Array.<string>} labels labels array
     * @returns {Array.<number>}
     * @private
     */
    _setSeriesPosition: function(params, labels) {
        var positions = [];
        if (params.funcMoveToPosition) {
            positions = snippet.map(params.positions, function(position, index) {
                var outerPosition = null;

                if (position) {
                    outerPosition = params.funcMoveToPosition(position, labels[index]);
                }

                return outerPosition;
            });
        } else {
            positions = params.positions;
        }

        return positions;
    },

    /**
     * Render series label.
     * @param {object} paper paper
     * @returns {Array.<object>}
     * @private
     */
    _renderSeriesLabel: function(paper) {
        var legendLabelPosition;
        var renderOption = {};
        var positions = [];
        var labelSet = paper.set();
        var graphRenderLabel = snippet.bind(function(dataType, labels) {
            var colors;
            var theme = snippet.extend({}, this.theme.label);
            if (this.isLabelAlignOuter && dataType === 'legend') {
                colors = this.theme.colors;
                theme.fontWeight = 'bold';
            }
            theme.fontSize = (dataType === 'value') ? 16 : theme.fontSize;

            positions = this._setSeriesPosition(renderOption, labels);
            this.graphRenderer.renderLabels({
                dataType: dataType,
                paper: paper,
                labelSet: labelSet,
                positions: positions,
                labels: labels,
                theme: theme,
                colors: colors
            });
        }, this);

        if (this.options.showLabel) {
            renderOption.positions = this._pickPositionsFromSectorData('centerPosition', 'value');
            graphRenderLabel('value', this.valueLabels);
        }
        if (this.options.showLegend) {
            legendLabelPosition = this.isLabelAlignOuter ? 'outerPosition' : 'centerPosition';
            renderOption.positions = this._pickPositionsFromSectorData(legendLabelPosition, 'legend');
            graphRenderLabel('legend', this.legendLabels);
        }

        return labelSet;
    },

    /**
     * Whether detected label element or not.
     * @param {{left: number, top: number}} position - mouse position
     * @returns {boolean}
     * @private
     */
    _isDetectedLabel: function(position) {
        var labelElement = document.elementFromPoint(position.left, position.top);

        return snippet.isString(labelElement.className);
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

        if ((sectorInfo || this._isDetectedLabel(position)) && snippet.isExisty(prevIndex) && allowSelect) {
            this.onUnselectSeries({
                indexes: {
                    index: prevIndex
                }
            });
            this.prevClickedIndex = null;
        }

        if (!sectorInfo || sectorInfo.chartType !== this.seriesType) {
            return;
        }

        foundIndex = sectorInfo.index;
        shouldSelect = foundIndex > -1 && (foundIndex !== prevIndex);

        if (allowSelect && !shouldSelect) {
            return;
        }

        this.onSelectSeries({
            chartType: this.chartType,
            indexes: {
                index: foundIndex,
                legendIndex: sectorInfo.legendIndex
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

function pieSeriesFactory(params) {
    var libType = params.chartOptions.libType;
    var chartTheme = params.chartTheme;
    var chartType = params.chartOptions.chartType;
    var legendOption = params.chartOptions.legend;

    params.libType = libType;
    params.chartType = 'pie';

    if (chartType === 'combo') {
        // elias series mapping key is used as a seriesType(ex. pie1)
        // It is now distinguished to follow current structure
        // elias will not be needed after chart constructor is integrated
        params.seriesType = params.name.split('Series')[0];
        params.isCombo = true;
    }

    if (legendOption) {
        params.legendMaxWidth = legendOption.maxWidth;
    }

    params.chartBackground = chartTheme.chart.background;

    return new PieChartSeries(params);
}

pieSeriesFactory.componentType = 'series';
pieSeriesFactory.PieChartSeries = PieChartSeries;

module.exports = pieSeriesFactory;
