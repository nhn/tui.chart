/**
 * @fileoverview  Legend component.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var LegendModel = require('./legendModel');
var chartConst = require('../../const');
var dom = require('../../helpers/domHandler');
var predicate = require('../../helpers/predicate');
var eventListener = require('../../helpers/eventListener');
var renderUtil = require('../../helpers/renderUtil');
var legendTemplate = require('./legendTemplate');

var Legend = tui.util.defineClass(/** @lends Legend.prototype */ {
    /**
     * Legend component.
     * @constructs Legend
     * @param {object} params parameters
     *      @param {object} params.theme - axis theme
     *      @param {?Array.<string>} params.seriesNames - series names
     *      @param {string} params.chart - chart type
     */
    init: function(params) {
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
         * series names
         * @type {?Array.<string>}
         */
        this.seriesNames = params.seriesNames || [this.chartType];

        /**
         * event bus for transmitting message
         * @type {object}
         */
        this.eventBus = params.eventBus;

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
         * DataProcessor instance
         * @type {DataProcessor}
         */
        this.dataProcessor = params.dataProcessor;

        /**
         * legend model
         */
        this.legendModel = new LegendModel({
            theme: this.theme,
            labels: params.dataProcessor.getLegendLabels(),
            legendData: params.dataProcessor.getLegendData(),
            seriesNames: this.seriesNames,
            chartType: this.chartType
        });

        /**
         * layout bounds information for this components
         * @type {null|{dimension:{width:number, height:number}, position:{left:number, top:number}}}
         */
        this.layout = null;
    },

    /**
     * Render legend area.
     * @param {HTMLElement} legendContainer legend container
     * @private
     */
    _renderLegendArea: function(legendContainer) {
        legendContainer.innerHTML = this._makeLegendHtml(this.legendModel.getData());
        renderUtil.renderPosition(legendContainer, this.layout.position);
        legendContainer.style.cssText += ';' + renderUtil.makeFontCssText(this.theme.label);
    },

    /**
     * Set data for rendering.
     * @param {{
     *      layout: {
     *          dimension: {width: number, height: number},
     *          position: {left: number, top: number}
     *      }
     * }} data - bounds data
     * @private
     */
    _setDataForRendering: function(data) {
        if (data) {
            this.layout = data.layout;
        }
    },

    /**
     * Render legend component.
     * @param {object} data - bounds data
     * @returns {HTMLElement} legend element
     */
    render: function(data) {
        var container = dom.create('DIV', this.className);

        this.legendContainer = container;

        if (predicate.isHorizontalLegend(this.options.align)) {
            dom.addClass(container, 'horizontal');
        }

        this._setDataForRendering(data);
        this._renderLegendArea(container);
        this._attachEvent(container);

        return container;
    },

    /**
     * Rerender.
     * @param {object} data - bounds data
     */
    rerender: function(data) {
        this._setDataForRendering(data);
        this._renderLegendArea(this.legendContainer);
    },

    /**
     * Rerender, when resizing chart.
     * @param {object} data - bounds data
     */
    resize: function(data) {
        this.rerender(data);
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
        var self = this;
        var template = legendTemplate.tplLegend;
        var checkBoxTemplate = legendTemplate.tplCheckbox;
        var labelsWidth = this._makeLabelsWidth(legendData);
        var labelHeight = renderUtil.getRenderedLabelHeight(legendData[0].label, legendData[0].theme);
        var isHorizontalLegend = predicate.isHorizontalLegend(this.options.align);
        var height = labelHeight + (chartConst.LABEL_PADDING_TOP * 2);
        var baseMarginTop = parseInt((height - chartConst.LEGEND_RECT_WIDTH) / 2, 10) - 1;
        var html = tui.util.map(legendData, function(legendDatum, index) {
            var rectCssText = self._makeLegendRectCssText(legendDatum, baseMarginTop);
            var checkbox = self.options.showCheckbox === false ? '' : checkBoxTemplate({
                index: index,
                checked: self.legendModel.isCheckedIndex(index) ? ' checked' : ''
            });
            var data = {
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
     * Fire onChangeCheckedLegends event.
     * @private
     */
    _fireChangeCheckedLegendsEvent: function() {
        this.eventBus.fire('changeCheckedLegends', this.legendModel.getCheckedIndexes());
    },

    /**
     * Fire selectLegend event.
     * @param {{chartType: string, index: number}} data data
     * @private
     */
    _fireSelectLegendEvent: function(data) {
        var index = this.legendModel.getSelectedIndex();
        var legendIndex = !tui.util.isNull(index) ? data.seriesIndex : index;

        this.eventBus.fire('selectLegend', data.chartType, legendIndex);
    },

    /**
     * Fire selectLegend public event.
     * @param {{label: string, chartType: string, index: number}} data data
     * @private
     */
    _fireSelectLegendPublicEvent: function(data) {
        this.eventBus.fire(chartConst.PUBLIC_EVENT_PREFIX + 'selectLegend', {
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
            this._fireChangeCheckedLegendsEvent();
        }

        this._renderLegendArea(this.legendContainer);

        this._fireSelectLegendEvent(data);
        this._fireSelectLegendPublicEvent(data);
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
        var isPieTypeCharts = tui.util.all(this.seriesNames, predicate.isPieTypeChart);
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

            this._fireChangeCheckedLegendsEvent();

            if (data) {
                this._fireSelectLegendEvent(data);
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
        eventListener.on(target, 'click', this._onClick, this);
    }
});

tui.util.CustomEvents.mixin(Legend);

module.exports = Legend;
