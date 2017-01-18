/**
 * @fileoverview Radial plot component.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var dom = require('../../helpers/domHandler');
var geom = require('../../helpers/geometric');
var chartConst = require('../../const');
var renderUtil = require('../../helpers/renderUtil');
var pluginFactory = require('../../factories/pluginFactory');

var RadialPlot = tui.util.defineClass(/** @lends Plot.prototype */ {
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
        this.options = tui.util.extend({
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
        this.graphRenderer = pluginFactory.get('raphael', 'radialPlot');
    },

    /**
     * Render plot area
     * @param {HTMLElement} container html container
     * @param {object} dimension dimension
     * @param {Array.<Array>} plotPositions plot positions
     * @param {object} labelData label data
     * @returns {Paper} raphael paper
     */
    _renderPlotArea: function(container, dimension, plotPositions, labelData) {
        var renderParams = {
            container: container,
            dimension: dimension,
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
     * @param {object} dimension dimension
     * @returns {Array.<Array>} plot positions
     */
    _makePositions: function(axisDataMap, dimension) {
        var width = dimension.width - chartConst.RADIAL_PLOT_PADDING - chartConst.RADIAL_MARGIN_FOR_CATEGORY;
        var height = dimension.height - chartConst.RADIAL_PLOT_PADDING - chartConst.RADIAL_MARGIN_FOR_CATEGORY;
        var centerX = (width / 2) + (chartConst.RADIAL_PLOT_PADDING / 2) + (chartConst.RADIAL_MARGIN_FOR_CATEGORY / 2);
        var centerY = (height / 2) - (chartConst.RADIAL_PLOT_PADDING / 2) - (chartConst.RADIAL_MARGIN_FOR_CATEGORY / 2);
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
     * @param {object} dimension dimension
     * @returns {Array.<object>} category positions
     */
    _makeCategoryPositions: function(axisDataMap, dimension) {
        var width = dimension.width - chartConst.RADIAL_PLOT_PADDING - chartConst.RADIAL_CATEGORY_PADDING;
        var height = dimension.height - chartConst.RADIAL_PLOT_PADDING - chartConst.RADIAL_CATEGORY_PADDING;
        var centerX = (width / 2) + (chartConst.RADIAL_PLOT_PADDING / 2) + (chartConst.RADIAL_CATEGORY_PADDING / 2);
        var centerY = (height / 2) - (chartConst.RADIAL_PLOT_PADDING / 2) - (chartConst.RADIAL_CATEGORY_PADDING / 2);
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

        // 마지막 스탭 라벨은 카테고리랑 겹칠수 있어 만들지 않음
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
     * @returns {{
     *     container: HTMLElement,
     *     paper: object
     * }} plot element
     */
    render: function(data) {
        var paper;
        var plotPositions = this._makePositions(data.axisDataMap, data.layout.dimension);
        var labelData = this._makeLabelData(data.axisDataMap, data.layout.dimension, plotPositions);

        this.plotContainer = dom.create('DIV', this.className);
        this._renderContainerPosition(this.plotContainer, data.positionMap.plot);

        paper = this._renderPlotArea(this.plotContainer, data.layout.dimension, plotPositions, labelData);

        return {
            container: this.plotContainer,
            paper: paper
        };
    },

    /**
     * Re render plot component
     * @param {object} data - bounds and scale data
     */
    rerender: function(data) {
        var plotPositions = this._makePositions(data.axisDataMap, data.layout.dimension);
        var labelData = this._makeLabelData(data.axisDataMap, data.layout.dimension, plotPositions);

        this.plotContainer.innerHTML = '';

        this._renderPlotArea(this.plotContainer, data.layout.dimension, plotPositions, labelData);
    },

    /**
     * Set element's top, left given top, left position
     * series에서 가져옴, 추후 공통 페이퍼 적용전까지 임시 사용
     * @param {HTMLElement} el - series element
     * @param {{top: number, left: number}} position - series top, left position
     * @private
     */
    _renderContainerPosition: function(el, position) {
        var hiddenWidth = renderUtil.isOldBrowser() ? 1 : 0;

        renderUtil.renderPosition(el, {
            top: position.top - (hiddenWidth),
            left: position.left - (hiddenWidth * 2)
        });
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

    stepPixel = radius / (stepCount - 1); // 0 스텝에는 크기가 없는 점이니 스텝한개는 제거

    for (i = 0; i < stepCount; i += 1) {
        stepPoints = [];
        // 회전할 첫번째 픽셀의 Y축 값
        pointY = centerY + (stepPixel * i);

        for (j = 0; j < angleStepCount; j += 1) {
            point = geom.rotatePointAroundOrigin(centerX, centerY, centerX, pointY, angleStep * j);

            stepPoints.push({
                left: point.x,
                top: height - point.y // y좌표를 top좌표로 전환
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
            top: height - point.y, // y좌표를 top좌표로 전환
            anchor: anchor
        });
    }

    return points;
}

function RadialPlotFactory(param) {
    return new RadialPlot(param);
}

RadialPlotFactory.componentType = 'plot';

module.exports = RadialPlotFactory;
