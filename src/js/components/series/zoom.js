/**
 * @fileoverview Zoom component.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */

import snippet from 'tui-code-snippet';
import seriesTemplate from './seriesTemplate';
import chartConst from '../../const';
import dom from '../../helpers/domHandler';
import calculator from '../../helpers/calculator';
import renderUtil from '../../helpers/renderUtil';
import eventListener from '../../helpers/eventListener';
import predicate from '../../helpers/predicate';

const {
  COMPONENT_TYPE_DOM,
  MAP_CHART_ZOOM_AREA_HEIGHT,
  MAP_CHART_ZOOM_AREA_WIDTH,
  CHART_PADDING
} = chartConst;

const IS_MSIE_VERSION_LTE_THAN_8 = snippet.browser.msie && snippet.browser.version <= 8;

class Zoom {
  /**
   * Zoom component.
   * @param {{eventBus: object}} params - parameters
   * @constructs Zoom
   * @private
   */
  constructor(params) {
    /**
     * zoom component className
     * @type {string}
     */
    this.className = 'tui-chart-zoom-area';

    const { seriesTypes } = params;
    const isMapChart =
      seriesTypes && seriesTypes.length ? predicate.isMapChart(seriesTypes[0]) : false;
    const legendOption = params.dataProcessor.options.legend;
    const isLegendTop = predicate.isLegendAlignTop(legendOption.align);
    const isLegendVisible = legendOption.visible !== false;

    this.isMapLegendTop = isMapChart && isLegendTop && isLegendVisible;

    /**
     * event bus for transmitting message
     * @type {object}
     */
    this.eventBus = params.eventBus;

    /**
     * Magnification.
     * @type {number}
     */
    this.magn = 1;

    /**
     * Stacked wheelDelta.
     * @type {number}
     */
    this.stackedWheelDelta = 0;

    this.drawingType = COMPONENT_TYPE_DOM;

    this._attachToEventBus();
  }

  /**
   * Attach to event bus.
   * @private
   */
  _attachToEventBus() {
    this.eventBus.on('wheel', this.onWheel, this);
  }

  /**
   * Render.
   * @param {{positionMap: {series: {left: number, top: number}}}} data - data for rendering
   * @returns {HTMLElement} zoom container
   */
  render(data) {
    let container;

    if (!IS_MSIE_VERSION_LTE_THAN_8) {
      let positionTop = calculator.sum([
        data.positionMap.series.top,
        -MAP_CHART_ZOOM_AREA_HEIGHT,
        MAP_CHART_ZOOM_AREA_WIDTH
      ]);

      if (this.isMapLegendTop) {
        positionTop = data.positionMap.legend.top - MAP_CHART_ZOOM_AREA_WIDTH;
      }

      const position = {
        top: positionTop,
        right: CHART_PADDING
      };

      container = dom.create('DIV', this.className);

      container.innerHTML += seriesTemplate.ZOOM_BUTTONS;
      renderUtil.renderPosition(container, position);
      this._attachEvent(container);
    }

    return container;
  }

  /**
   * Find button element.
   * @param {HTMLElement} target target element.
   * @returns {?HTMLElement} button element
   * @private
   */
  _findBtnElement(target) {
    const btnClassName = 'tui-chart-zoom-btn';
    let btnElement = target;

    if (!dom.hasClass(target, btnClassName)) {
      btnElement = dom.findParentByClass(target, btnClassName);
    }

    return btnElement;
  }

  /**
   * Zoom
   * @param {number} magn magnification
   * @param {?{left: number, top: number}} position mouse position
   * @private
   */
  _zoom(magn, position) {
    this.eventBus.fire('zoomMap', magn, position);
  }

  /**
   * On click.
   * @param {MouseEvent} e mouse event
   * @returns {?boolean} prevent default for ie
   * @private
   */
  _onClick(e) {
    const target = e.target || e.srcElement;
    const btnElement = this._findBtnElement(target);
    const zoomDirection = btnElement.getAttribute('data-magn');
    const magn = this._calculateMagn(zoomDirection);

    if (magn > 5) {
      this.magn = 5;
    } else if (magn < 1) {
      this.magn = 1;
    } else if (magn >= 1) {
      this._zoom(magn);
    }

    if (e.preventDefault) {
      e.preventDefault();
    }

    return false;
  }

  /**
   * Attach event.
   * @param {HTMLElement} target target element
   * @private
   */
  _attachEvent(target) {
    eventListener.on(target, 'click', this._onClick, this);
  }

  /**
   * Calculate magnification from zoomDirection.
   * @param {number} zoomDirection zoomDirection (positive is zoomIn)
   * @returns {number} magnification
   * @private
   */
  _calculateMagn(zoomDirection) {
    if (zoomDirection > 0) {
      this.magn += 0.1;
    } else if (zoomDirection < 0) {
      this.magn -= 0.1;
    }

    return this.magn;
  }

  /**
   * On wheel.
   * @param {number} wheelDelta wheelDelta
   * @param {{left: number, top: number}} position mouse position
   */
  onWheel(wheelDelta, position) {
    const magn = this._calculateMagn(wheelDelta);

    if (magn > 5) {
      this.magn = 5;
    } else if (magn < 1) {
      this.magn = 1;
    } else if (magn >= 1) {
      this._zoom(magn, position);
    }
  }
}

/**
 * zoomFactory
 * @param {object} params chart options
 * @returns {object} zoom instance
 * @ignore
 */
export default function zoomFactory(params) {
  return new Zoom(params);
}

zoomFactory.componentType = 'zoom';
