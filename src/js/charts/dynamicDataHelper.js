import chartConst from '../const';
import predicate from '../helpers/predicate';

class DynamicDataHelper {
  constructor(chart) {
    const firstRenderCheck = () => {
      this.isInitRenderCompleted = true;
      this.chart.off(firstRenderCheck);
    };

    /**
     * chart instance
     * @type {ChartBase}
     */
    this.chart = chart;

    this.isInitRenderCompleted = false;

    this.chart.on('load', firstRenderCheck);

    this.reset();
  }

  reset() {
    /**
     * whether lookupping or not
     * @type {boolean}
     */
    this.lookupping = false;

    /**
     * whether paused or not
     * @type {boolean}
     */
    this.paused = false;

    /**
     * rendering delay timer id
     * @type {null}
     */
    this.rerenderingDelayTimerId = null;

    /**
     * added data count
     * @type {number}
     */
    this.addedDataCount = 0;

    /**
     * checked legends.
     * @type {null | Array.<?boolean> | {line: ?Array.<boolean>, column: ?Array.<boolean>}}
     */
    this.checkedLegends = null;

    /**
     * previous xAxis data
     * @type {null|object}
     */
    this.prevXAxisData = null;
  }

  /**
   * Calculate animate tick size.
   * @param {number} xAxisWidth - x axis width
   * @returns {number}
   * @private
   */
  _calculateAnimateTickSize(xAxisWidth) {
    const { dataProcessor } = this.chart;
    const { tickInterval } = this.chart.options.xAxis;
    const shiftingOption = !!this.chart.options.series.shifting;
    let tickCount;

    if (dataProcessor.isCoordinateType()) {
      tickCount = dataProcessor.getValues(this.chart.chartType, 'x').length - 1;
    } else {
      tickCount = dataProcessor.getCategoryCount(false) - 1;
    }

    if (shiftingOption && !predicate.isAutoTickInterval(tickInterval)) {
      tickCount -= 1;
    }

    return xAxisWidth / tickCount;
  }

  /**
   * Animate for adding data.
   * @private
   */
  _animateForAddingData() {
    const { chart } = this;
    const boundsAndScale = chart.readyForRender(true);
    const shiftingOption = !!this.chart.options.series.shifting;

    this.addedDataCount += 1;

    const tickSize = this._calculateAnimateTickSize(boundsAndScale.dimensionMap.xAxis.width);

    chart.componentManager.render('animateForAddingData', boundsAndScale, {
      tickSize,
      shifting: shiftingOption
    });

    if (shiftingOption) {
      chart.dataProcessor.shiftData();
    }
  }

  /**
   * Rerender for adding data.
   * @private
   */
  _rerenderForAddingData() {
    const { chart } = this;
    const boundsAndScale = chart.readyForRender();
    chart.componentManager.render('rerender', boundsAndScale);
  }

  /**
   * Check for added data.
   * @private
   */
  _checkForAddedData() {
    const { chart } = this;
    const added = chart.dataProcessor.addDataFromDynamicData();

    if (!added) {
      this.lookupping = false;

      return;
    }

    if (this.paused) {
      if (chart.options.series.shifting) {
        chart.dataProcessor.shiftData();
      }

      return;
    }

    this._animateForAddingData();

    this.rerenderingDelayTimerId = setTimeout(() => {
      this.rerenderingDelayTimerId = null;
      this._rerenderForAddingData();
      this._checkForAddedData();
    }, 400);
  }

  /**
   * Change checked legend.
   * @param {Array.<?boolean> | {line: ?Array.<boolean>, column: ?Array.<boolean>}} checkedLegends checked legends
   * @param {?object} rawData rawData
   * @param {?object} boundsParams addition params for calculating bounds
   */
  changeCheckedLegends(checkedLegends, rawData, boundsParams) {
    const { chart } = this;
    const shiftingOption = !!chart.options.series.shifting;
    const pastPaused = this.paused;

    if (!pastPaused) {
      this.pauseAnimation();
    }

    this.checkedLegends = checkedLegends;
    chart.protectedRerender(checkedLegends, rawData, boundsParams);

    if (!pastPaused) {
      setTimeout(() => {
        chart.dataProcessor.addDataFromRemainDynamicData(shiftingOption);
        this.restartAnimation();
      }, chartConst.RERENDER_TIME);
    }
  }

  /**
   * Pause animation for adding data.
   */
  pauseAnimation() {
    this.paused = true;

    if (this.rerenderingDelayTimerId) {
      clearTimeout(this.rerenderingDelayTimerId);
      this.rerenderingDelayTimerId = null;

      if (this.chart.options.series.shifting) {
        this.chart.dataProcessor.shiftData();
      }
    }
  }

  /**
   * Restart animation for adding data.
   */
  restartAnimation() {
    this.paused = false;
    this.lookupping = false;
    this._startLookup();
  }

  /**
   * Start lookup for checking added data.
   * @private
   */
  _startLookup() {
    if (this.lookupping) {
      return;
    }

    this.lookupping = true;

    this._checkForAddedData();
  }

  /**
   * Add data.
   * @param {string} category - category
   * @param {Array} values - values
   */
  addData(category, values) {
    if (!values) {
      values = category;
      category = null;
    }

    this.chart.dataProcessor.addDynamicData(category, values);

    // we should not animate for added data if initial render have not completed
    if (this.isInitRenderCompleted) {
      this._startLookup();
    } else if (values) {
      this.addedDataCount += 1;
    }
  }
}

export default DynamicDataHelper;
