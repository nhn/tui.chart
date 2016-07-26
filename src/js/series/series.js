/**
 * @fileoverview Series base component.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var labelHelper = require('./renderingLabelHelper');
var chartConst = require('../const');
var dom = require('../helpers/domHandler');
var predicate = require('../helpers/predicate');
var renderUtil = require('../helpers/renderUtil');
var pluginFactory = require('../factories/pluginFactory');

var Series = tui.util.defineClass(/** @lends Series.prototype */ {
    /**
     * Series base component.
     * @constructs Series
     * @param {object} params parameters
     *      @param {object} params.options series options
     *      @param {object} params.theme series theme
     */
    init: function(params) {
        var libType = params.libType || chartConst.DEFAULT_PLUGIN;

        /**
         * Chart type
         * @type {string}
         */
        this.chartType = params.chartType;

        /**
         * Series name
         * @tpye {string}
         */
        this.seriesName = params.seriesName || params.chartType;

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
         * Bounds maker
         * @type {BoundsMaker}
         */
        this.boundsMaker = params.boundsMaker;

        /**
         * User event listener
         * @type {UserEventListener}
         */
        this.userEvent = params.userEvent;

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
         * whether chart has axes or not
         * @type {boolean}
         */
        this.hasAxes = !!params.hasAxes;

        /**
         * Graph renderer
         * @type {object}
         */
        this.graphRenderer = pluginFactory.get(libType, params.chartType);

        /**
         * Series view className
         * @type {string}
         */
        this.className = 'tui-chart-series-area';

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
    },

    /**
     * Get seriesDataModel.
     * @returns {SeriesDataModel}
     * @private
     */
    _getSeriesDataModel: function() {
        return this.dataProcessor.getSeriesDataModel(this.seriesName);
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
     * @param {?HTMLElement} seriesLabelContainer series label area element
     * @returns {HTMLElement} series label area element
     * @private
     */
    _renderSeriesLabelArea: function(seriesLabelContainer) {
        var extendedDimension;

        if (!seriesLabelContainer) {
            seriesLabelContainer = dom.create('div', 'tui-chart-series-label-area');
            if (!predicate.isMousePositionChart(this.chartType)) {
                extendedDimension = this.boundsMaker.getDimension('extendedSeries');
                renderUtil.renderDimension(seriesLabelContainer, extendedDimension);
            }
        }

        this._renderSeriesLabel(seriesLabelContainer);

        return seriesLabelContainer;
    },

    /**
     * Render series area.
     * @param {HTMLElement} seriesContainer series area element
     * @param {object} data data for rendering
     * @param {function} funcRenderGraph function for graph rendering
     * @returns {object}
     * @private
     */
    _renderSeriesArea: function(seriesContainer, data, funcRenderGraph) {
        var extendedBound = this.boundsMaker.getBound('extendedSeries');
        var seriesData, seriesLabelContainer, paper;

        this.data = data;

        this.seriesData = seriesData = this._makeSeriesData();

        if (!data.paper) {
            renderUtil.renderDimension(seriesContainer, extendedBound.dimension);
        }
        this._renderPosition(seriesContainer, extendedBound.position);

        if (funcRenderGraph) {
            paper = funcRenderGraph(extendedBound.dimension, seriesData, data.paper);
        }

        if (predicate.isShowLabel(this.options)) {
            seriesLabelContainer = this._renderSeriesLabelArea(this.seriesLabelContainer);
            this.seriesLabelContainer = seriesLabelContainer;
            dom.append(seriesContainer, seriesLabelContainer);
        }

        return paper;
    },

    /**
     * Make parameters for graph rendering.
     * @param {{width: number, height: number}} dimension dimension
     * @param {object} seriesData series data
     * @returns {object} parameters for graph rendering
     * @private
     */
    _makeParamsForGraphRendering: function(dimension, seriesData) {
        return tui.util.extend({
            dimension: dimension,
            chartType: this.seriesName,
            theme: this.theme,
            options: this.options
        }, seriesData);
    },

    /**
     * Render raphael graph.
     * @param {{width: number, height: number}} dimension - dimension
     * @param {object} seriesData - series data
     * @param {object} [paper] - raphael paper
     * @retruns {object}
     * @private
     */
    _renderGraph: function(dimension, seriesData, paper) {
        var params = this._makeParamsForGraphRendering(dimension, seriesData);

        paper = this.graphRenderer.render(this.seriesContainer, params, paper);

        return paper;
    },

    /**
     * Render series component.
     * @param {object} data data for rendering
     * @returns {HTMLElement} series element
     */
    render: function(data) {
        var container = dom.create('DIV', this.className);
        var paper;

        this.seriesContainer = container;
        paper = this._renderSeriesArea(container, data, tui.util.bind(this._renderGraph, this));

        return {
            container: container,
            paper: paper
        };
    },

    /**
     * Update theme.
     * @param {object} theme legend theme
     * @param {?Array.<?boolean>} checkedLegends checked legends
     * @returns {object} updated theme
     * @private
     */
    _updateTheme: function(theme, checkedLegends) {
        var cloneTheme;

        if (!checkedLegends.length) {
            return theme;
        }

        cloneTheme = JSON.parse(JSON.stringify(theme));
        cloneTheme.colors = tui.util.filter(cloneTheme.colors, function(color, index) {
            return checkedLegends[index];
        });

        return cloneTheme;
    },

    /**
     * Clear container.
     * @private
     */
    _clearContainer: function() {
        if (this.graphRenderer.clear) {
            this.graphRenderer.clear();
        }

        this.seriesContainer.innerHTML = '';
        this.seriesLabelContainer = null;
        this.seriesData = [];
    },

    /**
     * Rerender.
     * @param {object} data data for rendering
     * @returns {{container: HTMLElement, paper: object}}
     */
    rerender: function(data) {
        var paper;

        this._clearContainer();

        if (this.dataProcessor.getGroupCount(this.seriesName)) {
            if (data.checkedLegends) {
                this.theme = this._updateTheme(this.orgTheme, data.checkedLegends);
            }

            paper = this._renderSeriesArea(this.seriesContainer, data, tui.util.bind(this._renderGraph, this));

            if (this.labelShowEffector) {
                clearInterval(this.labelShowEffector.timerId);
            }

            if (data.checkedLegends) {
                this.animateComponent(true);
            } else {
                this._showGraphWithoutAnimation();
            }

            if (!tui.util.isNull(this.selectedLegendIndex)) {
                this.graphRenderer.selectLegend(this.selectedLegendIndex);
            }
        }

        return {
            container: this.seriesContainer,
            paper: paper
        };
    },

    /**
     * Whether use label or not.
     * @returns {boolean}
     * @private
     */
    _useLabel: function() {
        return this.seriesLabelContainer && (this.options.showLabel || this.options.showLegend);
    },

    /**
     * Show series label without animation.
     * @private
     */
    _showSeriesLabelWithoutAnimation: function() {
        dom.addClass(this.seriesLabelContainer, 'show');
        this.seriesLabelContainer.style.filter = '';
        this.seriesLabelContainer.style.opacity = 1;
    },

    /**
     * Show graph without animation.
     * @private
     */
    _showGraphWithoutAnimation: function() {
        this.graphRenderer.showGraph();

        if (this._useLabel()) {
            this._showSeriesLabelWithoutAnimation();
        }
    },

    /**
     * Resize raphael graph.
     * @param {{width: number, height: number}} dimension dimension
     * @param {object} seriesData series data
     * @private
     */
    _resizeGraph: function(dimension, seriesData) {
        this.graphRenderer.resize(tui.util.extend({
            dimension: dimension
        }, seriesData));
    },

    /**
     * Resize series component.
     * }} bound series bound
     * @param {object} data data for rendering
     */
    resize: function(data) {
        this._renderSeriesArea(this.seriesContainer, data, tui.util.bind(this._resizeGraph, this));
    },

    /**
     * Render bounds
     * @param {HTMLElement} el series element
     * @param {{top: number, left: number}} position series position
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
     */
    onShowAnimation: function(data) {
        if (!this.graphRenderer.showAnimation) {
            return;
        }
        this.graphRenderer.showAnimation(data);
    },

    /**
     * To call hideAnimation function of graphRenderer.
     * @param {{groupIndex: number, index: number}} data data
     */
    onHideAnimation: function(data) {
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
        if (this.graphRenderer.animate) {
            this.graphRenderer.animate(tui.util.bind(this.animateSeriesLabelArea, this, isRerendering));
        } else {
            this.animateSeriesLabelArea(isRerendering);
        }
    },

    /**
     * Make html about series label.
     * @param {{left: number, top: number}} position - position for rendering
     * @param {string} label - label of SeriesItem
     * @param {number} index - index of legend
     * @param {object} [tplCssText] - cssText template object
     * @param {boolean} [isStart] - whether start label or not
     * @returns {string}
     * @private
     */
    _makeSeriesLabelHtml: function(position, label, index, tplCssText, isStart) {
        var labelTheme = this.theme.label;
        var selectedIndex = this.selectedLegendIndex;

        return labelHelper.makeSeriesLabelHtml(position, label, labelTheme, index, selectedIndex, tplCssText, isStart);
    },

    /**
     * Fire load event.
     * @param {boolean} [isRerendering] - whether rerendering or not
     * @private
     */
    _fireLoadEvent: function(isRerendering) {
        if (!isRerendering) {
            this.userEvent.fire('load');
        }
    },

    /**
     * Animate series label area.
     * @param {boolean} [isRerendering] - whether rerendering or not
     */
    animateSeriesLabelArea: function(isRerendering) {
        var self = this;

        if (!this._useLabel()) {
            this._fireLoadEvent(isRerendering);
            return;
        }

        dom.addClass(this.seriesLabelContainer, 'show');

        if (renderUtil.isIE7()) {
            this.seriesLabelContainer.style.filter = '';
            this._fireLoadEvent(isRerendering);
        } else {
            this.labelShowEffector = new tui.component.Effects.Fade({
                element: this.seriesLabelContainer,
                duration: 300
            });
            this.labelShowEffector.action({
                start: 0,
                end: 1,
                complete: function() {
                    if (self.labelShowEffector) {
                        clearInterval(self.labelShowEffector.timerId);
                    }
                    self.labelShowEffector = null;
                    self._fireLoadEvent(isRerendering);
                }
            });
        }
    },

    /**
     * Make exportation data for series type userEvent.
     * @param {object} seriesData series data
     * @returns {{chartType: string, legend: string, legendIndex: number, index: number}} export data
     * @private
     */
    _makeExportationSeriesData: function(seriesData) {
        var legendIndex = seriesData.indexes.index;
        var legendData = this.dataProcessor.getLegendItem(legendIndex);

        return {
            chartType: legendData.chartType,
            legend: legendData.label,
            legendIndex: legendIndex,
            index: seriesData.indexes.groupIndex
        };
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

        this.fire('hideTooltipContainer');

        if (this.seriesLabelContainer && dom.hasClass(this.seriesLabelContainer, 'show')) {
            dom.removeClass(this.seriesLabelContainer, 'show');
            isShowLabel = true;
        }

        result = this.graphRenderer[funcName](position);

        if (isShowLabel) {
            dom.addClass(this.seriesLabelContainer, 'show');
        }

        this.fire('showTooltipContainer');

        return result;
    },

    /**
     * To call selectSeries callback of userEvent.
     * @param {object} seriesData series data
     */
    onSelectSeries: function(seriesData) {
        this.userEvent.fire('selectSeries', this._makeExportationSeriesData(seriesData));
        if (this.options.allowSelect && this.graphRenderer.selectSeries) {
            this.graphRenderer.selectSeries(seriesData.indexes);
        }
    },

    /**
     * To call unselectSeries callback of userEvent.
     * @param {object} seriesData series data.
     */
    onUnselectSeries: function(seriesData) {
        this.userEvent.fire('unselectSeries', this._makeExportationSeriesData(seriesData));
        if (this.options.allowSelect && this.graphRenderer.unselectSeries) {
            this.graphRenderer.unselectSeries(seriesData.indexes);
        }
    },

    /**
     *On select legend.
     * @param {string} seriesName - series name
     * @param {?number} legendIndex - legend index
     */
    onSelectLegend: function(seriesName, legendIndex) {
        if ((this.seriesName !== seriesName) && !tui.util.isNull(legendIndex)) {
            legendIndex = -1;
        }

        this.selectedLegendIndex = legendIndex;

        if (this._getSeriesDataModel().getGroupCount()) {
            this._renderSeriesArea(this.seriesContainer, this.data);
            this.graphRenderer.selectLegend(legendIndex);
        }
    },

    /**
     * Show label.
     */
    showLabel: function() {
        this.options.showLabel = true;
        dom.addClass(this.seriesLabelContainer, 'show opacity');
    },

    /**
     * Hide label.
     */
    hideLabel: function() {
        this.options.showLabel = false;
        dom.removeClass(this.seriesLabelContainer, 'show');
    }
});

module.exports = Series;
