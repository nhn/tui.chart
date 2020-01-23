/**
 * @fileoverview MouseEventDetectorBase is base class for mouse event detector components.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */

import TickBaseCoordinateModel from './tickBaseCoordinateModel';
import BoundsBaseCoordinateModel from './boundsBaseCoordinateModel';
import chartConst from '../../const';
import eventListener from '../../helpers/eventListener';
import predicate from '../../helpers/predicate';
import dom from '../../helpers/domHandler';
import renderUtil from '../../helpers/renderUtil';

import snippet from 'tui-code-snippet';

class MouseEventDetectorBase {
  /**
   * MouseEventDetectorBase is base class for mouse event detector components.
   * @constructs MouseEventDetectorBase
   * @private
   * @param {object} params parameters
   *      @param {string} params.chartType - chart type
   *      @param {Array.<string>} params.chartTypes - chart types
   *      @param {boolean} params.isVertical - whether vertical or not
   *      @param {DataProcessor} params.dataProcessor - DataProcessor instance
   *      @param {boolean} params.allowSelect - whether has allowSelect option or not
   */
  constructor(params) {
    if (!params) {
      return;
    }

    /**
     * type of chart
     * @type {string}
     */
    this.chartType = params.chartType;

    /**
     * chartTypes is available in combo chart
     * @type {Array.<string>}
     */
    this.chartTypes = params.chartTypes;

    /**
     * whether vertical or not
     * @type {boolean}
     */
    this.isVertical = params.isVertical;

    /**
     * data processor
     * @type {DataProcessor}
     */
    this.dataProcessor = params.dataProcessor;

    /**
     * whether allow select series or not
     * @type {boolean}
     */
    this.allowSelect = params.allowSelect;

    /**
     * event bus for transmitting message
     * @type {object}
     */
    this.eventBus = params.eventBus;

    /**
     * layout bounds information for this components
     * @type {null|{dimension:{width:number, height:number}, position:{left:number, top:number}}}
     */
    this.layout = null;

    /**
     * selected series item.
     * @type {null | object}
     */
    this.selectedData = null;

    const isLineTypeChart = predicate.isLineTypeChart(this.chartType, this.chartTypes);
    /**
     * expand size
     * @type {number}
     */
    this.expandSize = isLineTypeChart ? chartConst.SERIES_EXPAND_SIZE : 0;

    /**
     * series item bounds data
     * @type {Array}
     */
    this.seriesItemBoundsData = [];

    /**
     * series count
     * @type {number}
     */
    this.seriesCount = predicate.isComboChart(this.chartType) ? 2 : 1;

    this._attachToEventBus();

    this.drawingType = chartConst.COMPONENT_TYPE_DOM;
  }

  /**
   * Attach to event bus.
   * @private
   */
  _attachToEventBus() {
    this.eventBus.on('receiveSeriesData', this.onReceiveSeriesData, this);
  }

  /**
   * Get bound for rendering.
   * @returns {{
   *      dimension: {width: number, height: number},
   *      position: {left: number, top: number}
   * }}
   * @private
   */
  _getRenderingBound() {
    const renderingBound = renderUtil.expandBound(this.layout);

    return renderingBound;
  }

  /**
   * Render event handle layer area.
   * @param {HTMLElement} mouseEventDetectorContainer - container element for mouse event detector
   * @param {number} tickCount - tick count
   * @private
   */
  _renderMouseEventDetectorArea(mouseEventDetectorContainer, tickCount) {
    ({ dimension: this.dimension } = this.layout);

    const tbcm = new TickBaseCoordinateModel(
      this.layout,
      tickCount,
      this.chartType,
      this.isVertical,
      this.chartTypes
    );
    this.tickBaseCoordinateModel = tbcm;
    const { dimension, position } = this._getRenderingBound();
    renderUtil.renderDimension(mouseEventDetectorContainer, dimension);
    renderUtil.renderPosition(mouseEventDetectorContainer, position);
  }

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
  _setDataForRendering(data) {
    this.layout = data.layout;
  }

  /**
   * Pick tick count.
   * @param {{xAxis: object, yAxis: object}} axisDataMap - axis data map
   * @returns {number}
   * @private
   */
  _pickTickCount(axisDataMap) {
    if (this.isVertical) {
      return axisDataMap.xAxis.eventTickCount || axisDataMap.xAxis.tickCount;
    }

    return axisDataMap.yAxis.tickCount;
  }

