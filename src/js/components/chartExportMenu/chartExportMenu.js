/**
 * @fileoverview chartExportMenu component.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var chartConst = require('../../const');
var eventListener = require('../../helpers/eventListener');
var dom = require('../../helpers/domHandler');
var renderUtil = require('../../helpers/renderUtil');
var chartDataExporter = require('../../helpers/chartDataExporter');

var CHART_EXPORT_MENU_ITEMS = ['xls', 'csv'];
var CLASS_NAME_CHART_EXPORT_MENU_OPENED = 'menu-opened';

var ChartExportMenu = tui.util.defineClass(/** @lends ChartExportMenu.prototype */ {
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
        this.chartTitle = params.chartTitle;

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
    },

    /**
     * Create chartExportMenuButton
     * @returns {HTMLElement}
     * @private
     */
    _createChartExportMenuButton: function() {
        var menuButton = dom.create('div', chartConst.CLASS_NAME_CHART_EXPORT_MENU_BUTTON);
        menuButton.innerHTML = 'menu';

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
        var browserSupportsDownload = chartDataExporter.isBrowserSupportClientSideDownload();
        var chartExportMenuElement = dom.create('ul');
        var menuStyle = chartExportMenuElement.style;
        var menuItems = [];

        if (browserSupportsDownload) {
            menuItems = tui.util.map(CHART_EXPORT_MENU_ITEMS, function(exportItemType) {
                var itemElement = dom.create('li', chartConst.CLASS_NAME_CHART_EXPORT_MENU_ITEM);
                itemElement.id = exportItemType;
                itemElement.innerHTML = 'Export to .' + exportItemType;

                return itemElement;
            });
        } else {
            menuStyle.width = '200px';
            menuItems[0] = dom.create('li', chartConst.CLASS_NAME_CHART_EXPORT_MENU_ITEM);
            menuItems[0].innerHTML = 'Browser does not support client-side download.';
        }

        dom.append(chartExportMenuElement, menuItems);

        this.chartExportMenu = chartExportMenuElement;

        dom.append(chartExportMenuContainer, chartExportMenuElement);
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
        var container = dom.create('DIV', this.className);

        this._setDataForRendering(data);
        this._renderChartExportMenuArea(container);
        this._renderChartExportMenu(container);
        this.chartExportMenuContainer = container;
        this._attachEvent(container);

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
        dom.removeClass(this.chartExportMenuContainer, CLASS_NAME_CHART_EXPORT_MENU_OPENED);
        this.chartExportMenu.style.display = 'none';
    },

    /**
     * onclick event handler
     * @param {MouseEvent} e mouse event
     * @private
     */
    _onClick: function(e) {
        var elTarget = e.target || e.srcElement;

        if (dom.hasClass(elTarget, chartConst.CLASS_NAME_CHART_EXPORT_MENU_ITEM)) {
            if (elTarget.id) {
                chartDataExporter.exportChartData(elTarget.id, this.dataProcessor.rawData, this.chartTitle);
            }

            this._hideChartExportMenu();
        } else if (dom.hasClass(elTarget, chartConst.CLASS_NAME_CHART_EXPORT_MENU_BUTTON)) {
            if (dom.hasClass(this.chartExportMenuContainer, CLASS_NAME_CHART_EXPORT_MENU_OPENED)) {
                this._hideChartExportMenu();
            } else {
                this._showChartExportMenu();
            }
        }
    },

    /**
     * Attach browser event.
     * @param {HTMLElement} target target element
     * @private
     */
    _attachEvent: function(target) {
        eventListener.on(target, 'click', this._onClick, this);
    },

    /**
     * Detach browser event.
     * @param {HTMLElement} target target element
     * @private
     */
    _detachEvent: function(target) {
        eventListener.off(target, 'click', this._onClick);
    }
});

module.exports = ChartExportMenu;
