/**
 * @fileoverview RaphaelRadialPlot is graph renderer for radial plot.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var raphaelRenderUtil = require('./raphaelRenderUtil');
var arrayUtil = require('../helpers/arrayUtil');
var snippet = require('tui-code-snippet');

var STEP_TOP_ADJUSTMENT = 8;
var STEP_LEFT_ADJUSTMENT = 3;

/**
 * @classdesc RaphaelRadialPlot is graph renderer for radial plot.
 * @class RaphaelRadialPlot
 * @private
 */
var RaphaelRadialPlot = snippet.defineClass(/** @lends RaphaelRadialPlot.prototype */ {
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
        var plotSet = params.paper.set();

        this.paper = params.paper;
        this.layout = params.layout;
        this.plotPositions = params.plotPositions;
        this.theme = params.theme;
        this.options = params.options;
        this.labelData = params.labelData;

        this._renderPlot(plotSet);
        this._renderLabels(plotSet);

        plotSet.toBack();
        this.paper.pushDownBackgroundToBottom();

        return plotSet;
    },

    /**
     * Render plot component
     * @param {Array.<object>} plotSet plot set
     * @private
     */
    _renderPlot: function(plotSet) {
        if (this.options.type === 'circle') {
            this._renderCirclePlot(plotSet);
        } else {
            this._renderSpiderwebPlot(plotSet);
        }

        this._renderCatergoryLines(plotSet);
    },

    /**
     * Render spider web plot
     * @param {Array.<object>} plotSet plot set
     * @private
     */
    _renderSpiderwebPlot: function(plotSet) {
        var groupPaths = this._getLinesPath(this.plotPositions);

        this._renderLines(groupPaths, this.theme.lineColor, plotSet);
    },

    /**
     * Render circle plot
     * @param {Array.<object>} plotSet plot set
     * @private
     */
    _renderCirclePlot: function(plotSet) {
        var i, pos, radius;
        var plotPositions = this.plotPositions;
        var centerPoint = plotPositions[0][0];
        var strokeColor = this.theme.lineColor;

        for (i = 1; i < plotPositions.length; i += 1) {
            pos = plotPositions[i][0];
            radius = centerPoint.top - pos.top;

            plotSet.push(raphaelRenderUtil.renderCircle(this.paper, centerPoint, radius, {
                stroke: strokeColor
            }));
        }
    },

    /**
     * Render category lines
     * @param {Array.<object>} plotSet plot set
     * @private
     */
    _renderCatergoryLines: function(plotSet) {
        var groupPaths = this._getLinesPath(arrayUtil.pivot(this.plotPositions));

        this._renderLines(groupPaths, this.theme.lineColor, plotSet);
    },

    /**
     * Render labels
     * @param {Array.<object>} plotSet plot set
     * @private
     */
    _renderLabels: function(plotSet) {
        var paper = this.paper;
        var theme = this.theme;
        var labelData = this.labelData;
        var attributes = {
            fill: theme.lineColor,
            'font-size': theme.label.fontSize,
            'font-family': theme.label.fontFamily,
            'text-anchor': 'end',
            'font-weight': '100',
            'dominant-baseline': 'middle'
        };

        snippet.forEachArray(labelData.category, function(item) {
            var categoryAttributes = snippet.extend({}, attributes, {
                'text-anchor': item.position.anchor
            });
            var label = raphaelRenderUtil.renderText(paper, item.position, item.text, categoryAttributes);

            label.node.style.userSelect = 'none';
            label.node.style.cursor = 'default';

            plotSet.push(label);
        });

        snippet.forEachArray(labelData.step, function(item) {
            var stepLabel = raphaelRenderUtil.renderText(paper, item.position, item.text, attributes);

            item.position.top -= STEP_TOP_ADJUSTMENT;
            item.position.left -= STEP_LEFT_ADJUSTMENT;

            stepLabel.node.style.userSelect = 'none';
            stepLabel.node.style.cursor = 'default';

            plotSet.push(stepLabel);
        });
    },

    /**
     * Render lines.
     * @param {Array.<Array.<string>>} groupPaths paths
     * @param {string} lineColor line color
     * @param {Array.<object>} plotSet plot set
     * @returns {Array.<Array.<object>>} lines
     * @private
     */
    _renderLines: function(groupPaths, lineColor, plotSet) {
        var paper = this.paper;

        return snippet.map(groupPaths, function(path) {
            var line = raphaelRenderUtil.renderLine(paper, path.join(' '), lineColor, 1);

            plotSet.push(line);

            return line;
        });
    },

    /**
     * Get lines path.
     * /todo remove duplication, copied from raphaelLineTypeBase
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
     * Make lines path.
     * /todo remove duplication, copied from raphaelLineTypeBase
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

        snippet.map(positions, function(position) {
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
