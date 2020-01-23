/**
 * @fileoverview CoordinateTypeSeriesBase is base class for coordinate type series.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */
import snippet from 'tui-code-snippet';

class CoordinateTypeSeriesBase {
  /**
   * Make series data.
   * @returns {{
   *      groupBounds: Array.<Array.<{left: number, top: number, radius: number}>>,
   *      seriesDataModel: SeriesDataModel
   * }} series data
   * @private
   * @override */
  _makeSeriesData() {
    const groupBounds = this._makeBounds();

    return {
      groupBounds,
      seriesDataModel: this._getSeriesDataModel(),
      isAvailable: () => groupBounds && groupBounds.length > 0
    };
  }

  /**
   * showTooltip is callback of mouseover event to series element.
   * @param {object} params parameters
   *      @param {boolean} params.allowNegativeTooltip whether allow negative tooltip or not
   * @param {{top:number, left: number, width: number, height: number}} bound graph bound information
   * @param {number} groupIndex group index
   * @param {number} index index
   * @param {{left: number, top: number}} mousePosition mouse position
   */
  showTooltip(params, bound, groupIndex, index, mousePosition) {
    this.eventBus.fire(
      'showTooltip',
      snippet.extend(
        {
          indexes: {
            groupIndex,
            index
          },
          mousePosition
        },
        params
      )
    );
  }

  /**
   * hideTooltip is callback of mouseout event to series element.
   */
  hideTooltip() {
    this.eventBus.fire('hideTooltip');
  }

  /**
   * Render raphael graph.
   * @param {{width: number, height: number}} dimension dimension
   * @param {object} seriesData series data
   * @param {object} paper paper object
   * @private
   * @override
   */
  _renderGraph(dimension, seriesData, paper) {
    const showTooltip = this.showTooltip.bind(this, {
      chartType: this.chartType
    });
    const callbacks = {
      showTooltip,
      hideTooltip: this.hideTooltip.bind(this)
    };
    const params = this._makeParamsForGraphRendering(dimension, seriesData);

    return this.graphRenderer.render(paper, params, callbacks);
  }

  /**
   * If click series, showing selected state.
   * @param {{left: number, top: number}} position - mouse position
   */
  onClickSeries(position) {
    const indexes = this._executeGraphRenderer(position, 'findIndexes');
    const prevIndexes = this.prevClickedIndexes;
    const {
      options: { allowSelect },
      chartType
    } = this;

    if (indexes && prevIndexes) {
      this.onUnselectSeries({
        chartType,
        indexes: prevIndexes
      });
      this.prevClickedIndexes = null;
    }

    if (!indexes) {
      return;
    }

    const shouldSelect =
      !prevIndexes ||
      indexes.index !== prevIndexes.index ||
      indexes.groupIndex !== prevIndexes.groupIndex;

    if (allowSelect && shouldSelect) {
      this.onSelectSeries(
        {
          chartType,
          indexes
        },
        shouldSelect
      );
      this.prevClickedIndexes = indexes;
    }
  }

  /**
   * If mouse move series, call 'moveMouseOnSeries' of graph render.
   * @param {{left: number, top: number}} position mouse position
   */
  onMoveSeries(position) {
    this._executeGraphRenderer(position, 'moveMouseOnSeries');
  }
}

CoordinateTypeSeriesBase.mixin = function(func) {
  Object.assign(func.prototype, CoordinateTypeSeriesBase.prototype);
};

export default CoordinateTypeSeriesBase;
