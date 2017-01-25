/**
 * @fileoverview RaphaelPieCharts is graph renderer for map chart.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var raphaelRenderUtil = require('./raphaelRenderUtil');

var STROKE_COLOR = 'gray';
var ANIMATION_DURATION = 100;

/**
 * @classdesc RaphaelMapCharts is graph renderer for map chart.
 * @class RaphaelMapChart
 * @private
 */
var RaphaelMapChart = tui.util.defineClass(/** @lends RaphaelMapChart.prototype */ {
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
        this.paper = paper;
        this.sectorSet = paper.set();
        this.sectors = this._renderMap(data, this.ratio);
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
        //var self = this;
        var sectorSet = this.sectorSet;
        var position = data.layout.position;
        var paper = this.paper;
        var colorSpectrum = data.colorSpectrum;
        //this.gElement = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        //this.paper.canvas.appendChild(this.gElement);
        //window.gElement = this.gElement;
        //window.paper = this.paper;

        return tui.util.map(data.mapModel.getMapData(), function(datum, index) {
            var ratio = datum.ratio || 0;
            var color = colorSpectrum.getColor(ratio);
            var sector = raphaelRenderUtil.renderArea(paper, datum.path, {
                fill: color,
                opacity: 1,
                stroke: STROKE_COLOR,
                'stroke-opacity': 1,
                transform: 's' + dimensionRatio + ',' + dimensionRatio + ',0,0'
                    + 't' + position.left + ',' + position.top
            });
            //self.gElement.appendChild(sector[0])
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
            data = !tui.util.isUndefined(foundIndex) && this.sectors[foundIndex];

        return data && !tui.util.isUndefined(data.ratio) ? foundIndex : null;
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

    scaleMapPaths: function(changedRatio, position, layout, base) {
        var bbox = this.sectorSet.getBBox();
        var zoomOut = changedRatio < 1 ? 1 : -1;

        tui.util.forEachArray(this.sectorSet, function(sector) {
            var transformList = sector.node.transform.baseVal;
            var zoom = sector.paper.canvas.createSVGTransform();
            var matrix = sector.paper.canvas.createSVGMatrix();
            var raphaelMatrix = sector.paper.raphael.matrix();

            raphaelMatrix.scale(changedRatio, changedRatio, position.left, position.top);

            tui.util.extend(matrix, raphaelMatrix);

            zoom.setMatrix(matrix);
            transformList.appendItem(zoom);
        }); // 빠른데 IE8안됨

        //tui.util.forEachArray(this.sectorSet, function(sector) {
        //    var node = sector.node;
        //    var scale = sector.paper.canvas.createSVGTransform();
        //    var translate = sector.paper.canvas.createSVGTransform();
        //
        //    scale.setScale(changedRatio, changedRatio, position.left, position.top);
        //    node.transform.baseVal.appendItem(scale);
        //
        //    translate.setTranslate((bbox.width - (bbox.width * changedRatio)) / 2,
        //        (bbox.height - (bbox.height * changedRatio)) / 2);
        //    node.transform.baseVal.appendItem(translate);
        //    node.transform.baseVal.initialize(node.transform.baseVal.consolidate());
        //}); // 빠른데 IE8안됨

        //this.sectorSet.scale(changedRatio, changedRatio, position.left, position.top); //버벅댐

        //this.sectorSet.attr({
        //    transform: 's' + changedRatio + ',' + changedRatio + ',0,0'
        //        + 't' + (bbox.x * changedRatio * direction) + ',' + (bbox.y * changedRatio * direction)
        //});
    },

    moveMapPaths: function(distances, zoomMagn, dimension, mapDimension) {
        var bbox = this.sectorSet.getBBox();

        tui.util.forEachArray(this.sectorSet, function(sector) {
            var node = sector.node;
            var translate;

            translate = sector.paper.canvas.createSVGTransform();

            translate.setTranslate(distances.x, distances.y);
            node.transform.baseVal.appendItem(translate);
            node.transform.baseVal.initialize(node.transform.baseVal.consolidate());
        });
    }
});

module.exports = RaphaelMapChart;
