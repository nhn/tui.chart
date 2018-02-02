/**
 * @fileoverview RaphaelPieCharts is graph renderer for map chart.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var raphaelRenderUtil = require('./raphaelRenderUtil');
var dom = require('../helpers/domHandler');
var snippet = require('tui-code-snippet');
var browser = snippet.browser;

var IS_LTE_IE8 = browser.msie && browser.version <= 8;
var STROKE_COLOR = 'gray';
var ANIMATION_DURATION = 100;
var G_ID = 'tui-chart-series-group';

/**
 * @classdesc RaphaelMapCharts is graph renderer for map chart.
 * @class RaphaelMapChart
 * @private
 */
var RaphaelMapChart = snippet.defineClass(/** @lends RaphaelMapChart.prototype */ {
    /**
     * Render function of map chart.
     * @param {object} paper paper object
     * @param {object} data data
     *      @param {{width: number, height: number}} data.dimension series dimension
     *      @param {Array.<{code: string, path: string}>} data.map mapData
     *      @param {ColorSpectrum} data.colorSpectrum color model
     */
    render: function(paper, data) {
        var mapDimension = data.mapModel.getMapDimension();

        this.ratio = this._getDimensionRatio(data.layout.dimension, mapDimension);
        this.dimension = data.layout.dimension;
        this.position = data.layout.position;
        this.paper = paper;
        this.sectorSet = paper.set();
        this.sectors = this._renderMap(data, this.ratio);

        if (!IS_LTE_IE8) {
            this.g = createGElement(paper, this.sectorSet, G_ID);
        }

        this.overColor = data.theme.overColor;
    },

    /**
     * Get dimension ratio
     * @param {object} dimension dimension
     * @param {object} mapDimension map dimension
     * @returns {number}
     * @private
     */
    _getDimensionRatio: function(dimension, mapDimension) {
        return Math.min(dimension.height / mapDimension.height, dimension.width / mapDimension.width);
    },

    /**
     * Render map graph.
     * @param {object} data data
     *      @param {{width: number, height: number}} data.dimension series dimension
     *      @param {Array.<{code: string, path: string}>} data.map mapData
     *      @param {ColorSpectrum} data.colorSpectrum color model
     * @param {number} dimensionRatio dimension ratio of rendering by map
     * @returns {Array.<{sector: object, color: string, data: object}>} rendered map information
     * @private
     */
    _renderMap: function(data, dimensionRatio) {
        var sectorSet = this.sectorSet;
        var position = data.layout.position;
        var paper = this.paper;
        var colorSpectrum = data.colorSpectrum;

        return snippet.map(data.mapModel.getMapData(), function(datum, index) {
            var ratio = datum.ratio || 0;
            var color = colorSpectrum.getColor(ratio);
            var sector = raphaelRenderUtil.renderArea(paper, datum.path, {
                fill: color,
                opacity: 1,
                stroke: STROKE_COLOR,
                'stroke-opacity': 1,
                transform: 's' + dimensionRatio + ',' + dimensionRatio + ',0,0'
                    + 't' + (position.left / dimensionRatio) + ',' + (position.top / dimensionRatio)
            });

            sector.data('index', index);

            sectorSet.push(sector);

            return {
                sector: sector,
                color: color,
                ratio: datum.ratio
            };
        });
    },

    /**
     * Find sector index.
     * @param {{left: number, top: number}} position position
     * @returns {?number} found index
     */
    findSectorIndex: function(position) {
        var sector = this.paper.getElementByPoint(position.left, position.top),
            foundIndex = sector && sector.data('index'),
            data = !snippet.isUndefined(foundIndex) && this.sectors[foundIndex];

        return data && !snippet.isUndefined(data.ratio) ? foundIndex : null;
    },

    /**
     * Change color.
     * @param {number} index index
     */
    changeColor: function(index) {
        var sector = this.sectors[index];

        sector.sector.animate({
            fill: this.overColor
        }, ANIMATION_DURATION, '>');
    },

    /**
     * Restore color.
     * @param {number} index index
     */
    restoreColor: function(index) {
        var sector = this.sectors[index];

        sector.sector.animate({
            fill: sector.color
        }, ANIMATION_DURATION, '>');
    },

    /**
     * Scale map sector paths
     * @param {number} changedRatio changed ratio of map
     * @param {object} position position
     * @param {number} mapRatio mapdimension ratio by dimansion
     * @param {object} limitPosition limit position
     * @param {object} mapDimension map dimension
     */
    scaleMapPaths: function(changedRatio, position, mapRatio, limitPosition, mapDimension) {
        var transformList = this.g.transform.baseVal;
        var zoom = this.paper.canvas.createSVGTransform();
        var matrix = this.paper.canvas.createSVGMatrix();
        var raphaelMatrix = this.paper.raphael.matrix();
        var transformMatrix = transformList.numberOfItems ? transformList.getItem(0).matrix : {
            a: 1,
            b: 0,
            c: 0,
            d: 1,
            e: 0,
            f: 0
        };
        var maxRight = mapDimension.width - this.dimension.width;
        var maxTop = mapDimension.height - this.dimension.height;
        var previousTranslateX = (transformMatrix.e / transformMatrix.a);
        var previousTranslateY = (transformMatrix.f / transformMatrix.d);
        var currentLimitRight = -maxRight / transformMatrix.a;
        var currentLimitTop = -maxTop / transformMatrix.d;
        var transformX, transformY;

        raphaelMatrix.scale(changedRatio, changedRatio,
            (position.left * mapRatio) - (previousTranslateX * changedRatio),
            (position.top * mapRatio) - (previousTranslateY * changedRatio));
        transformX = (raphaelMatrix.e / raphaelMatrix.a) + previousTranslateX;
        transformY = (raphaelMatrix.f / raphaelMatrix.d) + previousTranslateY;

        if (transformX >= 0) {
            raphaelMatrix.e = -previousTranslateX * raphaelMatrix.a;
        } else if (transformX < currentLimitRight) {
            raphaelMatrix.e = currentLimitRight - previousTranslateX;
        }

        if (transformY >= 0) {
            raphaelMatrix.f = -previousTranslateY * raphaelMatrix.a;
        } else if (transformY < currentLimitTop) {
            raphaelMatrix.f = currentLimitTop - previousTranslateY;
        }

        matrix.a = raphaelMatrix.a;
        matrix.b = raphaelMatrix.b;
        matrix.c = raphaelMatrix.c;
        matrix.d = raphaelMatrix.d;
        matrix.e = raphaelMatrix.e;
        matrix.f = raphaelMatrix.f;

        zoom.setMatrix(matrix);
        transformList.appendItem(zoom);
        transformList.initialize(transformList.consolidate());
    },

    /**
     * Scale map sector paths
     * @param {object} distances drag distance for moving
     * @param {object} mapDimension map dimension
     */
    moveMapPaths: function(distances, mapDimension) {
        var matrix = this.paper.canvas.createSVGMatrix();
        var raphaelMatrix = this.paper.raphael.matrix();
        var transformList = this.g.transform.baseVal;
        var translate = this.paper.canvas.createSVGTransform();
        var maxRight = mapDimension.width - this.dimension.width;
        var maxTop = mapDimension.height - this.dimension.height;
        var transformMatrix = transformList.numberOfItems ? transformList.getItem(0).matrix : {
            a: 1,
            b: 0,
            c: 0,
            d: 1,
            e: 0,
            f: 0
        };
        var translateX, translateY, currentTranslateX, currentTranslateY;

        raphaelMatrix.translate(distances.x, distances.y);

        currentTranslateX = (raphaelMatrix.e / raphaelMatrix.a);
        currentTranslateY = (raphaelMatrix.f / raphaelMatrix.d);
        translateX = currentTranslateX + (transformMatrix.e / transformMatrix.a);
        translateY = currentTranslateY + (transformMatrix.f / transformMatrix.d);

        if (translateX >= 0 && currentTranslateX > 0) {
            raphaelMatrix.e = 0;
        } else if (translateX < 0 && translateX < -maxRight / transformMatrix.a && currentTranslateX < 0) {
            raphaelMatrix.e = 0;
        }
        if (translateY >= 0 && currentTranslateY > 0) {
            raphaelMatrix.f = 0;
        } else if (translateY < 0 && translateY < -maxTop / transformMatrix.d && currentTranslateY < 0) {
            raphaelMatrix.f = 0;
        }

        matrix.a = raphaelMatrix.a;
        matrix.b = raphaelMatrix.b;
        matrix.c = raphaelMatrix.c;
        matrix.d = raphaelMatrix.d;
        matrix.e = raphaelMatrix.e;
        matrix.f = raphaelMatrix.f;

        translate.setMatrix(matrix);
        transformList.appendItem(translate);
        transformList.initialize(transformList.consolidate());
    },
    /**
     * Render series labels
     * @param {object} paper Raphael paper
     * @param {Array.<object>} labelData label data
     * @param {object} labelTheme label theme
     * @returns {Array.<object>}
     */
    renderSeriesLabels: function(paper, labelData, labelTheme) {
        var attributes = {
            'font-size': labelTheme.fontSize,
            'font-family': labelTheme.fontFamily,
            'font-weight': labelTheme.fontWeight,
            fill: labelTheme.color,
            'text-anchor': 'middle',
            opacity: 0,
            transform: 's' + this.ratio + ',' + this.ratio + ',0,0'
            + 't' + (this.position.left / this.ratio) + ',' + (this.position.top / this.ratio)
        };
        var set = paper.set();
        var self = this;

        snippet.forEach(labelData, function(labelDatum) {
            var position = labelDatum.labelPosition;
            var label = raphaelRenderUtil.renderText(paper, position, labelDatum.name || labelDatum.code, attributes);

            set.push(label);

            label.node.style.userSelect = 'none';
            label.node.style.cursor = 'default';
            label.node.setAttribute('filter', 'url(#glow)');

            if (!IS_LTE_IE8) {
                self.g.appendChild(label.node);
            }
        });

        return set;
    }
});

/**
 * Create and append sector set
 * @param {object} paper Raphael paper
 * @param {Array.<object>} sectorSet sectorSet
 * @param {string} id ID string
 * @returns {object}
 * @ignore
 */
function createGElement(paper, sectorSet, id) {
    var g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.id = id;

    sectorSet.forEach(function(sector) {
        dom.append(g, sector.node);
    });

    paper.canvas.appendChild(g);

    return g;
}

module.exports = RaphaelMapChart;
