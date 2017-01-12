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
var renderUtil = require('../../helpers/renderUtil');
var arrayUtil = require('../../helpers/arrayUtil');
var pluginFactory = require('../../factories/pluginFactory');

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
        this.graphRenderer = pluginFactory.get(this.options.libType || chartConst.DEFAULT_PLUGIN, 'legend');

        /**
         * Paper for rendering legend
         * @type {object}
         */
        this.paper = null;
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

        this._setDataForRendering(data);
        this.paper = this._renderLegendArea(container);
        this._listenEvents();

        return container;
    },

    /**
     * Rerender.
     * @param {object} data - bounds data
     */
    rerender: function(data) {
        this.paper.remove();

        this._setDataForRendering(data);
        this.paper = this._renderLegendArea(this.legendContainer);
    },

    /**
     * Rerender, when resizing chart.
     * @param {object} data - bounds data
     */
    resize: function(data) {
        this.rerender(data);
    },

    /**
     * Render legend area.
     * @param {HTMLElement} legendContainer legend container
     * @returns {object} paper paper for drawing legend
     * @private
     */
    _renderLegendArea: function(legendContainer) {
        var self = this;
        var graphRenderer = this.graphRenderer;
        var legendData = this.legendModel.getData();
        var labelsWidth = graphRenderer.makeLabelsWidth(legendData, this.theme.label);
        var labelHeight = graphRenderer.getRenderedLabelHeight(legendData[0].label, legendData[0].theme);
        var isHorizontal = predicate.isHorizontalLegend(this.options.align);
        var labelCount = labelsWidth.length;
        var height = (chartConst.LINE_MARGIN_TOP + labelHeight) * (isHorizontal ? 1 : labelCount);
        var checkboxWidth = this.options.showCheckbox === false ? 0 : 10;
        var iconWidth = 10;
        var width = arrayUtil.max(labelsWidth) + checkboxWidth + iconWidth
            + (chartConst.LEGEND_LABEL_LEFT_PADDING * 2);
        var paper, legendRenderingData;

        legendRenderingData = tui.util.map(legendData, function(legendDatum, index) {
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
                labelWidth: labelsWidth[index],
                isUnselected: self.legendModel.isUnselectedIndex(index)
            };
        });

        paper = graphRenderer.render({
            container: legendContainer,
            legendData: legendRenderingData,
            isHorizontal: isHorizontal,
            dimension: {
                height: height,
                width: width
            },
            labelTheme: this.theme.label,
            labelsWidth: labelsWidth,
            eventBus: this.eventBus
        });

        renderUtil.renderPosition(legendContainer, this.layout.position);

        return paper;
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
        this.rerender();

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
