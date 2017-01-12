/**
 * @fileoverview  Axis component.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var dom = require('../../helpers/domHandler');
var chartConst = require('../../const');
var predicate = require('../../helpers/predicate');
var calculator = require('../../helpers/calculator');
var renderUtil = require('../../helpers/renderUtil');
var pluginFactory = require('../../factories/pluginFactory');

var raphael = window.Raphael;

var PAPER_ADDITIONAL_DIMENSION_RATIO = 1.1;

var Axis = tui.util.defineClass(/** @lends Axis.prototype */ {
    /**
     * Axis component.
     * @constructs Axis
     * @private
     * @param {object} params parameters
     *      @param {object} params.bound axis bound
     *      @param {object} params.theme axis theme
     *      @param {object} params.options axis options
     *      @param {object} params.dataProcessor data processor of chart
     *      @param {object} params.seriesType series type
     *      @param {boolean} params.isVertical boolean value for axis is vertical or not
     */
    init: function(params) {
        /**
         * Axis view className
         * @type {string}
         */
        this.className = 'tui-chart-axis-area';

        /**
         * Data processor
         * @type {DataProcessor}
         */
        this.dataProcessor = params.dataProcessor;

        /**
         * Options
         * @type {object}
         */
        this.options = params.options || {};

        /**
         * Theme
         * @type {object}
         */
        this.theme = params.theme[params.seriesType] || params.theme;

        /**
         * Whether label type axis or not.
         * @type {boolean}
         */
        this.isLabelAxis = false;

        /**
         * Whether vertical type or not.
         * @type {boolean}
         */
        this.isVertical = params.isVertical;

        /**
         * cached axis data
         * @type {object}
         */
        this.data = {};

        /**
         * layout bounds information for this components
         * @type {null|{dimension:{width:number, height:number}, position:{left:number, top:number, ?right:number}}}
         */
        this.layout = null;

        /**
         * dimension map for layout of chart
         * @type {null|object}
         */
        this.dimensionMap = null;

        /**
         * axis data map
         * @type {null|object}
         */
        this.axisDataMap = null;

        /**
         * Renderer
         * @type {object}
         */
        this.graphRenderer = pluginFactory.get(params.options.libType || chartConst.DEFAULT_PLUGIN, 'axis');

        /**
         * Paper additional width
         * @type {number}
         */
        this.paperAdditionalWidth = 0;

        /**
         * Paper additional height
         * @type {number}
         */
        this.paperAdditionalHeight = 0;
    },

    /**
     * Render child containers like title area, label area and tick area.
     * @param {number} size xAxis width or yAxis height
     * @param {number} tickCount tick count
     * @param {Array.<number|string>} categories categories
     * @param {number} additionalWidth additional width
     * @param {object} paper paper object
     * @private
     */
    _renderChildContainers: function(size, tickCount, categories, additionalWidth, paper) {
        var isVerticalLineType = this.isVertical && this.data.aligned;

        this._renderTitleArea(paper, size);
        this._renderLabelArea(size, tickCount, categories, additionalWidth, paper);

        if (!isVerticalLineType) {
            this._renderTickArea(size, tickCount, additionalWidth, paper);
        }
    },

    /**
     * Render divided xAxis if yAxis rendered in the center.
     * @param {HTMLElement} axisContainer axis container element
     * @param {{width: number, height:number}} dimension axis area width and height
     * @private
     */
    _renderDividedAxis: function(axisContainer, dimension) {
        var axisData = this.data;
        var lSideWidth = Math.round(dimension.width / 2);
        var rSideWidth = dimension.width - lSideWidth - 1;
        var tickCount = axisData.tickCount;
        var halfTickCount = parseInt(tickCount / 2, 10) + 1;
        var categories = axisData.labels;
        var lCategories = categories.slice(0, halfTickCount);
        var rCategories = categories.slice(halfTickCount - 1, tickCount);
        var tickInterval = lSideWidth / halfTickCount;
        var secondXAxisAdditionalPosition = lSideWidth + this.dimensionMap.yAxis.width + tickInterval - 1;
        var paper = raphael(axisContainer, this.dimensionMap.chart.width, dimension.height);

        this.paperAdditionalWidth = tickInterval;

        paper.canvas.style.left = -(Math.round(tickInterval * 2)) + 'px';

        this._renderChildContainers(lSideWidth, halfTickCount, lCategories, tickInterval, paper);
        this._renderChildContainers(rSideWidth, halfTickCount, rCategories,
            secondXAxisAdditionalPosition, paper);
    },

    /**
     * Render single axis if not divided.
     * @param {HTMLElement} axisContainer axis container element
     * @param {{width: number, height: number}} dimension axis area dimension
     * @private
     */
    _renderNotDividedAxis: function(axisContainer, dimension) {
        var PAPER_ADDITIONAL_DIMENSION_DIFFERENCE = (PAPER_ADDITIONAL_DIMENSION_RATIO - 1) / 2;
        var axisData = this.data;
        var isVertical = this.isVertical;
        var width = isVertical ? dimension.width : this.dimensionMap.chart.width;
        var height = isVertical ? dimension.height * PAPER_ADDITIONAL_DIMENSION_RATIO : dimension.height;
        var size = isVertical ? dimension.height : dimension.width;
        var additionalSize = 0;
        var childContainers;
        var paper = raphael(axisContainer, width, height);

        if (axisData.positionRatio) {
            additionalSize = size * axisData.positionRatio;
        }

        if (isVertical) {
            this.paperAdditionalHeight = (dimension.height * PAPER_ADDITIONAL_DIMENSION_DIFFERENCE);
            paper.canvas.style.top = -(Math.round(this.paperAdditionalHeight)) + 'px';
        } else {
            this.paperAdditionalWidth = (dimension.width * PAPER_ADDITIONAL_DIMENSION_DIFFERENCE);
            paper.canvas.style.left = -(Math.round(this.paperAdditionalWidth)) + 'px';
        }

        childContainers = this._renderChildContainers(size, axisData.tickCount, axisData.labels, additionalSize, paper);

        dom.append(axisContainer, childContainers);
    },

    /**
     * Render axis area.
     * @param {HTMLElement} axisContainer axis area element
     * @private
     */
    _renderAxisArea: function(axisContainer) {
        var dimension = this.layout.dimension;
        var axisData = this.data;

        this.isLabelAxis = axisData.isLabelAxis;

        if (this.options.divided) {
            this.containerWidth = dimension.width + this.dimensionMap.yAxis.width;
            this._renderDividedAxis(axisContainer, dimension);
            dimension.width = this.containerWidth;
        } else {
            dimension.width += this.options.isCenter ? 2 : 0;
            this._renderNotDividedAxis(axisContainer, dimension);
        }

        renderUtil.renderDimension(axisContainer, dimension);
        renderUtil.renderPosition(axisContainer, this.layout.position);
    },

    /**
     * Set data for rendering.
     * @param {{
     *      options: ?object,
     *      layout: {
     *          dimension: {width: number, height: number},
     *          position: {left: number, top: number}
     *      },
     *      dimensionMap: object,
     *      axisDataMap: object
     * }} data - bounds and scale data
     * @private
     */
    _setDataForRendering: function(data) {
        this.layout = data.layout;
        this.dimensionMap = data.dimensionMap;
        this.data = data.axisDataMap[this.componentName];
        this.options = this.data.options;
    },

    /**
     * @param {object} data - bounds and scale data
     * @returns {HTMLElement} axis area base element
     */
    render: function(data) {
        var container = dom.create('DIV', this.className);

        this._setDataForRendering(data);
        this._renderAxisArea(container);
        this.axisContainer = container;

        return container;
    },

    /**
     * Rerender axis component.
     * @param {object} data - bounds and scale data
     */
    rerender: function(data) {
        this.axisContainer.innerHTML = '';

        this._setDataForRendering(data);
        this._renderAxisArea(this.axisContainer);
    },

    /**
     * Resize axis component.
     * @param {object} data - bounds and scale data
     */
    resize: function(data) {
        this.rerender(data);
    },

    /**
     * Zoom.
     * @param {object} data - bounds and scale data
     */
    zoom: function(data) {
        this.rerender(data);
    },

    /**
     * Title area renderer
     * @param {object} paper paper object
     * @param {?number} size (width or height)
     * @private
     */
    _renderTitleArea: function(paper, size) {
        var title = this.options.title || {};
        if (title.text) {
            this.graphRenderer.renderTitle(title.text, this.theme.title, paper, {
                isVertical: this.isVertical,
                isPositionRight: this.data.isPositionRight,
                isCenter: this.options.isCenter
            }, size);
        }
    },

    /**
     * Render tick line.
     * @param {number} areaSize - width or height
     * @param {boolean} isNotDividedXAxis - whether is not divided x axis or not.
     * @param {number} additionalSize - additional size
     * @param {object} paper - raphael paper
     * @private
     */
    _renderTickLine: function(areaSize, isNotDividedXAxis, additionalSize, paper) {
        this.graphRenderer.renderTickLine({
            paper: paper,
            areaSize: areaSize,
            isNotDividedXAxis: isNotDividedXAxis,
            additionalSize: additionalSize,
            additionalWidth: this.paperAdditionalWidth,
            additionalHeight: this.paperAdditionalHeight,
            isPositionRight: this.data.isPositionRight,
            isCenter: this.data.options.isCenter,
            isVertical: this.isVertical
        });
    },

     /**
     * Render ticks.
     * @param {number} size - width or height
     * @param {number} tickCount - tick count
     * @param {boolean} isNotDividedXAxis - whether is not divided x axis or not.
     * @param {number} additionalSize - additional size
     * @param {object} paper - raphael paper
     * @private
     */
    _renderTicks: function(size, tickCount, isNotDividedXAxis, additionalSize, paper) {
        var tickColor = this.theme.tickColor;
        var axisData = this.data;
        var sizeRatio = axisData.sizeRatio || 1;
        var isVertical = this.isVertical;
        var isCenter = this.data.options.isCenter;
        var isPositionRight = this.data.isPositionRight;
        var positions = calculator.makeTickPixelPositions((size * sizeRatio), tickCount);
        var additionalHeight = this.paperAdditionalHeight + 1;
        var additionalWidth = this.paperAdditionalWidth;

        positions.length = axisData.tickCount;

        this.graphRenderer.renderTicks({
            paper: paper,
            positions: positions,
            isVertical: isVertical,
            isCenter: isCenter,
            additionalSize: additionalSize,
            additionalWidth: additionalWidth,
            additionalHeight: additionalHeight,
            isPositionRight: isPositionRight,
            tickColor: tickColor
        });
    },

    /**
     * Render tick area.
     * @param {number} size - width or height
     * @param {number} tickCount - tick count
     * @param {?number} additionalSize - additional size (width or height)
     * @param {object} paper raphael paper
     * @private
     */
    _renderTickArea: function(size, tickCount, additionalSize, paper) {
        var isNotDividedXAxis = !this.isVertical && !this.options.divided;

        this._renderTickLine(size, isNotDividedXAxis, (additionalSize || 0), paper);

        this._renderTicks(size, tickCount, isNotDividedXAxis, (additionalSize || 0), paper);
    },

    /**
     * Render label area.
     * @param {number} size label area size
     * @param {number} tickCount tick count
     * @param {Array.<string>} categories categories
     * @param {?number} additionalSize additional size (width or height)
     * @param {object} paper paper object
     * @private
     */
    _renderLabelArea: function(size, tickCount, categories, additionalSize, paper) {
        var sizeRatio = this.data.sizeRatio || 1;
        var tickPixelPositions = calculator.makeTickPixelPositions((size * sizeRatio), tickCount, 0);
        var labelDistance = tickPixelPositions[1] - tickPixelPositions[0];

        this._renderLabels(tickPixelPositions, categories, labelDistance, (additionalSize || 0), paper);
    },

    /**
     * Make html of rotation labels.
     * @param {Array.<object>} positions label position array
     * @param {string[]} categories categories
     * @param {number} labelSize label size
     * @param {number} additionalSize additional size
     * @param {object} paper paper
     * @private
     */
    _renderRotationLabels: function(positions, categories, labelSize, additionalSize, paper) {
        var renderer = this.graphRenderer;
        var isVertical = this.isVertical;
        var theme = this.theme.label;
        var degree = this.data.degree;
        var halfWidth = labelSize / 2;
        var horizontalTop = calculator.calculateRotatedHeight(degree, labelSize, this.theme.label.fontSize);

        tui.util.forEach(positions, function(position, index) {
            var labelPosition = position + (additionalSize || 0);
            var positionTopAndLeft = {};

            if (isVertical) {
                positionTopAndLeft.top = labelPosition + halfWidth;
                positionTopAndLeft.left = labelSize;
            } else {
                positionTopAndLeft.top = horizontalTop;
                positionTopAndLeft.left = labelPosition + labelSize;
            }

            renderer.renderRotatedLabel({
                positionTopAndLeft: positionTopAndLeft,
                labelText: categories[index],
                paper: paper,
                theme: theme,
                degree: degree
            });
        });
    },

    /**
     * Make html of normal labels.
     * @param {Array.<object>} positions label position array
     * @param {string[]} categories categories
     * @param {number} labelSize label size
     * @param {number} additionalSize additional size
     * @param {object} paper paper object
     * @private
     */
    _renderNormalLabels: function(positions, categories, labelSize, additionalSize, paper) {
        var renderer = this.graphRenderer;
        var isVertical = this.isVertical;
        var isPositionRight = this.data.isPositionRight;
        var isCategoryLabel = this.isLabelAxis;
        var theme = this.theme.label;
        var paperAdditionalWidth = this.paperAdditionalWidth;
        var dataProcessor = this.dataProcessor;
        var isLineTypeChart = predicate.isLineTypeChart(dataProcessor.chartType, dataProcessor.seriesTypes);
        var isPointOnColumn = isLineTypeChart && this.options.pointOnColumn;

        tui.util.forEach(positions, function(position, index) {
            var labelPosition = position + additionalSize;
            var fontSize = theme.fontSize;
            var halfLabelDistance = labelSize / 2;
            var positionTopAndLeft = {};
            var labelTopPosition, labelLeftPosition;

            if (isVertical) {
                labelTopPosition = fontSize + 4 + labelPosition;

                if (isCategoryLabel) {
                    labelTopPosition += halfLabelDistance;
                } else {
                    labelTopPosition = paper.height - labelTopPosition;
                }

                if (isPositionRight) {
                    labelLeftPosition = chartConst.AXIS_LABEL_PADDING;
                } else {
                    labelLeftPosition = paper.width - chartConst.AXIS_LABEL_PADDING;
                }
            } else {
                labelTopPosition = fontSize * PAPER_ADDITIONAL_DIMENSION_RATIO;
                labelLeftPosition = labelPosition + paperAdditionalWidth;

                if (isCategoryLabel) {
                    if (!isLineTypeChart || isPointOnColumn) {
                        labelLeftPosition += halfLabelDistance;
                    }
                }
            }

            positionTopAndLeft.top = Math.round(labelTopPosition);
            positionTopAndLeft.left = Math.round(labelLeftPosition);

            renderer.renderLabel({
                positionTopAndLeft: positionTopAndLeft,
                labelText: categories[index],
                labelSize: labelSize,
                paper: paper,
                isVertical: isVertical,
                isPositionRight: isPositionRight,
                theme: theme
            });
        });
    },

    /**
     * Make labels html.
     * @param {Array.<object>} positions - positions for labels
     * @param {Array.<string>} categories - categories
     * @param {number} labelSize label size
     * @param {number} additionalSize additional size
     * @param {object} paper paper object
     * @private
     */
    _renderLabels: function(positions, categories, labelSize, additionalSize, paper) {
        var isRotationlessXAxis = !this.isVertical && this.isLabelAxis && (this.options.rotateLabel === false);
        var hasRotatedXAxisLabel = this.componentName === 'xAxis' && this.data.degree;
        var axisLabels;

        if (isRotationlessXAxis) {
            axisLabels = this.data.multilineLabels;
        } else {
            axisLabels = categories;
        }

        if (axisLabels.length) {
            positions.length = axisLabels.length;
        }

        if (hasRotatedXAxisLabel) {
            this._renderRotationLabels(positions, axisLabels, labelSize, additionalSize, paper);
        } else {
            this._renderNormalLabels(positions, axisLabels, labelSize, additionalSize, paper);
        }
    }
});

module.exports = Axis;
