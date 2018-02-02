/**
 * @fileoverview Series base component.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var snippet = require('tui-code-snippet');

var LABEL_FADE_IN_DURATION = 600;
var browser = snippet.browser;
var IS_IE7 = browser.msie && browser.version === 7;

var chartConst = require('../../const');
var dom = require('../../helpers/domHandler');
var predicate = require('../../helpers/predicate');
var renderUtil = require('../../helpers/renderUtil');
var pluginFactory = require('../../factories/pluginFactory');
var raphaelRenderUtil = require('../../plugins/raphaelRenderUtil');

var Series = snippet.defineClass(/** @lends Series.prototype */ {
    /**
     * Series component className
     * @type {string}
     */
    className: 'tui-chart-series-area',
    /**
     * Series base component.
     * @constructs Series
     * @private
     * @param {object} params parameters
     *      @param {object} params.options series options
     *      @param {object} params.theme series theme
     */
    init: function(params) {
        var libType = params.libType;

        /**
         * Chart type
         * @type {string}
         */
        this.chartType = params.chartType;

        /**
         * Series name
         * @tpye {string}
         */
        this.seriesType = params.seriesType || params.chartType;

        /**
         * Component type
         * @type {string}
         */
        this.componentType = params.componentType;

        /**
         * Data processor
         * @type {DataProcessor}
         */
        this.dataProcessor = params.dataProcessor;

        /**
         * event bus for transmitting message
         * @type {object}
         */
        this.eventBus = params.eventBus;

        /**
         * chart background.
         * @type {string}
         */
        this.chartBackground = params.chartBackground;

        /**
         * Options
         * @type {object}
         */
        this.options = params.options || {};

        /**
         * Theme
         * @type {object}
         */

        this.orgTheme = this.theme = params.theme;

        /**
         * Graph renderer
         * @type {object}
         */
        this.graphRenderer = pluginFactory.get(libType, params.chartType);

        /**
         * series container
         * @type {HTMLElement}
         */
        this.seriesContainer = null;

        /**
         * series label container
         * @type {HTMLElement}
         */
        this.seriesLabelContainer = null;

        /**
         * series data
         * @type {Array.<object>}
         */
        this.seriesData = [];

        /**
         * Selected legend index
         * @type {?number}
         */
        this.selectedLegendIndex = null;

        /**
         * effector for show layer
         * @type {object}
         */
        this.labelShowEffector = null;

        /**
         * raphael object
         * @type {null|object}
         */
        this.paper = null;

        /**
         * limit(min, max) data for series
         * @type {null|{min:number, max:number}}
         */
        this.limit = null;

        /**
         * aligned
         * @type {null|boolean}
         */
        this.aligned = null;

        /**
         * layout bounds information for this components
         * @type {null|{dimension:{width:number, height:number}, position:{left:number, top:number}}}
         */
        this.layout = null;

        /**
         * dimension map for layout of chart
         * @type {null|object}
         */
        this.dimensionMap = null;

        /**
         * position map for layout of chart
         * @type {null|object}
         */
        this.positionMap = null;

        /**
         * axis data map
         * @type {null|object}
         */
        this.axisDataMap = null;

        /**
         * before axis data map
         * @type {null|object}
         */
        this.beforeAxisDataMap = null;

        /**
         * Drawing type
         * @type {string}
         */
        this.drawingType = chartConst.COMPONENT_TYPE_RAPHAEL;

        /**
         * whether series lable is supported
         * @type {boolean}
         */
        this.supportSeriesLable = true;

        this._attachToEventBus();
    },

    /**
     * Attach to event bus.
     * @private
     */
    _attachToEventBus: function() {
        var firstRenderCheck = snippet.bind(function() {
            this.isInitRenderCompleted = true;
            this.eventBus.off('load', firstRenderCheck);
        }, this);

        this.eventBus.on(chartConst.PUBLIC_EVENT_PREFIX + 'load', firstRenderCheck);

        this.eventBus.on({
            selectLegend: this.onSelectLegend,
            selectSeries: this.onSelectSeries,
            unselectSeries: this.onUnselectSeries,
            hoverSeries: this.onHoverSeries,
            hoverOffSeries: this.onHoverOffSeries,
            showGroupAnimation: this.onShowGroupAnimation,
            hideGroupAnimation: this.onHideGroupAnimation
        }, this);

        if (this.onShowTooltip) {
            this.eventBus.on('showTooltip', this.onShowTooltip, this);
        }

        if (this.onShowGroupTooltipLine) {
            this.eventBus.on({
                showGroupTooltipLine: this.onShowGroupTooltipLine,
                hideGroupTooltipLine: this.onHideGroupTooltipLine
            }, this);
        }

        if (this.onClickSeries) {
            this.eventBus.on({
                clickSeries: this.onClickSeries,
                moveSeries: this.onMoveSeries
            }, this);
        }
    },

    /**
     * Get seriesDataModel.
     * @returns {SeriesDataModel}
     * @private
     */
    _getSeriesDataModel: function() {
        return this.dataProcessor.getSeriesDataModel(this.seriesType);
    },

    /**
     * Make series data.
     * @private
     * @abstract
     */
    _makeSeriesData: function() {},

    /**
     * Get seriesData
     * @returns {object} series data
     */
    getSeriesData: function() {
        return this.seriesData;
    },

    /**
     * Render series label.
     * @private
     * @abstract
     */
    _renderSeriesLabel: function() {},

    /**
     * Render series label area
     * @param {object} paper series label area element
     * @returns {Array.<object>}
     * @private
     */
    _renderSeriesLabelArea: function(paper) {
        return this._renderSeriesLabel(paper);
    },

    /**
     * Send boudns to mouseEventDetector component.
     * @param {object} seriesData - series data
     * @private
     */
    _sendBoundsToMouseEventDetector: function(seriesData) {
        this.eventBus.fire('receiveSeriesData', {
            chartType: this.chartType,
            data: seriesData
        });
    },

    /**
     * Render series area.
     * @param {object} paper - raphael object
     * @param {function} funcRenderGraph - function for graph rendering
     * @private
     */
    _renderSeriesArea: function(paper, funcRenderGraph) {
        var dimension, seriesData;

        dimension = this.dimensionMap.extendedSeries;

        this.seriesData = seriesData = this._makeSeriesData();

        this._sendBoundsToMouseEventDetector(seriesData);

        if (this.hasDataForRendering(seriesData) || this.chartType === 'map') {
            if (funcRenderGraph) {
                this.seriesSet = funcRenderGraph(dimension, seriesData, paper);
            }

            if (predicate.isShowLabel(this.options) && this.supportSeriesLable) {
                this.labelSet = this._renderSeriesLabelArea(paper);
            }
        }
    },

    /**
     * Make parameters for graph rendering.
     * @param {{width: number, height: number}} dimension dimension
     * @param {object} seriesData series data
     * @returns {object} parameters for graph rendering
     * @private
     */
    _makeParamsForGraphRendering: function(dimension, seriesData) {
        return snippet.extend({
            dimension: dimension,
            position: this.layout.position,
            chartType: this.seriesType,
            theme: this.theme,
            options: this.options
        }, seriesData);
    },

    /**
     * Render raphael graph.
     * @param {{width: number, height: number}} dimension - dimension
     * @param {object} seriesData - series data
     * @param {object} [paper] - raphael paper
     * @returns {object}
     * @private
     */
    _renderGraph: function(dimension, seriesData, paper) {
        var params = this._makeParamsForGraphRendering(dimension, seriesData);

        return this.graphRenderer.render(paper, params);
    },

    /**
     * Set data for rendering.
     * @param {{
     *      paper: ?object,
     *      limit: {
     *          min: number,
     *          max: number
     *      },
     *      aligned: boolean,
     *      layout: {
     *          dimension: {width: number, height: number},
     *          position: {left: number, top: number}
     *      },
     *      dimensionMap: object,
     *      positionMap: object,
     *      axisDataMap: object
     * }} data - data for rendering
     * @private
     */
    _setDataForRendering: function(data) {
        this.paper = data.paper;
        this.limit = data.limitMap[this.chartType];
        if (data.axisDataMap && data.axisDataMap.xAxis) {
            this.aligned = data.axisDataMap.xAxis.aligned;
        }
        this.layout = data.layout;
        this.dimensionMap = data.dimensionMap;
        this.positionMap = data.positionMap;
        this.axisDataMap = data.axisDataMap;
    },

    /**
     * Render series component.
     * @param {object} data - data for rendering
     */
    render: function(data) {
        var checkedLegends;
        this.paper = data.paper;
        this._setDataForRendering(data);
        this._clearSeriesContainer();
        this.beforeAxisDataMap = this.axisDataMap;

        if (data.checkedLegends) {
            checkedLegends = data.checkedLegends[this.seriesType];
            if (!this.options.colorByPoint) {
                this.theme = this._getCheckedSeriesTheme(this.orgTheme, checkedLegends);
            }
        }

        this._renderSeriesArea(data.paper, snippet.bind(this._renderGraph, this));

        if (this.paper.pushDownBackgroundToBottom) {
            this.paper.pushDownBackgroundToBottom();
        }
    },

    /**
     * Get checked series theme.
     * @param {object} theme legend theme
     * @param {?Array.<?boolean>} checkedLegends checked legends
     * @returns {object} checked series theme
     * @private
     */
    _getCheckedSeriesTheme: function(theme, checkedLegends) {
        var cloneTheme;

        if (!checkedLegends.length) {
            return theme;
        }

        cloneTheme = JSON.parse(JSON.stringify(theme));
        cloneTheme.colors = snippet.filter(cloneTheme.colors, function(color, index) {
            return checkedLegends[index];
        });

        return cloneTheme;
    },

    /**
     * Clear series container.
     * @private
     */
    _clearSeriesContainer: function() {
        if (this.seriesSet && this.seriesSet.remove) {
            this.seriesSet.forEach(function(series) {
                series.remove();
            }, this);
            this.seriesSet.remove();
        }
        if (this.labelSet && this.labelSet.remove) {
            this.labelSet.forEach(function(label) {
                label.remove();
            }, this);
            this.labelSet.remove();
        }

        this.seriesData = [];
    },

    /**
     * Rerender series
     * @param {object} data - data for rendering
     */
    rerender: function(data) {
        var checkedLegends;

        if (this.dataProcessor.getGroupCount(this.seriesType)) {
            if (data.checkedLegends) {
                checkedLegends = data.checkedLegends[this.seriesType];
                this.theme = this._getCheckedSeriesTheme(this.orgTheme, checkedLegends);
            }

            this._setDataForRendering(data);
            this._clearSeriesContainer();
            this._renderSeriesArea(data.paper, snippet.bind(this._renderGraph, this));

            if (this.labelShowEffector) {
                clearInterval(this.labelShowEffector.timerId);
            }

            // if rerender have excuted in the middle of animate,
            // we should rerun animate
            if (checkedLegends || !this.isInitRenderCompleted) {
                this.animateComponent(true);
            }

            if (!snippet.isNull(this.selectedLegendIndex)) {
                this.graphRenderer.selectLegend(this.selectedLegendIndex);
            }
        }
    },

    /**
     * Return whether label visible or not.
     * @returns {boolean}
     * @private
     */
    _isLabelVisible: function() {
        return !!(this.options.showLabel || this.options.showLegend);
    },

    /**
     * Resize raphael graph by given dimension and series data
     * @param {{width: number, height: number}} dimension - chart dimension
     * @param {object} seriesData - series data
     * @returns {Array.<object>}
     * @private
     */
    _resizeGraph: function(dimension, seriesData) {
        this.graphRenderer.resize(snippet.extend({
            dimension: this.dimensionMap.chart
        }, seriesData));

        return this.seriesSet;
    },

    /**
     * Resize series component.
     * }} bound series bound
     * @param {object} data data for rendering
     */
    resize: function(data) {
        this._clearSeriesContainer();
        this._setDataForRendering(data);
        this._renderSeriesArea(data.paper, snippet.bind(this._resizeGraph, this));
    },

    /**
     * Set element's top, left given top, left position
     * @param {HTMLElement} el - series element
     * @param {{top: number, left: number}} position - series top, left position
     * @private
     */
    _renderPosition: function(el, position) {
        var hiddenWidth = renderUtil.isOldBrowser() ? 1 : 0;

        renderUtil.renderPosition(el, {
            top: position.top - (hiddenWidth),
            left: position.left - (hiddenWidth * 2)
        });
    },

    /**
     * Get limit distance from zero point.
     * @param {number} size chart size (width or height)
     * @param {{min: number, max: number}} limit limit
     * @returns {{toMax: number, toMin: number}} pixel distance
     * @private
     */
    _getLimitDistanceFromZeroPoint: function(size, limit) {
        var min = limit.min,
            max = limit.max,
            distance = max - min,
            toMax = 0,
            toMin = 0;

        if (min <= 0 && max >= 0) {
            toMax = (distance + min) / distance * size;
            toMin = (distance - max) / distance * size;
        } else if (min > 0) {
            toMax = size;
        }

        return {
            toMax: toMax,
            toMin: toMin
        };
    },

    /**
     * Find label element.
     * @param {HTMLElement} elTarget target element
     * @returns {HTMLElement} label element
     * @private
     */
    _findLabelElement: function(elTarget) {
        var elLabel = null;

        if (dom.hasClass(elTarget, chartConst.CLASS_NAME_SERIES_LABEL)) {
            elLabel = elTarget;
        } else {
            elLabel = dom.findParentByClass(elTarget, chartConst.CLASS_NAME_SERIES_LABEL);
        }

        return elLabel;
    },

    /**
     * To call showAnimation function of graphRenderer.
     * @param {{groupIndex: number, index: number}} data data
     * @param {string} chartType - chart type
     */
    onHoverSeries: function(data, chartType) {
        if (chartType !== this.chartType) {
            return;
        }

        if (!this.graphRenderer.showAnimation) {
            return;
        }

        this.graphRenderer.showAnimation(data);
    },

    /**
     * To call hideAnimation function of graphRenderer.
     * @param {{groupIndex: number, index: number}} data data
     * @param {string} chartType - chart type
     */
    onHoverOffSeries: function(data, chartType) {
        if (chartType !== this.chartType) {
            return;
        }

        if (!this.graphRenderer.hideAnimation || !data) {
            return;
        }

        this.graphRenderer.hideAnimation(data);
    },

    /**
     * To call showGroupAnimation function of graphRenderer.
     * @param {number} index index
     */
    onShowGroupAnimation: function(index) {
        if (!this.graphRenderer.showGroupAnimation) {
            return;
        }
        this.graphRenderer.showGroupAnimation(index);
    },

    /**
     * To call hideGroupAnimation function of graphRenderer.
     * @param {number} index index
     */
    onHideGroupAnimation: function(index) {
        if (!this.graphRenderer.hideGroupAnimation) {
            return;
        }
        this.graphRenderer.hideGroupAnimation(index);
    },

    /**
     * Animate component.
     * @param {boolean} [isRerendering] - whether rerendering or not
     */
    animateComponent: function(isRerendering) {
        if (this.graphRenderer.animate && this.seriesSet) {
            this.graphRenderer.animate(snippet.bind(this.animateSeriesLabelArea, this, isRerendering), this.seriesSet);
        } else {
            this.animateSeriesLabelArea(isRerendering);
        }
    },

    /**
     * Fire load event.
     * @param {boolean} [isRerendering] - whether rerendering or not
     * @private
     */
    _fireLoadEvent: function(isRerendering) {
        if (!isRerendering) {
            this.eventBus.fire(chartConst.PUBLIC_EVENT_PREFIX + 'load');
        }
    },

    /**
     * Animate series label area.
     * @param {boolean} [isRerendering] - whether rerendering or not
     */
    animateSeriesLabelArea: function(isRerendering) {
        if (!this._isLabelVisible()) {
            this._fireLoadEvent(isRerendering);

            return;
        }

        if (IS_IE7) {
            this._fireLoadEvent(isRerendering);
            this.labelSet.attr({
                opacity: 1
            });
        } else if (this.labelSet && this.labelSet.length) {
            raphaelRenderUtil.animateOpacity(this.labelSet, 0, 1, LABEL_FADE_IN_DURATION);
        }
    },

    /**
     * Make exportation data for public event of series type.
     * @param {object} seriesData series data
     * @returns {{chartType: string, legend: string, legendIndex: number, index: number}} export data
     * @private
     */
    _makeExportationSeriesData: function(seriesData) {
        var indexes = seriesData.indexes;
        var legendIndex = snippet.isExisty(indexes.legendIndex) ? indexes.legendIndex : indexes.index;
        var legendData = this.dataProcessor.getLegendItem(legendIndex);
        var index = snippet.isExisty(indexes.groupIndex) ? indexes.groupIndex : 0;
        var seriesItem = this._getSeriesDataModel().getSeriesItem(index, indexes.index);
        var result;

        if (snippet.isExisty(seriesItem)) {
            result = {
                chartType: legendData.chartType,
                legend: legendData.label,
                legendIndex: legendIndex
            };
            result.index = seriesItem.index;
        }

        return result;
    },

    /**
     * Execute graph renderer.
     * @param {{left: number, top: number}} position mouse position
     * @param {string} funcName function name
     * @returns {*} result.
     * @private
     */
    _executeGraphRenderer: function(position, funcName) {
        var isShowLabel = false;
        var result;

        this.eventBus.fire('hideTooltipContainer');
        if (this.seriesLabelContainer && dom.hasClass(this.seriesLabelContainer, 'show')) {
            dom.removeClass(this.seriesLabelContainer, 'show');
            isShowLabel = true;
        }

        result = this.graphRenderer[funcName](position);

        if (isShowLabel) {
            dom.addClass(this.seriesLabelContainer, 'show');
        }

        this.eventBus.fire('showTooltipContainer');

        return result;
    },

    /**
     * To call selectSeries callback of public event.
     * @param {object} seriesData - series data
     * @param {?boolean} shouldSelect - whether should select or not
     */
    onSelectSeries: function(seriesData, shouldSelect) {
        var eventName;

        if (seriesData.chartType !== this.chartType) {
            return;
        }

        eventName = chartConst.PUBLIC_EVENT_PREFIX + 'selectSeries';

        this.eventBus.fire(eventName, this._makeExportationSeriesData(seriesData));
        shouldSelect = snippet.isEmpty(shouldSelect) ? true : shouldSelect;

        if (this.options.allowSelect && this.graphRenderer.selectSeries && shouldSelect) {
            this.graphRenderer.selectSeries(seriesData.indexes);
        }
    },

    /**
     * To call unselectSeries callback of public event.
     * @param {object} seriesData series data.
     */
    onUnselectSeries: function(seriesData) {
        var eventName;

        if (seriesData.chartType !== this.chartType) {
            return;
        }

        eventName = chartConst.PUBLIC_EVENT_PREFIX + 'unselectSeries';

        this.eventBus.fire(eventName, this._makeExportationSeriesData(seriesData));
        if (this.options.allowSelect && this.graphRenderer.unselectSeries) {
            this.graphRenderer.unselectSeries(seriesData.indexes);
        }
    },

    /**
     *On select legend.
     * @param {string} seriesType - series name
     * @param {?number} legendIndex - legend index
     */
    onSelectLegend: function(seriesType, legendIndex) {
        if ((this.seriesType !== seriesType) && !snippet.isNull(legendIndex)) {
            legendIndex = -1;
        }

        this.selectedLegendIndex = legendIndex;

        if (this._getSeriesDataModel().getGroupCount()) {
            this.graphRenderer.selectLegend(legendIndex);
        }
    },

    /**
     * Show label.
     */
    showLabel: function() {
        this.options.showLabel = true;

        if (!this.seriesLabelContainer && this.supportSeriesLable) {
            this._renderSeriesLabelArea(this.paper);
        }
    },

    /**
     * Hide label.
     */
    hideLabel: function() {
        this.options.showLabel = false;

        if (this.seriesLabelContainer) {
            dom.removeClass(this.seriesLabelContainer, 'show');
            dom.removeClass(this.seriesLabelContainer, 'opacity');
        }
    },
    /**
     * Return boolean value whether seriesData contains data
     * @param {object} seriesData seriesData object
     * @returns {boolean}
     */
    hasDataForRendering: function(seriesData) {
        return !!(seriesData && seriesData.isAvailable());
    }
});

module.exports = Series;
