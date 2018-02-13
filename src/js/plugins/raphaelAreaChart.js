/**
 * @fileoverview Raphael area chart renderer.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var RaphaelLineBase = require('./raphaelLineTypeBase');
var raphaelRenderUtil = require('./raphaelRenderUtil');
var snippet = require('tui-code-snippet');

var EMPHASIS_OPACITY = 1;
var DE_EMPHASIS_OPACITY = 0.3;

var concat = Array.prototype.concat;
var GUIDE_AREACHART_AREAOPACITY_TYPE = require('../const.js').GUIDE_AREACHART_AREAOPACITY_TYPE;
var consoleUtil = require('../helpers/consoleUtil');

var RaphaelAreaChart = snippet.defineClass(RaphaelLineBase, /** @lends RaphaelAreaChart.prototype */ {
    /**
     * RaphaelAreaChart is graph renderer for area chart.
     * @constructs RaphaelAreaChart
     * @private
     * @private
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

        /**
         * Line width
         * @type {number}
         */
        this.lineWidth = 1;
    },

    /**
     * Render function of area chart.
     * @param {object} paper - raphael paper
     * @param {{groupPositions: Array.<Array>, dimension: object, theme: object, options: object}} data render data
     * @returns {object}
     */
    render: function(paper, data) {
        var dimension = data.dimension;
        var groupPositions = data.groupPositions;
        var theme = data.theme;
        var colors = theme.colors;
        var options = data.options;
        var areaOpacity = this._isAreaOpacityNumber(options.areaOpacity) ? options.areaOpacity : 0.5;
        var dotOpacity = options.showDot ? 1 : 0;
        var borderStyle = this.makeBorderStyle(theme.borderColor, dotOpacity);
        var outDotStyle = this.makeOutDotStyle(dotOpacity, borderStyle);
        var lineWidth = this.lineWidth = (snippet.isNumber(options.pointWidth) ? options.pointWidth : this.lineWidth);

        this.paper = paper;
        this.theme = data.theme;
        this.isSpline = options.spline;
        this.dimension = dimension;
        this.position = data.position;

        this.zeroTop = data.zeroTop;
        this.hasRangeData = data.hasRangeData;

        paper.setStart();

        this.groupPaths = this._getAreaChartPath(groupPositions, null, options.connectNulls);
        this.groupAreas = this._renderAreas(paper, this.groupPaths, colors, lineWidth, areaOpacity);
        this.tooltipLine = this._renderTooltipLine(paper, dimension.height);
        this.groupDots = this._renderDots(paper, groupPositions, colors, dotOpacity);

        if (options.allowSelect) {
            this.selectionDot = this._makeSelectionDot(paper);
            this.selectionColor = theme.selectionColor;

            if (this.hasRangeData) {
                this.selectionStartDot = this._makeSelectionDot(paper);
            }
        }

        this.outDotStyle = outDotStyle;
        this.groupPositions = groupPositions;
        this.dotOpacity = dotOpacity;

        this.pivotGroupDots = null;

        return paper.setFinish();
    },

    /**
     * Get path for area chart.
     * @param {Array.<Array.<{left: number, top: number, startTop: number}>>} groupPositions - positions
     * @param {boolean} [hasExtraPath] - whether has extra path or not
     * @param {boolean} [connectNulls] - boolean value connect nulls or not
     * @returns {*}
     * @private
     */
    _getAreaChartPath: function(groupPositions, hasExtraPath, connectNulls) {
        var path;

        if (this.isSpline) {
            path = this._makeSplineAreaChartPath(groupPositions, hasExtraPath);
        } else {
            path = this._makeAreaChartPath(groupPositions, hasExtraPath, connectNulls);
        }

        return path;
    },

    /**
     * Render area graphs.
     * @param {object} paper paper
     * @param {Array.<object>} groupPaths group paths
     * @param {Array.<string>} colors colors
     * @param {number} lineWidth line width
     * @param {number} opacity opacity
     * @returns {Array} raphael objects
     * @private
     */
    _renderAreas: function(paper, groupPaths, colors, lineWidth, opacity) {
        var groupAreas;

        colors = colors.slice(0, groupPaths.length);
        colors.reverse();
        groupPaths.reverse();

        groupAreas = snippet.map(groupPaths, function(path, groupIndex) {
            var areaColor = colors[groupIndex] || 'transparent',
                lineColor = areaColor,
                polygons = {
                    area: raphaelRenderUtil.renderArea(paper, path.area.join(' '), {
                        fill: areaColor,
                        opacity: opacity,
                        stroke: areaColor
                    }),
                    line: raphaelRenderUtil.renderLine(paper, path.line.join(' '), lineColor, lineWidth)
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
        var path = [];
        var paths = [];
        var prevNull = false;
        var positionLength = positions.length;
        var targetIndex;
        var formerPath = [];
        var latterPath = [];

        snippet.forEachArray(positions, function(position, index) {
            var moveOrLine;
            if (position) {
                if (prevNull) {
                    moveOrLine = 'M';
                    prevNull = false;
                } else {
                    moveOrLine = 'L';
                }

                formerPath.push([moveOrLine, position.left, position.top]);
                latterPath.unshift(['L', position.left, position.startTop]);
            } else {
                prevNull = true;
                latterPath.push(['z']);
            }

            if (!position || index === positionLength - 1) {
                paths.push(formerPath.concat(latterPath));
                formerPath = [];
                latterPath = [];
            }
        });

        snippet.forEachArray(paths, function(partialPath) {
            path = path.concat(partialPath);
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
     * @param {boolean} [connectNulls] - boolean value connect nulls or not
     * @returns {Array.<{area: Array.<string | number>, line: Array.<string | number>}>} path
     * @private
     */
    _makeAreaChartPath: function(groupPositions, hasExtraPath, connectNulls) {
        var self = this;

        return snippet.map(groupPositions, function(positions) {
            var paths;

            paths = {
                area: self._makeAreasPath(positions, hasExtraPath),
                line: self._makeLinesPath(positions, null, connectNulls)
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

        return snippet.map(positions, function(position) {
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

        return snippet.map(groupPositions, function(positions) {
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

        this.resizeClipRect(dimension.width, dimension.height);

        this.zeroTop = params.zeroTop;
        this.groupPositions = groupPositions;
        this.groupPaths = this._getAreaChartPath(groupPositions);
        this.paper.setSize(dimension.width, dimension.height);
        this.tooltipLine.attr({top: dimension.height});

        snippet.forEachArray(this.groupPaths, function(path, groupIndex) {
            var area = self.groupAreas[groupIndex];
            area.area.attr({path: path.area.join(' ')});
            area.line.attr({path: path.line.join(' ')});

            if (area.startLine) {
                area.startLine.attr({path: path.startLine.join(' ')});
            }

            snippet.forEachArray(self.groupDots[groupIndex], function(item, index) {
                var position = groupPositions[groupIndex][index];
                var startPositon;

                if (item.endDot) {
                    self._moveDot(item.endDot.dot, position);
                }
                if (item.startDot) {
                    startPositon = snippet.extend({}, position);
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
        var noneSelected = snippet.isNull(legendIndex);

        if (this.selectedLegendIndex && this.selectedLegendIndex !== -1) {
            this.resetSeriesOrder(this.selectedLegendIndex);
        }

        this.selectedLegendIndex = legendIndex;

        snippet.forEachArray(this.groupAreas, function(area, groupIndex) {
            var isSelectedLegend = legendIndex === groupIndex;
            var opacity = (noneSelected || isSelectedLegend) ? EMPHASIS_OPACITY : DE_EMPHASIS_OPACITY;
            var groupDots = this.groupDots[groupIndex];

            area.area.attr({'fill-opacity': opacity});
            area.line.attr({'stroke-opacity': opacity});

            if (area.startLine) {
                area.startLine.attr({'stroke-opacity': opacity});
            }

            snippet.forEachArray(groupDots, function(item) {
                if (this.dotOpacity) {
                    item.endDot.dot.attr({'fill-opacity': opacity});
                    if (item.startDot) {
                        item.startDot.dot.attr({'fill-opacity': opacity});
                    }
                }
            }, this);

            if (isSelectedLegend) {
                this.moveSeriesToFront(area, groupDots);
            }
        }, this);
    },

    /**
     * Reset series order after selected to be same to when it is first rendered
     * @param {number} legendIndex - legend index to reset series order
     * @ignore
     */
    resetSeriesOrder: function(legendIndex) {
        var frontLine = legendIndex + 1 < this.groupLines.length ? this.groupLines[legendIndex + 1] : null;

        if (frontLine) {
            this.groupLines[legendIndex].insertBefore(frontLine);
            snippet.forEachArray(this.groupDots[legendIndex], function(item) {
                item.endDot.dot.insertBefore(frontLine);
            });
        }
    },

    /**
     * @param {{area: {SVGElement}, line: {SVGElement}, startLine: {SVGElement}}} areaSurface - line or plane to represent area chart
     * @param {Array.<SVGElement>} dots - dot type element
     * @ignore
     * @override
     */
    moveSeriesToFront: function(areaSurface, dots) {
        areaSurface.line.toFront();
        areaSurface.area.toFront();
        if (areaSurface.startLine) {
            areaSurface.startLine.toFront();
        }

        snippet.forEachArray(dots, function(item) {
            item.endDot.dot.toFront();
            if (item.startDot) {
                item.startDot.dot.toFront();
            }
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
        var groupPaths = this._getAreaChartPath(groupPositions, false);
        var additionalIndex = 0;

        if (!groupPositions.length) {
            return;
        }

        if (shiftingOption) {
            additionalIndex = 1;
        }

        this.zeroTop = zeroTop;

        snippet.forEachArray(this.groupAreas, function(area, groupIndex) {
            var dots = self.groupDots[groupIndex];
            var groupPosition = groupPositions[groupIndex];
            var pathMap = groupPaths[groupIndex];

            if (shiftingOption) {
                self._removeFirstDot(dots);
            }

            snippet.forEachArray(dots, function(item, index) {
                var position = groupPosition[index + additionalIndex];
                self._animateByPosition(item.endDot.dot, position, tickSize);

                if (item.startDot) {
                    self._animateByPosition(item.startDot.dot, {
                        left: position.left,
                        top: position.startTop
                    }, tickSize);
                }
            });

            self._animateByPath(area.area, pathMap.area, tickSize);
            self._animateByPath(area.line, pathMap.line, tickSize);

            if (area.startLine) {
                self._animateByPath(area.startLine, pathMap.startLine, tickSize);
            }
        });
    },

    renderSeriesLabel: function(paper, groupPositions, groupLabels, labelTheme) {
        var attributes = {
            'font-size': labelTheme.fontSize,
            'font-family': labelTheme.fontFamily,
            'font-weight': labelTheme.fontWeight,
            fill: labelTheme.color,
            'text-anchor': 'middle',
            opacity: 0
        };
        var set = paper.set();

        snippet.forEach(groupLabels, function(categoryLabel, categoryIndex) {
            snippet.forEach(categoryLabel, function(label, seriesIndex) {
                var position = groupPositions[categoryIndex][seriesIndex];
                var endLabel = raphaelRenderUtil.renderText(paper, position.end, label.end, attributes);
                var startLabel;

                set.push(endLabel);

                endLabel.node.style.userSelect = 'none';
                endLabel.node.style.cursor = 'default';
                endLabel.node.setAttribute('filter', 'url(#glow)');

                if (position.start) {
                    startLabel = raphaelRenderUtil.renderText(paper, position.start, label.start, attributes);

                    startLabel.node.style.userSelect = 'none';
                    startLabel.node.style.cursor = 'default';
                    startLabel.node.setAttribute('filter', 'url(#glow)');

                    set.push(startLabel);
                }
            });
        });

        return set;
    },

    /**
     * Test areaOpacity is a number, and return the result.
     * It is used to determine whether to set a default value, 0.5.
     * If it is not a number, areaOpacity will be changed to the default value, 0.5.
     * @param {*} areaOpacity - value of property `options.areaOpacity`
     * @returns {boolean} - whether areaOpacity is a number.
     * @private
     */
    _isAreaOpacityNumber: function(areaOpacity) {
        var isNumber = snippet.isNumber(areaOpacity);

        if (isNumber) {
            if (areaOpacity < 0 || areaOpacity > 1) {
                consoleUtil.print(GUIDE_AREACHART_AREAOPACITY_TYPE, 'warn');
            }
        } else if (!snippet.isUndefined(areaOpacity)) {
            consoleUtil.print(GUIDE_AREACHART_AREAOPACITY_TYPE, 'error');
        }

        return isNumber;
    }
});

module.exports = RaphaelAreaChart;
