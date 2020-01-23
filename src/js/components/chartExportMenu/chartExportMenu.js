/**
 * @fileoverview chartExportMenu component.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */

import chartConst from '../../const';
import chartExporter from '../../helpers/chartExporter';
import dom from '../../helpers/domHandler';
import eventListener from '../../helpers/eventListener';
import predicate from '../../helpers/predicate';
import renderUtil from '../../helpers/renderUtil';

const CHART_EXPORT_MENU_ITEMS = ['xls', 'csv', 'png', 'jpeg'];
const CLASS_NAME_CHART_EXPORT_MENU_OPENED = 'menu-opened';
const {
  CLASS_NAME_CHART_EXPORT_MENU_BUTTON,
  CLASS_NAME_CHART_EXPORT_MENU,
  CLASS_NAME_CHART_EXPORT_MENU_HEAD,
  CLASS_NAME_CHART_EXPORT_MENU_BODY,
  CLASS_NAME_CHART_EXPORT_MENU_ITEM,
  COMPONENT_TYPE_DOM
} = chartConst;

class ChartExportMenu {
  /**
   * ChartExportMenu component.
   * @constructs ChartExportMenu
   * @private
   * @param {object} params parameters
   */
  constructor(params) {
    /**
     * ChartExportMenu view className
     * @type {string}
     */
    this.className = 'tui-chart-chartExportMenu-area';

    /**
     * Data processor
     * @type {DataProcessor}
     */
    this.dataProcessor = params.dataProcessor;

    /**
     * chart title
     * @type {string}
     */
    this.chartTitle = params.chartTitle || 'tui-chart';

    /**
     * export filename
     * @type {string}
     */
    this.exportFilename = params.exportFilename || this.chartTitle;

    /**
     * chart type
     * @type {string}
     */
    this.chartType = params.chartType;

    /**
     * layout bounds information for this components
     * @type {null|{dimension:{width:number, height:number}, position:{right:number, top:number}}}
     */
    this.layout = null;

    /**
     * chartExportMenu container
     * @type {HTMLElement}
     */
    this.chartExportMenuContainer = null;

    /**
     * chartExportMenu element
     * @type {HTMLElement}
     */
    this.chartExportMenu = null;

    /**
     * chartExportMenu options
     */
    this.options = params.options;

    /**
     * Event bus
     * @type {EventBus}
     */
    this.eventBus = params.eventBus;
    this.drawingType = COMPONENT_TYPE_DOM;

    this.theme = params.theme || null;
  }

  /**
   * Create chartExportMenuButton
   * @returns {HTMLElement}
   * @private
   */
  _createChartExportMenuButton() {
    const menuButton = dom.create('div', CLASS_NAME_CHART_EXPORT_MENU_BUTTON);

    if (this.options.buttonClass) {
      dom.addClass(menuButton, this.options.buttonClass);
    }

    return menuButton;
  }

  /**
   * Render chartExportMenu area.
   * @param {HTMLElement} chartExportMenuContainer chartExportMenu area element
   * @private
   */
  _renderChartExportMenuArea(chartExportMenuContainer) {
    const menuButton = this._createChartExportMenuButton();
    const { dimension } = this.layout;

    chartExportMenuContainer.appendChild(menuButton);

    renderUtil.renderDimension(chartExportMenuContainer, dimension);
    renderUtil.renderPosition(chartExportMenuContainer, this.layout.position);
  }

  /**
   * Render chartExportMenu area.
   * @param {HTMLElement} chartExportMenuContainer chartExportMenu area element
   * @private
   */
  _renderChartExportMenu(chartExportMenuContainer) {
    const { seriesDataModelMap } = this.dataProcessor;
    const isDataDownloadAvailable = this.isDataDownloadAvailable(seriesDataModelMap);
    const { isDownloadSupported, isImageExtension, isImageDownloadAvailable } = chartExporter;
    const menuElement = dom.create('ul', CLASS_NAME_CHART_EXPORT_MENU);
    const menuHead = dom.create('li', CLASS_NAME_CHART_EXPORT_MENU_HEAD);
    const menuBody = dom.create('li', CLASS_NAME_CHART_EXPORT_MENU_BODY);
    const menuStyle = menuElement.style;
    const { borderWidth, borderRadius, backgroundColor, color } = this.theme;
    let menuItems = [];

    if (isDownloadSupported && (isDataDownloadAvailable || isImageDownloadAvailable)) {
      menuItems = CHART_EXPORT_MENU_ITEMS.map(exportItemType => {
        let itemElement;

        if (
          (!isImageExtension(exportItemType) && isDataDownloadAvailable) ||
          (isImageExtension(exportItemType) && isImageDownloadAvailable)
        ) {
          itemElement = dom.create('li', CLASS_NAME_CHART_EXPORT_MENU_ITEM);
          itemElement.id = exportItemType;
          itemElement.innerHTML = exportItemType;
        }

        return itemElement;
      });
    } else {
      menuStyle.width = '200px';
      menuItems[0] = dom.create('li', CLASS_NAME_CHART_EXPORT_MENU_ITEM);
      menuItems[0].innerHTML = 'Browser does not support client-side download.';
    }

    if (this.theme) {
      if (borderWidth) {
        menuStyle.borderWidth = borderWidth;
      }

      if (borderRadius) {
        menuStyle.borderRadius = borderRadius;
      }

      if (backgroundColor) {
        menuStyle.backgroundColor = backgroundColor;
      }

      if (color) {
        menuStyle.color = color;
      }
    }

    if (this.options.menuClass) {
      dom.addClass(menuElement, this.options.menuClass);
    }

    menuHead.innerHTML = 'Export to';

    dom.append(menuBody, menuItems);
    dom.append(menuElement, menuHead);
    dom.append(menuElement, menuBody);

    this.chartExportMenu = menuElement;

    dom.append(chartExportMenuContainer, menuElement);
  }

