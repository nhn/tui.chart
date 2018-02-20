/**
 * @fileoverview RaphaelMapLegend is graph renderer for map chart legend.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var raphaelRenderUtil = require('./raphaelRenderUtil');
var chartConst = require('../const');
var snippet = require('tui-code-snippet');
var renderUtil = require('../helpers/renderUtil');

var DEGREE_HORIZONTAL_BAR = 360;
var DEGREE_VERTICAL_BAR = 270;
var WEDGE_BASE_HALF = 2.5; // half of wedge triagle base
/**
 * @classdesc RaphaelMapLegend is graph renderer for map chart legend.
 * @class RaphaelMapLegend
 * @private
 */
var RaphaelMapLegend = snippet.defineClass(/** @lends RaphaelMapLegend.prototype */ {
    /**
     * Render function of map chart legend.
     * @param {object} param - param to render spectrum legend
     *  @param {object} param.paper raphael paper
     *  @param {object} param.layout legend layout
     *  @param {ColorSpectrum} param.colorSpectrum map chart color model
     *  @param {boolean} param.isHorizontal whether horizontal legend or not
     *  @param {Array.<object>} param.legendSet legend set
     */
    render: function(param) {
        var gradientBar;

        var layout = param.layout;
        var isHorizontal = param.isHorizontal;
        var legendSet = param.legendSet;
        var labels = param.labels;

        this.layout = layout;
        this.isHorizontal = isHorizontal;
        this.theme = param.theme;
        this.paper = param.paper;
        this.legendSet = param.legendSet;
        this.colorSpectrum = param.colorSpectrum;

        if (isHorizontal) {
            layout.position.top += chartConst.MAP_LEGEND_AREA_PADDING
                + this._calculateHorizontalLegendTooltipHeight(labels, this.theme)
                + chartConst.MAP_LEGEND_PADDING_BTW_GRAPH_AND_WEDGE;
        } else {
            layout.position.left += chartConst.MAP_LEGEND_AREA_PADDING
                + this._calculateVerticalLegendTooltipWidth(labels, this.theme)
                + chartConst.MAP_LEGEND_PADDING_BTW_GRAPH_AND_WEDGE;
        }

        gradientBar = this._renderGradientBar(this.paper, layout, this.colorSpectrum, isHorizontal);

        legendSet.push(gradientBar);

        this.wedge = this._renderWedge(this.paper, layout.position);
        this.wedgeText = this._renderWedgeText(this.paper, layout.position, this.theme);
        legendSet.push(this.wedge);

        this.gradientBar = gradientBar;
    },

    /**
     * Render tick label
     * @param {object} paper Raphael paper
     * @param {object} baseData base data for render ticks
     * @param {Array.<string>} labels labels
     * @param {boolean} isHorizontal boolean value for is horizontal or not
     * @param {Array.<object>} legendSet legend set
     */
    renderTickLabels: function(paper, baseData, labels, isHorizontal, legendSet) {
        var theme = this.theme;
        var attribute = {
            'font-size': theme.fontSize,
            'font-family': theme.fontFamily,
            'font-weight': theme.fontWeight,
            fill: theme.color
        };

        snippet.forEach(labels, function(label, labelIndex) {
            var offsetValue = baseData.step * labelIndex;
            var pos = snippet.extend({}, baseData.position);

            if (isHorizontal) {
                pos.left += offsetValue;
                attribute['dominant-baseline'] = 'hanging';
            } else {
                pos.top += offsetValue;
                attribute['text-anchor'] = 'start';
            }

            legendSet.push(raphaelRenderUtil.renderText(paper, pos, label, attribute));
        });
    },

    /**
     * Render gradient bar.
     * @param {object} paper raphael object
     * @param {object} layout legend layout
     * @param {ColorSpectrum} colorSpectrum map chart color model
     * @param {boolean} isHorizontal whether horizontal legend or not
     * @returns {object}
     * @private
     */
    _renderGradientBar: function(paper, layout, colorSpectrum, isHorizontal) {
        var width, height, degree, bound;

        if (isHorizontal) {
            width = layout.dimension.width;
            height = chartConst.MAP_LEGEND_GRAPH_SIZE;
            degree = DEGREE_HORIZONTAL_BAR;
            this._makeWedghPath = this._makeHorizontalWedgePath;
        } else {
            width = chartConst.MAP_LEGEND_GRAPH_SIZE;
            height = layout.dimension.height;
            degree = DEGREE_VERTICAL_BAR;
            this._makeWedghPath = this._makeVerticalWedgePath;
        }

        bound = {
            left: layout.position.left,
            top: layout.position.top,
            width: width,
            height: height
        };

        return raphaelRenderUtil.renderRect(paper, bound, {
            fill: degree + '-' + colorSpectrum.start + '-' + colorSpectrum.end,
            stroke: 'none'
        });
    },

    /**
     * Render wedge text
     * @param {object} paper - raphael paper
     * @param {object} position - position
     * @param {object} theme - legend label theme
     * @returns {SVGTextElement} - wedge text
     */
    _renderWedgeText: function(paper, position, theme) {
        return raphaelRenderUtil.renderText(paper, position, '', {
            'font-size': theme.fontSize,
            'font-family': theme.fontFamily,
            'font-weight': theme.fontWeight,
            fill: '#ffffff'
        });
    },

    /**
     * Render wedge.
     * @param {object} paper raphael object
     * @param {{top: number, left: number}} position base position of legend
     * @returns {object} raphael object
     * @private
     */
    _renderWedge: function(paper, position) {
        return paper.path(this.verticalBasePath).attr({
            fill: 'gray',
            stroke: 'none',
            opacity: 0,
            transform: 't' + position.left + ',' + position.top
        });
    },

    /**
     * Vertical base path
     * @type {Array}
     */
    verticalBasePath: ['M', -4, 0, 'L', -8, 2.5, 'L', -8, 12.5, 'L', -28, 12.5, 'L', -28, -12.5, 'L', -8, -12.5, 'L', -8, -2.5],

    /**
     * Make vertical wedge path.
     * @param {number} top top
     * @param {object} labelDimension label width and height
     * @returns {Array} path
     * @private
     */
    _makeVerticalWedgePath: function(top, labelDimension) {
        var path = this.verticalBasePath;
        var PADDING_H = chartConst.MAP_LEGEND_TOOLTIP_HORIZONTAL_PADDING;
        var PADDING_V = chartConst.MAP_LEGEND_TOOLTIP_VERTICAL_PADDING;
        var labelWidth = labelDimension.width;
        var labelHeight = labelDimension.height;

        path[2] = top;
        path[5] = top + WEDGE_BASE_HALF;
        path[8] = path[11] = top + (labelHeight / 2) + PADDING_V;
        path[10] = path[13] = path[4] - labelWidth - (PADDING_H * 2);
        path[14] = path[17] = top - (labelHeight / 2) - PADDING_V;
        path[20] = top - WEDGE_BASE_HALF;

        return path;
    },

    /**
     * Horizontal base path
     * @type {Array}
     */
    horizontalBasePath: ['M', 0, -4, 'L', 2.5, -8, 'L', 12.5, -8, 'L', 12.5, -28, 'L', -12.5, -28, 'L', -12.5, -8, 'L', -2.5, -8],

    /**
     * Make horizontal wedge path.
     * @param {number} left left
     * @param {object} labelDimension label width and height
     * @returns {Array} path
     * @private
     */
    _makeHorizontalWedgePath: function(left, labelDimension) {
        var path = this.horizontalBasePath;
        var PADDING_H = chartConst.MAP_LEGEND_TOOLTIP_HORIZONTAL_PADDING;
        var PADDING_V = chartConst.MAP_LEGEND_TOOLTIP_VERTICAL_PADDING;
        var labelWidth = labelDimension.width;
        var labelHeight = labelDimension.height;

        path[1] = left;
        path[4] = left + WEDGE_BASE_HALF;
        path[7] = path[10] = left + (labelWidth / 2) + PADDING_H;
        path[11] = path[14] = path[5] - labelHeight - (PADDING_V * 2);
        path[13] = path[16] = left - (labelWidth / 2) - PADDING_H;
        path[19] = left - WEDGE_BASE_HALF;

        return path;
    },

    /**
     * Show wedge.
     * @param {number} ratio value ratio beyond spectrum legend
     * @param {string} label data value
     */
    showWedge: function(ratio, label) {
        var labelTheme = this.theme;
        var labelSize = raphaelRenderUtil.getRenderedTextSize(label, labelTheme.fontSize, labelTheme.fontFamily);
        var legendSize = this.isHorizontal ? this.layout.dimension.width : this.layout.dimension.height;
        var path = this._makeWedghPath(legendSize * ratio, labelSize);

        this.wedge.attr({
            path: path,
            opacity: 1,
            fill: this.colorSpectrum.getColor(ratio)
        });

        this.wedgeText.attr({
            x: this.wedge.getBBox().x + chartConst.MAP_LEGEND_TOOLTIP_HORIZONTAL_PADDING + (labelSize.width / 2),
            y: this.wedge.getBBox().y + chartConst.MAP_LEGEND_TOOLTIP_VERTICAL_PADDING + (labelSize.height / 2),
            text: label,
            opacity: 1
        });
    },

    /**
     * Hide wedge
     */
    hideWedge: function() {
        this.wedge.attr({
            opacity: 0
        });

        this.wedgeText.attr({
            opacity: 0
        });
    },

    /**
     * Remove location URL from fill attribute
     * @private
     */
    removeLocationURLFromFillAttribute: function() {
        var gradientBar = this.gradientBar;
        var fillURL = gradientBar.node.getAttribute('fill');
        this.locationURL = /url\('?([^#]+)#[^#]+'?\)/.exec(fillURL)[1];

        gradientBar.node.setAttribute('fill', fillURL.replace(this.locationURL, ''));
    },

    /**
     * Restore location URL to fill attribute
     * @private
     */
    restoreLocationURLToFillAttribute: function() {
        var gradientBar = this.gradientBar;
        var fillURL = gradientBar.node.getAttribute('fill');

        gradientBar.node.setAttribute('fill', fillURL.replace('#', this.locationURL + '#'));
    },

    /**
     * Calculate tooltip area height of horizontal legend
     * @param {Array.<string>} labels - labels
     * @param {object} theme - legend label theme
     * @returns {number} - tooltip height
     * @private
     */
    _calculateHorizontalLegendTooltipHeight: function(labels, theme) {
        var label = labels.length ? labels[labels.length - 1] : '';
        var labelHeight = renderUtil.getRenderedLabelHeight(label, theme);

        return (chartConst.MAP_LEGEND_TOOLTIP_VERTICAL_PADDING * 2)
            + labelHeight + chartConst.MAP_LEGEND_WEDGE_SIZE;
    },

    /**
     * Calculate tooltip area width of vertical legend
     * @param {Array.<string>} labels - labels
     * @param {object} theme - legend label theme
     * @returns {number} - tooltip width
     * @private
     */
    _calculateVerticalLegendTooltipWidth: function(labels, theme) {
        var label = labels.length ? labels[labels.length - 1] : '';
        var labelWidth = renderUtil.getRenderedLabelWidth(label, theme);

        return (chartConst.MAP_LEGEND_TOOLTIP_HORIZONTAL_PADDING * 2)
            + labelWidth + chartConst.MAP_LEGEND_WEDGE_SIZE;
    }
});

module.exports = RaphaelMapLegend;
