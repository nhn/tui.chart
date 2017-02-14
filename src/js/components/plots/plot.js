/**
 * @fileoverview Plot component.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var chartConst = require('../../const');
var dom = require('../../helpers/domHandler');
var predicate = require('../../helpers/predicate');
var calculator = require('../../helpers/calculator');
var renderUtil = require('../../helpers/renderUtil');
var plotTemplate = require('./plotTemplate');

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
    },

    /**
     * Render plot area.
     * @param {HTMLElement} plotContainer plot area element
     * @private
     */
    _renderPlotArea: function(plotContainer) {
        var dimension;

        dimension = this.layout.dimension;

        renderUtil.renderDimension(plotContainer, dimension);
        renderUtil.renderPosition(plotContainer, this.layout.position);

        if (predicate.isLineTypeChart(this.chartType, this.chartTypes)) {
            this._renderOptionalLines(plotContainer, dimension);
        }

        if (this.options.showLine) {
            this._renderPlotLines(plotContainer, dimension);
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
        }
    },

    /**
     * Render plot component.
     * @param {object} data - bounds and scale data
     * @returns {HTMLElement} plot element
     */
    render: function(data) {
        var container = dom.create('DIV', this.className);

        this._setDataForRendering(data);
        this._renderPlotArea(container);
        this.plotContainer = container;

        return container;
    },

    /**
     * Rerender.
     * @param {object} data - bounds and scale data
     */
    rerender: function(data) {
        this.plotContainer.innerHTML = '';
        this._setDataForRendering(data);
        this._renderPlotArea(this.plotContainer);
    },

    /**
     * Resize plot component.
     * @param {object} data - bounds and scale data
     */
    resize: function(data) {
        this.rerender(data);
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
     * Make line html.
     * @param {number} startPercent - start percentage position
     * @param {number} standardWidth - standard width
     * @param {object} templateParams - template parameters
     * @returns {string}
     * @private
     */
    _makeLineHtml: function(startPercent, standardWidth, templateParams) {
        templateParams.positionValue = startPercent + '%';
        templateParams.opacity = templateParams.opacity || '';

        return plotTemplate.tplPlotLine(templateParams);
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
     * Make optional line html.
     * @param {Array.<number>} xAxisData - positions
     * @param {number} width - standard width
     * @param {object} templateParams - template parameters
     * @param {object} optionalLineData - optional line information
     * @returns {string}
     * @private
     */
    _makeOptionalLineHtml: function(xAxisData, width, templateParams, optionalLineData) {
        var positionMap = this._createOptionalLinePositionMap(optionalLineData, xAxisData, width);
        var plotLineWidth = '1px';
        var html = '';
        var startPercent, widthPercent;

        if (tui.util.isExisty(positionMap.start) && (positionMap.start >= 0) && (positionMap.start <= width)) {
            startPercent = calculator.makePercentageValue(positionMap.start, width);

            if (tui.util.isExisty(positionMap.end)) {
                widthPercent = calculator.makePercentageValue(positionMap.end - positionMap.start, width);

                if (startPercent + widthPercent > 100) {
                    widthPercent = 100 - startPercent;
                }

                templateParams.width = widthPercent + '%';
            } else {
                templateParams.width = plotLineWidth;
            }

            templateParams.color = optionalLineData.color || 'transparent';
            templateParams.opacity = renderUtil.makeOpacityCssText(optionalLineData.opacity);
            html = this._makeLineHtml(startPercent, width, templateParams);
        }

        return html;
    },

    /**
     * Make optional lines html.
     * @param {Array.<object>} lines - optional lines
     * @param {{width: number, height: number}} dimension - dimension
     * @returns {string}
     * @private
     */
    _makeOptionalLinesHtml: function(lines, dimension) {
        var width = dimension.width;
        var xAxisData = this.axisDataMap.xAxis;
        var templateParams = this._makeVerticalLineTemplateParams({
            height: dimension.height + 'px'
        });
        var makeOptionalLineHtml = tui.util.bind(this._makeOptionalLineHtml, this, xAxisData, width, templateParams);

        return tui.util.map(lines, makeOptionalLineHtml).join('');
    },

    /**
     * Render optional lines and bands.
     * @param {HTMLElement} container - container
     * @param {{width: number, height: number}} dimension - dimension
     * @private
     */
    _renderOptionalLines: function(container, dimension) {
        var optionalContainer = dom.create('DIV', 'tui-chart-plot-optional-lines-area');
        var bandsHtml = this._makeOptionalLinesHtml(this.options.bands, dimension);
        var linesHtml = this._makeOptionalLinesHtml(this.options.lines, dimension);

        this.optionalContainer = optionalContainer;

        dom.append(container, optionalContainer);

        optionalContainer.innerHTML = bandsHtml + linesHtml;
    },

    /**
     * Make html of plot lines.
     * @param {Array.<number>} positions - position values
     * @param {number} standardWidth - standard width
     * @param {object} templateParams parameters
     * @returns {string} html
     * @private
     */
    _makeLinesHtml: function(positions, standardWidth, templateParams) {
        var self = this;
        var startPercent;

        var lineHtml = tui.util.map(positions, function(position) {
            startPercent = calculator.makePercentageValue(position, standardWidth);

            return self._makeLineHtml(startPercent, standardWidth, templateParams);
        }).join('');

        return lineHtml;
    },

    /**
     * Maker html for vertical lines
     * @param {{width: number, height: number}} dimension - dimension
     * @param {string} lineColor - line color
     * @returns {string}
     * @private
     */
    _makeVerticalLinesHtml: function(dimension, lineColor) {
        var positions = this._makeHorizontalPositions(dimension.width);
        var templateParams = this._makeVerticalLineTemplateParams({
            height: dimension.height + 'px',
            color: lineColor
        });

        return this._makeLinesHtml(positions, dimension.width, templateParams);
    },

    /**
     * Maker html for horizontal lines.
     * @param {{width: number, height: number}} dimension - dimension
     * @param {string} lineColor - line color
     * @returns {string}
     * @private
     */
    _makeHorizontalLinesHtml: function(dimension, lineColor) {
        var positions = this._makeVerticalPositions(dimension.height);
        var templateParams = this._makeHorizontalLineTemplateParams({
            width: dimension.width + 'px',
            color: lineColor
        });

        return this._makeLinesHtml(positions, dimension.height, templateParams);
    },

    /**
     * Render plot lines.
     * @param {HTMLElement} container - container element
     * @param {{width: number, height: number}} dimension plot area dimension
     * @private
     */
    _renderPlotLines: function(container, dimension) {
        var lineContainer = dom.create('DIV', 'tui-chart-plot-lines-area');
        var theme = this.theme;
        var lineHtml = '';

        if (!predicate.isLineTypeChart(this.chartType)) {
            lineHtml += this._makeVerticalLinesHtml(dimension, theme.lineColor);
        }

        lineHtml += this._makeHorizontalLinesHtml(dimension, theme.lineColor);

        dom.append(container, lineContainer);
        lineContainer.innerHTML += lineHtml;
        renderUtil.renderBackground(container, theme.background);
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
        this.options.bands = tui.util.filter(this.options.bands, function(line) {
            return line.id !== id;
        });
        this.rerender();
    },

    /**
     * Animate for adding data.
     * @param {{tickSize: number, shifting: boolean}} data - data for animation
     */
    animateForAddingData: function(data) {
        var self = this;
        var beforeLeft = 0;
        var interval = data.tickSize;
        var areaWidth;

        if (this.dataProcessor.isCoordinateType()) {
            this.optionalContainer.innerHTML = '';
        } else if (data.shifting) {
            renderUtil.startAnimation(chartConst.ADDING_DATA_ANIMATION_DURATION, function(ratio) {
                var left = interval * ratio;
                self.optionalContainer.style.left = (beforeLeft - left) + 'px';
            });
        } else {
            areaWidth = this.layout.dimension.width;
            renderUtil.startAnimation(chartConst.ADDING_DATA_ANIMATION_DURATION, function(ratio) {
                var left = interval * ratio;
                self.optionalContainer.style.width = (areaWidth - left) + 'px';
            }, function() {
            });
        }
    }
});

function plotFactory(param) {
    var chartType = param.chartOptions.chartType;
    var seriesTypes = param.seriesTypes;
    var xAxisType = param.chartOptions.xAxis.type;

    // bar, chart, line, area동일
    param.chartType = chartType;
    param.chartTypes = seriesTypes;
    param.xAxisTypeOption = xAxisType;

    return new Plot(param);
}

plotFactory.componentType = 'plot';
plotFactory.Plot = Plot;

module.exports = plotFactory;
