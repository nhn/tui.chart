/**
 * @fileoverview Radial plot component.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var geom = require('../../helpers/geometric');
var chartConst = require('../../const');
var pluginFactory = require('../../factories/pluginFactory');
var snippet = require('tui-code-snippet');

var RadialPlot = snippet.defineClass(/** @lends Plot.prototype */ {
    /**
     * plot component className
     * @type {string}
     */
    className: 'tui-chart-plot-area',

    /**
     * Plot component.
     * @constructs Plot
     * @param {object} params parameters
     *      @param {number} params.vTickCount vertical tick count
     *      @param {number} params.hTickCount horizontal tick count
     *      @param {object} params.theme axis theme
     */
    init: function(params) {
        /**
         * Options
         * @type {object}
         */
        this.options = snippet.extend({
            type: 'spiderweb'
        }, params.options);

        /**
         * Theme
         * @type {object}
         */
        this.theme = params.theme || {};

        /**
         * Graph renderer
         * @type {object}
         */
        this.graphRenderer = pluginFactory.get(chartConst.COMPONENT_TYPE_RAPHAEL, 'radialPlot');

        this.drawingType = chartConst.COMPONENT_TYPE_RAPHAEL;
    },

    /**
     * Render plot area
     * @param {object} paper paper object
     * @param {object} layout layout
     * @param {Array.<Array>} plotPositions plot positions
     * @param {object} labelData label data
     * @returns {Array.<object>} plotSet
     */
    _renderPlotArea: function(paper, layout, plotPositions, labelData) {
        var renderParams = {
            paper: paper,
            layout: layout,
            plotPositions: plotPositions,
            labelData: labelData,
            theme: this.theme,
            options: this.options
        };

        return this.graphRenderer.render(renderParams);
    },

    /**
     * Make plot positions for render
     * @param {object} axisDataMap axisDataMap
     * @param {object} layout layout
     * @returns {Array.<Array>} plot positions
     */
    _makePositions: function(axisDataMap, layout) {
        var width = layout.dimension.width - chartConst.RADIAL_PLOT_PADDING - chartConst.RADIAL_MARGIN_FOR_CATEGORY;
        var height = layout.dimension.height - chartConst.RADIAL_PLOT_PADDING - chartConst.RADIAL_MARGIN_FOR_CATEGORY;
        var centerX = (width / 2) + (chartConst.RADIAL_PLOT_PADDING / 2) + (chartConst.RADIAL_MARGIN_FOR_CATEGORY / 2)
            + layout.position.left;
        var centerY = (height / 2) - (chartConst.RADIAL_PLOT_PADDING / 2) - (chartConst.RADIAL_MARGIN_FOR_CATEGORY / 2)
            - layout.position.top;
        var stepCount = axisDataMap.yAxis.tickCount;
        var angleStepCount = axisDataMap.xAxis.labels.length;

        return makeSpiderWebPositions({
            width: width,
            height: height,
            centerX: centerX,
            centerY: centerY,
            angleStepCount: angleStepCount,
            stepCount: stepCount
        });
    },

    /**
     * Make category positions
     * @param {object} axisDataMap axisDataMap
     * @param {object} layout layout
     * @returns {Array.<object>} category positions
     */
    _makeCategoryPositions: function(axisDataMap, layout) {
        var width = layout.dimension.width - chartConst.RADIAL_PLOT_PADDING - chartConst.RADIAL_CATEGORY_PADDING;
        var height = layout.dimension.height - chartConst.RADIAL_PLOT_PADDING - chartConst.RADIAL_CATEGORY_PADDING;
        var centerX = (width / 2) + (chartConst.RADIAL_PLOT_PADDING / 2) + (chartConst.RADIAL_CATEGORY_PADDING / 2)
            + layout.position.left;
        var centerY = (height / 2) - (chartConst.RADIAL_PLOT_PADDING / 2) - (chartConst.RADIAL_CATEGORY_PADDING / 2)
            - layout.position.top;
        var angleStepCount = axisDataMap.xAxis.labels.length;

        return makeRadialCategoryPositions({
            width: width,
            height: height,
            centerX: centerX,
            centerY: centerY,
            angleStepCount: angleStepCount
        });
    },

    /**
     * Make label data
     * @param {object} axisDataMap axisDataMap
     * @param {object} dimension dimension
     * @param {Array.<Array>} plotPositions plot positions
     * @returns {object}
     */
    _makeLabelData: function(axisDataMap, dimension, plotPositions) {
        var categories = axisDataMap.xAxis.labels;
        var stepLabels = axisDataMap.yAxis.labels;
        var categoryPositions = this._makeCategoryPositions(axisDataMap, dimension);
        var categoryLabelData = [];
        var stepLabelData = [];
        var i, j;

        for (i = 0; i < categories.length; i += 1) {
            categoryLabelData.push({
                text: categories[i],
                position: categoryPositions[i]
            });
        }

        // skip last step label. it could overlapped by category label
        for (j = 0; j < (stepLabels.length - 1); j += 1) {
            stepLabelData.push({
                text: stepLabels[j],
                position: plotPositions[j][0]
            });
        }

        return {
            category: categoryLabelData,
            step: stepLabelData
        };
    },

    /**
     * Render plot component.
     * @param {object} data - bounds and scale data
     */
    render: function(data) {
        var plotPositions = this._makePositions(data.axisDataMap, data.layout);
        var labelData = this._makeLabelData(data.axisDataMap, data.layout, plotPositions);

        this.plotSet = this._renderPlotArea(data.paper, data.layout, plotPositions, labelData);
    },

    /**
     * Re render plot component
     * @param {object} data - bounds and scale data
     */
    rerender: function(data) {
        this.plotSet.remove();

        this.render(data);
    },

    /**
     * Resize plot component.
     * @param {object} data - bounds and scale data
     */
    resize: function(data) {
        this.rerender(data);
    }
});

