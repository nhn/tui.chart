/**
 * @fileoverview Series base component.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var seriesTemplate = require('./seriesTemplate.js'),
    chartConst = require('../const.js'),
    dom = require('../helpers/domHandler.js'),
    renderUtil = require('../helpers/renderUtil.js'),
    event = require('../helpers/eventListener.js'),
    pluginFactory = require('../factories/pluginFactory.js');

var HIDDEN_WIDTH = 1,
    SERIES_LABEL_CLASS_NAME = 'ne-chart-series-label';

var Series = ne.util.defineClass(/** @lends Series.prototype */ {
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

        ne.util.extend(this, params);
        libType = params.libType || chartConst.DEFAULT_PLUGIN;
        this.percentValues = this._makePercentValues(params.data, params.options.stacked);
        /**
         * Graph renderer
         * @type {object}
         */
        this.graphRenderer = pluginFactory.get(libType, params.chartType);

        /**
         * Series view className
         * @type {string}
         */
        this.className = 'ne-chart-series-area';
    },

    /**
     * Show tooltip (mouseover callback).
     * @param {object} params parameters
     *      @param {string} params.prefix tooltip id prefix
     *      @param {boolean} params.allowNegativeTooltip whether allow negative tooltip or not
     * @param {{top:number, left: number, width: number, height: number}} bound graph bound information
     * @param {string} id tooltip id
     */
    showTooltip: function(params, bound, id) {
        this.fire('showTooltip', ne.util.extend({
            id: params.prefix + id,
            bound: bound
        }, params));
    },

    /**
     * Hide tooltip (mouseout callback).
     * @param {string} prefix tooltip id prefix
     * @param {string} id tooltip id
     */
    hideTooltip: function(prefix, id) {
        this.fire('hideTooltip', {
            id: prefix + id
        });
    },

    /**
     * Render series.
     * @param {object} paper object for graph drawing
     * @returns {HTMLElement} series element
     */
    render: function(paper) {
        var el = dom.create('DIV', this.className),
            tooltipPrefix = this.tooltipPrefix,
            bound = this.bound,
            dimension = bound.dimension,
            inCallback = ne.util.bind(this.showTooltip, this, {
                prefix: tooltipPrefix,
                allowNegativeTooltip: !!this.allowNegativeTooltip,
                chartType: this.chartType
            }),
            outCallback = ne.util.bind(this.hideTooltip, this, tooltipPrefix),
            data = {
                dimension: dimension,
                theme: this.theme,
                options: this.options
            },
            addData = this.makeAddData();

        if (!paper) {
            renderUtil.renderDimension(el, dimension);
        }

        this._renderPosition(el, bound.position, this.chartType);

        data = ne.util.extend(data, addData);

        if (this.options.showLegend && this._renderLegend) {
            this.elSeriesLabelArea = this._renderLegend(ne.util.extend({
                container: el,
                legendLabels: this.data.legendLabels,
                options: {
                    showLegend: this.options.showLegend,
                    showLabel: this.options.showLabel
                }
            },addData));
        } else if (this.options.showLabel && this._renderSeriesLabel) {
            this.elSeriesLabelArea = this._renderSeriesLabel(ne.util.extend({
                container: el,
                values: this.data.values,
                formattedValues: this.data.formattedValues,
                formatFunctions: this.data.formatFunctions,
                dimension: dimension
            }, addData));
        }

        this.paper = this.graphRenderer.render(paper, el, data, inCallback, outCallback);
        this.attachEvent(el);

        // series label mouse event 동작 시 사용
        this.inCallback = inCallback;
        this.outCallback = outCallback;

        return el;
    },

    /**
     * To make add data.
     * @returns {object} add data
     */
    makeAddData: function() {
        return {};
    },

    /**
     * Render bounds
     * @param {HTMLElement} el series element
     * @param {{width: number, height: number}} dimension series dimension
     * @param {{top: number, left: number}} position series position
     * @private
     */
    _renderPosition: function(el, position, chartType) {
        var hiddenWidth = renderUtil.isIE8() ? 0 : HIDDEN_WIDTH;
        position.top = position.top - HIDDEN_WIDTH;
        position.left = position.left + (chartType === chartConst.CHART_TYPE_BAR ? hiddenWidth : HIDDEN_WIDTH * 2);
        renderUtil.renderPosition(el, position);
    },

    /**
     * Get paper.
     * @returns {object} object for graph drawing
     */
    getPaper: function() {
        return this.paper;
    },

    /**
     * To make percent value.
     * @param {{values: array, scale: {min: number, max: number}}} data series data
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
     * To make percent values about normal stacked option.
     * @param {{values: array, scale: {min: number, max: number}}} data series data
     * @returns {array} percent values about normal stacked option.
     * @private
     */
    _makeNormalStackedPercentValues: function(data) {
        var min = data.scale.min,
            max = data.scale.max,
            distance = max - min,
            percentValues = ne.util.map(data.values, function(values) {
                var plusValues = ne.util.filter(values, function(value) {
                        return value > 0;
                    }),
                    sum = ne.util.sum(plusValues),
                    groupPercent = (sum - min) / distance;
                return ne.util.map(values, function(value) {
                    return groupPercent * (value / sum);
                });
            });
        return percentValues;
    },

    /**
     * To make percent values about percent stacked option.
     * @param {{values: array, scale: {min: number, max: number}}} data series data
     * @returns {array} percent values about percent stacked option
     * @private
     */
    _makePercentStackedPercentValues: function(data) {
        var percentValues = ne.util.map(data.values, function(values) {
            var plusValues = ne.util.filter(values, function(value) {
                    return value > 0;
                }),
                sum = ne.util.sum(plusValues);
            return ne.util.map(values, function(value) {
                return value / sum;
            });
        });
        return percentValues;
    },

    /**
     * To make normal percent value.
     * @param {{values: array, scale: {min: number, max: number}}} data series data
     * @returns {array.<array.<number>>} percent values
     * @private
     */
    _makeNormalPercentValues: function(data) {
        var min = data.scale.min,
            max = data.scale.max,
            distance = max - min,
            flag = 1,
            subValue = 0,
            percentValues;

        if (this.chartType !== chartConst.CHART_TYPE_LINE && min < 0 && max <= 0) {
            flag = -1;
            subValue = max;
            distance = min - max;
        } else if (this.chartType === chartConst.CHART_TYPE_LINE || min >= 0) {
            subValue = min;
        }

        percentValues = ne.util.map(data.values, function(values) {
            return ne.util.map(values, function(value) {
                return (value - subValue) * flag / distance;
            });
        });
        return percentValues;
    },

    /**
     * Get scale distance from zero point.
     * @param {number} size chart size (width or height)
     * @param {{min: number, max: number}} scale scale
     * @returns {{toMax: number, toMin: number}} pixel distance
     */
    getScaleDistanceFromZeroPoint: function(size, scale) {
        var min = scale.min,
            max = scale.max,
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
     * On mouseover event handler for series area
     * @param {MouseEvent} e mouse event
     */
    onMouseover: function(e) {
        var elTarget = e.target || e.srcElement,
            groupIndex, index, bound;

        if (elTarget.className !== SERIES_LABEL_CLASS_NAME) {
            return;
        }

        groupIndex = elTarget.getAttribute('data-group-index');
        index = elTarget.getAttribute('data-index');
        if (groupIndex === '-1' || index === '-1') {
            return;
        }
        this.inCallback(this._getBound(groupIndex, index), groupIndex + '-' + index);
    },

    /**
     * On mouseout event handler for series area
     * @param {MouseEvent} e mouse event
     */
    onMouseout: function(e) {
        var elTarget = e.target || e.srcElement,
            groupIndex, index;

        if (elTarget.className !== SERIES_LABEL_CLASS_NAME) {
            return;
        }

        groupIndex = elTarget.getAttribute('data-group-index');
        index = elTarget.getAttribute('data-index');

        if (groupIndex === '-1' || index === '-1') {
            return;
        }

        this.outCallback(groupIndex + '-' + index);
    },

    /**
     * Attach event
     * @param {HTMLElement} el target element
     */
    attachEvent: function(el) {
        event.bindEvent('mouseover', el, ne.util.bind(this.onMouseover, this));
        event.bindEvent('mouseout', el, ne.util.bind(this.onMouseout, this));
    },

    /**
     * Call showDot function of graphRenderer.
     * @param {{groupIndex: number, index: number}} data data
     */
    onShowAnimation: function(data) {
        if (!this.graphRenderer.showAnimation) {
            return;
        }
        this.graphRenderer.showAnimation.call(this.graphRenderer, data);
    },

    /**
     * Call hideDot function of graphRenderer.
     * @param {{groupIndex: number, index: number}} data data
     */
    onHideAnimation: function(data) {
        if (!this.graphRenderer.hideAnimation) {
            return;
        }
        this.graphRenderer.hideAnimation.call(this.graphRenderer, data);
    },

    /**
     * Animate component
     */
    animateComponent: function() {
        if (this.graphRenderer.animate) {
            this.graphRenderer.animate(ne.util.bind(this.showSeriesLabelArea, this));
        }
    },

    /**
     * To make html about series label
     * @param {left: number, top: number} position position
     * @param {string} value value
     * @param {number} groupIndex group index
     * @param {number} index index
     * @returns {string} html string
     * @private
     */
    _makeSeriesLabelHtml: function(position, value, groupIndex, index) {
        var cssText = renderUtil.concatStr('left:', position.left, 'px;',
            'top:', position.top, 'px');
        return seriesTemplate.TPL_SERIES_LABEL({
            cssText: cssText,
            value: value,
            groupIndex: groupIndex,
            index: index
        });
    },

    /**
     * Show series label area.
     */
    showSeriesLabelArea: function() {
        if ((!this.options.showLabel && !this.options.showLegend) || !this.elSeriesLabelArea) {
            return;
        }

        dom.addClass(this.elSeriesLabelArea, 'show');

        (new ne.component.Effects.Fade({
            element: this.elSeriesLabelArea,
            duration: 300
        })).action({
            start: 0,
            end: 1,
            complete: function() {}
        });
    }
});

ne.util.CustomEvents.mixin(Series);

module.exports = Series;
