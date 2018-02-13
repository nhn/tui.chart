/**
 * @fileoverview Raphael line chart renderer.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var RaphaelLineBase = require('./raphaelLineTypeBase');
var raphaelRenderUtil = require('./raphaelRenderUtil');
var snippet = require('tui-code-snippet');

var EMPHASIS_OPACITY = 1;
var DE_EMPHASIS_OPACITY = 0.3;

var RaphaelLineChart = snippet.defineClass(RaphaelLineBase, /** @lends RaphaelLineChart.prototype */ {
    /**
     * RaphaelLineCharts is graph renderer for line chart.
     * @constructs RaphaelLineChart
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
        this.chartType = 'line';

        /**
         * Line width
         * @type {number}
         */
        this.lineWidth = 2;
    },

    /**
     * Render function of line chart.
     * @param {object} [paper] - raphael paper
     * @param {{groupPositions: Array.<Array>, dimension: object, theme: object, options: object}} data render data
     * @returns {object} paper raphael paper
     */
    render: function(paper, data) {
        var dimension = data.dimension;
        var groupPositions = data.groupPositions;
        var theme = data.theme;
        var colors = theme.colors;
        var options = data.options;
        var opacity = options.showDot ? 1 : 0;
        var isSpline = options.spline;
        var lineWidth = this.lineWidth = (snippet.isNumber(options.pointWidth) ? options.pointWidth : this.lineWidth);
        var borderStyle = this.makeBorderStyle(theme.borderColor, opacity);
        var outDotStyle = this.makeOutDotStyle(opacity, borderStyle);
        var groupPaths;

        if (isSpline) {
            groupPaths = this._getSplineLinesPath(groupPositions, options.connectNulls);
        } else {
            groupPaths = this._getLinesPath(groupPositions, options.connectNulls);
        }

        this.paper = paper;
        this.theme = data.theme;
        this.isSpline = isSpline;
        this.dimension = dimension;
        this.position = data.position;

        paper.setStart();

        this.groupLines = this._renderLines(paper, groupPaths, colors, lineWidth);
        this.tooltipLine = this._renderTooltipLine(paper, dimension.height);
        this.groupDots = this._renderDots(paper, groupPositions, colors, opacity);

        if (options.allowSelect) {
            this.selectionDot = this._makeSelectionDot(paper);
            this.selectionColor = theme.selectionColor;
        }
        this.colors = colors;
        this.borderStyle = borderStyle;
        this.outDotStyle = outDotStyle;
        this.groupPositions = groupPositions;
        this.groupPaths = groupPaths;
        this.dotOpacity = opacity;
        delete this.pivotGroupDots;

        return paper.setFinish();
    },

    /**
     * Get lines path.
     * @param {Array.<Array.<{left: number, top: number, startTop: number}>>} groupPositions positions
     * @param {boolean} [connectNulls] - boolean value connect nulls or not
     * @returns {Array.<Array.<string>>} path
     * @private
     */
    _getLinesPath: function(groupPositions, connectNulls) {
        var self = this;

        return snippet.map(groupPositions, function(positions) {
            return self._makeLinesPath(positions, null, connectNulls);
        });
    },

    /**
     * Get spline lines path.
     * @param {Array.<Array.<{left: number, top: number, startTop: number}>>} groupPositions positions
     * @param {boolean} [connectNulls] - boolean value connect nulls or not
     * @returns {Array} path
     * @private
     */
    _getSplineLinesPath: function(groupPositions, connectNulls) {
        var self = this;

        return snippet.map(groupPositions, function(positions) {
            return self._makeSplineLinesPath(positions, connectNulls);
        });
    },

    /**
     * Render lines.
     * @param {object} paper raphael paper
     * @param {Array.<Array.<string>>} groupPaths paths
     * @param {string[]} colors line colors
     * @param {?number} strokeWidth stroke width
     * @returns {Array.<Array.<object>>} lines
     * @private
     */
    _renderLines: function(paper, groupPaths, colors, strokeWidth) {
        return snippet.map(groupPaths, function(path, groupIndex) {
            var color = colors[groupIndex] || 'transparent';

            return raphaelRenderUtil.renderLine(paper, path.join(' '), color, strokeWidth);
        });
    },

    /**
     * Resize graph of line chart.
     * @param {object} params parameters
     *      @param {{width: number, height:number}} params.dimension dimension
     *      @param {Array.<Array.<{left:number, top:number}>>} params.groupPositions group positions
     */
    resize: function(params) {
        var self = this,
            dimension = params.dimension,
            groupPositions = params.groupPositions;

        this.resizeClipRect(dimension.width, dimension.height);

        this.groupPositions = groupPositions;
        this.groupPaths = this.isSpline ? this._getSplineLinesPath(groupPositions) : this._getLinesPath(groupPositions);
        this.paper.setSize(dimension.width, dimension.height);
        this.tooltipLine.attr({top: dimension.height});

        snippet.forEachArray(this.groupPaths, function(path, groupIndex) {
            self.groupLines[groupIndex].attr({path: path.join(' ')});

            snippet.forEachArray(self.groupDots[groupIndex], function(item, index) {
                if (item.endDot) {
                    self.moveDot(item.endDot.dot, groupPositions[groupIndex][index]);
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

        snippet.forEachArray(this.groupLines, function(line, groupIndex) {
            var isSelectedLegend = legendIndex === groupIndex;
            var opacity = (noneSelected || isSelectedLegend) ? EMPHASIS_OPACITY : DE_EMPHASIS_OPACITY;
            var groupDots = this.groupDots[groupIndex];

            line.attr({'stroke-opacity': opacity});

            snippet.forEachArray(groupDots, function(item) {
                item.opacity = opacity;

                if (this.dotOpacity) {
                    item.endDot.dot.attr({'fill-opacity': opacity});
                }
            }, this);

            if (isSelectedLegend) {
                this.moveSeriesToFront(line, groupDots);
            }
        }, this);

        if (noneSelected) {
            snippet.forEachArray(this.groupLines, function(line, groupIndex) {
                this.moveSeriesToFront(line, this.groupDots[groupIndex]);
            }, this);
        }
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
     * @param {SVGElement} lineType - line or area graph
     * @param {Array.<SVGElement>} dots - dot type element
     * @ignore
     * @override
     */
    moveSeriesToFront: function(lineType, dots) {
        lineType.toFront();

        snippet.forEachArray(dots, function(item) {
            item.endDot.dot.toFront();
        });
    },

    /**
     * Animate for adding data.
     * @param {object} data - data for graph rendering
     * @param {number} tickSize - tick size
     * @param {Array.<Array.<object>>} groupPositions - group positions
     * @param {boolean} [shiftingOption] - shifting option
     */
    animateForAddingData: function(data, tickSize, groupPositions, shiftingOption) {
        var self = this;
        var isSpline = data.options.spline;
        var groupPaths = isSpline ? this._getSplineLinesPath(groupPositions) : this._getLinesPath(groupPositions);
        var additionalIndex = 0;

        if (!groupPositions.length) {
            return;
        }

        if (shiftingOption) {
            additionalIndex = 1;
        }

        snippet.forEachArray(this.groupLines, function(line, groupIndex) {
            var dots = self.groupDots[groupIndex];
            var groupPosition = groupPositions[groupIndex];

            if (shiftingOption) {
                self._removeFirstDot(dots);
            }

            snippet.forEachArray(dots, function(item, index) {
                var position = groupPosition[index + additionalIndex];
                self._animateByPosition(item.endDot.dot, position, tickSize);
            });

            self._animateByPath(line, groupPaths[groupIndex], tickSize);
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
    }
});

module.exports = RaphaelLineChart;
