/**
 * @fileoverview  Legend component.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var arrayUtil = require('../../helpers/arrayUtil');
var chartConst = require('../../const');
var LegendModel = require('./legendModel');
var pluginFactory = require('../../factories/pluginFactory');
var predicate = require('../../helpers/predicate');

var Legend = tui.util.defineClass(/** @lends Legend.prototype */ {
    /**
     * Legend component.
     * @constructs Legend
     * @private
     * @param {object} params parameters
     *      @param {object} params.theme - axis theme
     *      @param {?Array.<string>} params.seriesTypes - series types
     *      @param {string} params.chart - chart type
     *      @param {object} params.dataProcessor - data processor
     *      @param {object} params.eventBus - chart event bus
     */
    init: function(params) {
        /**
         * legend theme
         * @type {object}
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
         * series types
         * @type {?Array.<string>}
         */
        this.seriesTypes = params.seriesTypes || [this.chartType];

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
            seriesTypes: this.seriesTypes,
            chartType: this.chartType
        });

        /**
         * layout bounds information for this components
         * @type {null|{dimension:{width:number, height:number}, position:{left:number, top:number}}}
         */
        this.layout = null;

        /**
         * Graph renderer
         * @type {object}
         */
        this.graphRenderer = pluginFactory.get(chartConst.COMPONENT_TYPE_RAPHAEL, 'legend');

        /**
         * Paper for rendering legend
         * @type {object}
         */
        this.paper = null;

        this.drawingType = chartConst.COMPONENT_TYPE_RAPHAEL;
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
            this.paper = data.paper;
        }
    },

    /**
     * Render legend component.
     * @param {object} data - bounds data
     */
    _render: function(data) {
        this._setDataForRendering(data);
        this.legendSet = this._renderLegendArea(data.paper);
    },

    /**
     * Render legend component and listen legend event.
     * @param {object} data - bounds data
     */
    render: function(data) {
        this._render(data);

        this._listenEvents();
    },

    /**
     * Rerender.
     * @param {object} data - bounds data
     */
    rerender: function(data) {
        this.legendSet.remove();

        this._render(data);
    },

    /**
     * Rerender, when resizing chart.
     * @param {object} data - bounds data
     */
    resize: function(data) {
        this.rerender(data);
    },

    /**
     * Get legend rendering data
     * @param {object} legendData legned data
     * @param {number} labelHeight lebel height
     * @param {Array.<number>} labelWidths label widths
     * @returns {Array.<object>}
     * @private
     */
    _getLegendRenderingData: function(legendData, labelHeight, labelWidths) {
        var self = this;

        return tui.util.map(legendData, function(legendDatum, index) {
            var checkbox = self.options.showCheckbox === false ? null : {
                checked: self.legendModel.isCheckedIndex(index)
            };

            return {
                checkbox: checkbox,
                iconType: legendDatum.chartType || 'rect',
                index: index,
                theme: legendDatum.theme,
                label: legendDatum.label,
                labelHeight: labelHeight,
                labelWidth: labelWidths[index],
                isUnselected: self.legendModel.isUnselectedIndex(index)
            };
        });
    },

    /**
     * Render legend area.
     * @param {object} paper paper object
     * @returns {Array.<object>}
     * @private
     */
    _renderLegendArea: function(paper) {
        var legendData = this.legendModel.getData();
        var graphRenderer = this.graphRenderer;
        var labelWidths = graphRenderer.makeLabelWidths(legendData, this.theme.label);
        var labelHeight = graphRenderer.getRenderedLabelHeight(legendData[0].label, legendData[0].theme) - 1;
        var isHorizontal = predicate.isHorizontalLegend(this.options.align);
        var labelCount = labelWidths.length;
        var height = (chartConst.LINE_MARGIN_TOP + labelHeight) * (isHorizontal ? 1 : labelCount);
        var checkboxWidth = this.options.showCheckbox === false ? 0 : 10;
        var iconWidth = 10;
        var width = arrayUtil.max(labelWidths) + checkboxWidth + iconWidth
            + (chartConst.LEGEND_LABEL_LEFT_PADDING * 2);
        var basePosition = this.layout.position;
        var position = {
            left: basePosition.left + chartConst.LEGEND_AREA_PADDING + chartConst.CHART_PADDING,
            top: basePosition.top + chartConst.LEGEND_AREA_PADDING + chartConst.CHART_PADDING
        };
        var legendRenderingData;

        legendRenderingData = this._getLegendRenderingData(legendData, labelHeight, labelWidths);

        return graphRenderer.render({
            paper: paper,
            legendData: legendRenderingData,
            isHorizontal: isHorizontal,
            position: position,
            dimension: {
                height: height,
                width: width
            },
            labelTheme: this.theme.label,
            labelWidths: labelWidths,
            eventBus: this.eventBus
        });
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

        this.graphRenderer.selectLegend(this.legendModel.getSelectedIndex(), this.legendSet);

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

        tui.util.forEachArray(this.legendModel.checkedWholeIndexes, function(checkbox, index) {
            if (checkbox) {
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
        var selectedData = this.legendModel.getSelectedDatum();

        if (!this.legendModel.isCheckedSelectedIndex()) {
            this.legendModel.updateSelectedIndex(null);
        }

        this._fireChangeCheckedLegendsEvent();

        if (selectedData) {
            this._fireSelectLegendEvent(selectedData);
        }
    },

    /**
     * On click event handler.
     * @param {number} index checkbox index
     * @private
     */
    _checkboxClick: function(index) {
        var checkedIndexes;

        this.legendModel.toggleCheckedIndex(index);

        checkedIndexes = this._getCheckedIndexes();

        if (checkedIndexes.length > 0) {
            this.legendModel.updateCheckedLegendsWith(checkedIndexes);
            this._checkLegend();
        } else {
            this.legendModel.toggleCheckedIndex(index);
        }
    },

    /**
     * On click event handler.
     * @param {number} index selected index
     * @private
     */
    _labelClick: function(index) {
        this._selectLegend(index);
    },

    /**
     * Listen legend events
     * @private
     */
    _listenEvents: function() {
        this.eventBus.on('checkboxClicked', this._checkboxClick, this);
        this.eventBus.on('labelClicked', this._labelClick, this);
    }
});

tui.util.CustomEvents.mixin(Legend);

module.exports = Legend;
