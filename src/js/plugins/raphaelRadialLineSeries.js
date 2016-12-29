/**
 * @fileoverview Raphael radial line series renderer.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var RaphaelLineTypeBase = require('./raphaelLineTypeBase');
var raphaelRenderUtil = require('./raphaelRenderUtil');

var EMPHASIS_OPACITY = 1;
var DE_EMPHASIS_OPACITY = 0.3;

var raphael = window.Raphael;

var RaphaelRadialLineSeries = tui.util.defineClass(RaphaelLineTypeBase, /** @lends RaphaelRadialLineSeries.prototype */ {
    /**
     * RaphaelLineCharts is graph renderer for line chart.
     * @constructs RaphaelRadialLineSeries
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
        this.chartType = 'radial';
    },

    /**
     * Render function of line chart.
     * @param {HTMLElement} container container
     * @param {{groupPositions: Array.<Array>, dimension: object, theme: object, options: object}} data render data
     * @param {object} [paper] - raphael paper
     * @returns {object} paper raphael paper
     */
    render: function(container, data, paper) {
        var dimension = data.dimension;
        var groupPositions = data.groupPositions;
        var theme = data.theme;
        var colors = theme.colors;
        var dotOpacity = data.options.showDot ? 1 : 0;
        var isShowArea = data.options.showArea;

        var groupPaths = this._getLinesPath(groupPositions);
        var borderStyle = this.makeBorderStyle(theme.borderColor, dotOpacity);
        var outDotStyle = this.makeOutDotStyle(dotOpacity, borderStyle);

        paper = paper || raphael(container, 1, dimension.height);

        this.paper = paper;
        this.dimension = dimension;

        if (isShowArea) {
            this._renderArea(paper, groupPaths, colors);
        }

        this.groupLines = this._renderLines(paper, groupPaths, colors);
        this.groupDots = this._renderDots(paper, groupPositions, colors, dotOpacity);

        if (data.options.allowSelect) {
            this.selectionDot = this._makeSelectionDot(paper);
            this.selectionColor = theme.selectionColor;
        }

        this.colors = colors;
        this.borderStyle = borderStyle;
        this.outDotStyle = outDotStyle;
        this.groupPositions = groupPositions;
        this.groupPaths = groupPaths;
        this.dotOpacity = dotOpacity;

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
            return self._makeLinesPath(positions);
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
        return tui.util.map(groupPaths, function(path, groupIndex) {
            var color = colors[groupIndex] || 'transparent';

            return raphaelRenderUtil.renderLine(paper, path.join(' '), color, strokeWidth);
        });
    },

    /**
     * Render area.
     * @param {object} paper raphael paper
     * @param {Array.<Array.<string>>} groupPaths paths
     * @param {string[]} colors line colors
     * @returns {Array.<Array.<object>>} lines
     * @private
     */
    _renderArea: function(paper, groupPaths, colors) {
        return tui.util.map(groupPaths, function(path, groupIndex) {
            var color = colors[groupIndex] || 'transparent';

            return raphaelRenderUtil.renderArea(paper, path, {
                fill: color,
                opacity: 0.4,
                'stroke-width': 0,
                stroke: color
            });
        });
    },

    /**
     * Resize graph of line chart.
     * raphaelLineCharts에서 가져옴, 구조 개편시 중복 제거
     * @param {object} params parameters
     *      @param {{width: number, height:number}} params.dimension dimension
     *      @param {Array.<Array.<{left:number, top:number}>>} params.groupPositions group positions
     */
    resize: function(params) {
        var self = this,
            dimension = params.dimension,
            groupPositions = params.groupPositions;

        this.groupPositions = groupPositions;
        this.groupPaths = this._getLinesPath(groupPositions);
        this.paper.setSize(dimension.width, dimension.height);
        this.tooltipLine.attr({top: dimension.height});

        tui.util.forEachArray(this.groupPaths, function(path, groupIndex) {
            self.groupLines[groupIndex].attr({path: path.join(' ')});

            tui.util.forEachArray(self.groupDots[groupIndex], function(item, index) {
                self._moveDot(item.endDot.dot, groupPositions[groupIndex][index]);
            });
        });
    },

    /**
     * Select legend.
     * raphaelLineCharts에서 가져옴, 구조 개편시 중복 제거
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
                    item.endDot.dot.attr({'fill-opacity': opacity});
                }
            });
        });
    }
});

module.exports = RaphaelRadialLineSeries;
