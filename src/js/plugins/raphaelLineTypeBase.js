/**
 * @fileoverview RaphaelLineTypeBase is base class for line type renderer.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var raphaelRenderUtil = require('./raphaelRenderUtil');

var ANIMATION_TIME = 700,
    DEFAULT_DOT_RADIUS = 3,
    HOVER_DOT_RADIUS = 4,
    SELECTION_DOT_RADIUS = 7,
    DE_EMPHASIS_OPACITY = 0.3;

var concat = Array.prototype.concat;

/**
 * @classdesc RaphaelLineTypeBase is base for line type renderer.
 * @class RaphaelLineTypeBase
 */
var RaphaelLineTypeBase = tui.util.defineClass(/** @lends RaphaelLineTypeBase.prototype */ {
    /**
     * Make lines path.
     * @param {Array.<{left: number, top: number, startTop: number}>} positions positions
     * @returns {Array.<string | number>} paths
     * @private
     */
    _makeLinesPath: function(positions) {
        var path = tui.util.map(positions, function(position) {
            return ['L', position.left, position.top];
        });

        path = concat.apply([], path);
        path[0] = 'M';

        return path;
    },

    /**
     * Get anchor. (http://raphaeljs.com/analytics.js)
     * @param {{left: number, top: number}} fromPos from position
     * @param {{left: number, top: number}} pos position
     * @param {{left: number, top: number}} nextPos next position
     * @returns {{x1: number, y1: number, x2: number, y2: number}} anchor
     * @private
     */
    _getAnchor: function(fromPos, pos, nextPos) {
        var l1 = (pos.left - fromPos.left) / 2,
            l2 = (nextPos.left - pos.left) / 2,
            a = Math.atan((pos.left - fromPos.left) / Math.abs(pos.top - fromPos.top)),
            b = Math.atan((nextPos.left - pos.left) / Math.abs(pos.top - nextPos.top)),
            alpha, dx1, dy1, dx2, dy2;

        a = fromPos.top < pos.top ? Math.PI - a : a;
        b = nextPos.top < pos.top ? Math.PI - b : b;
        alpha = Math.PI / 2 - ((a + b) % (Math.PI * 2)) / 2;
        dx1 = l1 * Math.sin(alpha + a);
        dy1 = l1 * Math.cos(alpha + a);
        dx2 = l2 * Math.sin(alpha + b);
        dy2 = l2 * Math.cos(alpha + b);

        return {
            x1: pos.left - dx1,
            y1: pos.top + dy1,
            x2: pos.left + dx2,
            y2: pos.top + dy2
        };
    },

    /**
     * Make spline lines path.
     * @param {Array.<{left: number, top: number, startTop: number}>} positions positions
     * @returns {Array.<string | number>} paths
     * @private
     */
    _makeSplineLinesPath: function(positions) {
        var firstPos = positions[0],
            positionsLen = positions.length,
            fromPos = firstPos,
            lastPos = positions[positionsLen - 1],
            middlePositions = positions.slice(1).slice(0, positionsLen - 2),
            path = tui.util.map(middlePositions, function(position, index) {
                var nextPos = positions[index + 2],
                    anchor = this._getAnchor(fromPos, position, nextPos);
                fromPos = position;
                return [anchor.x1, anchor.y1, position.left, position.top, anchor.x2, anchor.y2];
            }, this);

        firstPos.left -= 1;
        path.push([lastPos.left, lastPos.top, lastPos.left, lastPos.top]);
        path.unshift(['M', firstPos.left, firstPos.top, 'C', firstPos.left, firstPos.top]);

        return path;
    },

    /**
     * Render tooltip line.
     * @param {object} paper raphael paper
     * @param {number} height height
     * @returns {object} raphael object
     * @private
     */
    _renderTooltipLine: function(paper, height) {
        var linePath = raphaelRenderUtil.makeLinePath({
                left: 10,
                top: height
            }, {
                left: 10,
                top: 0
            });

        return raphaelRenderUtil.renderLine(paper, linePath, 'transparent', 1);
    },

    /**
     * Make border style.
     * @param {string} borderColor border color
     * @param {number} opacity opacity
     * @returns {{stroke: string, stroke-width: number, strike-opacity: number}} border style
     */
    makeBorderStyle: function(borderColor, opacity) {
        var borderStyle;

        if (borderColor) {
            borderStyle = {
                stroke: borderColor,
                'stroke-width': 1,
                'stroke-opacity': opacity
            };
        }

        return borderStyle;
    },

    /**
     * Make dot style for mouseout event.
     * @param {number} opacity opacity
     * @param {object} borderStyle border style
     * @returns {{fill-opacity: number, stroke-opacity: number, r: number}} style
     */
    makeOutDotStyle: function(opacity, borderStyle) {
        var outDotStyle = {
            'fill-opacity': opacity,
            'stroke-opacity': 0,
            r: DEFAULT_DOT_RADIUS
        };

        if (borderStyle) {
            tui.util.extend(outDotStyle, borderStyle);
        }

        return outDotStyle;
    },

    /**
     * Render dot.
     * @param {object} paper raphael papaer
     * @param {{left: number, top: number}} position dot position
     * @param {string} color dot color
     * @param {number} opacity opacity
     * @returns {object} raphael dot
     */
    renderDot: function(paper, position, color, opacity) {
        var dot = paper.circle(position.left, position.top, DEFAULT_DOT_RADIUS),
            dotStyle = {
                fill: color,
                'fill-opacity': opacity,
                'stroke-opacity': 0
            };

        dot.attr(dotStyle);

        return {
            dot: dot,
            color: color
        };
    },

    /**
     * Render dots.
     * @param {object} paper raphael paper
     * @param {Array.<Array.<object>>} groupPositions positions
     * @param {string[]} colors colors
     * @param {number} opacity opacity
     * @returns {Array.<object>} dots
     * @private
     */
    _renderDots: function(paper, groupPositions, colors, opacity) {
        var dots = tui.util.map(groupPositions, function(positions, groupIndex) {
            var color = colors[groupIndex];
            return tui.util.map(positions, function(position) {
                var dot = this.renderDot(paper, position, color, opacity);
                return dot;
            }, this);
        }, this);

        return dots;
    },

    /**
     * Get center position
     * @param {{left: number, top: number}} fromPos from position
     * @param {{left: number, top: number}} toPos to position
     * @returns {{left: number, top: number}} position
     * @private
     */
    _getCenter: function(fromPos, toPos) {
        return {
            left: (fromPos.left + toPos.left) / 2,
            top: (fromPos.top + toPos.top) / 2
        };
    },

    /**
     * Show dot.
     * @param {object} dot raphael object
     * @private
     */
    _showDot: function(dot) {
        dot.attr({
            'fill-opacity': 1,
            'stroke-opacity': 0.3,
            'stroke-width': 2,
            r: HOVER_DOT_RADIUS
        });
    },

    /**
     * Update line stroke width.
     * @param {object} line raphael object
     * @param {number} strokeWidth stroke width
     * @private
     */
    _updateLineStrokeWidth: function(line, strokeWidth) {
        line.attr({
            'stroke-width': strokeWidth
        });
    },

    /**
     * Show animation.
     * @param {{groupIndex: number, index:number}} data show info
     */
    showAnimation: function(data) {
        var index = data.groupIndex, // Line chart has pivot values.
            groupIndex = data.index,
            line = this.groupLines ? this.groupLines[groupIndex] : this.groupAreas[groupIndex].line,
            item = this.groupDots[groupIndex][index];

        this._updateLineStrokeWidth(line, 3);
        this._showDot(item.dot);
    },

    /**
     * Get pivot group dots.
     * @returns {Array.<Array>} dots
     * @private
     */
    _getPivotGroupDots: function() {
        if (!this.pivotGroupDots) {
            this.pivotGroupDots = tui.util.pivot(this.groupDots);
        }

        return this.pivotGroupDots;
    },

    /**
     * Show group dots.
     * @param {number} index index
     * @private
     */
    _showGroupDots: function(index) {
        var groupDots = this._getPivotGroupDots();

        tui.util.forEachArray(groupDots[index], function(item) {
            this._showDot(item.dot);
        }, this);
    },

    /**
     * Show line for group tooltip.
     * @param {{
     *      dimension: {width: number, height: number},
     *      position: {left: number, top: number}
     * }} bound bound
     */
    showGroupTooltipLine: function(bound) {
        var linePath = raphaelRenderUtil.makeLinePath({
            left: bound.position.left,
            top: bound.position.top + bound.dimension.height
        }, {
            left: bound.position.left,
            top: bound.position.top
        });

        this.tooltipLine.attr({
            path: linePath,
            stroke: '#999',
            'stroke-opacity': 1
        });
    },

    /**
     * Show group animation.
     * @param {number} index index
     */
    showGroupAnimation: function(index) {
        this._showGroupDots(index);
    },

    /**
     * Hide dot.
     * @param {object} dot raphael object
     * @param {?number} opacity opacity
     * @private
     */
    _hideDot: function(dot, opacity) {
        var outDotStyle = this.outDotStyle;

        if (!tui.util.isUndefined(opacity)) {
            outDotStyle = tui.util.extend({}, this.outDotStyle, {
                'fill-opacity': opacity
            });
        }

        dot.attr(outDotStyle);
    },

    /**
     * Hide animation.
     * @param {{groupIndex: number, index:number}} data hide info
     */
    hideAnimation: function(data) {
        var index = data.groupIndex, // Line chart has pivot values.
            groupIndex = data.index,
            line = this.groupLines ? this.groupLines[groupIndex] : this.groupAreas[groupIndex].line,
            item = this.groupDots[groupIndex][index],
            opacity = this.dotOpacity;

        if (opacity && !tui.util.isNull(this.selectedLegendIndex) && this.selectedLegendIndex !== groupIndex) {
            opacity = DE_EMPHASIS_OPACITY;
        }

        if (line) {
            this._updateLineStrokeWidth(line, 2);
        }

        if (item) {
            this._hideDot(item.dot, opacity);
        }
    },

    /**
     * Hide group dots.
     * @param {number} index index
     * @private
     */
    _hideGroupDots: function(index) {
        var dots = this._getPivotGroupDots(),
            hasSelectedIndex = !tui.util.isNull(this.selectedLegendIndex),
            baseOpacity = this.dotOpacity;

        tui.util.forEachArray(dots[index], function(item, groupIndex) {
            var opacity = baseOpacity;

            if (opacity && hasSelectedIndex && this.selectedLegendIndex !== groupIndex) {
                opacity = DE_EMPHASIS_OPACITY;
            }

            this._hideDot(item.dot, opacity);
        }, this);
    },

    /**
     * Hide line for group tooltip.
     */
    hideGroupTooltipLine: function() {
        this.tooltipLine.attr({
            'stroke-opacity': 0
        });
    },

    /**
     * Hide group animation.
     * @param {number} index index
     */
    hideGroupAnimation: function(index) {
        this._hideGroupDots(index);
    },

    _moveDot: function(dot, position) {
        var dotAttrs = {
                cx: position.left,
                cy: position.top
            };

        if (this.dotOpacity) {
            dotAttrs = tui.util.extend({'fill-opacity': this.dotOpacity}, dotAttrs, this.borderStyle);
        }

        dot.attr(dotAttrs);
    },

    /**
     * Animate.
     * @param {function} onFinish callback
     */
    animate: function(onFinish) {
        var that = this,
            seriesWidth = this.dimension.width,
            seriesHeight = this.dimension.height;

        tui.chart.renderUtil.cancelAnimation(this.animation);

        this.animation = tui.chart.renderUtil.startAnimation(ANIMATION_TIME, function(ratio) {
            var width = Math.min(seriesWidth * ratio, seriesWidth);

            that.paper.setSize(width, seriesHeight);

            if (ratio === 1) {
                onFinish();
            }
        });
    },

    /**
     * Make selection dot.
     * @param {object} paper raphael paper
     * @returns {object} selection dot
     * @private
     */
    _makeSelectionDot: function(paper) {
        var selectionDot = paper.circle(0, 0, SELECTION_DOT_RADIUS);

        selectionDot.attr({
            'fill': '#ffffff',
            'fill-opacity': 0,
            'stroke-opacity': 0,
            'stroke-width': 2
        });
        return selectionDot;
    },

    /**
     * Select series.
     * @param {{groupIndex: number, index: number}} indexes indexes
     */
    selectSeries: function(indexes) {
        var item = this.groupDots[indexes.index][indexes.groupIndex],
            position = this.groupPositions[indexes.index][indexes.groupIndex];

        this.selectedItem = item;
        this.selectionDot.attr({
            cx: position.left,
            cy: position.top,
            'fill-opacity': 0.5,
            'stroke-opacity': 1,
            stroke: this.selectionColor || item.color
        });
    },

    /**
     * Unselect series.
     * @param {{groupIndex: number, index: number}} indexes indexes
     */
    unselectSeries: function(indexes) {
        var item = this.groupDots[indexes.index][indexes.groupIndex];

        if (this.selectedItem === item) {
            this.selectionDot.attr({
                'fill-opacity': 0,
                'stroke-opacity': 0
            });
        }
    }
});

module.exports = RaphaelLineTypeBase;
