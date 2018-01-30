/**
 * @fileoverview Plot component.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var chartConst = require('../../const');
var predicate = require('../../helpers/predicate');
var calculator = require('../../helpers/calculator');
var snippet = require('tui-code-snippet');
var map = snippet.map;

var Plot = snippet.defineClass(/** @lends Plot.prototype */ {
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
        this.options.showLine = snippet.isUndefined(this.options.showLine) ? true : this.options.showLine;
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
        this.additionalPlotSet = paper.set();

        this._setDataForRendering(data);
        this._renderPlotArea(this.paper);

        this.additionalPlotSet.toBack();
        this.plotSet.toBack();
        paper.pushDownBackgroundToBottom();
    },

    /**
     * Rerender.
     * @param {object} data - bounds and scale data
     */
    rerender: function(data) {
        this.additionalPlotSet.remove();
        this.plotSet.remove();
        this.render(data);
    },

    /**
     * Resize plot component.
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
     * Make template params for vertical line.
     * @param {object} additionalParams - additional params
     * @returns {object}
     * @private
     */
    _makeVerticalLineTemplateParams: function(additionalParams) {
        return snippet.extend({
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
        return snippet.extend({
            className: 'horizontal',
            positionType: 'bottom',
            height: '1px'
        }, additionalParams);
    },

    /**
     * Render line
     * @param {number} offsetPosition - start percentage offsetPosition
     * @param {object} attributes - line attributes
     * @returns {object} path
     * @private
     */
    _renderLine: function(offsetPosition, attributes) {
        var top = this.layout.position.top;
        var height = this.layout.dimension.height;
        var pathString = 'M' + offsetPosition + ',' + top + 'V' + (top + height);
        var path = this.paper.path(pathString);

        path.attr({
            opacity: attributes.opacity || 1,
            stroke: attributes.color
        });

        this.additionalPlotSet.push(path);

        return path;
    },

    /**
     * Render band
     * @param {number} offsetPosition - start percentage offsetPosition
     * @param {number} plotWidth - plotWidth
     * @param {object} attributes - band attributes
     * @returns {object} band
     * @private
     */
    _renderBand: function(offsetPosition, plotWidth, attributes) {
        var position = this.layout.position;
        var dimension = this.layout.dimension;
        var remainingWidth = dimension.width - offsetPosition + position.left;
        var bandWidth = plotWidth < 0 ? remainingWidth : plotWidth;
        var rect = this.paper.rect(offsetPosition, position.top, bandWidth, dimension.height);

        rect.attr({
            fill: attributes.color,
            opacity: attributes.opacity || 1,
            stroke: attributes.color
        });

        this.additionalPlotSet.push(rect);

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
            range = map(range, function(value) {
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

        if (!snippet.isNull(index)) {
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
        var categories = this.dataProcessor.getCategories();
        var range = this._createOptionalLineValueRange(optionalLineData);
        var startPosition, endPosition;

        if (xAxisData.isLabelAxis) {
            startPosition = this._createOptionalLinePositionWhenLabelAxis(width, range[0]);
            endPosition = this._createOptionalLinePositionWhenLabelAxis(width, range[1]);
        } else {
            startPosition = this._createOptionalLinePosition(xAxisData, width, range[0]);
            endPosition = range[1] && this._createOptionalLinePosition(xAxisData, width, range[1]);
        }

        if (snippet.isNull(startPosition)) {
            startPosition = this._isBeforeVisibleCategories(range[0], categories[0]) ? 0 : -1;
        }

        if (snippet.isNull(endPosition)) {
            endPosition = this._isAfterVisibleCatgories(range[1], categories[categories.length - 1]) ? width : -1;
        }

        return {
            start: startPosition,
            end: endPosition
        };
    },

    /**
     * @param {string} value - value of starting point
     * @param {string} firstCategory - first visible category data
     * @returns {boolean} - whether starting point value is at before first visible category data or not
     * @private
     */
    _isBeforeVisibleCategories: function(value, firstCategory) {
        var dataProcessor = this.dataProcessor;
        var valueIndex, firstCategoryIndex;

        if (!snippet.isExisty(value)) {
            return false;
        }

        if (predicate.isDatetimeType(this.xAxisTypeOption)) {
            return value < firstCategory;
        }

        valueIndex = dataProcessor.findAbsoluteCategoryIndex(value);
        firstCategoryIndex = dataProcessor.findAbsoluteCategoryIndex(firstCategory);

        return (valueIndex >= 0) && (valueIndex < firstCategoryIndex);
    },

    /**
     * @param {string} value - value of end point
     * @param {string} lastCategory - last visible category data
     * @returns {boolean} - whether end point value is at after last visible category data or not
     * @private
     */
    _isAfterVisibleCatgories: function(value, lastCategory) {
        var dataProcessor = this.dataProcessor;
        var valueIndex, lastCategoryIndex;

        if (!snippet.isExisty(value)) {
            return false;
        }

        if (predicate.isDatetimeType(this.xAxisTypeOption)) {
            return value > lastCategory;
        }

        valueIndex = dataProcessor.findAbsoluteCategoryIndex(value);
        lastCategoryIndex = dataProcessor.findAbsoluteCategoryIndex(lastCategory);

        return (valueIndex >= 0) && (valueIndex > lastCategoryIndex);
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

        if (positionMap.start >= 0 && positionMap.start <= width) {
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
        var range = optionalLineData.range;
        var positionMaps;

        if (range && range.length) {
            this._makeRangeTo2DArray(optionalLineData);
        }

        positionMaps = map(optionalLineData.range, function(rangeItem) {
            return this._createOptionalLinePositionMap({range: rangeItem}, xAxisData, width);
        }, this);

        if (optionalLineData.mergeOverlappingRanges) {
            positionMaps.sort(compareByStartPosition);
            positionMaps = this._mergeOverlappingPositionMaps(positionMaps);
        }

        return map(positionMaps, function(positionMap) {
            var isStartPositionInsidePlotArea = (positionMap.start) >= 0 && (positionMap.start <= width);
            var bandWidth, band;

            if (isStartPositionInsidePlotArea && positionMap.end >= 0) {
                attributes.color = optionalLineData.color || 'transparent';
                attributes.opacity = optionalLineData.opacity;
                bandWidth = positionMap.end - positionMap.start;
                band = this._renderBand(positionMap.start + this.layout.position.left, bandWidth, attributes);
            }

            return band;
        }, this);
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
        var makeOptionalLineHtml = snippet.bind(this._renderOptionalLine, this, xAxisData, width, templateParams);

        return map(lines, makeOptionalLineHtml);
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
        var makeOptionalLineHtml = snippet.bind(this._makeOptionalBand, this, xAxisData, width, templateParams);

        return map(lines, makeOptionalLineHtml);
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

        snippet.forEach(positions, function(position) {
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

        snippet.forEach(positions, function(position, index) {
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
        this.options.lines = snippet.filter(this.options.lines, function(line) {
            return line.id !== id;
        });
        this.rerender();
    },

    /**
     * Remove plot band.
     * @param {string} id - band id
     */
    removePlotBand: function(id) {
        this.options.bands = snippet.filter(this.options.bands, function(band) {
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
                snippet.forEach(this.optionalLines, function(line) {
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
    },

    /**
     * Check if  optionalLineData has range property and range property is 2D array
     * @param {{range: ?Array.<number>}} optionalLineData - optional line data
     * @private
     */
    _makeRangeTo2DArray: function(optionalLineData) {
        var range = optionalLineData.range;
        var isOneDimensionArray = range && snippet.isArray(range) &&
            (range.length === 0 || !snippet.isArray(range[0]));

        if (isOneDimensionArray) {
            optionalLineData.range = [range];
        }
    },

    /**
     * check if some areas are overlapped, and then merge overlapping area
     * @param {Array.<{start: number, end: number}>} positionMaps - original positionMaps
     * @returns {Array.<{start: number, end: number}>} - inspected positionMaps
     * @private
     */
    _mergeOverlappingPositionMaps: function(positionMaps) {
        var i = 1;
        var len = positionMaps.length;
        var processedMap, previous, current;

        if (len) {
            processedMap = [positionMaps[0]];
            previous = processedMap[0];
        }

        for (; i < len; i += 1) {
            current = positionMaps[i];

            if (current.start <= previous.end) {
                previous.end = Math.max(current.end, previous.end);
            } else {
                processedMap.push(current);
                previous = current;
            }
        }

        return processedMap;
    }
});

/**
 * Compare positionMap by it's start value
 * @param {{start: number, end: number}} previous - previouse plot band positionMap
 * @param {{start: number, end: number}} current - current plot band positionMap
 * @returns {number} - comparison of whether a is greater than b
 * @ignore
 */
function compareByStartPosition(previous, current) {
    return previous.start - current.start;
}

/**
 * Factory for Plot
 * @param {object} param parameter
 * @returns {object}
 * @ignore
 */
function plotFactory(param) {
    var chartType = param.chartOptions.chartType;
    var seriesTypes = param.seriesTypes;
    var xAxisType = param.chartOptions.xAxis.type;

    // same among bar, chart, line, area charts
    param.chartType = chartType;
    param.chartTypes = seriesTypes;
    param.xAxisTypeOption = xAxisType;

    return new Plot(param);
}

plotFactory.componentType = 'plot';
plotFactory.Plot = Plot;

module.exports = plotFactory;
