/**
 * @fileoverview  Legend component.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var chartConst = require('../const'),
    dom = require('../helpers/domHandler'),
    eventListener = require('../helpers/eventListener'),
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

        /**
         * Selected legend index.
         * @type {?number}
         */
        this.selectedIndex = null;
    },

    /**
     * To render legend area.
     * @param {HTMLElement} legendContainer legend area element
     * @param {{dimension: {width: number, height: number}, position: {left: number, top: number}}} bound lengend bound
     * @private
     */
    _renderLegendArea: function(legendContainer, bound) {
        var legendData;
        this.bound = bound;
        this.legendData = legendData = this._makeLegendData(this.joinLegendLabels, this.theme, this.chartTypes, this.legendLabels);
        legendContainer.innerHTML = this._makeLegendHtml(legendData);
        renderUtil.renderPosition(legendContainer, bound.position);
        this._renderLabelTheme(legendContainer, this.theme.label);
    },

    /**
     * To render legend component.
     * @param {{dimension: {width: number, height: number}, position: {left: number, top: number}}} bound lengend bound
     * @returns {HTMLElement} legend element
     */
    render: function(bound) {
        var el = dom.create('DIV', this.className);
        this._renderLegendArea(el, bound);
        this._attachEvent(el);
        this.legendContainer = el;
        return el;
    },

    /**
     * To resize legend component.
     * @param {{dimension: {width: number, height: number}, position: {left: number, top: number}}} bound lengend bound
     */
    resize: function(bound) {
        this._renderLegendArea(this.legendContainer, bound);
    },

    /**
     * To make label info that applied theme.
     * @param {array.<object>} labelInfo labels
     * @param {{colors: array.<number>, singleColor: ?string, bordercolor: ?string}} theme legend theme
     * @returns {array.<object>} labels
     * @private
     */
    _makeLabelInfoAppliedTheme: function(labelInfo, theme) {
        return tui.util.map(labelInfo, function(item, index) {
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
    },

    /**
     * To make legend labels.
     * @param {array.<object>} labelInfos label infos
     * @param {{colors: array.<number>, singleColor: ?string, borderColor: ?string}} theme legend theme
     * @param {?array.<string>} chartTypes chart types
     * @param {{column: ?array.<string>, line: ?array.<string>}} labelMap label map
     * @returns {array.<{theme: {object}, index: number}>} legend labels.
     * @private
     */
    _makeLegendData: function(labelInfos, theme, chartTypes, labelMap) {
        var legendData, startIndex, defaultLegendTheme;

        if (!chartTypes) {
            legendData = this._makeLabelInfoAppliedTheme(labelInfos, theme);
        } else {
            startIndex = 0;
            defaultLegendTheme = {
                colors: defaultTheme.series.colors
            };
            legendData = concat.apply([], tui.util.map(chartTypes, function(chartType) {
                var chartTheme = theme[chartType] || defaultLegendTheme,
                    endIndex = startIndex + labelMap[chartType].length,
                    data = this._makeLabelInfoAppliedTheme(labelInfos.slice(startIndex, endIndex), chartTheme);
                startIndex = endIndex;
                return data;
            }, this));
        }
        return legendData;
    },

    /**
     * To make cssText of legend rect.
     * @param {{
     *      chartType: string,
     *      theme: {color: string, borderColor: ?string, singleColor: ?string}
     * }} legendInfo legend info
     * @param {number} baseMarginTop base margin-top
     * @returns {string} cssText of legend rect
     * @private
     */
    _makeLegendRectCssText: function(legendInfo, baseMarginTop) {
        var theme = legendInfo.theme,
            borderCssText = theme.borderColor ? renderUtil.concatStr(';border:1px solid ', theme.borderColor) : '',
            rectMargin, marginTop;

        if (legendInfo.iconType === 'line') {
            marginTop = baseMarginTop + chartConst.LINE_MARGIN_TOP;
        } else {
            marginTop = baseMarginTop;
        }

        rectMargin = renderUtil.concatStr(';margin-top:', marginTop, 'px');

        return renderUtil.concatStr('background-color:', theme.singleColor || theme.color, borderCssText, rectMargin);
    },

    /**
     * To make legend html.
     * @param {array.<{chartType: ?string, }>} legendInfos legend infos
     * @returns {string} legend html
     * @private
     */
    _makeLegendHtml: function(legendInfos) {
        var template = legendTemplate.tplLegend,
            labelHeight = renderUtil.getRenderedLabelHeight(legendInfos[0].label, legendInfos[0].theme),
            height = labelHeight + (chartConst.LABEL_PADDING_TOP * 2),
            baseMarginTop = parseInt((height - chartConst.LEGEND_RECT_WIDTH) / 2, 10) - 1,
            html = tui.util.map(legendInfos, function(legendInfo, index) {
                var rectCssText = this._makeLegendRectCssText(legendInfo, baseMarginTop),
                    data;
                data = {
                    rectCssText: rectCssText,
                    height: height,
                    labelHeight: labelHeight,
                    labelFontWeight: this.selectedIndex === index ? ';font-weight: bold' : '',
                    iconType: legendInfo.chartType || 'rect',
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
        var legendContainer;

        if (dom.hasClass(elTarget, chartConst.CLASS_NAME_LEGEND)) {
            legendContainer = elTarget;
        } else {
            legendContainer = dom.findParentByClass(elTarget, chartConst.CLASS_NAME_LEGEND);
        }

        return legendContainer;
    },

    /**
     * Fire legend event.
     * @param {{chartType: string, index: number}} data data
     * @param {?number} index index
     * @private
     */
    _fireLegendEvent: function(data, index) {
        var chartTypes = this.chartTypes || [data.chartType],
            legendIndex = !tui.util.isNull(index) ? data.index : index;

        tui.util.forEachArray(chartTypes, function(chartType) {
            this.fire(renderUtil.makeCustomEventName('select', chartType, 'legend'), data.chartType, legendIndex);
        }, this);
    },

    /**
     * Fire user event.
     * @param {{label: string, chartType: string, index: number}} data data
     * @private
     */
    _fireUserEvent: function(data) {
        this.userEvent.fire('selectLegend', {
            legend: data.label,
            chartType: data.chartType,
            index: data.index
        });
    },

    /**
     * Select legend.
     * @param {number} index index
     * @private
     */
    _selectLegend: function(index) {
        var data = this.legendData[index];

        if (this.selectedIndex === index) {
            this.selectedIndex = null;
        } else {
            this.selectedIndex = index;
        }

        this._renderLegendArea(this.legendContainer, this.bound);
        this._fireLegendEvent(data, this.selectedIndex);
        this._fireUserEvent(data);
    },

    /**
     * On click event handler.
     * @param {MouseEvent} e mouse event
     * @private
     */
    _onClick: function(e) {
        var elTarget = e.target || e.srcElement,
            legendContainer = this._findLegendElement(elTarget),
            index;

        if (!legendContainer) {
            return;
        }

        index = parseInt(legendContainer.getAttribute('data-index'), 10);
        this._selectLegend(index);
    },

    /**
     * Attach browser event.
     * @param {HTMLElement} el target element
     * @private
     */
    _attachEvent: function(el) {
        eventListener.bindEvent('click', el, tui.util.bind(this._onClick, this));
    }
});

tui.util.CustomEvents.mixin(Legend);

module.exports = Legend;
