/**
 * @fileoverview MapChartEventDetector is mouse event detector for map chart.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */

import MouseEventDetectorBase from './mouseEventDetectorBase';
import chartConst from '../../const';
import eventListener from '../../helpers/eventListener';
import dom from '../../helpers/domHandler';
import renderUtil from '../../helpers/renderUtil';
import snippet from 'tui-code-snippet';

class MapChartEventDetector extends MouseEventDetectorBase {
  /**
   * MapChartEventDetector is mouse event detector for map chart.
   * @param {object} params parameters
   *      @param {string} params.chartType - chart type
   * @constructs MapChartEventDetector
   * @private
   * @extends MouseEventDetectorBase
   */
  constructor(params) {
    super();

    /**
     * chart type
     * {string}
     *
     */
    this.chartType = params.chartType;

    /**
     * event bus for transmitting message
     * @type {object}
     */
    this.eventBus = params.eventBus;

    /**
     * whether mouse down or not
     * @type {boolean}
     */
    this.isDown = false;

    this.drawingType = chartConst.COMPONENT_TYPE_DOM;
  }

  /**
   * Render event handle layer area
   * @param {HTMLElement} mouseEventDetectorContainer mouse event detector container element
   * @private
   */
  _renderMouseEventDetectorArea(mouseEventDetectorContainer) {
    renderUtil.renderDimension(mouseEventDetectorContainer, this.layout.dimension);
    renderUtil.renderPosition(mouseEventDetectorContainer, this.layout.position);
  }

  /**
   * On click.
   * @private
   * @override
   */
  _onClick() {}

  /**
   * Call 'dragStartMapSeries' event, when occur mouse down event.
   * @param {mouseevent} e mouse event
   * @private
   * @override
   */
  _onMousedown(e) {
    this.isDown = true;
    this.eventBus.fire('dragStartMapSeries', {
      left: e.clientX,
      top: e.clientY
    });
  }

  /**
   * Drag end.
   * @private
   */
  _dragEnd() {
    this.isDrag = false;
    dom.removeClass(this.mouseEventDetectorContainer, 'drag');
    this.eventBus.fire('dragEndMapSeries');
  }

  /**
   * If drag, call dragEnd function.
   * But if not drag, occur click event.
   * @param {mouseevent} e mouse event
   * @private
   * @override
   */
  _onMouseup(e) {
    this.isDown = false;

    if (this.isDrag) {
      this._dragEnd();
    } else {
      this._onMouseEvent('click', e);
    }

    this.isMove = false;
  }

  /**
   * If mouse downed, set drag mode.
   * But if not downed, set move mode.
   * @param {mouseevent} e mouse event
   * @private
   * @override
   */
  _onMousemove(e) {
    if (this.isDown) {
      if (!this.isDrag) {
        dom.addClass(this.mouseEventDetectorContainer, 'drag');
      }
      this.isDrag = true;
      this.eventBus.fire('dragMapSeries', {
        left: e.clientX,
        top: e.clientY
      });
    } else {
      this.isMove = true;
      this._onMouseEvent('move', e);
    }
  }

  /**
   * If drag mode, call dragEnd.
   * But if not drag mode, occur move event.
   * @private
   * @override
   */
  _onMouseout(e) {
    if (this.isDrag) {
      this._dragEnd();
    } else {
      this._onMouseEvent('move', e);
    }
    this.isDown = false;
  }

  /**
   * On mouse wheel.
   * @param {mouseevent} e mouse event
   * @returns {?boolean}
   * @private
   */
  _onMousewheel(e) {
    const wheelDelta = e.wheelDelta || e.detail * chartConst.FF_WHEELDELTA_ADJUSTING_VALUE;

    this.eventBus.fire('wheel', wheelDelta, {
      left: e.clientX,
      top: e.clientY
    });

    if (e.preventDefault) {
      e.preventDefault();
    }

    return false;
  }

  /**
   * Attach event.
   * @param {HTMLElement} target target element
   * @override
   */
  attachEvent(target) {
    MouseEventDetectorBase.prototype.attachEvent.call(this, target);

    if (snippet.browser.firefox) {
      eventListener.on(target, 'DOMMouseScroll', this._onMousewheel, this);
    } else {
      eventListener.on(target, 'mousewheel', this._onMousewheel, this);
    }
  }
}

/**
 * mapChartEventDetectorFactory
 * @param {object} params chart options
 * @returns {object} map chart event detector instance
 * @ignore
 */
export default function mapChartEventDetectorFactory(params) {
  return new MapChartEventDetector(params);
}

mapChartEventDetectorFactory.componentType = 'mouseEventDetector';
