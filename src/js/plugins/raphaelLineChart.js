/**
 * @fileoverview Raphael line chart renderer.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var RaphaelLineBase = require('./raphaelLineTypeBase'),
    raphaelRenderUtil = require('./raphaelRenderUtil');

var EMPHASIS_OPACITY = 1;
var DE_EMPHASIS_OPACITY = 0.3;
var LEFT_BAR_WIDTH = 9;

var raphael = window.Raphael;

var RaphaelLineChart = tui.util.defineClass(RaphaelLineBase, /** @lends RaphaelLineChart.prototype */ {
    /**
     * RaphaelLineCharts is graph renderer for line chart.
     * @constructs RaphaelLineChart
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
    },

    /**
     * Render function of line chart.
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
            isSpline = data.options.spline,
            groupPaths = isSpline ? this._getSplineLinesPath(groupPositions) : this._getLinesPath(groupPositions),
            borderStyle = this.makeBorderStyle(theme.borderColor, opacity),
            outDotStyle = this.makeOutDotStyle(opacity, borderStyle),
            paper;

        this.paper = paper = raphael(container, 1, dimension.height);
        this.isSpline = isSpline;
        this.dimension = dimension;

        this.groupLines = this._renderLines(paper, groupPaths, colors);
        this.tooltipLine = this._renderTooltipLine(paper, dimension.height);
        this.leftBar = this._renderLeftBar(dimension.height, data.chartBackground);
        this.groupDots = this._renderDots(paper, groupPositions, colors, opacity);

        if (data.options.allowSelect) {
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

        return paper;
    },

    /**
     * Get lines path.
     * @param {Array.<Array.<{left: number, top: number, startTop: number}>>} groupPositions positions
     * @returns {Array.<Array.<string>>} path
     * @private
     */
    _getLinesPath: function(groupPositions) {
        var self = this;

        return tui.util.map(groupPositions, function(positions) {
            positions[0].left -= 1;

            return self._makeLinesPath(positions);
        });
    },

    /**
     * Get spline lines path.
     * @param {Array.<Array.<{left: number, top: number, startTop: number}>>} groupPositions positions
     * @returns {Array} path
     * @private
     */
    _getSplineLinesPath: function(groupPositions) {
        return tui.util.map(groupPositions, this._makeSplineLinesPath, this);
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
        return tui.util.map(groupPaths, function(path, groupIndex) {
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

        this.groupPositions = groupPositions;
        this.groupPaths = this.isSpline ? this._getSplineLinesPath(groupPositions) : this._getLinesPath(groupPositions);
        this.paper.setSize(dimension.width, dimension.height);
        this.tooltipLine.attr({top: dimension.height});

        tui.util.forEachArray(this.groupPaths, function(path, groupIndex) {
            self.groupLines[groupIndex].attr({path: path.join(' ')});

            tui.util.forEachArray(self.groupDots[groupIndex], function(item, index) {
                self._moveDot(item.dot.dot, groupPositions[groupIndex][index]);
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

        tui.util.forEachArray(this.groupLines, function(line, groupIndex) {
            var opacity = (noneSelected || legendIndex === groupIndex) ? EMPHASIS_OPACITY : DE_EMPHASIS_OPACITY;

            line.attr({'stroke-opacity': opacity});

            tui.util.forEachArray(self.groupDots[groupIndex], function(item) {
                item.opacity = opacity;

                if (self.dotOpacity) {
                    item.dot.dot.attr({'fill-opacity': opacity});
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
     */
    animateForAddingData: function(data, tickSize, groupPositions, shiftingOption) {
        var self = this;
        var isSpline = data.options.spline;
        var groupPaths = isSpline ? this._getSplineLinesPath(groupPositions) : this._getLinesPath(groupPositions);
        var additionalIndex = 0;

        if (shiftingOption) {
            this.leftBar.animate({
                width: tickSize + LEFT_BAR_WIDTH
            }, 300);
            additionalIndex = 1;
        }

        tui.util.forEachArray(this.groupLines, function(line, groupIndex) {
            var dots = self.groupDots[groupIndex];
            var groupPosition = groupPositions[groupIndex];

            if (shiftingOption) {
                self._removeFirstDot(dots);
            }

            tui.util.forEachArray(dots, function(item, index) {
                var position = groupPosition[index + additionalIndex];
                self._animateByPosition(item.dot.dot, position);
            });

            self._animateByPath(line, groupPaths[groupIndex]);
        });
    }
});

module.exports = RaphaelLineChart;
