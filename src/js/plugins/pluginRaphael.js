/**
 * @fileoverview Raphael render plugin.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var raphael = require('raphael');

var BarChart = require('./raphaelBarChart');
var Boxplot = require('./raphaelBoxplotChart');
var Bullet = require('./raphaelBulletChart');
var LineChart = require('./raphaelLineChart');
var AreaChart = require('./raphaelAreaChart');
var PieChart = require('./raphaelPieChart');
var RadialLineSeries = require('./raphaelRadialLineSeries');
var CoordinateTypeChart = require('./raphaelCoordinateTypeChart');
var BoxTypeChart = require('./raphaelBoxTypeChart');
var MapChart = require('./raphaelMapChart');

var legend = require('./raphaelLegendComponent');
var MapLegend = require('./raphaelMapLegend');
var CircleLegend = require('./raphaelCircleLegend');
var title = require('./raphaelTitleComponent');
var axis = require('./raphaelAxisComponent');

var RadialPlot = require('./raphaelRadialPlot');

var pluginRaphael = {
    bar: BarChart,
    boxplot: Boxplot,
    bullet: Bullet,
    column: BarChart,
    line: LineChart,
    area: AreaChart,
    pie: PieChart,
    bubble: CoordinateTypeChart,
    scatter: CoordinateTypeChart,
    heatmap: BoxTypeChart,
    treemap: BoxTypeChart,
    map: MapChart,
    radial: RadialLineSeries,
    legend: legend,
    mapLegend: MapLegend,
    circleLegend: CircleLegend,
    radialPlot: RadialPlot,
    title: title,
    axis: axis
};
var callback = function(container, dimension) {
    var paper = raphael(container, dimension.width, dimension.height);
    var rect = paper.rect(0, 0, dimension.width, dimension.height);

    if (paper.raphael.svg) {
        appendGlowFilterToDefs(paper);
    }

    paper.pushDownBackgroundToBottom = function() {
        rect.toBack();
    };

    paper.changeChartBackgroundColor = function(color) {
        rect.attr({
            fill: color
        });
    };

    paper.changeChartBackgroundOpacity = function(opacity) {
        rect.attr({
            'fill-opacity': opacity
        });
    };

    paper.resizeBackground = function(width, height) {
        rect.attr({
            width: width,
            height: height
        });
    };

    rect.attr({
        fill: '#fff',
        'stroke-width': 0
    });

    return paper;
};

/**
 * Append glow filter for series label
 * @param {object} paper Raphael paper object
 * @ignore
 */
function appendGlowFilterToDefs(paper) {
    var filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
    var feGaussianBlur = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
    var feFlood = document.createElementNS('http://www.w3.org/2000/svg', 'feFlood');
    var feComposite = document.createElementNS('http://www.w3.org/2000/svg', 'feComposite');
    var feMorphology = document.createElementNS('http://www.w3.org/2000/svg', 'feMorphology');
    var feMerge = document.createElementNS('http://www.w3.org/2000/svg', 'feMerge');
    var feMergeNodeColoredBlur = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
    var feMergeNodeSourceGraphic = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');

    filter.id = 'glow';

    feFlood.setAttribute('result', 'flood');
    feFlood.setAttribute('flood-color', '#ffffff');
    feFlood.setAttribute('flood-opacity', '0.5');

    feComposite.setAttribute('in', 'flood');
    feComposite.setAttribute('result', 'mask');
    feComposite.setAttribute('in2', 'SourceGraphic');
    feComposite.setAttribute('operator', 'in');

    feMorphology.setAttribute('in', 'mask');
    feMorphology.setAttribute('result', 'dilated');
    feMorphology.setAttribute('operator', 'dilate');
    feMorphology.setAttribute('radius', '2');

    feGaussianBlur.setAttribute('in', 'dilated');
    feGaussianBlur.setAttribute('result', 'blurred');
    feGaussianBlur.setAttribute('stdDeviation', '1');

    feMergeNodeColoredBlur.setAttribute('in', 'blurred');
    feMergeNodeSourceGraphic.setAttribute('in', 'SourceGraphic');

    filter.appendChild(feFlood);
    filter.appendChild(feComposite);
    filter.appendChild(feMorphology);
    filter.appendChild(feGaussianBlur);

    filter.appendChild(feMerge);

    feMerge.appendChild(feMergeNodeColoredBlur);
    feMerge.appendChild(feMergeNodeSourceGraphic);

    paper.defs.appendChild(filter);
}

module.exports = {
    name: 'Raphael',
    plugins: pluginRaphael,
    callback: callback
};