  /**
   * Render for mouseEventDetector component.
   * @param {object} data - bounds data and tick count
   * @returns {HTMLElement} container for mouse event detector
   */
  render(data) {
    this.positionMap = data.positionMap;
    const container = data.paper;
    let tickCount;

    dom.addClass(container, 'tui-chart-series-custom-event-area');
    container.style.backgroundColor = 'aliceblue';

    if (data.axisDataMap.xAxis) {
      tickCount = this._pickTickCount(data.axisDataMap);
    }

    this._setDataForRendering(data);
    this._renderMouseEventDetectorArea(container, tickCount);
    this.attachEvent(container);
    this.mouseEventDetectorContainer = container;

    this.transparentChild = this._createTransparentChild();
    dom.append(container, this.transparentChild);

    return container;
  }

  /**
   * Create a transparent element
   * @param {string} height - value of css heigth property
   * @returns {HTMLElement} transparent element
   * @private
   */
  _createTransparentChild() {
    const child = document.createElement('DIV');
    const { style } = child;

    style.backgroundColor = '#fff';
    style.height = renderUtil.getStyle(this.mouseEventDetectorContainer).height;
    renderUtil.setOpacity(child, 0);

    return child;
  }

  /**
   * Calculate layer position by client position.
   * @param {number} clientX - clientX
   * @param {number} [clientY] - clientY
   * @param {boolean} [checkLimit] - whether check limit or not
   * @returns {{x: number, y: ?number}}
   * @private
   */
  _calculateLayerPosition(clientX, clientY, checkLimit) {
    const { left, right, top } = this.mouseEventDetectorContainer.getBoundingClientRect();
    const seriesPosition = this.positionMap.series;
    const { expandSize } = this;
    const layerPosition = {};

    checkLimit = snippet.isUndefined(checkLimit) ? true : checkLimit;

    if (checkLimit) {
      const maxLeft = right - expandSize;
      const minLeft = left + expandSize;
      clientX = Math.min(Math.max(clientX, minLeft), maxLeft);
    }

    layerPosition.x = clientX - left + seriesPosition.left - chartConst.CHART_PADDING;

    if (!snippet.isUndefined(clientY)) {
      layerPosition.y = clientY - top + seriesPosition.top - chartConst.CHART_PADDING;
    }

    return layerPosition;
  }

  /**
   * Create BoundsBaseCoordinateModel from seriesItemBoundsData for mouse event detector.
   * @param {{chartType: string, data: object}} seriesItemBoundsDatum - series item bounds datum
   */
  onReceiveSeriesData(seriesItemBoundsDatum) {
    const { seriesCount } = this;
    let { seriesItemBoundsData } = this;

    if (seriesItemBoundsData.length === seriesCount) {
      seriesItemBoundsData = [];
    }

    seriesItemBoundsData.push(seriesItemBoundsDatum);

    if (seriesItemBoundsData.length === seriesCount) {
      this.boundsBaseCoordinateModel = new BoundsBaseCoordinateModel(seriesItemBoundsData);
    }
  }

  /**
   * Rerender mouse event detector component.
   * @param {object} data - bounds data and tick count
   */
  rerender(data) {
    let tickCount;

    this.positionMap = data.positionMap;

    if (data.axisDataMap.xAxis) {
      tickCount = this._pickTickCount(data.axisDataMap);
    }

    this.selectedData = null;
    this._setDataForRendering(data);
    this._renderMouseEventDetectorArea(this.mouseEventDetectorContainer, tickCount);

    this.transparentChild.style.height = renderUtil.getStyle(
      this.mouseEventDetectorContainer
    ).height;
  }

  /**
   * Rerender, when resizing chart.
   * @param {object} data - bounds data and tick count
   */
  resize(data) {
    this.containerBound = null;
    this.rerender(data);
  }

  /**
   * Whether changed select data or not.
   * @param {object} prev - previous data
   * @param {object} cur - current data
   * @returns {boolean}
   * @private
   */
  _isChangedSelectData(prev, cur) {
    return (
      !prev ||
      !cur ||
      prev.chartType !== cur.chartType ||
      prev.indexes.groupIndex !== cur.indexes.groupIndex ||
      prev.indexes.index !== cur.indexes.index
    );
  }

