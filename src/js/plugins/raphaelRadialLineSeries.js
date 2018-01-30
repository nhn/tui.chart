/**
 * @fileoverview Raphael radial line series renderer.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var RaphaelLineTypeBase = require('./raphaelLineTypeBase');
var raphaelRenderUtil = require('./raphaelRenderUtil');
var snippet = require('tui-code-snippet');

var EMPHASIS_OPACITY = 1;
var DE_EMPHASIS_OPACITY = 0.3;

var RaphaelRadialLineSeries = snippet.defineClass(RaphaelLineTypeBase, /** @lends RaphaelRadialLineSeries.prototype */{
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

        /**
         * Line width
         * @type {number}
         */
        this.lineWidth = 2;
    },

    /**
     * Render function of line chart.
     * @param {object} paper - raphael paper
     * @param {{groupPositions: Array.<Array>, dimension: object, theme: object, options: object}} data render data
     * @returns {object} paper raphael paper
     */
    render: function(paper, data) {
        var dimension = data.dimension;
        var groupPositions = data.groupPositions;
        var theme = data.theme;
        var colors = theme.colors;
        var dotOpacity = data.options.showDot ? 1 : 0;
        var isShowArea = data.options.showArea;

        var groupPaths = this._getLinesPath(groupPositions);
        var borderStyle = this.makeBorderStyle(theme.borderColor, dotOpacity);
        var outDotStyle = this.makeOutDotStyle(dotOpacity, borderStyle);
        var radialSeriesSet = paper.set();
        var lineWidth = this.lineWidth = (data.options.pointWidth ? data.options.pointWidth : this.lineWidth);

        this.paper = paper;
        this.theme = data.theme;
        this.dimension = dimension;
        this.position = data.position;

        if (isShowArea) {
            this.groupAreas = this._renderArea(paper, groupPaths, colors, radialSeriesSet);
        }

        this.groupLines = this._renderLines(paper, groupPaths, colors, lineWidth, radialSeriesSet);
        this.groupDots = this._renderDots(paper, groupPositions, colors, dotOpacity, radialSeriesSet);

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

        return radialSeriesSet;
    },

    /**
     * Get lines path.
     * @param {Array.<Array.<{left: number, top: number, startTop: number}>>} groupPositions positions
     * @returns {Array.<Array.<string>>} path
     * @private
     */
    _getLinesPath: function(groupPositions) {
        var self = this;

        return snippet.map(groupPositions, function(positions) {
            return self._makeLinesPath(positions);
        });
    },

    /**
     * Render lines.
     * @param {object} paper raphael paper
     * @param {Array.<Array.<string>>} groupPaths paths
     * @param {string[]} colors line colors
     * @param {?number} strokeWidth stroke width
     * @param {Array.<object>} radialSeriesSet radial line series set
     * @returns {Array.<Array.<object>>} lines
     * @private
     */
    _renderLines: function(paper, groupPaths, colors, strokeWidth, radialSeriesSet) {
        return snippet.map(groupPaths, function(path, groupIndex) {
            var color = colors[groupIndex] || 'transparent';
            var line = raphaelRenderUtil.renderLine(paper, path.join(' '), color, strokeWidth);

            radialSeriesSet.push(line);

            return line;
        });
    },

    /**
     * Render area.
     * @param {object} paper raphael paper
     * @param {Array.<Array.<string>>} groupPaths paths
     * @param {string[]} colors line colors
     * @param {Array.<object>} radialSeriesSet radial line series set
     * @returns {Array.<Array.<object>>} lines
     * @private
     */
    _renderArea: function(paper, groupPaths, colors, radialSeriesSet) {
        return snippet.map(groupPaths, function(path, groupIndex) {
            var color = colors[groupIndex] || 'transparent';
            var area = raphaelRenderUtil.renderArea(paper, path, {
                fill: color,
                opacity: 0.4,
                'stroke-width': 0,
                stroke: color
            });

            radialSeriesSet.push(area);

            return area;
        });
    },

    /**
     * Resize graph of line chart.
     * /todo copied at raphaelLineCharts#resize, should remove duplication
     * tooltipLine code was deleted, as group tooltip not works on radial chart/
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

        snippet.forEachArray(this.groupPaths, function(path, groupIndex) {
            self.groupLines[groupIndex].attr({path: path.join(' ')});
            self.groupAreas[groupIndex].attr({path: path.join(' ')});

            snippet.forEachArray(self.groupDots[groupIndex], function(item, index) {
                self._moveDot(item.endDot.dot, groupPositions[groupIndex][index]);
            });
        });
    },

    /**
     * Select legend.
     * /todo copied at raphaelLineCharts, should remove duplication
     * @param {?number} legendIndex legend index
     */
    selectLegend: function(legendIndex) {
        var self = this,
            noneSelected = snippet.isNull(legendIndex);

        this.selectedLegendIndex = legendIndex;

        snippet.forEachArray(this.groupLines, function(line, groupIndex) {
            var opacity = (noneSelected || legendIndex === groupIndex) ? EMPHASIS_OPACITY : DE_EMPHASIS_OPACITY;

            line.attr({'stroke-opacity': opacity});

            snippet.forEachArray(self.groupDots[groupIndex], function(item) {
                item.opacity = opacity;

                if (self.dotOpacity) {
                    item.endDot.dot.attr({'fill-opacity': opacity});
                }
            });
        });
    }
});

module.exports = RaphaelRadialLineSeries;
