/**
 * @fileoverview  Legend component.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var LegendModel = require('./legendModel'),
    LegendDimensionModel = require('./legendDimensionModel'),
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
     *      @param {object} params.theme axis theme
     *      @param {?Array.<string>} params.chartTypes chart types
     *      @param {string} params.chart type
     */
    init: function(params) {
        var legendData;

        /**
         * legend theme
         * @type {Object}
         */
        this.theme = params.theme;

        /**
         * options
         * @type {Object}
         */
        this.options = params.options || {};

        /**
         * chart type
         * @type {string}
         */
        this.chartType = params.chartType;

        /**
         * chart types
         * @type {?Array.<string>}
         */
        this.chartTypes = params.chartTypes || [this.chartType];

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
         * @type {Array}
         */
        this.checkedIndexes = [];

        /**
         * bounds maker
         * @type {BoundsMaker}
         */
        this.boundsMaker = params.boundsMaker;

        legendData = params.dataProcessor.getLegendData();
        /**
         * legend model
         */
        this.legendModel = new LegendModel({
            theme: this.theme,
            labels: params.dataProcessor.getLegendLabels(),
            legendData: legendData,
            chartTypes: this.chartTypes,
            chartType: this.chartType
        });

        this.dimensionModel = new LegendDimensionModel({
            legendLabels: tui.util.pluck(legendData, 'label'),
            chartTypes: this.chartTypes,
            chartType: this.chartType,
            options: this.options,
            theme: this.theme
        });
    },

    /**
     * Register legend dimension.
     */
    registerDimension: function() {
        var chartWidth = this.boundsMaker.getDimension('chart').width;
        var legendDimension = this.dimensionModel.makeDimension(chartWidth);

        this.boundsMaker.registerBaseDimension('legend', legendDimension);

        if (predicate.hasVerticalLegendWidth(this.options)) {
            this.boundsMaker.registerBaseDimension('calculationLegend', {
                width: legendDimension.width
            });
        }
    },

    /**
     * Render legend area.
     * @param {HTMLElement} legendContainer legend container
     * @private
     */
    _renderLegendArea: function(legendContainer) {
        legendContainer.innerHTML = this._makeLegendHtml(this.legendModel.getData());
        renderUtil.renderPosition(legendContainer, this.boundsMaker.getPosition('legend'));
        legendContainer.style.cssText += ';' + renderUtil.makeFontCssText(this.theme.label);
    },

    /**
     * Render legend component.
     * @returns {HTMLElement} legend element
     */
    render: function() {
        var el = dom.create('DIV', this.className);

        this.legendContainer = el;

        if (predicate.isHorizontalLegend(this.options.align)) {
            dom.addClass(el, 'horizontal');
        }

        this._renderLegendArea(el);
        this._attachEvent(el);
        return el;
    },

    /**
     * Rerender.
     */
    rerender: function() {
        this._renderLegendArea(this.legendContainer);
    },

    /**
     * Resize legend component.
     */
    resize: function() {
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
     * Make labels width.
     * @param {Array.<{chartType: ?string, label: string}>} legendData legend data
     * @returns {Array.<number>} labels width
     * @private
     */
    _makeLabelsWidth: function(legendData) {
        var self = this;

        return tui.util.map(legendData, function(item) {
            var labelWidth = renderUtil.getRenderedLabelWidth(item.label, self.theme.label);
            return labelWidth + chartConst.LEGEND_AREA_PADDING;
        });
    },

    /**
     * Make legend html.
     * @param {Array.<{chartType: ?string, label: string}>} legendData legend data
     * @returns {string} legend html
     * @private
     */
    _makeLegendHtml: function(legendData) {
        var self = this,
            template = legendTemplate.tplLegend,
            checkBoxTemplate = legendTemplate.tplCheckbox,
            labelsWidth = this._makeLabelsWidth(legendData),
            labelHeight = renderUtil.getRenderedLabelHeight(legendData[0].label, legendData[0].theme),
            isHorizontalLegend = predicate.isHorizontalLegend(this.options.align),
            height = labelHeight + (chartConst.LABEL_PADDING_TOP * 2),
            baseMarginTop = parseInt((height - chartConst.LEGEND_RECT_WIDTH) / 2, 10) - 1,
            html = tui.util.map(legendData, function(legendDatum, index) {
                var rectCssText = self._makeLegendRectCssText(legendDatum, baseMarginTop),
                    checkbox = self.options.showCheckbox === false ? '' : checkBoxTemplate({
                        index: index,
                        checked: self.legendModel.isCheckedIndex(index) ? ' checked' : ''
                    }),
                    data;

                data = {
                    rectCssText: rectCssText,
                    height: height,
                    labelHeight: labelHeight,
                    unselected: self.legendModel.isUnselectedIndex(index) ? ' unselected' : '',
                    labelWidth: isHorizontalLegend ? ';width:' + labelsWidth[index] + 'px' : '',
                    iconType: legendDatum.chartType || 'rect',
                    label: legendDatum.label,
                    checkbox: checkbox,
                    index: index
                };
                return template(data);
            }).join('');
        return html;
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
     * Fire legend checkbox event.
     * @private
     */
    _fireLegendCheckboxEvent: function() {
        this.fire('changeCheckedLegends', this.legendModel.getCheckedIndexes());
    },

    /**
     * Fire legend event.
     * @param {{chartType: string, index: number}} data data
     * @private
     */
    _fireLegendSelectionEvent: function(data) {
        var self = this;
        var chartTypes = this.chartTypes || [data.chartType];
        var index = this.legendModel.getSelectedIndex();
        var legendIndex = !tui.util.isNull(index) ? data.seriesIndex : index;

        tui.util.forEachArray(chartTypes, function(chartType) {
            self.fire(renderUtil.makeCustomEventName('select', chartType, 'legend'), data.chartType, legendIndex);
        });
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
        var data = this.legendModel.getDatum(index);

        this.legendModel.toggleSelectedIndex(index);

        if (!tui.util.isNull(this.legendModel.getSelectedIndex()) && !this.legendModel.isCheckedSelectedIndex()) {
            this.legendModel.checkSelectedIndex();
            this._fireLegendCheckboxEvent();
        }

        this._renderLegendArea(this.legendContainer);

        this._fireLegendSelectionEvent(data);
        this._fireUserEvent(data);
    },

    /**
     * Get checked indexes.
     * @returns {Array} checked indexes
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
        var checkedIndexes = this._getCheckedIndexes();
        var checkedCount = checkedIndexes.length;
        var isPieTypeCharts = tui.util.all(this.chartTypes, predicate.isPieTypeChart);
        var data;

        if ((isPieTypeCharts && checkedCount === 1) || checkedCount === 0) {
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
                this._fireLegendSelectionEvent(data, true);
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
     * @param {HTMLElement} target target element
     * @private
     */
    _attachEvent: function(target) {
        eventListener.bindEvent('click', target, this._onClick, this);
    }
});

tui.util.CustomEvents.mixin(Legend);

module.exports = Legend;
