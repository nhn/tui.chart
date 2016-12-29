/**
 * @fileoverview RaphaelRadialPlot is graph renderer for radial plot.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var raphaelRenderUtil = require('./raphaelRenderUtil');
var arrayUtil = require('../helpers/arrayUtil');

var raphael = window.Raphael;
var STEP_TOP_ADJUSTMENT = 8;
var STEP_LEFT_ADJUSTMENT = 3;

/**
 * @classdesc RaphaelRadialPlot is graph renderer for radial plot.
 * @class RaphaelRadialPlot
 * @private
 */
var RaphaelRadialPlot = tui.util.defineClass(/** @lends RaphaelRadialPlot.prototype */ {
    /**
     * Render function of map chart legend.
     * @param {object} params parameters
     * @param {HTMLElement} params.container container
     * @param {{width: number, height: number}} params.dimension - dimension of circle legend area
     * @param {Array<Array>} params.plotPositions plot positions
     * @param {object} params.labelData label data
     * @returns {object} paper raphael paper
     */
    render: function(params) {
        var paper = raphael(params.container, params.dimension.width, params.dimension.height);

        this.paper = paper;
        this.dimension = params.dimension;
        this.plotPositions = params.plotPositions;
        this.theme = params.theme;
        this.options = params.options;
        this.labelData = params.labelData;

        this._renderPlot();
        this._renderLabels();

        return paper;
    },

    /**
     * Render plot component
     * @private
     */
    _renderPlot: function() {
        if (this.options.type === 'circle') {
            this._renderCirclePlot();
        } else {
            this._renderSpiderwebPlot();
        }

        this._renderCatergoryLines();
    },

    /**
     * Render spider web plot
     * @private
     */
    _renderSpiderwebPlot: function() {
        this._renderLines(this._getLinesPath(this.plotPositions), this.theme.lineColor);
    },

    /**
     * Render circle plot
     * @private
     */
    _renderCirclePlot: function() {
        var i, pos, radius;
        var plotPositions = this.plotPositions;
        var centerPoint = plotPositions[0][0];
        var strokeColor = this.theme.lineColor;

        for (i = 1; i < plotPositions.length; i += 1) {
            pos = plotPositions[i][0];
            radius = centerPoint.top - pos.top;

            raphaelRenderUtil.renderCircle(this.paper, centerPoint, radius, {
                stroke: strokeColor
            });
        }
    },

    /**
     * Render category lines
     * @private
     */
    _renderCatergoryLines: function() {
        this._renderLines(this._getLinesPath(arrayUtil.pivot(this.plotPositions)), this.theme.lineColor);
    },

    /**
     * Render labels
     * @private
     */
    _renderLabels: function() {
        var paper = this.paper;
        var theme = this.theme;
        var labelData = this.labelData;

        tui.util.forEachArray(labelData.category, function(item) {
            var attrs = {
                fill: theme.label.color,
                'font-size': theme.label.fontSize,
                'font-family': theme.label.fontFamily,
                'text-anchor': item.position.anchor,
                'font-weight': '100',
                'dominant-baseline': 'middle'
            };

            raphaelRenderUtil.renderText(paper, item.position, item.text, attrs);
        });

        tui.util.forEachArray(labelData.step, function(item) {
            var attrs = {
                fill: theme.lineColor,
                'font-size': theme.label.fontSize,
                'font-family': theme.label.fontFamily,
                'text-anchor': 'end',
                'font-weight': '100',
                'dominant-baseline': 'middle'
            };

            item.position.top -= STEP_TOP_ADJUSTMENT;
            item.position.left -= STEP_LEFT_ADJUSTMENT;

            raphaelRenderUtil.renderText(paper, item.position, item.text, attrs);
        });
    },

    /**
     * Render lines.
     * @param {Array.<Array.<string>>} groupPaths paths
     * @returns {Array.<Array.<object>>} lines
     * @private
     */
    _renderLines: function(groupPaths, lineColor) {
        var paper = this.paper;

        return tui.util.map(groupPaths, function(path) {
            return raphaelRenderUtil.renderLine(paper, path.join(' '), lineColor, 1);
        });
    },

    /**
     * Get lines path.
     * raphaelLineTypeBase에서 가져옴, 구조 개선 작업시 수정필요
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
     * Make lines path.
     * raphaelLineTypeBase에서 가져옴, 구조 개선 작업시 수정필요
     * @param {Array.<{left: number, top: number, startTop: number}>} positions positions
     * @param {?string} [posTopType='top'] position top type
     * @param {boolean} [connectNulls] - boolean value connect nulls or not
     * @returns {Array.<string | number>} paths
     * @private
     */
    _makeLinesPath: function(positions, posTopType, connectNulls) {
        var path = [];
        var prevMissing = false;

        posTopType = posTopType || 'top';

        tui.util.map(positions, function(position) {
            var pathCommand = (prevMissing && !connectNulls) ? 'M' : 'L';

            if (position) {
                path.push([pathCommand, position.left, position[posTopType]]);
                if (prevMissing) {
                    prevMissing = false;
                }
            } else {
                prevMissing = true;
            }
        });

        path = Array.prototype.concat.apply([], path);
        path[0] = 'M';

        return path;
    }
});

module.exports = RaphaelRadialPlot;