/**
 * Make Spider web positions
 * @param {object} params parameters
 *     @param {number} params.width width
 *     @param {number} params.height height
 *     @param {number} params.centerX center x coordinate
 *     @param {number} params.centerY cneter y coordinate
 *     @param {number} params.angleStepCount angle step count
 *     @param {number} params.stepCount step count
 * @returns {Array<Array>} positions
 * @private
 */
function makeSpiderWebPositions(params) {
    var width = params.width;
    var height = params.height;
    var centerX = params.centerX;
    var centerY = params.centerY;
    var angleStepCount = params.angleStepCount;
    var stepCount = params.stepCount;
    var radius = Math.min(width, height) / 2;
    var angleStep = 360 / angleStepCount;
    var points = [];
    var stepPoints, pointY, point, stepPixel, i, j;

    stepPixel = radius / (stepCount - 1); // As there is not size in step 0, one step is removed

    for (i = 0; i < stepCount; i += 1) {
        stepPoints = [];
        // point Y of first pixel to rotate
        pointY = centerY + (stepPixel * i);

        for (j = 0; j < angleStepCount; j += 1) {
            point = geom.rotatePointAroundOrigin(centerX, centerY, centerX, pointY, angleStep * j);

            stepPoints.push({
                left: point.x,
                top: height - point.y // convert y to top
            });
        }

        stepPoints.push(stepPoints[0]);

        points[i] = stepPoints;
    }

    return points;
}

/**
 * Make radial category positions
 * @param {object} params parameters
 *     @param {number} params.width width
 *     @param {number} params.height height
 *     @param {number} params.centerX center x coordinate
 *     @param {number} params.centerY cneter y coordinate
 *     @param {number} params.angleStepCount angle step count
 * @returns {Array<object>} category positions
 * @private
 */
function makeRadialCategoryPositions(params) {
    var width = params.width;
    var height = params.height;
    var centerX = params.centerX;
    var centerY = params.centerY;
    var angleStepCount = params.angleStepCount;
    var radius = Math.min(height, width) / 2;
    var angleStep = 360 / angleStepCount;
    var points = [];
    var anchor, point, i, pointY, reversedAngle;

    pointY = centerY + radius;

    for (i = 0; i < angleStepCount; i += 1) {
        reversedAngle = 360 - (angleStep * i);
        point = geom.rotatePointAroundOrigin(centerX, centerY, centerX, pointY, reversedAngle);

        if (reversedAngle > 0 && reversedAngle < 180) {
            anchor = 'end';
        } else if (reversedAngle > 180 && reversedAngle < 360) {
            anchor = 'start';
        } else {
            anchor = 'middle';
        }

        points.push({
            left: point.x,
            top: height - point.y, // convert y to top
            anchor: anchor
        });
    }

    return points;
}

function RadialPlotFactory(param) {
    return new RadialPlot(param);
}

RadialPlotFactory.componentType = 'plot';
RadialPlotFactory.RadialPlot = RadialPlot;

module.exports = RadialPlotFactory;
