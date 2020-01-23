/**
 * @fileoverview SimpleEventDetector is event handle layer for simply sending clientX, clientY.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */

import chartConst from '../../const';
import MouseEventDetectorBase from './mouseEventDetectorBase';
import renderUtil from '../../helpers/renderUtil';

class SimpleEventDetector extends MouseEventDetectorBase {
  /**
   * SimpleEventDetector is event handle layer for simply sending clientX, clientY.
   * @constructs SimpleEventDetector
   * @private
   * @param {object} params parameters
   *      @param {string} params.chartType - chart type
   * @extends MouseEventDetectorBase
   */
  constructor(params) {
    super();
    /**
     * chart type
     * @type {string}
     */
    this.chartType = params.chartType;

    this.drawingType = chartConst.COMPONENT_TYPE_DOM;

    /**
     * event bus for transmitting message
     * @type {object}
     */
    this.eventBus = params.eventBus;
  }

  /**
   * Render mouse event detector area
   * @param {HTMLElement} mouseEventDetectorContainer - container element for mouse event detector
   * @private
   */
  _renderMouseEventDetectorArea(mouseEventDetectorContainer) {
    renderUtil.renderDimension(mouseEventDetectorContainer, this.layout.dimension);
    renderUtil.renderPosition(mouseEventDetectorContainer, this.layout.position);
  }

  /**
   * Initialize data of mouse event detector
   * @override
   */
  onReceiveSeriesData() {}

  /**
   * On click.
   * @param {MouseEvent} e - mouse event
   * @private
   * @override
   */
  _onClick(e) {
    this._onMouseEvent('click', e);
  }

  /**
   * On mouse move.
   * @param {MouseEvent} e - mouse event
   * @private
   * @override
   */
  _onMousemove(e) {
    this._onMouseEvent('move', e);
  }

  /**
   * On mouse out.
   * @param {MouseEvent} e - mouse event
   * @private
   * @override
   */
  _onMouseout(e) {
    this._onMouseEvent('move', e);
  }
}

/**
 * simpleTypeEventDetectorFactory
 * @param {object} params chart options
 * @returns {object} simple type event detector instance
 * @ignore
 */
export default function simpleTypeEventDetectorFactory(params) {
  return new SimpleEventDetector(params);
}

simpleTypeEventDetectorFactory.componentType = 'mouseEventDetector';
