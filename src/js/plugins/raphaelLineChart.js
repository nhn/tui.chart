/**
 * @fileoverview Raphael line chart renderer.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var RaphaelLineBase = require('./raphaelLineTypeBase'),
    raphaelRenderUtil = require('./raphaelRenderUtil');

var raphael = window.Raphael,
    EMPHASIS_OPACITY = 1,
    DE_EMPHASIS_OPACITY = 0.3;

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
            opacity = data.options.hasDot ? 1 : 0,
            groupPaths = data.options.spline ? this._getSplineLinesPath(groupPositions) : this._getLinesPath(groupPositions),
            borderStyle = this.makeBorderStyle(theme.borderColor, opacity),
            outDotStyle = this.makeOutDotStyle(opacity, borderStyle),
            paper;

        this.paper = paper = raphael(container, 1, dimension.height);
        this.splineOption = data.options.spline;
        this.dimension = dimension;

        this.groupLines = this._renderLines(paper, groupPaths, colors);
        this.tooltipLine = this._renderTooltipLine(paper, dimension.height);
        this.groupDots = this._renderDots(paper, groupPositions, colors, opacity);

        if (data.options.hasSelection) {
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
        return tui.util.map(groupPositions, function(positions) {
            positions[0].left -= 1;

            return this._makeLinesPath(positions);
        }, this);
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
        }, this);
    },

    /**
     * Resize graph of line chart.
     * @param {object} params parameters
     *      @param {{width: number, height:number}} params.dimension dimension
     *      @param {Array.<Array.<{left:number, top:number}>>} params.groupPositions group positions
     */
    resize: function(params) {
        var dimension = params.dimension,
            groupPositions = params.groupPositions;

        this.groupPositions = groupPositions;
        this.groupPaths = this.splineOption ? this._getSplineLinesPath(groupPositions) : this._getLinesPath(groupPositions);
        this.paper.setSize(dimension.width, dimension.height);
        this.tooltipLine.attr({top: dimension.height});

        tui.util.forEachArray(this.groupPaths, function(path, groupIndex) {
            this.groupLines[groupIndex].attr({path: path.join(' ')});

            tui.util.forEachArray(this.groupDots[groupIndex], function(item, index) {
                this._moveDot(item.dot, groupPositions[groupIndex][index]);
            }, this);
        }, this);
    },

    /**
     * Select legend.
     * @param {?number} legendIndex legend index
     */
    selectLegend: function(legendIndex) {
        var that = this,
            noneSelected = tui.util.isNull(legendIndex);

        this.selectedLegendIndex = legendIndex;

        tui.util.forEachArray(this.groupPaths, function(path, groupIndex) {
            var opacity = (noneSelected || legendIndex === groupIndex) ? EMPHASIS_OPACITY : DE_EMPHASIS_OPACITY;

            that.groupLines[groupIndex].attr({'stroke-opacity': opacity});

            tui.util.forEachArray(this.groupDots[groupIndex], function(item) {
                item.opacity = opacity;

                if (that.dotOpacity) {
                    item.dot.attr({'fill-opacity': opacity});
                }
            });
        }, this);
    }
});

module.exports = RaphaelLineChart;
