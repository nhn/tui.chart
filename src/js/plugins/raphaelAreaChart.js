/**
 * @fileoverview Raphael area chart renderer.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var RaphaelLineBase = require('./raphaelLineTypeBase'),
    raphaelRenderUtil = require('./raphaelRenderUtil');

var raphael = window.Raphael,
    EMPHASIS_OPACITY = 1,
    DE_EMPHASIS_OPACITY = 0.3;

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
            opacity = data.options.hasDot ? 1 : 0,
            borderStyle = this.makeBorderStyle(theme.borderColor, opacity),
            outDotStyle = this.makeOutDotStyle(opacity, borderStyle),
            paper;

        this.paper = paper = raphael(container, 1, dimension.height);
        this.stackedOption = data.options.stacked;
        this.isSpline = data.options.spline;
        this.dimension = dimension;
        this.zeroTop = data.zeroTop;
        this.hasRangeData = data.hasRangeData;

        this.groupPaths = this.isSpline ? this._getSplineAreasPath(groupPositions) : this._getAreasPath(groupPositions);
        this.groupAreas = this._renderAreas(paper, this.groupPaths, colors);
        this.tooltipLine = this._renderTooltipLine(paper, dimension.height);
        this.groupDots = this._renderDots(paper, groupPositions, colors, opacity);

        if (data.options.hasSelection) {
            this.selectionDot = this._makeSelectionDot(paper);
            this.selectionColor = theme.selectionColor;

            if (this.hasRangeData) {
                this.selectionStartDot = this._makeSelectionDot(paper);
            }
        }

        this.outDotStyle = outDotStyle;
        this.groupPositions = groupPositions;
        this.dotOpacity = opacity;
        delete this.pivotGroupDots;

        return paper;
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
     * @returns {Array.<string | number>} path
     * @private
     */
    _makeAreasPath: function(positions) {
        var len = positions.length * 2,
            path = [];

        tui.util.forEachArray(positions, function(position, index) {
            path[index] = ['L', position.left, position.top];
            path[len - index - 1] = ['L', position.left, position.startTop];
        });

        path = concat.apply([], path);
        path[0] = 'M';

        return path;
    },

    /**
     * Get area path.
     * @param {Array.<Array.<{left: number, top: number, startTop: number}>>} groupPositions positions
     * @returns {Array.<{area: Array.<string | number>, line: Array.<string | number>}>} path
     * @private
     */
    _getAreasPath: function(groupPositions) {
        var self = this;

        return tui.util.map(groupPositions, function(positions) {
            var paths;

            positions[0].left -= 1;

            paths = {
                area: self._makeAreasPath(positions),
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
     * @param {Array.<{left: number, top: number}>} prevPositions previous positions
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
     * Get spline areas path.
     * @param {Array.<Array.<{left: number, top: number, startTop: number}>>} groupPositions positions
     * @returns {Array.<{area: Array.<string | number>, line: Array.<string | number>}>} path
     * @private
     */
    _getSplineAreasPath: function(groupPositions) {
        var self = this;

        return tui.util.map(groupPositions, function(positions) {
            var linesPath, areasBottomPath;

            positions[0].left -= 1;
            linesPath = self._makeSplineLinesPath(positions);
            areasBottomPath = self._makeSplineAreaBottomPath(positions);

            return {
                area: linesPath.concat(areasBottomPath),
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

        this.groupPositions = groupPositions;
        this.groupPaths = this.isSpline ? this._getSplineAreasPath(groupPositions) : this._getAreasPath(groupPositions);
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

                self._moveDot(item.dot.dot, position);
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

        tui.util.forEachArray(this.groupPaths, function(path, groupIndex) {
            var area = self.groupAreas[groupIndex],
                opacity = (noneSelected || legendIndex === groupIndex) ? EMPHASIS_OPACITY : DE_EMPHASIS_OPACITY;

            area.area.attr({'fill-opacity': opacity});
            area.line.attr({'stroke-opacity': opacity});

            if (area.startLine) {
                area.startLine.attr({'stroke-opacity': opacity});
            }

            tui.util.forEachArray(self.groupDots[groupIndex], function(item) {
                if (self.dotOpacity) {
                    item.dot.dot.attr({'fill-opacity': opacity});
                    if (item.startDot) {
                        item.startDot.dot.attr({'fill-opacity': opacity});
                    }
                }
            });
        });
    }
});

module.exports = RaphaelAreaChart;
