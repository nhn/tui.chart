/**
 * @fileoverview Raphael line chart renderer
 * @author NHN Ent.
 *         FE Development Team <jiung.kang@nhnent.com>
 */

'use strict';

var Raphael = window.Raphael;

var HIDE_DELAY = 100;

/**
 * @classdesc This class is LineChart graph renderer.
 * @class
 */
var LineChart = ne.util.defineClass({
    render: function(container, data, inCallback, outCallback) {
        var dimension = data.dimension,
            theme = data.theme,
            colors = theme.colors,
            opacity = data.model.options.dot ? 1 : 0,
            paper = Raphael(container, dimension.width, dimension.height),
            groupPositions = data.model.makeLinePositions(data.dimension),
            groupLines = this._renderLines(paper, colors, groupPositions),
            borderStyle = theme.borderColor && {
                'stroke': theme.borderColor,
                'stroke-width': 1,
                'stroke-opacity': opacity
            },
            groupDots = this._renderDots(paper, groupPositions, colors, opacity, borderStyle);

        this._attachEvent(groupDots, groupLines, groupPositions, opacity, borderStyle, inCallback, outCallback);

        this.groupDots = groupDots;
    },

    showDot: function(data) {
        var index = data.groupIndex, // Line chart has pivot values.
            groupIndex = data.index,
            dot = this.groupDots[groupIndex][index];

        dot.attr({
            'fill-opacity': 1,
            'stroke-opacity': 0.3,
            'stroke-width': 3,
            r: 6
        });
    },

    hideDot: function(data) {
        var index = data.groupIndex, // Line chart has pivot values.
            groupIndex = data.index,
            dot = this.groupDots[groupIndex][index];

        dot.attr(this.outDotStyle);
    },

    _renderDot: function(paper, position, color, opacity, borderStyle) {
        var dot = paper.circle(position.left, position.top, 4),
            dotStyle = {
                fill: color,
                'fill-opacity': opacity,
                'stroke-opacity': 0
            };

        if (borderStyle) {
            ne.util.extend(dotStyle, borderStyle);
        }

        dot.attr(dotStyle);

        return dot;
    },

    _renderDots: function(paper, groupPositions, colors, opacity, borderStyle) {
        var dots = ne.util.map(groupPositions, function(positions, groupIndex) {
            var color = colors[groupIndex];
            return ne.util.map(positions, function(position) {
                var dot = this._renderDot(paper, position, color, opacity, borderStyle);
                return dot;
            }, this);
        }, this);

        return dots;
    },

    _makeLinePath: function(fx, fy, tx, ty, width) {
        var fromPoint = [fx, fy];
        var toPoint = [tx, ty];

        width = width || 1;

        if (fromPoint[0] === toPoint[0]) {
            fromPoint[0] = toPoint[0] = Math.round(fromPoint[0]) - (width % 2 / 2);
        }
        if (fromPoint[1] === toPoint[1]) {
            fromPoint[1] = toPoint[1] = Math.round(fromPoint[1]) + (width % 2 / 2);
        }

        return 'M' + fromPoint.join(' ') + 'L' + toPoint.join(' ');
    },

    _getCenter: function(from, to) {
        return {
            left: (from.left + to.left) / 2,
            top: (from.top + to.top) / 2
        };
    },

    _renderLine: function(paper, path, color, strokeWidth) {
        var line = paper.path([path]);
        line.attr({
            stroke: color,
            'stroke-width': strokeWidth || 2
        });

        return line;
    },

    _renderLines: function(paper, colors, groupPositions) {
        var groupLines = ne.util.map(groupPositions, function(positions, groupIndex) {
            var color = colors[groupIndex],
                from = positions[0],
                rest = positions.slice(1);
            return ne.util.map(rest, function(position) {
                var center = this._getCenter(from, position),
                    firstPath = this._makeLinePath(from.left, from.top, center.left, center.top),
                    secondPath = this._makeLinePath(center.left, center.top, position.left, position.top),
                    firstLine = this._renderLine(paper, firstPath, color),
                    secondLine = this._renderLine(paper, secondPath, color);

                from = position;
                return [firstLine, secondLine];
            }, this);
        }, this);

        return groupLines;
    },

    _bindHoverEvent: function(target, dot, outDotStyle, position, id, inCallback, outCallback) {
        target.hover(function() {
            dot.attr({
                'fill-opacity': 1,
                'stroke-opacity': 0.3,
                'stroke-width': 3,
                r: 6
            });
            inCallback(position, id);
        }, function() {
            setTimeout(function() {
                dot.attr(outDotStyle);
            }, HIDE_DELAY);
            outCallback(id);
        });
    },

    _attachEvent: function(groupDots, groupLines, groupPositions, opacity, borderStyle, inCallback, outCallback) {
        var outDotStyle = {
            'fill-opacity': opacity,
            'stroke-opacity': 0,
            r: 4
        };

        this.outDotStyle = outDotStyle;
        if (borderStyle) {
            ne.util.extend(outDotStyle, borderStyle);
        }
        ne.util.forEach(groupDots, function(dots, groupIndex) {
            ne.util.forEach(dots, function(dot, index, scope) {
                var position = groupPositions[groupIndex][index],
                    id = index + '-' + groupIndex,
                    prevIndex, prevPositon, lines, prevId;
                this._bindHoverEvent(dot, dot, outDotStyle, position, id, inCallback, outCallback);
                if (index > 0) {
                    prevIndex = index - 1;
                    lines = groupLines[groupIndex][prevIndex];
                    prevPositon = groupPositions[groupIndex][prevIndex];
                    prevId = prevIndex + '-' + groupIndex;
                    this._bindHoverEvent(lines[0], scope[prevIndex], outDotStyle, prevPositon, prevId, inCallback, outCallback);
                    this._bindHoverEvent(lines[1], dot, outDotStyle, position, id, inCallback, outCallback);
                }
            }, this);
        }, this);
    }
});

module.exports = LineChart;