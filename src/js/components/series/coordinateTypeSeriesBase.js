/**
 * @fileoverview CoordinateTypeSeriesBase is base class for coordinate type series.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var snippet = require('tui-code-snippet');
var CoordinateTypeSeriesBase = snippet.defineClass(/** @lends CoordinateTypeSeriesBase.prototype */ {
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
        var groupBounds = this._makeBounds();

        return {
            groupBounds: groupBounds,
            seriesDataModel: this._getSeriesDataModel(),
            isAvailable: function() {
                return groupBounds && groupBounds.length > 0;
            }
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
        this.eventBus.fire('showTooltip', snippet.extend({
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
     * @param {object} paper paper object
     * @private
     * @override
     */
    _renderGraph: function(dimension, seriesData, paper) {
        var showTooltip = snippet.bind(this.showTooltip, this, {
            chartType: this.chartType
        });
        var callbacks = {
            showTooltip: showTooltip,
            hideTooltip: snippet.bind(this.hideTooltip, this)
        };
        var params = this._makeParamsForGraphRendering(dimension, seriesData);

        return this.graphRenderer.render(paper, params, callbacks);
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
            chartType: this.chartType,
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
    snippet.extend(func.prototype, CoordinateTypeSeriesBase.prototype);
};

module.exports = CoordinateTypeSeriesBase;
