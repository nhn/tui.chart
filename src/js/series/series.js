/**
 * @fileoverview Series base component.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var seriesTemplate = require('./seriesTemplate'),
    chartConst = require('../const'),
    predicate = require('../helpers/predicate'),
    dom = require('../helpers/domHandler'),
    renderUtil = require('../helpers/renderUtil'),
    pluginFactory = require('../factories/pluginFactory');

var Series = tui.util.defineClass(/** @lends Series.prototype */ {
    /**
     * Series base component.
     * @constructs Series
     * @param {object} params parameters
     *      @param {object} params.model series model
     *      @param {object} params.options series options
     *      @param {object} params.theme series theme
     */
    init: function(params) {
        var libType;

        tui.util.extend(this, params);
        libType = params.libType || chartConst.DEFAULT_PLUGIN;

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
         * Selected legend index
         * @type {?number}
         */
        this.selectedLegendIndex = null;
    },

    /**
     * Make series data.
     * @returns {object} add data
     */
    makeSeriesData: function() {
        return {};
    },

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
     * Set base data.
     * @param {{
     *      dimension: {width: number, height: number},
     *      position: {left: number, top: number}
     * }} bound series bound
     * @param {object} data data for rendering
     * @private
     */
    _setBaseData: function(bound, data) {
        this.data = tui.util.extend(this.data, data);
        this.bound = bound;
        this.percentValues = this._makePercentValues(this.data, this.options.stacked);
    },

    /**
     * Render series label area
     * @param {{width: number, height: number}} dimension series dimension
     * @param {object} seriesData series data
     * @param {?HTMLElement} seriesLabelContainer series label area element
     * @returns {HTMLElement} series label area element
     * @private
     */
    _renderSeriesLabelArea: function(dimension, seriesData, seriesLabelContainer) {
        var addDataForSeriesLabel = this._makeSeriesDataForSeriesLabel(seriesData, dimension);

        if (!seriesLabelContainer) {
            seriesLabelContainer = dom.create('div', 'tui-chart-series-label-area');
        }

        this._renderSeriesLabel(addDataForSeriesLabel, seriesLabelContainer);
        return seriesLabelContainer;
    },

    /**
     * Render series area.
     * @param {HTMLElement} seriesContainer series area element
     * @param {{
     *      dimension: {width: number, height: number},
     *      position: {left: number, top: number}
     * }} bound series bound
     * @param {object} data data for rendering
     * @param {function} funcRenderGraph function for graph rendering
     * @private
     */
    _renderSeriesArea: function(seriesContainer, bound, data, funcRenderGraph) {
        var expandedBound, seriesData, seriesLabelContainer;

        this._setBaseData(bound, data);

        expandedBound = renderUtil.expandBound(bound);
        this.seriesData = seriesData = this.makeSeriesData(bound);

        renderUtil.renderDimension(seriesContainer, expandedBound.dimension);
        this._renderPosition(seriesContainer, expandedBound.position, this.chartType);
        if (funcRenderGraph) {
            funcRenderGraph(expandedBound.dimension, seriesData);
        }

        seriesLabelContainer = this._renderSeriesLabelArea(expandedBound.dimension, seriesData, this.seriesLabelContainer);

        if (!this.seriesLabelContainer) {
            this.seriesLabelContainer = seriesLabelContainer;
            dom.append(seriesContainer, seriesLabelContainer);
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
        return tui.util.extend({
            dimension: dimension,
            chartType: this.chartType,
            theme: this.theme,
            options: this.options
        }, seriesData);
    },

    /**
     * Render raphael graph.
     * @param {{width: number, height: number}} dimension dimension
     * @param {object} seriesData series data
     * @private
     */
    _renderGraph: function(dimension, seriesData) {
        var params = this._makeParamsForGraphRendering(dimension, seriesData);
        this.graphRenderer.render(this.seriesContainer, params);
    },

    /**
     * Render series component.
     * @param {{
     *      dimension: {width: number, height: number},
     *      position: {left: number, top: number}
     * }} bound series bound
     * @param {object} data data for rendering
     * @returns {HTMLElement} series element
     */
    render: function(bound, data) {
        var el = dom.create('DIV', this.className);

        this.seriesContainer = el;
        this.bound = bound;
        this._renderSeriesArea(el, bound, data, tui.util.bind(this._renderGraph, this));

        return el;
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
     * @param {{
     *      dimension: {width: number, height: number},
     *      position: {left: number, top: number}
     * }} bound series bound
     * @param {object} data data for rendering
     */
    resize: function(bound, data) {
        this._renderSeriesArea(this.seriesContainer, bound, data, tui.util.bind(this._resizeGraph, this));
    },

    /**
     * Make add data for series label.
     * @param {object} seriesData series data
     * @param {{width: number, height: number}} dimension dimension
     * @returns {{
     *      container: HTMLElement,
     *      values: array.<array>,
     *      formattedValues: array.<array>,
     *      formatFunctions: array.<function>,
     *      dimension: {width: number, height: number}
     * }} add data for series label
     * @private
     */
    _makeSeriesDataForSeriesLabel: function(seriesData, dimension) {
        return tui.util.extend({
            values: this.data.values,
            formattedValues: this.data.formattedValues,
            formatFunctions: this.data.formatFunctions,
            dimension: dimension
        }, seriesData);
    },

    /**
     * Render bounds
     * @param {HTMLElement} el series element
     * @param {{top: number, left: number}} position series position
     * @private
     */
    _renderPosition: function(el, position) {
        var hiddenWidth = renderUtil.isOldBrowser() ? chartConst.HIDDEN_WIDTH : 0;

        renderUtil.renderPosition(el, {
            top: position.top - (hiddenWidth * 2),
            left: position.left - hiddenWidth
        });
    },

    /**
     * Make percent value.
     * @param {{values: array, limit: {min: number, max: number}}} data series data
     * @param {string} stacked stacked option
     * @returns {array.<array.<number>>} percent values
     * @private
     */
    _makePercentValues: function(data, stacked) {
        var result;

        if (stacked === chartConst.STACKED_NORMAL_TYPE) {
            result = this._makeNormalStackedPercentValues(data);
        } else if (stacked === chartConst.STACKED_PERCENT_TYPE) {
            result = this._makePercentStackedPercentValues(data);
        } else {
            result = this._makeNormalPercentValues(data);
        }

        return result;
    },

    /**
     * Make percent values about normal stacked option.
     * @param {{values: array, limit: {min: number, max: number}}} data series data
     * @returns {array} percent values about normal stacked option.
     * @private
     */
    _makeNormalStackedPercentValues: function(data) {
        var min = data.limit.min,
            max = data.limit.max,
            distance = max - min,
            percentValues = tui.util.map(data.values, function(values) {
                var plusValues = tui.util.filter(values, function(value) {
                        return value > 0;
                    }),
                    sum = tui.util.sum(plusValues),
                    groupPercent = (sum - min) / distance;
                return tui.util.map(values, function(value) {
                    return value === 0 ? 0 : groupPercent * (value / sum);
                });
            });

        return percentValues;
    },

    /**
     * Make percent values about percent stacked option.
     * @param {{values: array, limit: {min: number, max: number}}} data series data
     * @returns {array} percent values about percent stacked option
     * @private
     */
    _makePercentStackedPercentValues: function(data) {
        var percentValues = tui.util.map(data.values, function(values) {
            var plusValues = tui.util.filter(values, function(value) {
                    return value > 0;
                }),
                sum = tui.util.sum(plusValues);
            return tui.util.map(values, function(value) {
                return value === 0 ? 0 : value / sum;
            });
        });

        return percentValues;
    },

    /**
     * Make normal percent value.
     * @param {{values: array, limit: {min: number, max: number}}} data series data
     * @returns {array.<array.<number>>} percent values
     * @private
     */
    _makeNormalPercentValues: function(data) {
        var min = data.limit.min,
            max = data.limit.max,
            distance = max - min,
            isLineTypeChart = predicate.isLineTypeChart(this.chartType),
            flag = 1,
            subValue = 0,
            percentValues;

        if (!isLineTypeChart && min < 0 && max <= 0) {
            flag = -1;
            subValue = max;
            distance = min - max;
        } else if (isLineTypeChart || min >= 0) {
            subValue = min;
        }

        percentValues = tui.util.map(data.values, function(values) {
            return tui.util.map(values, function(value) {
                return (value - subValue) * flag / distance;
            });
        });

        return percentValues;
    },

    /**
     * Get limit distance from zero point.
     * @param {number} size chart size (width or height)
     * @param {{min: number, max: number}} limit limit
     * @returns {{toMax: number, toMin: number}} pixel distance
     */
    getLimitDistanceFromZeroPoint: function(size, limit) {
        var min = limit.min,
            max = limit.max,
            distance = max - min,
            toMax = 0,
            toMin = 0;

        if (min < 0 && max > 0) {
            toMax = (distance + min) / distance * size;
            toMin = (distance - max) / distance * size;
        }

        return {
            toMax: toMax,
            toMin: toMin
        };
    },

    /**
     * Make label bound.
     * @param {number} clientX clientX
     * @param {number} clientY clientY
     * @returns {{left: number, top: number}} bound
     * @private
     */
    _makeLabelBound: function(clientX, clientY) {
        return {
            left: clientX - this.bound.position.left,
            top: clientY - this.bound.position.top
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
        if (!this.graphRenderer.hideAnimation) {
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
     */
    animateComponent: function() {
        if (this.graphRenderer.animate) {
            this.graphRenderer.animate(tui.util.bind(this.animateShowingAboutSeriesLabelArea, this));
        }
    },

    _makeOpacityCssText: function(opacity) {
        var funcMakeOpacityCssText;
        if (renderUtil.isOldBrowser()) {
            funcMakeOpacityCssText = function(_opacity) {
                return ';filter: alpha(opacity=' + (_opacity * 100) + ')';
            };
        } else {
            funcMakeOpacityCssText = function(_opacity) {
                return ';opacity: ' + _opacity;
            };
        }
        this._makeOpacityCssText = funcMakeOpacityCssText;
        return funcMakeOpacityCssText(opacity);
    },

    /**
     * Make html about series label.
     * @param {{left: number, top: number}} position position
     * @param {string} value value
     * @param {number} groupIndex group index
     * @param {number} index index
     * @returns {string} html string
     */
    makeSeriesLabelHtml: function(position, value, groupIndex, index) {
        var cssObj = tui.util.extend(position, this.theme.label);
        if (!tui.util.isNull(this.selectedLegendIndex) && this.selectedLegendIndex !== index) {
            cssObj.opacity = this._makeOpacityCssText(0.3);
        } else {
            cssObj.opacity = '';
        }
        return seriesTemplate.tplSeriesLabel({
            cssText: seriesTemplate.tplCssText(cssObj),
            value: value,
            groupIndex: groupIndex,
            index: index
        });
    },

    /**
     * Animate showing about series label area.
     */
    animateShowingAboutSeriesLabelArea: function() {
        if ((!this.options.showLabel && !this.legendAlign) || !this.seriesLabelContainer) {
            return;
        }

        dom.addClass(this.seriesLabelContainer, 'show');

        (new tui.component.Effects.Fade({
            element: this.seriesLabelContainer,
            duration: 300
        })).action({
            start: 0,
            end: 1,
            complete: function() {}
        });
    },

    /**
     * Make exportation data for series type userEvent.
     * @param {object} seriesData series data
     * @returns {{chartType: string, legend: string, legendIndex: number, index: number}} export data
     * @private
     */
    _makeExportationSeriesData: function(seriesData) {
        var legendIndex = seriesData.indexes.index,
            legendData = this.data.joinLegendLabels[legendIndex];

        return {
            chartType: legendData.chartType,
            legend: legendData.label,
            legendIndex: legendIndex,
            index: seriesData.indexes.groupIndex
        };
    },

    /**
     * To call selectSeries callback of userEvent.
     * @param {object} seriesData series data
     */
    onSelectSeries: function(seriesData) {
        this.userEvent.fire('selectSeries', this._makeExportationSeriesData(seriesData));
        if (this.options.hasSelection) {
            this.graphRenderer.selectSeries(seriesData.indexes);
        }
    },

    /**
     * To call unselectSeries callback of userEvent.
     * @param {object} seriesData series data.
     */
    onUnselectSeries: function(seriesData) {
        this.userEvent.fire('unselectSeries', this._makeExportationSeriesData(seriesData));
        if (this.options.hasSelection) {
            this.graphRenderer.unselectSeries(seriesData.indexes);
        }
    },

    /**
     *On select legend.
     * @param {string} chartType chart type
     * @param {?number} legendIndex legend index
     */
    onSelectLegend: function(chartType, legendIndex) {
        if (this.chartType !== chartType && !tui.util.isNull(legendIndex)) {
            legendIndex = -1;
        }

        this.selectedLegendIndex = legendIndex;
        this._renderSeriesArea(this.seriesContainer, this.bound, this.data);
        this.graphRenderer.selectLegend(legendIndex);
    }
});

module.exports = Series;
