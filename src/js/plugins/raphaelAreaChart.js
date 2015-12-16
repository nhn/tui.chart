/**
 * @fileoverview Raphael area chart renderer.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var RaphaelLineBase = require('./raphaelLineTypeBase'),
    raphaelRenderUtil = require('./raphaelRenderUtil');

var Raphael = window.Raphael,
    ANIMATION_TIME = 700,
    EMPHASIS_OPACITY = 1,
    DE_EMPHASIS_OPACITY = 0.3,
    ZERO_OPACITY = 0;

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
    },

    /**
     * Render function of area chart.
     * @param {HTMLElement} container container
     * @param {{groupPositions: array.<array>, dimension: object, theme: object, options: object}} data render data
     * @return {object} paper raphael paper
     */
    render: function(container, data) {
        var dimension = data.dimension,
            groupPositions = data.groupPositions,
            theme = data.theme,
            colors = theme.colors,
            opacity = data.options.hasDot ? 1 : 0,
            groupPaths = this._getAreasPath(groupPositions),
            borderStyle = this.makeBorderStyle(theme.borderColor, opacity),
            outDotStyle = this.makeOutDotStyle(opacity, borderStyle),
            paper, groupAreas, tooltipLine, selectionDot, groupDots;

        this.paper = paper = Raphael(container, dimension.width, dimension.height);

        groupAreas = this._renderAreas(paper, groupPaths, colors);
        tooltipLine = this._renderTooltipLine(paper, dimension.height);
        selectionDot = this._makeSelectionDot(paper);
        groupDots = this._renderDots(paper, groupPositions, colors, borderStyle);

        if (data.options.hasSelection) {
            this.selectionDot = selectionDot;
            this.selectionColor = theme.selectionColor;
        }

        this.outDotStyle = outDotStyle;
        this.groupPositions = groupPositions;
        this.groupPaths = groupPaths;
        this.groupAreas = groupAreas;
        this.tooltipLine = tooltipLine;
        this.groupDots = groupDots;
        this.dotOpacity = opacity;

        return paper;
    },

    /**
     * Render area graph.
     * @param {object} paper paper
     * @param {{start: string, addStart: string}} path path
     * @param {string} color color
     * @returns {array.<object>} raphael object
     * @private
     */
    _renderArea: function(paper, path, color) {
        var result = [],
            area = paper.path([path.start]),
            fillStyle = {
                fill: color,
                opacity: 0.5,
                stroke: color,
                'stroke-opacity': 0
            },
            addArea;

        area.attr(fillStyle);
        result.push(area);

        if (path.addStart) {
            addArea = paper.path([path.addStart]);
            addArea.attr(fillStyle);
            result.push(addArea);
        }
        return result;
    },

    /**
     * Render area graphs.
     * @param {object} paper paper
     * @param {array.<object>} groupPaths group paths
     * @param {array.<string>} colors colors
     * @returns {array} raphael objects
     * @private
     */
    _renderAreas: function(paper, groupPaths, colors) {
        var groupAreas = tui.util.map(groupPaths, function(paths, groupIndex) {
            var color = colors[groupIndex] || 'transparent';
            return tui.util.map(paths, function(path) {
                var result = {
                    area: this._renderArea(paper, path.area, color),
                    line: raphaelRenderUtil.renderLine(paper, path.line.start, '#ffffff')
                };
                return result;
            }, this);
        }, this);

        return groupAreas;
    },

    /**
     * Whether minus or not.
     * @param {number} value value
     * @returns {boolean} result boolean
     * @private
     */
    _isMinus: function(value) {
        return value < 0;
    },

    /**
     * Whether plus or not.
     * @param {number} value value
     * @returns {boolean} result boolean
     * @private
     */
    _isPlus: function(value) {
        return value >= 0;
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
     * Find middle left
     * @param {{left: number, top: number}} fromPos from position
     * @param {{left: number, top: number}} toPos to position
     * @returns {number} middle left
     * @private
     */
    _findMiddleLeft: function(fromPos, toPos) {
        var tops = [fromPos.startTop - fromPos.top, toPos.startTop - toPos.top],
            middleLeft, width, fromHeight, toHeight;

        if (tui.util.all(tops, this._isMinus) || tui.util.all(tops, this._isPlus)) {
            return -1;
        }

        fromHeight = this._makeHeight(fromPos.top, fromPos.startTop);
        toHeight = this._makeHeight(toPos.top, toPos.startTop);
        width = toPos.left - fromPos.left;

        middleLeft = fromPos.left + (width * (fromHeight / (fromHeight + toHeight)));
        return middleLeft;
    },

    /**
     * Make area path.
     * @param {{left: number, top: number}} fromPos from position
     * @param {{left: number, top: number}} toPos to position
     * @returns {string} area path
     * @private
     */
    _makeAreaPath: function(fromPos, toPos) {
        var fromStartPoint = ['M', fromPos.left, ' ', fromPos.startTop],
            fromEndPoint = fromPos.startTop === fromPos.top ? [] : ['L', fromPos.left, ' ', fromPos.top],
            toStartPoint = ['L', toPos.left, ' ', toPos.top],
            toEndPoint = toPos.startTop === toPos.top ? [] : ['L', toPos.left, ' ', toPos.startTop];
        return concat.call([], fromStartPoint, fromEndPoint, toStartPoint, toEndPoint).join('');
    },

    /**
     * Make area paths.
     * @param {{left: number, top: number}} fromPos from position
     * @param {{left: number, top: number}} toPos to position
     * @returns {{
     *      start: string,
     *      end: string,
     *      addStart: string,
     *      addEnd: string
     * }} area paths
     * @private
     */
    _makeAreaPaths: function(fromPos, toPos) {
        var middleLeft = this._findMiddleLeft(fromPos, toPos),
            result = {
                start: this._makeAreaPath(fromPos, fromPos)
            },
            middlePos;

        if (this._isPlus(middleLeft)) {
            middlePos = {left: middleLeft, top: fromPos.startTop, startTop: fromPos.startTop};
            result.end = this._makeAreaPath(fromPos, middlePos);
            result.addStart = this._makeAreaPath(middlePos, middlePos);
            result.addEnd = this._makeAreaPath(middlePos, toPos);
        } else {
            result.end = this._makeAreaPath(fromPos, toPos);
        }

        return result;
    },

    /**
     * Get area path.
     * @param {array.<array.<object>>} groupPositions positions
     * @returns {array.<array.<string>>} paths
     * @private
     */
    _getAreasPath: function(groupPositions) {
        var groupPaths = tui.util.map(groupPositions, function(positions) {
            var fromPos = positions[0],
                rest = positions.slice(1);
            return tui.util.map(rest, function(position) {
                var result = {
                    area: this._makeAreaPaths(fromPos, position),
                    line: this.makeLinePath(fromPos, position)
                };
                fromPos = position;
                return result;
            }, this);
        }, this);
        return groupPaths;
    },

    /**
     * Animate area chart.
     * @param {object} area raphael object
     * @param {string} areaPath path
     * @param {number} time play time
     * @param {number} startTime start time
     * @private
     */
    _animateArea: function(area, areaPath, time, startTime) {
        var areaAddEndPath = areaPath.addEnd,
            areaEndPath = areaPath.end;
        if (areaAddEndPath) {
            time = time / 2;
            setTimeout(function() {
                area[1].animate({path: areaAddEndPath, 'stroke-opacity': 0.25}, time);
            }, startTime + time);
        }
        setTimeout(function() {
            area[0].animate({path: areaEndPath, 'stroke-opacity': 0.25}, time);
        }, startTime);
    },

    /**
     * Animate.
     * @param {function} callback callback
     */
    animate: function(callback) {
        var time = ANIMATION_TIME / this.groupAreas[0].length,
            that = this,
            startTime = 0;

        raphaelRenderUtil.renderItems(this.groupDots, function(item, groupIndex, index) {
            var area, areaPath;
            if (index) {
                area = that.groupAreas[groupIndex][index - 1];
                areaPath = that.groupPaths[groupIndex][index - 1];
                that.animateLine(area.line, areaPath.line.end, time, startTime);
                that._animateArea(area.area, areaPath.area, time, startTime);
                startTime += time;
            } else {
                startTime = 0;
            }

            if (that.dotOpacity) {
                setTimeout(function() {
                    item.dot.attr({'fill-opacity': that.dotOpacity});
                }, startTime);
            }
        });

        if (callback) {
            setTimeout(callback, startTime);
        }
    },

    /**
     * Update area path
     * @param {object} area raphael object
     * @param {string} areaPath area path
     * @private
     */
    _updateAreaPath: function(area, areaPath) {
        var areaAddEndPath = areaPath.addEnd;
        area[0].attr({path: areaPath.end});
        if (areaAddEndPath) {
            area[1].attr({path: areaAddEndPath});
        }
    },

    /**
     * Resize graph of area chart.
     * @param {object} params parameters
     *      @param {{width: number, height:number}} params.dimension dimension
     *      @param {array.<array.<{left:number, top:number}>>} params.groupPositions group positions
     */
    resize: function(params) {
        var dimension = params.dimension,
            groupPositions = params.groupPositions,
            that = this;

        this.groupPositions = groupPositions;
        this.groupPaths = this._getAreasPath(groupPositions);
        this.paper.setSize(dimension.width, dimension.height);
        this.tooltipLine.attr({top: dimension.height});

        raphaelRenderUtil.renderItems(this.groupDots, function(item, groupIndex, index) {
            var position = groupPositions[groupIndex][index],
                dotAttrs = {
                    cx: position.left,
                    cy: position.top
                },
                area, areaPath;

            if (index) {
                area = that.groupAreas[groupIndex][index - 1];
                areaPath = that.groupPaths[groupIndex][index - 1];
                area.line.attr({path: areaPath.line.end});
                that._updateAreaPath(area.area, areaPath.area);
            }

            if (that.dotOpacity) {
                dotAttrs = tui.util.extend({'fill-opacity': that.dotOpacity}, dotAttrs, that.borderStyle);
            }

            item.dot.attr(dotAttrs);
        });
    },

    /**
     * Select legend.
     * @param {?number} legendIndex legend index
     */
    selectLegend: function(legendIndex) {
        var that = this,
            isWithoutSelection = tui.util.isNull(legendIndex);

        this.selectedLegendIndex = legendIndex;
        raphaelRenderUtil.renderItems(this.groupDots, function(item, groupIndex, index) {
            var area, opacity;

            if (isWithoutSelection || legendIndex === groupIndex) {
                opacity = EMPHASIS_OPACITY;
            } else {
                opacity = DE_EMPHASIS_OPACITY;
            }

            if (index) {
                area = that.groupAreas[groupIndex][index - 1];
                area.area[0].attr({'fill-opacity': opacity});
            }

            if (that.dotOpacity) {
                item.dot.attr({'fill-opacity': opacity});
            }
        });
    }
});

module.exports = RaphaelAreaChart;
