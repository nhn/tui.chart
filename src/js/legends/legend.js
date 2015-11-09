/**
 * @fileoverview  Legend component.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var chartConst = require('../const'),
    dom = require('../helpers/domHandler'),
    event = require('../helpers/eventListener'),
    renderUtil = require('../helpers/renderUtil'),
    defaultTheme = require('../themes/defaultTheme'),
    legendTemplate = require('./../legends/legendTemplate');

var concat = Array.prototype.concat;

var Legend = tui.util.defineClass(/** @lends Legend.prototype */ {
    /**
     * Legend component.
     * @constructs Legend
     * @param {object} params parameters
     *      @param {number} params.legendLabels legend labels
     *      @param {object} params.bound axis bound
     *      @param {object} params.theme axis theme
     */
    init: function(params) {
        tui.util.extend(this, params);
        /**
         * Legend view className
         */
        this.className = 'tui-chart-legend-area';
    },

    /**
     * Render legend.
     * @param {{dimension: {width: number, height: number}, position: {left: number, top: number}}} bound lengend bound
     * @returns {HTMLElement} legend element
     */
    render: function(bound) {
        var el = dom.create('DIV', this.className),
            legendData = this._makeLegendData();
        this.bound = bound;
        el.innerHTML = this._makeLegendHtml(legendData);
        renderUtil.renderPosition(el, bound.position);
        this._renderLabelTheme(el, this.theme.label);
        this._attachEvent(el);

        this.legendData = legendData;
        return el;
    },

    /**
     * Set theme for legend labels
     * @param {array.<object>} labels labels
     * @param {object} theme legend theme
     * @returns {array.<object>} labels
     * @private
     */
    _setThemeForLabels: function(labels, theme) {
        var result;
        result = tui.util.map(labels, function(item, index) {
            var itemTheme = {
                color: theme.colors[index]
            };

            if (theme.singleColors) {
                itemTheme.singleColor = theme.singleColors[index];
            }
            if (theme.borderColor) {
                itemTheme.borderColor = theme.borderColor;
            }
            item.theme = itemTheme;
            item.index = index;
            return item;
        }, this);

        return result;
    },

    /**
     * To make legend labels.
     * @returns {array.<object>} legend labels.
     * @private
     */
    _makeLegendData: function() {
        var joinLegendLabels = this.joinLegendLabels,
            theme = this.theme,
            defaultLegendTheme = {
                colors: defaultTheme.series.colors
            },
            startIndex, result;

        if (!this.seriesChartTypes) {
            result = this._setThemeForLabels(joinLegendLabels, theme);
        } else {
            startIndex = 0;
            result = concat.apply([], tui.util.map(this.seriesChartTypes, function(chartType) {
                var chartTheme = theme[chartType] || defaultLegendTheme,
                    endIndex = startIndex + this.legendLabels[chartType].length,
                    data = this._setThemeForLabels(joinLegendLabels.slice(startIndex, endIndex), chartTheme);
                startIndex = endIndex;
                return data;
            }, this));
        }
        return result;
    },

    /**
     * To make legend html.
     * @param {array} legendData legend data
     * @returns {string} legend html
     * @private
     */
    _makeLegendHtml: function(legendData) {
        var template = legendTemplate.tplLegend,
            labelHeight = renderUtil.getRenderedLabelHeight(legendData[0].label, legendData[0].theme),
            height = labelHeight + (chartConst.LABEL_PADDING_TOP * 2),
            baseMarginTop = parseInt((height - chartConst.LEGEND_RECT_WIDTH) / 2, 10) - 1,
            html = tui.util.map(legendData, function(legendInfo, index) {
                var borderCssText = legendInfo.borderColor ? renderUtil.concatStr(';border:1px solid ', legendInfo.borderColor) : '',
                    rectMargin, marginTop, data;
                if (legendInfo.chartType === 'line') {
                    marginTop = baseMarginTop + chartConst.LINE_MARGIN_TOP;
                } else {
                    marginTop = baseMarginTop;
                }
                rectMargin = renderUtil.concatStr(';margin-top:', marginTop, 'px');

                data = {
                    cssText: renderUtil.concatStr('background-color:', legendInfo.theme.singleColor || legendInfo.theme.color, borderCssText, rectMargin),
                    height: height,
                    labelHeight: labelHeight,
                    chartType: legendInfo.chartType || 'rect',
                    label: legendInfo.label,
                    index: index
                };
                return template(data);
            }, this).join('');
        return html;
    },

    /**
     * Render css style of label area.
     * @param {HTMLElement} el label area element
     * @param {{fontSize:number, fontFamily: string, color: string}} theme label theme
     * @private
     */
    _renderLabelTheme: function(el, theme) {
        var cssText = renderUtil.makeFontCssText(theme);
        el.style.cssText += ';' + cssText;
    },

    /**
     * Find legend element.
     * @param {HTMLElement} elTarget target element
     * @returns {HTMLElement} legend element
     * @private
     */
    _findLegendElement: function(elTarget) {
        var elLegend;

        if (dom.hasClass(elTarget, chartConst.CLASS_NAME_LEGEND)) {
            elLegend = elTarget;
        } else {
            elLegend = dom.findParentByClass(elTarget, chartConst.CLASS_NAME_LEGEND);
        }

        return elLegend;
    },

    /**
     * Select legend.
     * @param {number} index index
     * @private
     */
    _selectLegend: function(index) {
        var data = this.legendData[index];
        this.userEvent.fire('clickLegend', {
            legend: data.label,
            chartType: data.chartType,
            index: data.index
        });
    },

    /**
     * On click event handler.
     * @param {MouseEvent} e mouse event
     * @private
     */
    _onClick: function(e) {
        var elTarget = e.target || e.srcElement,
            elLegend = this._findLegendElement(elTarget),
            index;

        if (!elLegend) {
            return;
        }

        index = parseInt(elLegend.getAttribute('data-index'), 0);
        this._selectLegend(index);
    },

    /**
     * Attach browser event.
     * @param {HTMLElement} el target element
     * @private
     */
    _attachEvent: function(el) {
        event.bindEvent('click', el, tui.util.bind(this._onClick, this));
    }
});

module.exports = Legend;
