/**
 * @fileoverview chartExportMenu component.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var chartConst = require('../../const');
var chartExporter = require('../../helpers/chartExporter');
var dom = require('../../helpers/domHandler');
var eventListener = require('../../helpers/eventListener');
var predicate = require('../../helpers/predicate');
var renderUtil = require('../../helpers/renderUtil');
var snippet = require('tui-code-snippet');

var CHART_EXPORT_MENU_ITEMS = ['xls', 'csv', 'png', 'jpeg'];
var CLASS_NAME_CHART_EXPORT_MENU_OPENED = 'menu-opened';

var ChartExportMenu = snippet.defineClass(/** @lends ChartExportMenu.prototype */ {
    /**
     * ChartExportMenu component.
     * @constructs ChartExportMenu
     * @private
     * @param {object} params parameters
     */
    init: function(params) {
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

        this.drawingType = chartConst.COMPONENT_TYPE_DOM;

        this.theme = params.theme || null;
    },

    /**
     * Create chartExportMenuButton
     * @returns {HTMLElement}
     * @private
     */
    _createChartExportMenuButton: function() {
        var menuButton = dom.create('div', chartConst.CLASS_NAME_CHART_EXPORT_MENU_BUTTON);

        if (this.options.buttonClass) {
            dom.addClass(menuButton, this.options.buttonClass);
        }

        return menuButton;
    },
    /**
     * Render chartExportMenu area.
     * @param {HTMLElement} chartExportMenuContainer chartExportMenu area element
     * @private
     */
    _renderChartExportMenuArea: function(chartExportMenuContainer) {
        var menuButton = this._createChartExportMenuButton();
        var dimension = this.layout.dimension;

        chartExportMenuContainer.appendChild(menuButton);

        renderUtil.renderDimension(chartExportMenuContainer, dimension);
        renderUtil.renderPosition(chartExportMenuContainer, this.layout.position);
    },

    /**
     * Render chartExportMenu area.
     * @param {HTMLElement} chartExportMenuContainer chartExportMenu area element
     * @private
     */
    _renderChartExportMenu: function(chartExportMenuContainer) {
        var seriesDataModelMap = this.dataProcessor.seriesDataModelMap;
        var isDataDownloadAvailable = this.isDataDownloadAvailable(seriesDataModelMap);
        var isDownloadSupported = chartExporter.isDownloadSupported;
        var isImageExtension = chartExporter.isImageExtension;
        var isImageDownloadAvailable = chartExporter.isImageDownloadAvailable;
        var menuElement = dom.create('ul', chartConst.CLASS_NAME_CHART_EXPORT_MENU);
        var menuStyle = menuElement.style;
        var menuTheme = this.theme;
        var menuItems = [];

        if (isDownloadSupported && (isDataDownloadAvailable || isImageDownloadAvailable)) {
            menuItems = snippet.map(CHART_EXPORT_MENU_ITEMS, function(exportItemType) {
                var itemElement;

                if ((!isImageExtension(exportItemType) && isDataDownloadAvailable)
                    || (isImageExtension(exportItemType) && isImageDownloadAvailable)
                ) {
                    itemElement = dom.create('li', chartConst.CLASS_NAME_CHART_EXPORT_MENU_ITEM);
                    itemElement.id = exportItemType;
                    itemElement.innerHTML = 'Export to .' + exportItemType;
                }

                return itemElement;
            });
        } else {
            menuStyle.width = '200px';
            menuItems[0] = dom.create('li', chartConst.CLASS_NAME_CHART_EXPORT_MENU_ITEM);
            menuItems[0].innerHTML = 'Browser does not support client-side download.';
        }

        if (menuTheme) {
            if (menuTheme.borderWidth) {
                menuStyle.borderWidth = menuTheme.borderWidth;
            }

            if (menuTheme.borderRadius) {
                menuStyle.borderRadius = menuTheme.borderRadius;
            }

            if (menuTheme.backgroundColor) {
                menuStyle.backgroundColor = menuTheme.backgroundColor;
            }

            if (menuTheme.color) {
                menuStyle.color = menuTheme.color;
            }
        }

        if (this.options.menuClass) {
            dom.addClass(menuElement, this.options.menuClass);
        }

        dom.append(menuElement, menuItems);

        this.chartExportMenu = menuElement;

        dom.append(chartExportMenuContainer, menuElement);
    },

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
    _setDataForRendering: function(data) {
        if (data) {
            this.layout = data.layout;
            this.dimensionMap = data.dimensionMap;
            this.axisDataMap = data.axisDataMap;
        }
    },

    /**
     * Render chartExportMenu component.
     * @param {object} data - bounds and scale data
     * @returns {HTMLElement} chartExportMenu element
     */
    render: function(data) {
        var container = null;

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
    },

    /**
     * Rerender.
     */
    rerender: function() {
        this._hideChartExportMenu();
    },

    /**
     * Resize.
     */
    resize: function() {
    },

    /**
     * Show chart export menu
     * @private
     */
    _showChartExportMenu: function() {
        dom.addClass(this.chartExportMenuContainer, CLASS_NAME_CHART_EXPORT_MENU_OPENED);
        this.chartExportMenu.style.display = 'block';
    },

    /**
     * Hide chart export menu
     * @private
     */
    _hideChartExportMenu: function() {
        if (this.chartExportMenuContainer) {
            dom.removeClass(this.chartExportMenuContainer, CLASS_NAME_CHART_EXPORT_MENU_OPENED);
            this.chartExportMenu.style.display = 'none';
        }
    },

    /**
     * onclick event handler
     * @param {MouseEvent} e mouse event
     * @private
     */
    _onClick: function(e) {
        var elTarget = e.target || e.srcElement;
        var svgElement = this.container.parentNode.getElementsByTagName('svg')[0];

        if (dom.hasClass(elTarget, chartConst.CLASS_NAME_CHART_EXPORT_MENU_ITEM)) {
            if (elTarget.id) {
                this.eventBus.fire('beforeImageDownload');

                chartExporter.exportChart(this.exportFilename, elTarget.id,
                    this.dataProcessor.rawData, svgElement, this.options);

                this.eventBus.fire('afterImageDownload');
            }

            this._hideChartExportMenu();
        } else if (dom.hasClass(elTarget, chartConst.CLASS_NAME_CHART_EXPORT_MENU_BUTTON)
            && (this.chartExportMenuContainer === elTarget.parentNode)
            && !dom.hasClass(this.chartExportMenuContainer, CLASS_NAME_CHART_EXPORT_MENU_OPENED)) {
            this._showChartExportMenu();
        } else {
            this._hideChartExportMenu();
        }
    },

    /**
     * Return boolean value for chart data is able to export
     * @param {object} seriesDataModels series data model
     * @returns {boolean}
     */
    isDataDownloadAvailable: function(seriesDataModels) {
        var result = true;

        if (predicate.isTreemapChart(this.chartType)) {
            result = false;
        } else {
            snippet.forEach(seriesDataModels, function(seriesDataModel) {
                if (seriesDataModel.isCoordinateType) {
                    result = false;
                }

                return false;
            });
        }

        return result;
    },

    /**
     * Attach browser event.
     * @private
     */
    _attachEvent: function() {
        eventListener.on(this.chartExportMenuContainer.parentNode, 'click', this._onClick, this);
    },

    /**
     * Detach browser event.
     * @private
     */
    _detachEvent: function() {
        eventListener.off(this.chartExportMenuContainer.parentNode, 'click', this._onClick);
    }
});

/**
 * Factory for ChartExportMenu
 * @param {object} params parameter
 * @returns {object|null}
 * @ignore
 */
function chartExportMenuFactory(params) {
    var isVisible = params.options.visible;
    var chartExportMenu = null;
    var chartOption = params.chartOptions.chart || {};
    var exportingOption = params.chartOptions.chartExportMenu;

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

module.exports = chartExportMenuFactory;
