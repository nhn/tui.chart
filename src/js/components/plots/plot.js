/**
 * @fileoverview Plot component.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var chartConst = require('../../const');
var predicate = require('../../helpers/predicate');
var calculator = require('../../helpers/calculator');

var Plot = tui.util.defineClass(/** @lends Plot.prototype */ {
    /**
     * Plot component.
     * @constructs Plot
     * @private
     * @param {object} params parameters
     *      @param {number} params.vTickCount vertical tick count
     *      @param {number} params.hTickCount horizontal tick count
     *      @param {object} params.theme axis theme
     */
    init: function(params) {
        /**
         * Plot view className
         * @type {string}
         */
        this.className = 'tui-chart-plot-area';

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
        this.options.showLine = tui.util.isUndefined(this.options.showLine) ? true : this.options.showLine;
        this.options.lines = this.options.lines || [];
        this.options.bands = this.options.bands || [];

        /**
         * x axis type option
         * @type {?string}
         */
        this.xAxisTypeOption = params.xAxisTypeOption;

        /**
         * Theme
         * @type {object}
         */
        this.theme = params.theme || {};

        /**
         * chart type
         * @type {string}
         */
        this.chartType = params.chartType;

        /**
         * sub charts type
         * @type {Array.<string>}
         */
        this.chartTypes = params.chartTypes;

        /**
         * layout bounds information for this components
         * @type {null|{dimension:{width:number, height:number}, position:{left:number, top:number}}}
         */
        this.layout = null;

        /**
         * axis data map
         * @type {null|object}
         */
        this.axisDataMap = null;

        this.drawingType = chartConst.COMPONENT_TYPE_RAPHAEL;
    },

    /**
     * Render plot area.
     * @param {object} paper paper object
     * @private
     */
    _renderPlotArea: function(paper) {
        var dimension;

        dimension = this.layout.dimension;

        if (predicate.isLineTypeChart(this.chartType, this.chartTypes)) {
            this._renderOptionalLines(paper, dimension);
        }

        if (this.options.showLine) {
            this._renderPlotLines(paper, dimension);
        }
    },

    /**
     * Set data for rendering.
     * @param {{
     *      layout: {
     *          dimension: {width: number, height: number},
     *          position: {left: number, top: number}
     *      },
     *      axisDataMap: object
     * }} data - bounds and scale data
     * @private
     */
    _setDataForRendering: function(data) {
        if (data) {
            this.layout = data.layout;
            this.dimensionMap = data.dimensionMap;
            this.axisDataMap = data.axisDataMap;
            this.paper = data.paper;
        }
    },

    /**
     * Render plot component.
     * @param {object} data - bounds and scale data
     */
    render: function(data) {
        var paper = (data && data.paper) || this.paper;
        this.plotSet = paper.set();

        this._setDataForRendering(data);
        this._renderPlotArea(this.paper);
    },

    /**
     * Rerender.
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
        this.plotSet.toBack();
        this.paper.pushDownBackgroundToBottom();
    },

    /**
     * Make template params for vertical line.
     * @param {object} additionalParams - additional params
     * @returns {object}
     * @private
     */
    _makeVerticalLineTemplateParams: function(additionalParams) {
        return tui.util.extend({
            className: 'vertical',
            positionType: 'left',
            width: '1px'
        }, additionalParams);
    },

    /**
     * Make template params for horizontal line.
     * @param {object} additionalParams - additional params
     * @returns {object}
     * @private
     */
    _makeHorizontalLineTemplateParams: function(additionalParams) {
        return tui.util.extend({
            className: 'horizontal',
            positionType: 'bottom',
            height: '1px'
        }, additionalParams);
    },

    /**
     * Render line
     * @param {number} position - start percentage position
     * @param {object} attributes - line attributes
     * @returns {object} path
     * @private
     */
    _renderLine: function(position, attributes) {
        var top = this.layout.position.top;
        var height = this.layout.dimension.height;
        var pathString = 'M' + position + ',' + top + 'V' + (top + height);
        var path = this.paper.path(pathString);

        path.attr({
            opacity: attributes.opacity || 1,
            stroke: attributes.color
        });

        this.plotSet.push(path);

        return path;
    },

    /**
     * Render band
     * @param {number} position - start percentage position
     * @param {number} width - width
     * @param {object} attributes - band attributes
     * @returns {object} band
     * @private
     */
    _renderBand: function(position, width, attributes) {
        var top = this.layout.position.top;
        var height = this.layout.dimension.height;
        var rect = this.paper.rect(position, top, width, height);

        rect.attr({
            fill: attributes.color,
            opacity: attributes.opacity || 1,
            stroke: attributes.color
        });

        this.plotSet.push(rect);

        return rect;
    },

    /**
     * Create value range for optional line.
     * @param {{range: ?Array.<number>, value: ?number}} optionalLineData - optional line data
     * @returns {Array.<number>}
     * @private
     */
    _createOptionalLineValueRange: function(optionalLineData) {
        var range = optionalLineData.range || [optionalLineData.value];

        if (predicate.isDatetimeType(this.xAxisTypeOption)) {
            range = tui.util.map(range, function(value) {
                var date = new Date(value);

                return date.getTime() || value;
            });
        }

        return range;
    },

    /**
     * Create position for optional line, when value axis.
     * @param {{dataMin: number, distance: number}} xAxisData - x axis data
     * @param {number} width - width
     * @param {number} value - value
     * @returns {number|null}
     * @private
     */
    _createOptionalLinePosition: function(xAxisData, width, value) {
        var ratio = (value - xAxisData.dataMin) / xAxisData.distance;
        var position = ratio * width;

        if (ratio === 1) {
            position -= 1;
        }

        if (position < 0) {
            position = null;
        }

        return position;
    },

    /**
     * Create position for optional line, when label axis.
     * @param {number} width - width
     * @param {number} value - value
     * @returns {number|null}
     * @private
     */
    _createOptionalLinePositionWhenLabelAxis: function(width, value) {
        var dataProcessor = this.dataProcessor;
        var index = dataProcessor.findCategoryIndex(value);
        var position = null;
        var ratio;

        if (!tui.util.isNull(index)) {
            ratio = (index === 0) ? 0 : (index / (dataProcessor.getCategoryCount() - 1));
            position = ratio * width;
        }

        if (ratio === 1) {
            position -= 1;
        }

        return position;
    },

    /**
     * Create position map for optional line.
     * @param {{range: ?Array.<number>, value: ?number}} optionalLineData - optional line data
     * @param {{isLabelAxis: boolean, dataMin: number, distance: number}} xAxisData - x axis data
     * @param {number} width - width
     * @returns {{start: number, end: number}}
     * @private
     */
    _createOptionalLinePositionMap: function(optionalLineData, xAxisData, width) {
        var range = this._createOptionalLineValueRange(optionalLineData);
        var startPosition, endPosition;

        if (xAxisData.isLabelAxis) {
            startPosition = this._createOptionalLinePositionWhenLabelAxis(width, range[0]);
            endPosition = this._createOptionalLinePositionWhenLabelAxis(width, range[1]);
        } else {
            startPosition = this._createOptionalLinePosition(xAxisData, width, range[0]);
            endPosition = range[1] && this._createOptionalLinePosition(xAxisData, width, range[1]);
        }

        if (tui.util.isExisty(endPosition) && tui.util.isNull(startPosition)) {
            startPosition = 0;
        }

        return {
            start: startPosition,
            end: endPosition
        };
    },

    /**
     * Render optional line.
     * @param {Array.<number>} xAxisData - positions
     * @param {number} width - standard width
     * @param {object} attributes - template parameters
     * @param {object} optionalLineData - optional line information
     * @returns {object}
     * @private
     */
    _renderOptionalLine: function(xAxisData, width, attributes, optionalLineData) {
        var positionMap = this._createOptionalLinePositionMap(optionalLineData, xAxisData, width);
        var line;

        if (tui.util.isExisty(positionMap.start) && (positionMap.start >= 0) && (positionMap.start <= width)) {
            attributes.width = 1;

            attributes.color = optionalLineData.color || 'transparent';
            attributes.opacity = optionalLineData.opacity;

            line = this._renderLine(positionMap.start + this.layout.position.left, attributes);
        }

        return line;
    },

    /**
     * Render optional band.
     * @param {Array.<number>} xAxisData - positions
     * @param {number} width - standard width
     * @param {object} attributes - template parameters
     * @param {object} optionalLineData - optional line information
     * @returns {object}
     * @private
     */
    _makeOptionalBand: function(xAxisData, width, attributes, optionalLineData) {
        var positionMap = this._createOptionalLinePositionMap(optionalLineData, xAxisData, width);
        var bandWidth = positionMap.end - positionMap.start;
        var band;

        if (tui.util.isExisty(positionMap.start) && (positionMap.start >= 0) && (positionMap.start <= width)) {
            attributes.color = optionalLineData.color || 'transparent';
            attributes.opacity = optionalLineData.opacity;
            band = this._renderBand(positionMap.start + this.layout.position.left, bandWidth, attributes);
        }

        return band;
    },

    /**
     * Make optional lines html.
     * @param {Array.<object>} lines - optional lines
     * @param {{width: number, height: number}} dimension - dimension
     * @returns {string}
     * @private
     */
    _makeOptionalLines: function(lines, dimension) {
        var width = dimension.width;
        var xAxisData = this.axisDataMap.xAxis;
        var templateParams = this._makeVerticalLineTemplateParams({
            height: dimension.height + 'px'
        });
        var makeOptionalLineHtml = tui.util.bind(this._renderOptionalLine, this, xAxisData, width, templateParams);

        return tui.util.map(lines, makeOptionalLineHtml).join('');
    },

    /**
     * Make optional lines html.
     * @param {Array.<object>} lines - optional lines
     * @param {{width: number, height: number}} dimension - dimension
     * @returns {string}
     * @private
     */
    _makeOptionalBands: function(lines, dimension) {
        var width = dimension.width;
        var xAxisData = this.axisDataMap.xAxis;
        var templateParams = this._makeVerticalLineTemplateParams({
            height: dimension.height + 'px'
        });
        var makeOptionalLineHtml = tui.util.bind(this._makeOptionalBand, this, xAxisData, width, templateParams);

        return tui.util.map(lines, makeOptionalLineHtml).join('');
    },

    /**
     * Render optional lines and bands.
     * @param {object} paper - paper
     * @param {{width: number, height: number}} dimension - dimension
     * @private
     */
    _renderOptionalLines: function(paper, dimension) {
        var optionalLines = [];
        optionalLines.concat(this._makeOptionalBands(this.options.bands, dimension));
        optionalLines.concat(this._makeOptionalLines(this.options.lines, dimension));

        this.optionalLines = optionalLines;
    },

    /**
     * Maker html for vertical lines
     * @param {{width: number, height: number}} dimension - dimension
     * @param {string} lineColor - line color
     * @private
     */
    _renderVerticalLines: function(dimension, lineColor) {
        var positions = this._makeHorizontalPositions(dimension.width);
        var self = this;
        var layout = this.layout;
        var left = layout.position.left;
        var top = layout.position.top;

        tui.util.forEach(positions, function(position) {
            var pathString = 'M' + (position + left) + ',' + top + 'V' + (top + layout.dimension.height);

            var path = self.paper.path(pathString);

            path.attr({
                stroke: lineColor,
                'stroke-width': 1
            });

            self.plotSet.push(path);
        });
    },

    /**
     * Maker html for horizontal lines.
     * @param {{width: number, height: number}} dimension - dimension
     * @param {string} lineColor - line color
     * @private
     */
    _renderHorizontalLines: function(dimension, lineColor) {
        var positions = this._makeVerticalPositions(dimension.height);
        var self = this;
        var layout = this.layout;
        var left = layout.position.left;
        var top = layout.position.top;
        var distance = positions[1] - positions[0];

        tui.util.forEach(positions, function(position, index) {
            var pathString = 'M' + left + ',' + ((distance * index) + top) + 'H' + (left + layout.dimension.width);
            var path = self.paper.path(pathString);

            path.attr({
                stroke: lineColor,
                'stroke-width': 1
            });

            self.plotSet.push(path);
        });
    },

    /**
     * Render plot lines.
     * @param {HTMLElement} container - container element
     * @param {{width: number, height: number}} dimension plot area dimension
     * @private
     */
    _renderPlotLines: function(container, dimension) {
        var theme = this.theme;

        if (!predicate.isLineTypeChart(this.chartType)) {
            this._renderVerticalLines(dimension, theme.lineColor);
        }

        this._renderHorizontalLines(dimension, theme.lineColor);
    },

    /**
     * Make positions for vertical line.
     * @param {number} height plot height
     * @returns {Array.<number>} positions
     * @private
     */
    _makeVerticalPositions: function(height) {
        var axisDataMap = this.axisDataMap;
        var yAxis = axisDataMap.yAxis || axisDataMap.rightYAxis;
        var positions = calculator.makeTickPixelPositions(height, yAxis.validTickCount);

        positions.shift();

        return positions;
    },

    /**
     * Make divided positions of plot.
     * @param {number} width - plot width
     * @param {number} tickCount - tick count
     * @returns {Array.<number>}
     * @private
     */
    _makeDividedPlotPositions: function(width, tickCount) {
        var yAxisWidth = this.dimensionMap.yAxis.width;
        var leftWidth, rightWidth, leftPositions, rightPositions;

        tickCount = parseInt(tickCount / 2, 10) + 1;
        width -= yAxisWidth;
        leftWidth = Math.round((width) / 2);
        rightWidth = width - leftWidth;

        leftPositions = calculator.makeTickPixelPositions(leftWidth, tickCount);
        rightPositions = calculator.makeTickPixelPositions(rightWidth, tickCount, leftWidth + yAxisWidth);

        leftPositions.pop();
        rightPositions.shift();

        return leftPositions.concat(rightPositions);
    },

    /**
     * Make positions for horizontal line.
     * @param {number} width plot width
     * @returns {Array.<number>} positions
     * @private
     */
    _makeHorizontalPositions: function(width) {
        var tickCount = this.axisDataMap.xAxis.validTickCount;
        var positions;

        if (this.options.divided) {
            positions = this._makeDividedPlotPositions(width, tickCount);
        } else {
            positions = calculator.makeTickPixelPositions(width, tickCount);
            positions.shift();
        }

        return positions;
    },

    /**
     * Add plot line.
     * @param {{index: number, color: string, id: string}} data - data
     */
    addPlotLine: function(data) {
        this.options.lines.push(data);
        this.rerender();
    },

    /**
     * Add plot band.
     * @param {{range: Array.<number>, color: string, id: string}} data - data
     */
    addPlotBand: function(data) {
        this.options.bands.push(data);
        this.rerender();
    },

    /**
     * Remove plot line.
     * @param {string} id - line id
     */
    removePlotLine: function(id) {
        this.options.lines = tui.util.filter(this.options.lines, function(line) {
            return line.id !== id;
        });
        this.rerender();
    },

    /**
     * Remove plot band.
     * @param {string} id - band id
     */
    removePlotBand: function(id) {
        this.options.bands = tui.util.filter(this.options.bands, function(band) {
            return band.id !== id;
        });
        this.rerender();
    },

    /**
     * Animate for adding data.
     * @param {{tickSize: number, shifting: boolean}} data - data for animation
     */
    animateForAddingData: function(data) {
        var self = this;

        if (!this.dataProcessor.isCoordinateType()) {
            if (data.shifting) {
                tui.util.forEach(this.optionalLines, function(line) {
                    var bbox = line.getBBox();

                    if (bbox.x - data.tickSize < self.layout.position.left) {
                        line.animate({
                            transform: 'T' + data.tickSize + ',' + bbox.y,
                            opacity: 0
                        }, 300, 'linear', function() {
                            line.remove();
                        });
                    } else {
                        line.animate({
                            transform: 'T' + data.tickSize + ',' + bbox.y
                        }, 300);
                    }
                });
            }
        }
    }
});

module.exports = Plot;
