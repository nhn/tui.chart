/**
 * @fileoverview  Legend component.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var chartConst = require('../const'),
    dom = require('../helpers/domHandler'),
    predicate = require('../helpers/predicate'),
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

        /**
         * sending data to series
         * @type {object}
         */
        this.sendingData = {};

        /**
         * checked indexes
         * @type {array}
         */
        this.checkedIndexes = [];
    },

    /**
     * Render legend area.
     * @param {HTMLElement} legendContainer legend container
     * @param {{dimension: {width: number, height: number}, position: {left: number, top: number}}} bound lengend bound
     * @param {array.<boolean>} checkedIndexes checked indexes
     * @private
     */
    _renderLegendArea: function(legendContainer) {
        this.legendData = this._makeLegendData();
        legendContainer.innerHTML = this._makeLegendHtml(this.legendData);
        renderUtil.renderPosition(legendContainer, this.bound.position);
        this._renderLabelTheme(legendContainer, this.theme.label);
    },

    /**
     * Render legend component.
     * @param {{dimension: {width: number, height: number}, position: {left: number, top: number}}} bound lengend bound
     * @returns {HTMLElement} legend element
     */
    render: function(bound) {
        var el = dom.create('DIV', this.className);

        this.legendContainer = el;
        this.bound = bound;
        this._renderLegendArea(el);
        this._attachEvent(el);
        return el;
    },

    /**
     * Resize legend component.
     * @param {{dimension: {width: number, height: number}, position: {left: number, top: number}}} bound lengend bound
     */
    resize: function(bound) {
        this.bound = bound;
        this._renderLegendArea(this.legendContainer);
    },

    /**
     * Make label info that applied theme.
     * @param {array.<object>} labelInfo labels
     * @param {{colors: array.<number>, singleColor: ?string, bordercolor: ?string}} theme legend theme
     * @param {array.<boolean>} checkedIndexes checked indexes
     * @returns {array.<object>} labels
     * @private
     */
    _makeLabelInfoAppliedTheme: function(labelInfo, theme, checkedIndexes) {
        var seriesIndex = 0;

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

            if (!checkedIndexes || checkedIndexes[index]) {
                item.seriesIndex = seriesIndex;
                seriesIndex += 1;
            } else {
                item.seriesIndex = -1;
            }

            return item;
        }, this);
    },

    /**
     * Make legend labels.
     * @returns {array.<{theme: {object}, index: number}>} legend labels.
     * @private
     */
    _makeLegendData: function() {
        var labelInfos = this.joinLegendLabels,
            legendData, startIndex, defaultLegendTheme;

        if (!this.chartTypes) {
            legendData = this._makeLabelInfoAppliedTheme(labelInfos, this.theme, this.sendingData[this.chartType]);
        } else {
            startIndex = 0;
            defaultLegendTheme = {
                colors: defaultTheme.series.colors
            };
            legendData = concat.apply([], tui.util.map(this.chartTypes, function(chartType) {
                var chartTheme = this.theme[chartType] || defaultLegendTheme,
                    endIndex = startIndex + this.legendLabels[chartType].length,
                    data = this._makeLabelInfoAppliedTheme(labelInfos.slice(startIndex, endIndex), chartTheme, this.sendingData[chartType]);
                startIndex = endIndex;
                return data;
            }, this));
        }
        return legendData;
    },

    /**
     * Make cssText of legend rect.
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
        if (legendInfo.chartType === 'line') {
            marginTop = baseMarginTop + chartConst.LINE_MARGIN_TOP;
        } else {
            marginTop = baseMarginTop;
        }

        rectMargin = renderUtil.concatStr(';margin-top:', marginTop, 'px');

        return renderUtil.concatStr('background-color:', theme.singleColor || theme.color, borderCssText, rectMargin);
    },

    /**
     * Make legend html.
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
                    checked = (!this.checkedIndexes.length || this.checkedIndexes[index]),
                    data;

                data = {
                    rectCssText: rectCssText,
                    height: height,
                    labelHeight: labelHeight,
                    labelFontWeight: this.selectedIndex === index ? ';font-weight: bold' : '',
                    iconType: legendInfo.chartType || 'rect',
                    label: legendInfo.label,
                    checked: checked ? ' checked' : '',
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
    _findLegendLabelElement: function(elTarget) {
        var legendContainer;

        if (dom.hasClass(elTarget, chartConst.CLASS_NAME_LEGEND_LABEL)) {
            legendContainer = elTarget;
        } else {
            legendContainer = dom.findParentByClass(elTarget, chartConst.CLASS_NAME_LEGEND_LABEL);
        }

        return legendContainer;
    },

    /**
     * Fire legend event.
     * @param {{chartType: string, index: number}} data data
     * @param {?number} index index
     * @param {boolean} isAsapShow whther asap show or not
     * @private
     */
    _fireLegendEvent: function(data, index, isAsapShow) {
        var chartTypes = this.chartTypes || [data.chartType],
            legendIndex = !tui.util.isNull(index) ? data.seriesIndex : index;

        tui.util.forEachArray(chartTypes, function(chartType) {
            this.fire(renderUtil.makeCustomEventName('select', chartType, 'legend'), data.chartType, legendIndex, isAsapShow);
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
        var data = this.legendData[index],
            isAsapShow = true;

        if (this.selectedIndex === index) {
            this.selectedIndex = null;
        } else {
            this.selectedIndex = index;
        }

        if (!tui.util.isNull(this.selectedIndex) && (this.checkedIndexes.length && !this.checkedIndexes[this.selectedIndex])) {
            isAsapShow = false;
            this.checkedIndexes[this.selectedIndex] = true;
            if (!this.sendingData[data.chartType]) {
                this.sendingData[data.chartType] = [];
            }
            this.sendingData[data.chartType][data.index] = true;
            this.fire('changeSelectedLegends', this.sendingData[this.chartType] || this.sendingData);
        }

        this._renderLegendArea(this.legendContainer);
        this._fireLegendEvent(data, this.selectedIndex, isAsapShow);
        this._fireUserEvent(data);
    },

    /**
     * Check legend.
     * @private
     */
    _checkLegend: function() {
        var checkedIndexes = [],
            sendingData = {},
            checkedCount = 0,
            data;

        tui.util.forEachArray(this.legendContainer.getElementsByTagName('input'), function(checkbox, index) {
            if (checkbox.checked) {
                data = this.legendData[index];
                checkedIndexes[parseInt(checkbox.value, 10)] = true;

                if (!sendingData[data.chartType]) {
                    sendingData[data.chartType] = [];
                }

                sendingData[data.chartType][data.index] = true;
                checkedCount += 1;
            }
        }, this);

        if ((predicate.isPieChart(this.chartType) && checkedCount === 1) || checkedCount === 0) {
            this._renderLegendArea(this.legendContainer);
            return;
        }

        if (!checkedIndexes[this.selectedIndex]) {
            data = this.legendData[this.selectedIndex];
            this.selectedIndex = null;
        }

        this.checkedIndexes = checkedIndexes;
        this.sendingData = sendingData;

        this._renderLegendArea(this.legendContainer);
        this.fire('changeSelectedLegends', sendingData[this.chartType] || sendingData);

        if (data) {
            this._fireLegendEvent(data, this.selectedIndex, false);
        }
    },

    /**
     * On click event handler.
     * @param {MouseEvent} e mouse event
     * @private
     */
    _onClick: function(e) {
        var elTarget = e.target || e.srcElement,
            legendContainer, index;

        if (dom.hasClass(elTarget, chartConst.CLASS_NAME_LEGEND_CHECKBOX)) {
            this._checkLegend();
            return;
        }

        legendContainer = this._findLegendLabelElement(elTarget);

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
