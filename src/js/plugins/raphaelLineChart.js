/**
 * @fileoverview Raphael line chart renderer
 * @author NHN Ent.
 *         FE Development Team <jiung.kang@nhnent.com>
 */

'use strict';

var Raphael = window.Raphael;

/**
 * @classdesc This class is LineChart graph renderer.
 * @class
 */
var LineChart = ne.util.defineClass({
    render: function(container, data, inCallback, outCallback) {
        var dimension = data.dimension,
            colors = data.theme.colors,
            fillOpacity = data.model.options.dot ? 1 : 0,
            paper = Raphael(container, dimension.width, dimension.height),
            groupPositions = this._makePositions(data.dimension, data.model.percentValues),
            groupLines = this._renderLines(paper, colors, groupPositions),
            groupDots = this._renderDots(paper, colors, groupPositions, fillOpacity);

        this._attachLinesEvent(groupDots, groupLines, groupPositions, fillOpacity, inCallback, outCallback);
    },

    _makePositions: function(dimension, groupValues) {
        var width = dimension.width,
            height = dimension.height,
            step = width / groupValues[0].length,
            start = step / 2,
            result = ne.util.map(groupValues, function(values) {
                return ne.util.map(values, function(value, index) {
                    return {
                        left: start + (step * index),
                        top: height - (value * height)
                    };
                });
            });
        return result;
    },

    _getLinePath: function(fx, fy, tx, ty, width) {
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

    _renderDot: function(paper, position, color, fillOpacity) {
        var dot = paper.circle(position.left, position.top, 4);

        dot.attr({
            fill: color,
            'fill-opacity': fillOpacity,
            'stroke-width': 3,
            'stroke-opacity': 0
        });

        return dot;
    },

    _renderLine: function(paper, path, color) {
        var line = paper.path([path]);
        line.attr({
            stroke: color,
            'stroke-width': 2
        });

        return line;
    },

    _attachEvent: function(target, dot, fillOpacity, position, id, inCallback, outCallback) {
        target.hover(function() {
            dot.attr({
                'fill-opacity': 1,
                'stroke-opacity': 0.3,
                r: 6
            });
            inCallback(position, id);
        }, function() {
            dot.attr({
                'fill-opacity': fillOpacity,
                'stroke-opacity': 0,
                r: 4
            });
            outCallback(id);
        });
    },

    _attachLinesEvent: function(groupDots, groupLines, groupPositions, fillOpacity, inCallback, outCallback) {
        ne.util.forEach(groupDots, function(dots, groupIndex) {
            ne.util.forEach(dots, function(dot, index, scope) {
                var position = groupPositions[groupIndex][index],
                    id = index + '-' + groupIndex,
                    prevIndex, prevPositon, lines, prevId;
                this._attachEvent(dot, dot, fillOpacity, position, id, inCallback, outCallback);
                if (index > 0) {
                    prevIndex = index - 1;
                    lines = groupLines[groupIndex][prevIndex];
                    prevPositon = groupPositions[groupIndex][prevIndex];
                    prevId = prevIndex + '-' + groupIndex;
                    this._attachEvent(lines[0], scope[prevIndex], fillOpacity, prevPositon, prevId, inCallback, outCallback);
                    this._attachEvent(lines[1], dot, fillOpacity, position, id, inCallback, outCallback);
                }
            }, this);
        }, this);
    },

    _renderLines: function(paper, colors, groupPositions) {
        var groupLines = ne.util.map(groupPositions, function(positions, groupIndex) {
            var color = colors[groupIndex],
                from = positions[0],
                rest = positions.slice(1);
            return ne.util.map(rest, function(position) {
                var center = this._getCenter(from, position),
                    firstPath = this._getLinePath(from.left, from.top, center.left, center.top),
                    secondPath = this._getLinePath(center.left, center.top, position.left, position.top),
                    firstLine = this._renderLine(paper, firstPath, color),
                    secondLine = this._renderLine(paper, secondPath, color);

                from = position;
                return [firstLine, secondLine];
            }, this);
        }, this);

        return groupLines;
    },

    _renderDots: function(paper, colors, groupPositions, fillOpacity) {
        var dots = ne.util.map(groupPositions, function(positions, groupIndex) {
            var color = colors[groupIndex];
            return ne.util.map(positions, function(position) {
                var dot = this._renderDot(paper, position, color, fillOpacity);
                return dot;
            }, this);
        }, this);

        return dots;
    }
});

module.exports = LineChart;