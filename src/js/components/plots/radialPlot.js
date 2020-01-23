/**
 * @fileoverview Radial plot component.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */

import geom from '../../helpers/geometric';
import calculator from '../../helpers/calculator';
import chartConst from '../../const';
import pluginFactory from '../../factories/pluginFactory';
import snippet from 'tui-code-snippet';
const {
  COMPONENT_TYPE_RAPHAEL,
  RADIAL_PLOT_PADDING,
  RADIAL_MARGIN_FOR_CATEGORY,
  RADIAL_CATEGORY_PADDING
} = chartConst;

class RadialPlot {
  /**
   * Plot component.
   * @constructs Plot
   * @param {object} params parameters
   *      @param {number} params.vTickCount vertical tick count
   *      @param {number} params.hTickCount horizontal tick count
   *      @param {object} params.theme axis theme
   * @ignore
   */
  constructor(params) {
    /**
     * plot component className
     * @type {string}
     */
    this.className = 'tui-chart-plot-area';

    /**
     * Options
     * @type {object}
     */
    this.options = snippet.extend(
      {
        type: 'spiderweb'
      },
      params.options
    );

    /**
     * Theme
     * @type {object}
     */
    this.theme = params.theme || {};

    /**
     * Graph renderer
     * @type {object}
     */
    this.graphRenderer = pluginFactory.get(COMPONENT_TYPE_RAPHAEL, 'radialPlot');

    this.drawingType = COMPONENT_TYPE_RAPHAEL;
  }

  /**
   * Render plot area
   * @param {object} paper paper object
   * @param {object} layout layout
   * @param {Array.<Array>} plotPositions plot positions
   * @param {object} labelData label data
   * @returns {Array.<object>} plotSet
   */
  _renderPlotArea(paper, layout, plotPositions, labelData) {
    const renderParams = {
      paper,
      layout,
      plotPositions,
      labelData,
      theme: this.theme,
      options: this.options
    };

    return this.graphRenderer.render(renderParams);
  }

  /**
   * Make plot positions for render
   * @param {object} axisDataMap axisDataMap
   * @param {object} layout layout
   * @returns {Array.<Array>} plot positions
   */
  _makePositions(axisDataMap, layout) {
    const {
      dimension,
      position: { left, top }
    } = layout;
    let { width, height } = dimension;

    width = width - RADIAL_PLOT_PADDING - RADIAL_MARGIN_FOR_CATEGORY;
    height = height - RADIAL_PLOT_PADDING - RADIAL_MARGIN_FOR_CATEGORY;

    const centerX = calculator.sum([
      width / 2,
      RADIAL_PLOT_PADDING / 2,
      RADIAL_MARGIN_FOR_CATEGORY / 2,
      left
    ]);

    const centerY = height / 2 - RADIAL_PLOT_PADDING / 2 - RADIAL_MARGIN_FOR_CATEGORY / 2 - top;
    const stepCount = axisDataMap.yAxis.tickCount;
    const angleStepCount = axisDataMap.xAxis.labels.length;

    return makeSpiderWebPositions({
      width,
      height,
      centerX,
      centerY,
      angleStepCount,
      stepCount
    });
  }

  /**
   * Make category positions
   * @param {object} axisDataMap axisDataMap
   * @param {object} layout layout
   * @returns {Array.<object>} category positions
   */
  _makeCategoryPositions(axisDataMap, layout) {
    const {
      dimension,
      position: { left, top }
    } = layout;
    let { width, height } = dimension;

    width = width - RADIAL_PLOT_PADDING - RADIAL_CATEGORY_PADDING;
    height = height - RADIAL_PLOT_PADDING - RADIAL_CATEGORY_PADDING;

    const centerX = calculator.sum([
      width / 2,
      RADIAL_PLOT_PADDING / 2,
      RADIAL_CATEGORY_PADDING / 2,
      left
    ]);
    const centerY = height / 2 - RADIAL_PLOT_PADDING / 2 - RADIAL_CATEGORY_PADDING / 2 - top;
    const angleStepCount = axisDataMap.xAxis.labels.length;

    return makeRadialCategoryPositions({
      width,
      height,
      centerX,
      centerY,
      angleStepCount
    });
  }