  /**
   * Set data for rendering.
   * @param {{
   *      layout: {
   *          dimension: {width: number, height: number},
   *          position: {left: number, top: number}
   *      },
   *      axisDataMap: object
   * }} data - bounds and scale data
   * @private
   */
  _setDataForRendering(data) {
    if (data) {
      this.layout = data.layout;
      this.dimensionMap = data.dimensionMap;
      this.axisDataMap = data.axisDataMap;
    }
  }

  /**
   * Render chartExportMenu component.
   * @param {object} data - bounds and scale data
   * @returns {HTMLElement} chartExportMenu element
   */
  render(data) {
    let container = null;

    if (chartExporter.isDownloadSupported) {
      container = this.container = data.paper;

      dom.addClass(container, this.className);

      this._setDataForRendering(data);
      this._renderChartExportMenuArea(container);
      this._renderChartExportMenu(container);
      this.chartExportMenuContainer = container;
      this._attachEvent();
    }

    return container;
  }

  /**
   * Rerender.
   */
  rerender() {
    this._hideChartExportMenu();
  }

  /**
   * Resize.
   */
  resize() {}

  /**
   * Show chart export menu
   * @private
   */
  _showChartExportMenu() {
    dom.addClass(this.chartExportMenuContainer, CLASS_NAME_CHART_EXPORT_MENU_OPENED);
    this.chartExportMenu.style.display = 'block';
  }

  /**
   * Hide chart export menu
   * @private
   */
  _hideChartExportMenu() {
    if (this.chartExportMenuContainer) {
      dom.removeClass(this.chartExportMenuContainer, CLASS_NAME_CHART_EXPORT_MENU_OPENED);
      this.chartExportMenu.style.display = 'none';
    }
  }

  /**
   * onclick event handler
   * @param {MouseEvent} e mouse event
   * @private
   */
  _onClick(e) {
    const elTarget = e.target || e.srcElement;

    if (dom.hasClass(elTarget, CLASS_NAME_CHART_EXPORT_MENU_ITEM)) {
      if (elTarget.id) {
        const svgElement = this._getMainSvgElemenmt(this.container.parentNode);

        this.eventBus.fire('beforeImageDownload');

        chartExporter.exportChart(
          this.exportFilename,
          elTarget.id,
          this.dataProcessor.rawData,
          svgElement,
          this.options
        );

        this.eventBus.fire('afterImageDownload');
      }

      this._hideChartExportMenu();
    } else if (
      dom.hasClass(elTarget, CLASS_NAME_CHART_EXPORT_MENU_BUTTON) &&
      this.chartExportMenuContainer === elTarget.parentNode &&
      !dom.hasClass(this.chartExportMenuContainer, CLASS_NAME_CHART_EXPORT_MENU_OPENED)
    ) {
      this._showChartExportMenu();
    } else {
      this._hideChartExportMenu();
    }
  }

  /**
   * Return chart svg
   * @param {HTMLElement} mainContainer - chart container element
   * @returns {HTMLElement} - chart main svg element
   * @private
   */
  _getMainSvgElemenmt(mainContainer) {
    const svgElements = Array.from(mainContainer.getElementsByTagName('svg'));
    let svgElement;

    svgElements.forEach(svg => {
      if (mainContainer === svg.parentNode) {
        svgElement = svg;
      }
    });

    return svgElement;
  }

  /**
   * Return boolean value for chart data is able to export
   * @param {object} seriesDataModels series data model
   * @returns {boolean}
   */
  isDataDownloadAvailable(seriesDataModels) {
    let result = true;

    if (predicate.isTreemapChart(this.chartType)) {
      result = false;
    } else {
      Object.values(seriesDataModels).forEach(seriesDataModel => {
        if (seriesDataModel.isCoordinateType) {
          result = false;
        }

        return false;
      });
    }

    return result;
  }

  /**
   * Attach browser event.
   * @private
   */
  _attachEvent() {
    eventListener.on(this.chartExportMenuContainer.parentNode, 'click', this._onClick, this);
  }

  /**
   * Detach browser event.
   * @private
   */
  _detachEvent() {
    eventListener.off(this.chartExportMenuContainer.parentNode, 'click', this._onClick);
  }
}

/**
 * Factory for ChartExportMenu
 * @param {object} params parameter
 * @returns {object|null}
 * @ignore
 */
export default function chartExportMenuFactory(params) {
  const isVisible = params.options.visible;
  const { chart: chartOption = {} } = params.chartOptions;
  const exportingOption = params.chartOptions.chartExportMenu;
  let chartExportMenu = null;

  if (chartOption.title) {
    params.chartTitle = chartOption.title.text;
  }

  if (exportingOption && exportingOption.filename) {
    params.exportFilename = exportingOption.filename;
  }

  if (isVisible) {
    chartExportMenu = new ChartExportMenu(params);
  }

  return chartExportMenu;
}

chartExportMenuFactory.componentType = 'chartExportMenu';
