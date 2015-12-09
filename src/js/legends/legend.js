/**
 * @fileoverview  Legend component.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var LegendModel = require('./legendModel'),
    chartConst = require('../const'),
    dom = require('../helpers/domHandler'),
    predicate = require('../helpers/predicate'),
    eventListener = require('../helpers/eventListener'),
    renderUtil = require('../helpers/renderUtil'),
    legendTemplate = require('./../legends/legendTemplate');

var Legend = tui.util.defineClass(/** @lends Legend.prototype */ {
    /**
     * Legend component.
     * @constructs Legend
     * @param {object} params parameters
     *      @param {array.<string> | {column: ?array.<string>, line: ?array.<string>}} params.legendLabels legend labels
     *      @param {object} params.theme axis theme
     *      @param {array.<{chartType: string, label: string, index: number}>} params.joinLegendLabels legend label infos
     *      @param {?array.<string>} params.chartTypes chart types
     *      @param {string} params.chart type
     */
    init: function(params) {
        /**
         * legend theme
         * @type {Object}
         */
        this.theme = params.theme;

        /**
         * chart types
         * @type {?array.<string>}
         */
        this.chartTypes = params.chartTypes;

        /**
         * chart type
         * @type {string}
         */
        this.chartType = params.chartType;

        /**
         * user event object
         */
        this.userEvent = params.userEvent;

        /**
         * Legend view className
         */
        this.className = 'tui-chart-legend-area';

        /**
         * checked indexes
         * @type {array}
         */
        this.checkedIndexes = [];

        /**
         * legend model
         */
        this.legendModel = new LegendModel({
            theme: params.theme,
            labels: params.legendLabels,
            labelInfos: params.joinLegendLabels,
            chartTypes: params.chartTypes,
            chartType: params.chartType
        });
    },

    /**
     * Render legend area.
     * @param {HTMLElement} legendContainer legend container
     * @param {{dimension: {width: number, height: number}, position: {left: number, top: number}}} bound lengend bound
     * @param {array.<boolean>} checkedIndexes checked indexes
     * @private
     */
    _renderLegendArea: function(legendContainer) {
        legendContainer.innerHTML = this._makeLegendHtml(this.legendModel.getData());
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
     * Make cssText of legend rect.
     * @param {{
     *      chartType: string,
     *      theme: {color: string, borderColor: ?string, singleColor: ?string}
     * }} legendDatum legend datum
     * @param {number} baseMarginTop base margin-top
     * @returns {string} cssText of legend rect
     * @private
     */
    _makeLegendRectCssText: function(legendDatum, baseMarginTop) {
        var theme = legendDatum.theme,
            borderCssText = theme.borderColor ? renderUtil.concatStr(';border:1px solid ', theme.borderColor) : '',
            rectMargin, marginTop;
        if (legendDatum.chartType === 'line') {
            marginTop = baseMarginTop + chartConst.LINE_MARGIN_TOP;
        } else {
            marginTop = baseMarginTop;
        }

        rectMargin = renderUtil.concatStr(';margin-top:', marginTop, 'px');

        return renderUtil.concatStr('background-color:', theme.singleColor || theme.color, borderCssText, rectMargin);
    },

    /**
     * Make legend html.
     * @param {array.<{chartType: ?string, label: string}>} legendData legend data
     * @returns {string} legend html
     * @private
     */
    _makeLegendHtml: function(legendData) {
        var template = legendTemplate.tplLegend,
            labelHeight = renderUtil.getRenderedLabelHeight(legendData[0].label, legendData[0].theme),
            height = labelHeight + (chartConst.LABEL_PADDING_TOP * 2),
            baseMarginTop = parseInt((height - chartConst.LEGEND_RECT_WIDTH) / 2, 10) - 1,
            html = tui.util.map(legendData, function(legendDatum, index) {
                var rectCssText = this._makeLegendRectCssText(legendDatum, baseMarginTop),
                    checked = this.legendModel.isCheckedIndex(index),
                    data;

                data = {
                    rectCssText: rectCssText,
                    height: height,
                    labelHeight: labelHeight,
                    labelFontWeight: this.legendModel.isSelectedIndex(index) ? ';font-weight: bold' : '',
                    iconType: legendDatum.chartType || 'rect',
                    label: legendDatum.label,
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

    _fireLegendCheckboxEvent: function() {
        this.fire('changeCheckedLegends', this.legendModel.getSendingData());
    },

    /**
     * Fire legend event.
     * @param {{chartType: string, index: number}} data data
     * @param {boolean} isAsapShow whther asap show or not
     * @private
     */
    _fireLegendSelectionEvent: function(data, isAsapShow) {
        var chartTypes = this.chartTypes || [data.chartType],
            index = this.legendModel.getSelectedIndex(),
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
        var data = this.legendModel.getDatum(index),
            isAsapShow = true;

        this.legendModel.toggleSelectedIndex(index);

        if (!tui.util.isNull(this.legendModel.getSelectedIndex()) && !this.legendModel.isCheckedSelectedIndex()) {
            isAsapShow = false;
            this.legendModel.checkSelectedIndex();
            this._fireLegendCheckboxEvent();
        }

        this._renderLegendArea(this.legendContainer);

        this._fireLegendSelectionEvent(data, isAsapShow);
        this._fireUserEvent(data);
    },

    /**
     * Get checked indexes.
     * @returns {array} checked indexes
     * @private
     */
    _getCheckedIndexes: function() {
        var checkedIndexes = [];
        tui.util.forEachArray(this.legendContainer.getElementsByTagName('input'), function(checkbox, index) {
            if (checkbox.checked) {
                checkedIndexes.push(index);
            }
        });
        return checkedIndexes;
    },

    /**
     * Check legend.
     * @private
     */
    _checkLegend: function() {
        var checkedIndexes = this._getCheckedIndexes(),
            checkedCount = checkedIndexes.length,
            data;

        if ((predicate.isPieChart(this.chartType) && checkedCount === 1) || checkedCount === 0) {
            this._renderLegendArea(this.legendContainer);
        } else {
            this.legendModel.updateCheckedData(checkedIndexes);

            data = this.legendModel.getSelectedDatum();

            if (!this.legendModel.isCheckedSelectedIndex()) {
                this.legendModel.updateSelectedIndex(null);
            }

            this._renderLegendArea(this.legendContainer);

            this._fireLegendCheckboxEvent();

            if (data) {
                this._fireLegendSelectionEvent(data, false);
            }
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