  /**
   * Make label data
   * @param {object} axisDataMap axisDataMap
   * @param {object} dimension dimension
   * @param {Array.<Array>} plotPositions plot positions
   * @returns {object}
   */
  _makeLabelData(axisDataMap, dimension, plotPositions) {
    const categories = axisDataMap.xAxis.labels;
    const stepLabels = axisDataMap.yAxis.labels;

    const categoryPositions = this._makeCategoryPositions(axisDataMap, dimension);
    const categoryLabelData = [];
    const stepLabelData = [];

    for (let i = 0; i < categories.length; i += 1) {
      categoryLabelData.push({
        text: categories[i],
        position: categoryPositions[i]
      });
    }

    // skip last step label. it could overlapped by category label
    for (let j = 0; j < stepLabels.length - 1; j += 1) {
      stepLabelData.push({
        text: stepLabels[j],
        position: plotPositions[j][0]
      });
    }

    return {
      category: categoryLabelData,
      step: stepLabelData
    };
  }

  /**
   * Render plot component.
   * @param {object} data - bounds and scale data
   */
  render({ axisDataMap, layout, paper }) {
    const plotPositions = this._makePositions(axisDataMap, layout);
    const labelData = this._makeLabelData(axisDataMap, layout, plotPositions);

    this.plotSet = this._renderPlotArea(paper, layout, plotPositions, labelData);
  }

  /**
   * Re render plot component
   * @param {object} data - bounds and scale data
   */
  rerender(data) {
    this.plotSet.remove();

    this.render(data);
  }

  /**
   * Resize plot component.
   * @param {object} data - bounds and scale data
   */
  resize(data) {
    this.rerender(data);
  }
}

/**
 * Make Spider web positions
 * @param {object} params parameters
 *     @param {number} params.width width
 *     @param {number} params.height height
 *     @param {number} params.centerX center x coordinate
 *     @param {number} params.centerY center y coordinate
 *     @param {number} params.angleStepCount angle step count
 *     @param {number} params.stepCount step count
 * @returns {Array<Array>} positions
 * @private
 */
function makeSpiderWebPositions(params) {
  const { width, height, centerX, centerY, angleStepCount, stepCount } = params;
  const radius = Math.min(width, height) / 2;
  const angleStep = 360 / angleStepCount;
  const points = [];
  const stepPixel = radius / (stepCount - 1); // As there is not size in step 0, one step is removed

  for (let i = 0; i < stepCount; i += 1) {
    const stepPoints = [];
    // point Y of first pixel to rotate
    const pointY = centerY + stepPixel * i;

    for (let j = 0; j < angleStepCount; j += 1) {
      const point = geom.rotatePointAroundOrigin(centerX, centerY, centerX, pointY, angleStep * j);

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
 *     @param {number} params.centerY center y coordinate
 *     @param {number} params.angleStepCount angle step count
 * @returns {Array<object>} category positions
 * @private
 */
function makeRadialCategoryPositions(params) {
  const { width, height, centerX, centerY, angleStepCount } = params;
  const radius = Math.min(height, width) / 2;
  const angleStep = 360 / angleStepCount;
  const points = [];
  const pointY = centerY + radius;

  for (let i = 0; i < angleStepCount; i += 1) {
    const reversedAngle = 360 - angleStep * i;
    const point = geom.rotatePointAroundOrigin(centerX, centerY, centerX, pointY, reversedAngle);
    let anchor;

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
      anchor
    });
  }

  return points;
}

/**
 * RadialPlotFactory
 * @param {object} param chart options
 * @returns {object} radial plot instance
 * @ignore
 */
export default function RadialPlotFactory(param) {
  return new RadialPlot(param);
}

RadialPlotFactory.componentType = 'plot';
RadialPlotFactory.RadialPlot = RadialPlot;
