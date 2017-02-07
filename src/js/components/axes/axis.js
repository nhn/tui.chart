/**
 * @fileoverview  Axis component.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var chartConst = require('../../const');
var predicate = require('../../helpers/predicate');
var calculator = require('../../helpers/calculator');
var pluginFactory = require('../../factories/pluginFactory');

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
        this.graphRenderer = pluginFactory.get(params.options.libType, 'axis');

        /**
         * Drawing type
         * @type {string}
         */
        this.drawingType = chartConst.COMPONENT_TYPE_RAPHAEL;

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
     * Render vertical axis background
     * @private
     */
    _renderBackground: function() {
        var dimension = tui.util.extend({}, this.layout.dimension);
        var position = tui.util.extend({}, this.layout.position);

        if (this.isVertical) {
            dimension.height = this.dimensionMap.chart.height;
            position.top = 0;
        }

        this.graphRenderer.renderBackground(this.paper, position, dimension, this.theme.plot);
    },
    /**
     * Render child containers like title area, label area and tick area.
     * @param {number} size xAxis width or yAxis height
     * @param {number} tickCount tick count
     * @param {Array.<number|string>} categories categories
     * @param {number} additionalWidth additional width
     * @private
     */
    _renderChildContainers: function(size, tickCount, categories, additionalWidth) {
        var isVerticalLineType = this.isVertical && this.data.aligned;

        if (this.isVertical && !this.data.isPositionRight && !this.options.isCenter) {
            this._renderBackground();
        }

        this._renderTitleArea();
        this._renderLabelArea(size, tickCount, categories, additionalWidth);

        if (!isVerticalLineType) {
            this._renderTickArea(size, tickCount, additionalWidth);
        }
    },

    /**
     * Render divided xAxis if yAxis rendered in the center.
     * @param {{width: number, height:number}} dimension axis area width and height
     * @private
     */
    _renderDividedAxis: function(dimension) {
        var axisData = this.data;
        var lSideWidth = Math.round(dimension.width / 2);
        var rSideWidth = dimension.width - lSideWidth - 1;
        var tickCount = axisData.tickCount;
        var halfTickCount = parseInt(tickCount / 2, 10) + 1;
        var categories = axisData.labels;
        var lCategories = categories.slice(0, halfTickCount);
        var rCategories = categories.slice(halfTickCount - 1, tickCount);
        var tickInterval = lSideWidth / halfTickCount;
        var secondXAxisAdditionalPosition = lSideWidth + this.dimensionMap.yAxis.width - 1;

        this.paperAdditionalWidth = tickInterval;

        this._renderChildContainers(lSideWidth, halfTickCount, lCategories, 0);
        this._renderChildContainers(rSideWidth + 1, halfTickCount, rCategories,
            secondXAxisAdditionalPosition);
    },

    /**
     * Render single axis if not divided.
     * @param {{width: number, height: number}} dimension axis area dimension
     * @private
     */
    _renderNotDividedAxis: function(dimension) {
        var axisData = this.data;
        var isVertical = this.isVertical;
        var size = isVertical ? dimension.height : dimension.width;
        var additionalSize = 0;

        if (axisData.positionRatio) {
            additionalSize = size * axisData.positionRatio;
        }

        this._renderChildContainers(size, axisData.tickCount, axisData.labels, additionalSize);
    },

    /**
     * Render axis area.
     * @private
     */
    _renderAxisArea: function() {
        var dimension = this.layout.dimension;
        var axisData = this.data;

        this.isLabelAxis = axisData.isLabelAxis;

        if (this.options.divided) {
            this.containerWidth = dimension.width + this.dimensionMap.yAxis.width;
            this._renderDividedAxis(dimension);
            dimension.width = this.containerWidth;
        } else {
            dimension.width += this.options.isCenter ? 1 : 0;
            this._renderNotDividedAxis(dimension);
        }
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
     */
    render: function(data) {
        this.paper = data.paper;
        this.axisSet = data.paper.set();

        this._setDataForRendering(data);
        this._renderAxisArea();
    },

    /**
     * Rerender axis component.
     * @param {object} data - bounds and scale data
     */
    rerender: function(data) {
        this.axisSet.remove();

        this.render(data);
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
     * @private
     */
    _renderTitleArea: function() {
        var title = this.options.title || {};

        if (title.text) {
            this.graphRenderer.renderTitle(this.paper, {
                text: title.text,
                theme: this.theme.title,
                rotationInfo: {
                    isVertical: this.isVertical,
                    isPositionRight: this.data.isPositionRight,
                    isCenter: this.options.isCenter
                },
                layout: this.layout,
                set: this.axisSet
            });
        }
    },

    /**
     * Render tick line.
     * @param {number} areaSize - width or height
     * @param {boolean} isNotDividedXAxis - whether is not divided x axis or not.
     * @param {number} additionalSize - additional size
     * @private
     */
    _renderTickLine: function(areaSize, isNotDividedXAxis, additionalSize) {
        this.graphRenderer.renderTickLine({
            areaSize: areaSize,
            additionalSize: additionalSize,
            additionalWidth: this.paperAdditionalWidth,
            additionalHeight: this.paperAdditionalHeight,
            isPositionRight: this.data.isPositionRight,
            isCenter: this.data.options.isCenter,
            isNotDividedXAxis: isNotDividedXAxis,
            isVertical: this.isVertical,
            layout: this.layout,
            paper: this.paper,
            set: this.axisSet
        });
    },

     /**
     * Render ticks.
     * @param {number} size - width or height
     * @param {number} tickCount - tick count
     * @param {boolean} isNotDividedXAxis - whether is not divided x axis or not.
     * @param {number} [additionalSize] - additional size
     * @private
     */
    _renderTicks: function(size, tickCount, isNotDividedXAxis, additionalSize) {
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
            paper: this.paper,
            layout: this.layout,
            positions: positions,
            isVertical: isVertical,
            isCenter: isCenter,
            additionalSize: additionalSize,
            additionalWidth: additionalWidth,
            additionalHeight: additionalHeight,
            isPositionRight: isPositionRight,
            tickColor: tickColor,
            set: this.axisSet
        });
    },

    /**
     * Render tick area.
     * @param {number} size - width or height
     * @param {number} tickCount - tick count
     * @param {number} [additionalSize] - additional size (width or height)
     * @private
     */
    _renderTickArea: function(size, tickCount, additionalSize) {
        var isNotDividedXAxis = !this.isVertical && !this.options.divided;

        this._renderTickLine(size, isNotDividedXAxis, (additionalSize || 0));

        this._renderTicks(size, tickCount, isNotDividedXAxis, (additionalSize || 0));
    },

    /**
     * Render label area.
     * @param {number} size label area size
     * @param {number} tickCount tick count
     * @param {Array.<string>} categories categories
     * @param {number} [additionalSize] additional size (width or height)
     * @private
     */
    _renderLabelArea: function(size, tickCount, categories, additionalSize) {
        var sizeRatio = this.data.sizeRatio || 1;
        var tickPixelPositions = calculator.makeTickPixelPositions((size * sizeRatio), tickCount, 0);
        var labelDistance = tickPixelPositions[1] - tickPixelPositions[0];

        this._renderLabels(tickPixelPositions, categories, labelDistance, (additionalSize || 0));
    },

    /**
     * Make html of rotation labels.
     * @param {Array.<object>} positions label position array
     * @param {string[]} categories categories
     * @param {number} labelSize label size
     * @param {number} additionalSize additional size
     * @private
     */
    _renderRotationLabels: function(positions, categories, labelSize, additionalSize) {
        var self = this;
        var renderer = this.graphRenderer;
        var isVertical = this.isVertical;
        var theme = this.theme.label;
        var degree = this.data.degree;
        var halfWidth = labelSize / 2;
        var horizontalTop = this.layout.position.top + chartConst.AXIS_LABEL_PADDING;
        var baseLeft = this.layout.position.left;

        tui.util.forEach(positions, function(position, index) {
            var labelPosition = position + (additionalSize || 0);
            var positionTopAndLeft = {};

            if (isVertical) {
                positionTopAndLeft.top = labelPosition + halfWidth;
                positionTopAndLeft.left = labelSize;
            } else {
                positionTopAndLeft.top = horizontalTop;
                positionTopAndLeft.left = baseLeft + labelPosition;

                if (!self.options.divided) {
                    positionTopAndLeft.left += halfWidth;
                }
            }

            renderer.renderRotatedLabel({
                degree: degree,
                labelText: categories[index],
                paper: self.paper,
                positionTopAndLeft: positionTopAndLeft,
                set: self.axisSet,
                theme: theme
            });
        });
    },

    /**
     * Make html of normal labels.
     * @param {Array.<object>} positions label position array
     * @param {string[]} categories categories
     * @param {number} labelSize label size
     * @param {number} additionalSize additional size
     * @private
     */
    _renderNormalLabels: function(positions, categories, labelSize, additionalSize) {
        var self = this;
        var renderer = this.graphRenderer;
        var isVertical = this.isVertical;
        var isPositionRight = this.data.isPositionRight;
        var isCategoryLabel = this.isLabelAxis;
        var theme = this.theme.label;
        var dataProcessor = this.dataProcessor;
        var isLineTypeChart = predicate.isLineTypeChart(dataProcessor.chartType, dataProcessor.seriesTypes);
        var isPointOnColumn = isLineTypeChart && this.options.pointOnColumn;
        var layout = this.layout;

        tui.util.forEach(positions, function(position, index) {
            var labelPosition = position + additionalSize;
            var halfLabelDistance = labelSize / 2;
            var positionTopAndLeft = {};
            var labelTopPosition, labelLeftPosition;

            if (isVertical) {
                labelTopPosition = labelPosition;

                if (isCategoryLabel) {
                    labelTopPosition += halfLabelDistance + layout.position.top;
                } else {
                    labelTopPosition = layout.dimension.height + layout.position.top - labelTopPosition;
                }

                if (isPositionRight) {
                    labelLeftPosition = layout.position.left + chartConst.AXIS_LABEL_PADDING;
                } else {
                    labelLeftPosition = layout.position.left + layout.dimension.width - chartConst.CHART_PADDING;
                }
            } else {
                labelTopPosition = layout.position.top + chartConst.CHART_PADDING + chartConst.AXIS_LABEL_PADDING;
                labelLeftPosition = labelPosition + layout.position.left;

                if (isCategoryLabel) {
                    if (!isLineTypeChart || isPointOnColumn) {
                        labelLeftPosition += halfLabelDistance;
                    }
                }
            }

            positionTopAndLeft.top = Math.round(labelTopPosition);
            positionTopAndLeft.left = Math.round(labelLeftPosition);

            renderer.renderLabel({
                isPositionRight: isPositionRight,
                isVertical: isVertical,
                labelSize: labelSize,
                labelText: categories[index],
                paper: self.paper,
                positionTopAndLeft: positionTopAndLeft,
                set: self.axisSet,
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
     * @private
     */
    _renderLabels: function(positions, categories, labelSize, additionalSize) {
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
            this._renderRotationLabels(positions, axisLabels, labelSize, additionalSize);
        } else {
            this._renderNormalLabels(positions, axisLabels, labelSize, additionalSize);
        }
    },
    /**
     * Animate axis for adding data
     * @param {object} data rendering data
     */
    animateForAddingData: function(data) {
        if (!this.isVertical) {
            this.graphRenderer.animateForAddingData(data.tickSize);
        }
    }
});

module.exports = Axis;
