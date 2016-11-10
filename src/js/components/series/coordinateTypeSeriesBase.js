/**
 * @fileoverview CoordinateTypeSeriesBase is base class for coordinate type series.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */


'use strict';

var renderUtil = require('../../helpers/renderUtil');

var CoordinateTypeSeriesBase = tui.util.defineClass(/** @lends CoordinateTypeSeriesBase.prototype */ {
    /**
     * Make series data.
     * @returns {{
     *      groupBounds: Array.<Array.<{left: number, top: number, radius: number}>>,
     *      seriesDataModel: SeriesDataModel
     * }} series data
     * @private
     * @override
     */
    _makeSeriesData: function() {
        var bounds = this._makeBounds();

        return {
            groupBounds: bounds,
            seriesDataModel: this._getSeriesDataModel()
        };
    },

    /**
     * showTooltip is callback of mouseover event to series element.
     * @param {object} params parameters
     *      @param {boolean} params.allowNegativeTooltip whether allow negative tooltip or not
     * @param {{top:number, left: number, width: number, height: number}} bound graph bound information
     * @param {number} groupIndex group index
     * @param {number} index index
     * @param {{left: number, top: number}} mousePosition mouse position
     */
    showTooltip: function(params, bound, groupIndex, index, mousePosition) {
        this.eventBus.fire('showTooltip', tui.util.extend({
            indexes: {
                groupIndex: groupIndex,
                index: index
            },
            mousePosition: mousePosition
        }, params));
    },

    /**
     * hideTooltip is callback of mouseout event to series element.
     */
    hideTooltip: function() {
        this.eventBus.fire('hideTooltip');
    },

    /**
     * Render raphael graph.
     * @param {{width: number, height: number}} dimension dimension
     * @param {object} seriesData series data
     * @private
     * @override
     */
    _renderGraph: function(dimension, seriesData) {
        var showTooltip = tui.util.bind(this.showTooltip, this, {
            chartType: this.chartType
        });
        var callbacks = {
            showTooltip: showTooltip,
            hideTooltip: tui.util.bind(this.hideTooltip, this)
        };
        var params = this._makeParamsForGraphRendering(dimension, seriesData);

        this.graphRenderer.render(this.seriesContainer, params, callbacks);
    },

    /**
     * Make html for label of series area.
     * @param {{left: number, top: number}} basePosition - position
     * @param {string} label - label of SeriesItem
     * @param {number} index - index
     * @returns {string}
     * @private
     */
    _makeSeriesLabelsHtml: function(basePosition, label, index) {
        var labelHeight = renderUtil.getRenderedLabelHeight(label, this.theme.label);
        var labelWidth = renderUtil.getRenderedLabelWidth(label, this.theme.label);
        var position = {
            left: basePosition.left - (labelWidth / 2),
            top: basePosition.top - (labelHeight / 2)
        };

        return this._makeSeriesLabelHtml(position, label, index);
    },

    /**
     * Render series label.
     * @param {HTMLElement} labelContainer - container for label area
     * @private
     */
    _renderSeriesLabel: function(labelContainer) {
        var self = this;
        var seriesDataModel = this._getSeriesDataModel();
        var html = seriesDataModel.map(function(seriesGroup, groupIndex) {
            return seriesGroup.map(function(seriesItem, index) {
                var bound = self.seriesData.groupBounds[groupIndex][index];

                return seriesItem ? self._makeSeriesLabelsHtml(bound, seriesItem.label, index) : '';
            }).join('');
        }).join('');

        labelContainer.innerHTML = html;
    },

    /**
     * If click series, showing selected state.
     * @param {{left: number, top: number}} position - mouse position
     */
    onClickSeries: function(position) {
        var indexes = this._executeGraphRenderer(position, 'findIndexes');
        var prevIndexes = this.prevClickedIndexes;
        var allowSelect = this.options.allowSelect;
        var shouldSelect;

        if (indexes && prevIndexes) {
            this.onUnselectSeries({
                indexes: prevIndexes
            });
            this.prevClickedIndexes = null;
        }

        if (!indexes) {
            return;
        }

        shouldSelect = !prevIndexes ||
            (indexes.index !== prevIndexes.index) || (indexes.groupIndex !== prevIndexes.groupIndex);

        if (allowSelect && !shouldSelect) {
            return;
        }

        this.onSelectSeries({
            indexes: indexes
        }, shouldSelect);

        if (allowSelect) {
            this.prevClickedIndexes = indexes;
        }
    },

    /**
     * If mouse move series, call 'moveMouseOnSeries' of graph render.
     * @param {{left: number, top: number}} position mouse position
     */
    onMoveSeries: function(position) {
        this._executeGraphRenderer(position, 'moveMouseOnSeries');
    }
});

CoordinateTypeSeriesBase.mixin = function(func) {
    tui.util.extend(func.prototype, CoordinateTypeSeriesBase.prototype);
};

module.exports = CoordinateTypeSeriesBase;
