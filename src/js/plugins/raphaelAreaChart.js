/**
 * @fileoverview Raphael area chart renderer.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var RaphaelLineBase = require('./raphaelLineTypeBase');
var raphaelRenderUtil = require('./raphaelRenderUtil');

var EMPHASIS_OPACITY = 1;
var DE_EMPHASIS_OPACITY = 0.3;
var LEFT_BAR_WIDTH = 10;

var raphael = window.Raphael;
var concat = Array.prototype.concat;

var RaphaelAreaChart = tui.util.defineClass(RaphaelLineBase, /** @lends RaphaelAreaChart.prototype */ {
    /**
     * RaphaelAreaChart is graph renderer for area chart.
     * @constructs RaphaelAreaChart
     * @extends RaphaelLineTypeBase
     */
    init: function() {
        /**
         * selected legend index
         * @type {?number}
         */
        this.selectedLegendIndex = null;

        /**
         * type of chart
         * @type {string}
         */
        this.chartType = 'area';
    },

    /**
     * Render function of area chart.
     * @param {HTMLElement} container container
     * @param {{groupPositions: Array.<Array>, dimension: object, theme: object, options: object}} data render data
     * @returns {object} paper raphael paper
     */
    render: function(container, data) {
        var dimension = data.dimension,
            groupPositions = data.groupPositions,
            theme = data.theme,
            colors = theme.colors,
            opacity = data.options.showDot ? 1 : 0,
            borderStyle = this.makeBorderStyle(theme.borderColor, opacity),
            outDotStyle = this.makeOutDotStyle(opacity, borderStyle),
            paper;

        this.paper = paper = raphael(container, 1, dimension.height);
        this.isSpline = data.options.spline;
        this.dimension = dimension;
        this.zeroTop = data.zeroTop;
        this.hasRangeData = data.hasRangeData;

        this.groupPaths = this._getAreaChartPath(groupPositions);
        this.groupAreas = this._renderAreas(paper, this.groupPaths, colors);
        this.tooltipLine = this._renderTooltipLine(paper, dimension.height);
        this.leftBar = this._renderLeftBar(dimension.height, data.chartBackground);
        this.groupDots = this._renderDots(paper, groupPositions, colors, opacity);

        if (data.options.allowSelect) {
            this.selectionDot = this._makeSelectionDot(paper);
            this.selectionColor = theme.selectionColor;

            if (this.hasRangeData) {
                this.selectionStartDot = this._makeSelectionDot(paper);
            }
        }

        this.outDotStyle = outDotStyle;
        this.groupPositions = groupPositions;
        this.dotOpacity = opacity;

        this.pivotGroupDots = null;

        return paper;
    },

    /**
     * Get path for area chart.
     * @param {Array.<Array.<{left: number, top: number, startTop: number}>>} groupPositions - positions
     * @param {boolean} [hasExtraPath] - whether has extra path or not
     * @returns {*}
     * @private
     */
    _getAreaChartPath: function(groupPositions, hasExtraPath) {
        var path;

        if (this.isSpline) {
            path = this._makeSplineAreaChartPath(groupPositions, hasExtraPath);
        } else {
            path = this._makeAreaChartPath(groupPositions, hasExtraPath);
        }

        return path;
    },

    /**
     * Render area graphs.
     * @param {object} paper paper
     * @param {Array.<object>} groupPaths group paths
     * @param {Array.<string>} colors colors
     * @returns {Array} raphael objects
     * @private
     */
    _renderAreas: function(paper, groupPaths, colors) {
        var groupAreas;

        colors = colors.slice(0, groupPaths.length);
        colors.reverse();
        groupPaths.reverse();

        groupAreas = tui.util.map(groupPaths, function(path, groupIndex) {
            var areaColor = colors[groupIndex] || 'transparent',
                lineColor = areaColor,
                polygons = {
                    area: raphaelRenderUtil.renderArea(paper, path.area.join(' '), {
                        fill: areaColor,
                        opacity: 0.5,
                        stroke: areaColor
                    }),
                    line: raphaelRenderUtil.renderLine(paper, path.line.join(' '), lineColor, 1)
                };

            if (path.startLine) {
                polygons.startLine = raphaelRenderUtil.renderLine(paper, path.startLine.join(' '), lineColor, 1);
            }

            return polygons;
        });

        return groupAreas.reverse();
    },

    /**
     * Make height.
     * @param {number} top top
     * @param {number} startTop start top
     * @returns {number} height
     * @private
     */
    _makeHeight: function(top, startTop) {
        return Math.abs(top - startTop);
    },

    /**
     * Make areas path.
     * @param {Array.<{left: number, top: number, startTop: number}>} positions positions
     * @param {boolean} [hasExtraPath] - whether has extra path or not
     * @returns {Array.<string | number>} path
     * @private
     */
    _makeAreasPath: function(positions, hasExtraPath) {
        var len = positions.length * 2;
        var path = [];
        var targetIndex;

        tui.util.forEachArray(positions, function(position, index) {
            path[index] = ['L', position.left, position.top];
            path[len - index - 1] = ['L', position.left, position.startTop];
        });

        if (hasExtraPath !== false) {
            targetIndex = positions.length - 1;
            path.splice(targetIndex + 1, 0, path[targetIndex], path[targetIndex + 1]);
        }

        path = concat.apply([], path);
        path[0] = 'M';

        return path;
    },

    /**
     * Make path for area chart.
     * @param {Array.<Array.<{left: number, top: number, startTop: number}>>} groupPositions positions
     * @param {boolean} [hasExtraPath] - whether has extra path or not
     * @returns {Array.<{area: Array.<string | number>, line: Array.<string | number>}>} path
     * @private
     */
    _makeAreaChartPath: function(groupPositions, hasExtraPath) {
        var self = this;

        return tui.util.map(groupPositions, function(positions) {
            var paths;

            paths = {
                area: self._makeAreasPath(positions, hasExtraPath),
                line: self._makeLinesPath(positions)
            };

            if (self.hasRangeData) {
                paths.startLine = self._makeLinesPath(positions, 'startTop');
            }

            return paths;
        });
    },

    /**
     * Make spline area bottom path.
     * @param {Array.<{left: number, top: number}>} positions positions
     * @returns {Array.<string | number>} spline area path
     * @private
     */
    _makeSplineAreaBottomPath: function(positions) {
        var self = this;

        return tui.util.map(positions, function(position) {
            return ['L', position.left, self.zeroTop];
        }).reverse();
    },

    /**
     * Make spline path for area chart.
     * @param {Array.<Array.<{left: number, top: number, startTop: number}>>} groupPositions positions
     * @param {boolean} [hasExtraPath] - whether has extra path or not
     * @returns {Array.<{area: Array.<string | number>, line: Array.<string | number>}>} path
     * @private
     */
    _makeSplineAreaChartPath: function(groupPositions, hasExtraPath) {
        var self = this;

        return tui.util.map(groupPositions, function(positions) {
            var linesPath = self._makeSplineLinesPath(positions);
            var areaPath = JSON.parse(JSON.stringify(linesPath));
            var areasBottomPath = self._makeSplineAreaBottomPath(positions);
            var lastPosition;

            if (hasExtraPath !== false) {
                lastPosition = positions[positions.length - 1];
                areaPath.push(['L', lastPosition.left, lastPosition.top]);
                areasBottomPath.unshift(['L', lastPosition.left, self.zeroTop]);
            }

            return {
                area: areaPath.concat(areasBottomPath),
                line: linesPath
            };
        });
    },

    /**
     * Resize graph of area chart.
     * @param {object} params parameters
     *      @param {{width: number, height:number}} params.dimension dimension
     *      @param {Array.<Array.<{left:number, top:number}>>} params.groupPositions group positions
     */
    resize: function(params) {
        var self = this,
            dimension = params.dimension,
            groupPositions = params.groupPositions;

        this.zeroTop = params.zeroTop;
        this.groupPositions = groupPositions;
        this.groupPaths = this._getAreaChartPath(groupPositions);
        this.paper.setSize(dimension.width, dimension.height);
        this.tooltipLine.attr({top: dimension.height});

        tui.util.forEachArray(this.groupPaths, function(path, groupIndex) {
            var area = self.groupAreas[groupIndex];
            area.area.attr({path: path.area.join(' ')});
            area.line.attr({path: path.line.join(' ')});

            if (area.startLine) {
                area.startLine.attr({path: path.startLine.join(' ')});
            }

            tui.util.forEachArray(self.groupDots[groupIndex], function(item, index) {
                var position = groupPositions[groupIndex][index];
                var startPositon;

                self._moveDot(item.endDot.dot, position);
                if (item.startDot) {
                    startPositon = tui.util.extend({}, position);
                    startPositon.top = startPositon.startTop;
                    self._moveDot(item.startDot.dot, startPositon);
                }
            });
        });
    },

    /**
     * Select legend.
     * @param {?number} legendIndex legend index
     */
    selectLegend: function(legendIndex) {
        var self = this,
            noneSelected = tui.util.isNull(legendIndex);

        this.selectedLegendIndex = legendIndex;

        tui.util.forEachArray(this.groupAreas, function(area, groupIndex) {
            var opacity = (noneSelected || legendIndex === groupIndex) ? EMPHASIS_OPACITY : DE_EMPHASIS_OPACITY;

            area.area.attr({'fill-opacity': opacity});
            area.line.attr({'stroke-opacity': opacity});

            if (area.startLine) {
                area.startLine.attr({'stroke-opacity': opacity});
            }

            tui.util.forEachArray(self.groupDots[groupIndex], function(item) {
                if (self.dotOpacity) {
                    item.endDot.dot.attr({'fill-opacity': opacity});
                    if (item.startDot) {
                        item.startDot.dot.attr({'fill-opacity': opacity});
                    }
                }
            });
        });
    },

    /**
     * Animate for adding data.
     * @param {object} data - data for graph rendering
     * @param {number} tickSize - tick size
     * @param {Array.<Array.<object>>} groupPositions - group positions
     * @param {boolean} [shiftingOption] - shifting option
     * @param {number} zeroTop - position top value for zero point
     */
    animateForAddingData: function(data, tickSize, groupPositions, shiftingOption, zeroTop) {
        var self = this;
        var additionalIndex = 0;
        var groupPaths;

        this.zeroTop = zeroTop;

        groupPaths = this._getAreaChartPath(groupPositions, false);

        if (shiftingOption) {
            this.leftBar.animate({
                width: tickSize + LEFT_BAR_WIDTH
            }, 300);
            additionalIndex = 1;
        }

        tui.util.forEachArray(this.groupAreas, function(area, groupIndex) {
            var dots = self.groupDots[groupIndex];
            var groupPosition = groupPositions[groupIndex];
            var pathMap = groupPaths[groupIndex];

            if (shiftingOption) {
                self._removeFirstDot(dots);
            }

            tui.util.forEachArray(dots, function(item, index) {
                var position = groupPosition[index + additionalIndex];

                self._animateByPosition(item.endDot.dot, position);

                if (item.startDot) {
                    self._animateByPosition(item.startDot.dot, {
                        left: position.left,
                        top: position.startTop
                    });
                }
            });

            self._animateByPath(area.area, pathMap.area);
            self._animateByPath(area.line, pathMap.line);

            if (area.startLine) {
                self._animateByPath(area.startLine, pathMap.startLine);
            }
        });
    }
});

module.exports = RaphaelAreaChart;