  /**
   * Find coordinate data from boundsCoordinateModel.
   * @param {{x: number, y: number}} layerPosition - layer position
   * @returns {object}
   * @private
   */
  _findDataFromBoundsCoordinateModel(layerPosition) {
    const layerX = layerPosition.x;
    const layerY = layerPosition.y;
    let groupIndex;

    if (predicate.isTreemapChart(this.chartType)) {
      groupIndex = 0;
    } else {
      groupIndex = this.tickBaseCoordinateModel.findIndex(this.isVertical ? layerX : layerY);
    }

    return this.boundsBaseCoordinateModel.findData(groupIndex, layerX, layerY);
  }

  /**
   * Find data.
   * @param {number} clientX - clientX
   * @param {number} clientY - clientY
   * @returns {object}
   * @private
   */
  _findData(clientX, clientY) {
    const layerPosition = this._calculateLayerPosition(clientX, clientY);

    return this._findDataFromBoundsCoordinateModel(layerPosition);
  }

  /**
   * Show tooltip
   * @private
   * @abstract
   */
  _showTooltip() {}

  /**
   * hide tooltip
   * @private
   * @abstract
   */
  _hideTooltip() {}

  /**
   * When mouse event happens,
   * hide MouseEventDetector container so that detect event of series elements
   * and send mouse position data to series component
   * @param {string} eventType - mouse event detector type
   * @param {MouseEvent} e - mouse event
   * @private
   */
  _onMouseEvent(eventType, e) {
    dom.addClass(this.mouseEventDetectorContainer, 'hide');
    this.eventBus.fire(`${eventType}Series`, {
      left: e.clientX,
      top: e.clientY
    });
    dom.removeClass(this.mouseEventDetectorContainer, 'hide');
  }

  /**
   * deselect selected data.
   * @ignore
   */
  unselectSeries() {
    if (this.selectedData) {
      this.eventBus.fire('unselectSeries', this.selectedData);
      this.selectedData = null;
    }
  }

  /**
   * Call 'selectSeries' event, when changed found position data.
   * And call 'unselectSeries' event, when not changed found position data.
   * @param {MouseEvent} e - mouse event
   * @private
   */
  _onClick(e) {
    const foundData = this._findData(e.clientX, e.clientY);
    this.selectSeries(foundData);
  }

  /**
   * To call selectSeries callback of public event.
   * @TODO: Need to change the selectedData location (Not used for mouse events only)
   * @param {object} seriesData - series data
   * @param {?boolean} shouldSelect - whether should select or not
   */
  selectSeries(seriesData, shouldSelect = true) {
    if (!this._isChangedSelectData(this.selectedData, seriesData)) {
      this.unselectSeries();
    } else if (seriesData) {
      if (this.selectedData) {
        this.unselectSeries();
      }

      this.eventBus.fire('selectSeries', seriesData, shouldSelect);
      if (this.allowSelect) {
        this.selectedData = seriesData;
      }
    }
  }

  /**
   * On mouse down
   * @private
   * @abstract
   */
  _onMousedown() {}

  /**
   * On mouse up
   * @private
   * @abstract
   */
  _onMouseup() {}

  /**
   * Store client position, when occur mouse move event.
   * @param {MouseEvent} e - mouse event
   * @abstract
   * @private
   */
  _onMousemove() {}

  /**
   * Abstract mouseout handler
   * @abstract
   * @private
   */
  _onMouseout() {}

  /**
   * Attach mouse event.
   * @param {HTMLElement} target - target element
   */
  attachEvent(target) {
    eventListener.on(
      target,
      {
        click: this._onClick,
        mousedown: this._onMousedown,
        mouseup: this._onMouseup,
        mousemove: this._onMousemove,
        mouseout: this._onMouseout
      },
      this
    );
  }

  /**
   * find data by indexes
   * @abstract
   */
  findDataByIndexes() {}

  /**
   * Set prevClientPosition by MouseEvent
   * @param {?MouseEvent} event - mouse event
   * @private
   */
  _setPrevClientPosition(event) {
    if (!event) {
      this.prevClientPosition = null;
    } else {
      this.prevClientPosition = {
        x: event.clientX,
        y: event.clientY
      };
    }
  }
}

snippet.CustomEvents.mixin(MouseEventDetectorBase);

export default MouseEventDetectorBase;
