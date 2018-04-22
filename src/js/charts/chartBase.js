/**
 * @fileoverview ChartBase
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

import chartConst from '../const';
import ComponentManager from './componentManager';
import DefaultDataProcessor from '../models/data/dataProcessor';
import rawDataHandler from '../models/data/rawDataHandler';
import dom from '../helpers/domHandler';
import renderUtil from '../helpers/renderUtil';
import objectUtil from '../helpers/objectUtil';
import boundsAndScaleBuilder from '../models/boundsAndScaleBuilder.js';
import predicate from '../helpers/predicate';
import snippet from 'tui-code-snippet';

export default class ChartBase {
    /**
     * Chart base.
     * @constructs ChartBase
     * @param {object} params parameters
     *      @param {object} params.rawData raw data
     *      @param {object} params.theme chart theme
     *      @param {object} params.options chart options
     *      @param {boolean} params.hasAxes whether has axes or not
     *      @param {boolean} params.isVertical whether vertical or not
     *      @param {DataProcessor} params.DataProcessor DataProcessor
     */
    constructor(params) {
        /**
         * theme
         * @type {object}
         */
        this.theme = params.theme;

        if (params.seriesTypes) {
            this.seriesTypes = params.seriesTypes;
        }

        if (params.chartTypes) {
            this.chartTypes = params.chartTypes;
        }

        this._initializeOptions(params.options);

        /**
         * chart type
         * @type {string}
         */
        this.chartType = this.options.chartType;

        /**
         * whether chart has axes or not
         * @type {boolean}
         */
        this.hasAxes = params.hasAxes;

        /**
         * whether vertical or not
         * @type {boolean}
         */
        this.isVertical = !!params.isVertical;

        /**
         * data processor
         * @type {DataProcessor}
         */
        this.dataProcessor = this._createDataProcessor(params);

        /**
         * event bus for transmitting message
         * @type {object}
         */
        this.eventBus = new snippet.CustomEvents();

        /**
         * previous xAxis data
         * @type {null|object}
         */
        this.prevXAxisData = null;

        /**
         * component manager
         * @type {ComponentManager}
         */
        this.componentManager = this._createComponentManager();

        this.addComponents();

        this._attachToEventBus();

        if (this.options.usageStatistics) {
            this._sendHostName();
        }
    }

    /**
     * Image ping for ga tracking
     * @private
     */
    _sendHostName() {
        const {hostname} = location;
        snippet.imagePing('https://www.google-analytics.com/collect', {
            v: 1,
            t: 'event',
            tid: 'UA-115377265-9',
            cid: hostname,
            dp: hostname,
            dh: 'chart'
        });
    }

    /**
     * Attach to event bus.
     * @private
     */
    _attachToEventBus() {
        this.eventBus.on('changeCheckedLegends', this.onChangeCheckedLegends, this);

        if (this.onZoom) {
            this.eventBus.on({
                zoom: this.onZoom,
                resetZoom: this.onResetZoom
            }, this);
        }
    }

    /**
     * Set offset property
     * @param {{offset: object}} options - options
     * @param {string} fromProperty - from property name
     * @param {string} toProperty - to property name
     * @private
     */
    _setOffsetProperty(options, fromProperty, toProperty) {
        if (!snippet.isExisty(options[fromProperty])) {
            return;
        }

        options.offset = options.offset || {};
        options.offset[toProperty] = options[fromProperty];
        delete options[fromProperty];
    }

    /**
     * Initialize offset.
     * @param {{offsetX: ?number, offsetY: ?number}} options - offset options
     * @private
     */
    _initializeOffset(options) {
        if (!options) {
            return;
        }

        this._setOffsetProperty(options, 'offsetX', 'x');
        this._setOffsetProperty(options, 'offsetY', 'y');
    }

    /**
     * Initialize title options.
     * @param {
     *      Array.<{title: (string | {text: string, offsetX: number, offsetY: number})}> |
     *      {title: (string | {text: string, offsetX: number, offsetY: number})}
     * } targetOptions - target options
     * @private
     */
    _initializeTitleOptions(targetOptions) {
        if (!targetOptions) {
            return;
        }

        const optionsSet = snippet.isArray(targetOptions) ? targetOptions : [targetOptions];
        optionsSet.forEach(options => {
            const {title} = options;

            if (snippet.isString(title)) {
                options.title = {
                    text: title
                };
            }

            this._initializeOffset(options.title);
        });
    }

    /**
     * Initialize tooltip options.
     * @param {{grouped: ?boolean, offsetX: ?number, offsetY: ?number}} options - tooltip options
     * @private
     */
    _initializeTooltipOptions(options) {
        options.grouped = !!options.grouped;
        this._initializeOffset(options);

        delete options.position;
    }

    /**
     * Initialize options.
     * @param {object} options - options for chart
     * @private
     */
    _initializeOptions(options) {
        const originalOptions = objectUtil.deepCopy(options);
        const defaultOption = {
            chartTypes: this.charTypes,
            xAxis: {},
            series: {},
            tooltip: {},
            usageStatistics: true,
            chartExportMenu: Object.assign({
                visible: true
            }, originalOptions.chartExportMenu),
            legend: Object.assign({
                visible: true
            }, originalOptions.legend)
        };
        delete originalOptions.chartExportMenu;
        delete originalOptions.legend;

        Object.assign(options, defaultOption, originalOptions);

        this._initializeTitleOptions(options.chart);
        this._initializeTitleOptions(options.xAxis);
        this._initializeTitleOptions(options.yAxis);
        this._initializeTooltipOptions(options.tooltip);

        this.options = options;
    }

    /**
     * Create dataProcessor for processing raw data.
     * @param {object} params parameters
     *      @param {object} params.rawData - raw data
     *      @param {DataProcessor} params.DataProcessor - DataProcessor class
     *      @param {{chart: object, chartType: string}} params.options - chart options
     *      @param {Array} params.seriesTypes series - chart types for rendering series
     * @returns {object} data processor
     * @private
     */
    _createDataProcessor(params) {
        const DataProcessor = params.DataProcessor || DefaultDataProcessor;
        const dataProcessor = new DataProcessor(params.rawData, this.chartType, params.options, this.seriesTypes);

        return dataProcessor;
    }

    /**
     * Create ComponentManager.
     * @returns {ComponentManager}
     * @private
     */
    _createComponentManager() {
        return new ComponentManager({
            options: this.options,
            theme: this.theme,
            dataProcessor: this.dataProcessor,
            hasAxes: this.hasAxes,
            eventBus: this.eventBus,
            isVertical: this.isVertical,
            seriesTypes: this.seriesTypes || [this.chartType]
        });
    }

    /**
     * Add components.
     * @abstract
     */
    addComponents() {}

    /**
     * Get scale option.
     * @abstract
     */
    getScaleOption() {}

    /**
     * Build bounds and scale data.
     * @param {object} prevXAxisData - previous xAxis data
     * @param {boolean} addingDataMode - whether adding data mode or not
     * @returns {{
     *      layoutBounds: {
     *          dimensionMap: {
     *              xAxis: {width: number, height: number},
     *              yAxis: {width: number, height: number},
     *              rightYAxis: {width: number, height: number},
     *              series: {width: number, height: number},
     *              extendedSeries: {width: number, height: number},
     *              mouseEventDetector: {width: number, height: number},
     *              legend: {width: number, height: number},
     *              tooltip: {width: number, height: number}
     *          },
     *          positionMap: {
     *              xAxis: {left: number, top: number},
     *              yAxis: {left: number, top: number},
     *              rightYAxis: {left: number, top: number},
     *              series: {left: number, top: number},
     *              extendedSeries: {left: number, top: number},
     *              mouseEventDetector: {left: number, top: number},
     *              legend: {left: number, top: number},
     *              tooltip: {left: number, top: number}
     *          }
     *      },
     *      limitMap: {
     *          xAxis: {min: number, max: number},
     *          yAxis: {min: number, max: number}
     *      },
     *      axisDataMap: {
     *          xAxis: object,
     *          yAxis: object,
     *          yRightAxis: object
     *      },
     *      maxRadius: ?number
     * }}
     * @private
     */
    _buildBoundsAndScaleData(prevXAxisData, addingDataMode) {
        return boundsAndScaleBuilder.build(this.dataProcessor, this.componentManager, {
            chartType: this.chartType,
            seriesTypes: this.seriesTypes,
            options: this.options,
            theme: this.theme,
            hasAxes: this.hasAxes,
            scaleOption: this.getScaleOption(),
            isVertical: this.isVertical,
            hasRightYAxis: this.hasRightYAxis,
            addedDataCount: this._dynamicDataHelper ? this._dynamicDataHelper.addedDataCount : null,
            prevXAxisData,
            addingDataMode
        });
    }

    /**
     * Add data ratios.
     * @abstract
     */
    addDataRatios() {}

    /**
     * Make chart ready for render, it should be invoked before render, rerender, resize and zoom.
     * @param {?boolean} addingDataMode - whether adding data mode or not
     * @returns {object} Bounds and scale data
     */
    readyForRender(addingDataMode) {
        const boundsAndScale = this._buildBoundsAndScaleData(this.prevXAxisData, addingDataMode);

        if (boundsAndScale.axisDataMap.xAxis) {
            this.prevXAxisData = boundsAndScale.axisDataMap.xAxis;
        }

        this.addDataRatios(boundsAndScale.limitMap);

        return boundsAndScale;
    }

    /**
     * Render chart.
     * @param {HTMLElement} wrapper chart wrapper element
     */
    render(wrapper) {
        const container = dom.create('DIV', `tui-chart ${this.className}`);
        const {componentManager, dataProcessor} = this;
        const seriesVisibilityMap = dataProcessor.getLegendVisibility();
        const rawData = rawDataHandler.filterCheckedRawData(dataProcessor.rawData, seriesVisibilityMap);
        const raphaelPaper = componentManager.drawingToolPicker.getPaper(container, chartConst.COMPONENT_TYPE_RAPHAEL);

        this.dataProcessor.initData(rawData);

        raphaelPaper.changeChartBackgroundColor(this.theme.chart.background.color);
        raphaelPaper.changeChartBackgroundOpacity(this.theme.chart.background.opacity);
        renderUtil.renderFontFamily(container, this.theme.chart.fontFamily);

        dom.append(wrapper, container);

        const boundsAndScale = this.readyForRender();

        renderUtil.renderDimension(container, boundsAndScale.dimensionMap.chart);
        componentManager.render('render', boundsAndScale, {
            checkedLegends: seriesVisibilityMap
        }, container);

        this.chartContainer = container;
        this.paper = raphaelPaper;
    }

    /**
     * Rerender.
     * @param {Array.<?boolean> | {line: ?Array.<boolean>, column: ?Array.<boolean>}} checkedLegends checked legends
     * @param {?object} rawData rawData
     */
    rerender(checkedLegends, rawData) {
        const {dataProcessor} = this;

        if (!rawData) {
            rawData = rawDataHandler.filterCheckedRawData(
                dataProcessor.getZoomedRawData(),
                checkedLegends
            );
        }

        this.dataProcessor.initData(rawData);

        const boundsAndScale = this.readyForRender();

        this.componentManager.render('rerender', boundsAndScale, {checkedLegends}, this.chartContainer);
    }

    /**
     * On change checked legend.
     * @param {Array.<?boolean> | {line: ?Array.<boolean>, column: ?Array.<boolean>}} checkedLegends checked legends
     * @param {?object} rawData rawData
     * @param {?object} boundsParams addition params for calculating bounds
     */
    onChangeCheckedLegends(checkedLegends, rawData, boundsParams) {
        this.rerender(checkedLegends, rawData, boundsParams);
    }

    /**
     * Animate chart.
     */
    animateChart() {
        this.componentManager.execute('animateComponent');
    }

    /**
     * Register of user event.
     * @param {string} eventName event name
     * @param {function} func event callback
     */
    on(eventName, func) {
        if (chartConst.PUBLIC_EVENT_MAP[eventName]) {
            this.eventBus.on(chartConst.PUBLIC_EVENT_PREFIX + eventName, func);
        }
    }

    /**
     * Remove user event.
     * @param {string} eventName event name
     * @param {function} func event callback
     */
    off(eventName, func) {
        if (chartConst.PUBLIC_EVENT_MAP[eventName]) {
            this.eventBus.off(chartConst.PUBLIC_EVENT_PREFIX + eventName, func);
        }
    }

    /**
     * Update dimension of chart.
     * @param {{width: number, height: number}} dimension dimension
     * @returns {boolean} whether updated or not
     * @private
     */
    _updateChartDimension(dimension) {
        let updated = false;
        const {options} = this;

        options.chart = options.chart || {};

        if (dimension.width && dimension.width > 0 && options.chart.width !== dimension.width) {
            options.chart.width = dimension.width;
            updated = true;
        }

        if (dimension.height && dimension.height > 0 && options.chart.height !== dimension.height) {
            options.chart.height = dimension.height;
            updated = true;
        }

        return updated;
    }

    /**
     * Public API for resizable.
     * @param {object} dimension dimension
     *      @param {number} dimension.width width
     *      @param {number} dimension.height height
     * @api
     */
    resize(dimension) {
        const {dataProcessor} = this;
        const seriesVisibilityMap = dataProcessor.getLegendVisibility();

        if (!dimension) {
            return;
        }

        const updated = this._updateChartDimension(dimension);

        if (!updated) {
            return;
        }

        const boundsAndScale = this.readyForRender();
        const chartDimension = boundsAndScale.dimensionMap.chart;

        renderUtil.renderDimension(this.chartContainer, chartDimension);
        this.paper.resizeBackground(chartDimension.width, chartDimension.height);

        this.componentManager.render('resize', boundsAndScale, {
            checkedLegends: seriesVisibilityMap
        });
    }

    /**
     * Set tooltip align option.
     * @param {string} align align (left|center|right, top|middle|bottom)
     * @api
     */
    setTooltipAlign(align) {
        this.componentManager.get('tooltip').setAlign(align);
    }

    /**
     * Set tooltip offset option.
     * @param {object} offset - tooltip offset
     *      @param {number} offset.x - offset x
     *      @param {number} offset.y - offset y
     * @api
     */
    setTooltipOffset(offset) {
        this.componentManager.get('tooltip').setOffset(offset);
    }

    /**
     * Set position option.
     * @param {object} position moving position
     *      @param {number} position.left left
     *      @param {number} position.top top
     * @api
     * @deprecated
     */
    setTooltipPosition(position) {
        this.componentManager.get('tooltip').setPosition(position);
    }

    /**
     * Reset tooltip align option.
     * @api
     */
    resetTooltipAlign() {
        this.componentManager.get('tooltip').resetAlign();
    }

    /**
     * Reset tooltip position.
     * @api
     */
    resetTooltipOffset() {
        this.componentManager.get('tooltip').resetOffset();
    }

    /**
     * Reset tooltip position.
     * @api
     * @deprecated
     */
    resetTooltipPosition() {
        this.resetTooltipOffset();
    }

    /**
     * Show series label.
     * @api
     */
    showSeriesLabel() {
        const seriesSet = this.componentManager.where({componentType: 'series'});

        seriesSet.forEach(series => {
            series.showLabel();
        });
    }

    /**
     * Hide series label.
     * @api
     */
    hideSeriesLabel() {
        const seriesSet = this.componentManager.where({componentType: 'series'});

        seriesSet.forEach(series => {
            series.hideLabel();
        });
    }

    /**
     * Add data.
     * @abstract
     */
    addData() {}

    /**
     * Add plot line.
     * @abstract
     */
    addPlotLine() {}

    /**
     * Add plot band.
     * @abstract
     */
    addPlotBand() {}

    /**
     * Remove plot line.
     * @abstract
     */
    removePlotLine() {}

    /**
     * Remove plot band.
     * @abstract
     */
    removePlotBand() {}

    /**
     * Get series item bound by indexes
     * @param {number} index - tooltip data's category index
     * @param {number} seriesIndex - tooltip data's series index
     * @param {number} [outlierIndex] - outlier index of tooltip, exists only hovered on boxplot chart's outlier point
     *
     * @returns {?object} - series item bound
     * @private
     */
    _getSeriesData(index, seriesIndex, outlierIndex) {
        const indexes = {
            index,
            seriesIndex,
            outlierIndex
        };

        if (seriesIndex < 0) {
            return null;
        }

        return this.componentManager.get('mouseEventDetector').findDataByIndexes(indexes);
    }

    /**
     * find series index by legend label
     * @param {string} chartType - chart tyoe
     * @param {string} legendLabel - legend label
     * @returns {number} - if not found return -1, else return found series index
     * @private
     */
    _findSeriesIndexByLabel(chartType, legendLabel) {
        const labels = this.dataProcessor.getLegendLabels(chartType);
        const len = labels ? labels.length : 0;
        let seriesIndex = -1;

        for (let i = 0; i < len; i += 1) {
            if (labels[i] === legendLabel) {
                seriesIndex = i;
                break;
            }
        }

        return seriesIndex;
    }

    /**
     * @param {number} index - category index
     * @param {number} seriesIndex - series index
     * @returns {object}
     */
    _findDataByIndexes(index, seriesIndex) {
        return this.componentManager.get('mouseEventDetector').findDataByIndexes(index, seriesIndex);
    }

    /**
     * show tooltip by index of series item
     * @param {object} params - data needed for making a tooltip
     * @ignore
     */
    showTooltip(params) {
        let foundSeriesIndex, foundData;

        if (!predicate.isSupportPublicShowTooptipAPI(this.chartType)) {
            return;
        }

        const isGroupTooltip = this.options.tooltip && this.options.tooltip.grouped;
        const mouseEventDetector = this.componentManager.get('mouseEventDetector');

        if (isGroupTooltip) {
            foundData = {indexes: {groupIndex: params.index}};
        } else {
            foundSeriesIndex = this._findSeriesIndexByLabel(params.chartType, params.legend);
            foundData = this._getSeriesData(params.index, foundSeriesIndex, params.outlierIndex);
        }

        if (foundData) {
            foundData.silent = true;
            mouseEventDetector._showTooltip(foundData);
        } else {
            this.hideTooltip();
        }
    }

    /**
     * hide tooltip
     * @ignore
     */
    hideTooltip() {
        if (!predicate.isSupportPublicShowTooptipAPI(this.chartType)) {
            return;
        }

        const isGroupTooltip = this.options.tooltip && this.options.tooltip.grouped;
        const mouseEventDetector = this.componentManager.get('mouseEventDetector');

        if ((isGroupTooltip && mouseEventDetector.prevIndex >= 0) ||
            (!isGroupTooltip && mouseEventDetector.prevFoundData)) {
            mouseEventDetector._hideTooltip({silent: true});
        }
    }
}
