/**
 * @fileoverview Bounds and scale data builder.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var BoundsMaker = require('../boundsModels/boundsMaker');
var ScaleModel = require('../scaleModels/scaleModel');
var chartConst = require('../const');
var predicate = require('../helpers/predicate');

/**
 * Bounds and scale data builder.
 * @module boundsAndScaleBuilder
 */
var boundsAndScaleBuilder = {
    /**
     * Create BoundsMaker.
     * @param {DataProcessor} dataProcessor - DataProcessor instance
     * @param {object} params - parameters
     * @returns {BoundsMaker}
     * @private
     */
    _createBoundsMaker: function(dataProcessor, params) {
        return new BoundsMaker({
            chartType: params.chartType,
            seriesNames: params.seriesNames,
            options: params.options,
            theme: params.theme,
            dataProcessor: dataProcessor,
            hasAxes: params.hasAxes,
            isVertical: params.isVertical
        });
    },

    /**
     * Create ScaleModel.
     * @param {DataProcessor} dataProcessor - DataProcessor instance
     * @param {BoundsMaker} boundsMaker - BoundsMaker instance
     * @param {object} params - parameters
     * @returns {ScaleModel}
     * @private
     */
    _createScaleModel: function(dataProcessor, boundsMaker, params) {
        return new ScaleModel({
            chartType: params.chartType,
            seriesNames: params.seriesNames,
            options: params.options,
            theme: params.theme,
            dataProcessor: dataProcessor,
            boundsMaker: boundsMaker,
            hasRightYAxis: params.hasRightYAxis
        });
    },

    /**
     * Add y axis scale.
     * @param {ScaleModel} scaleModel - ScaleModel instance
     * @param {string} name - component name
     * @param {object} scaleOption - option for add scale
     * @param {object} yAxisOptions - option for yAxis
     */
    addYAxisScale: function(scaleModel, name, scaleOption, yAxisOptions) {
        scaleModel.addScale(name, scaleOption.options || yAxisOptions, {
            valueType: scaleOption.valueType || 'value',
            areaType: scaleOption.areaType,
            chartType: scaleOption.chartType
        }, scaleOption.additionalParams);
    },

    /**
     * Register dimension for y axis.
     * @param {ComponentManager} componentManager - ComponentManager instance
     * @param {BoundsMaker} boundsMaker - BoundsMaker instance
     * @param {ScaleModel} scaleModel - ScaleModel instance
     * @param {string} axisName - axis name like yAxis and rightYAxis
     * @param {boolean} isVertical - whether vertical or not
     * @private
     */
    _registerYAxisDimension: function(componentManager, boundsMaker, scaleModel, axisName, isVertical) {
        var yAxis = componentManager.get(axisName);
        var limit = null;
        var scaleData;

        if (!yAxis) {
            return;
        }

        scaleData = scaleModel.scaleMap[axisName];

        if (scaleData) {
            limit = scaleData.getLimit();
        }
        boundsMaker.registerYAxisDimension(limit, axisName, yAxis.options, yAxis.theme, isVertical);
    },

    /**
     * Set layout bounds and scale.
     * @param {DataProcessor} dataProcessor - DataProcessor instance
     * @param {ComponentManager} componentManager - ComponentManager instance
     * @param {BoundsMaker} boundsMaker - BoundsMaker instance
     * @param {ScaleModel} scaleModel - ScaleModel instance
     * @param {object} params - parameter for setting layout bounds and scale data.
     * @private
     */
    _setLayoutBoundsAndScale: function(dataProcessor, componentManager, boundsMaker, scaleModel, params) {
        var options = params.options;
        var scaleOption = params.scaleOption;
        var addingDataMode = params.addingDataMode;
        var isVertical = params.isVertical;

        boundsMaker.initBoundsData();
        scaleModel.initScaleData(params.addedDataCount);

        // 01. base dimension 등록
        if (componentManager.has('xAxis')) {
            boundsMaker.registerXAxisHeight();
        }

        if (componentManager.has('legend')) {
            boundsMaker.registerLegendDimension();

            if (componentManager.get('legend').colorSpectrum) {
                boundsMaker.updateDimensionForSpectrumLegend();
            }
        }

        // 02. y axis, legend scale 추가
        if (scaleOption.yAxis) {
            this.addYAxisScale(scaleModel, 'yAxis', scaleOption.yAxis, params.options.yAxis);
        }

        if (scaleOption.rightYAxis) {
            this.addYAxisScale(scaleModel, 'rightYAxis', scaleOption.rightYAxis);
        }

        if (scaleOption.legend) {
            scaleModel.addScale('legend', {}, {
                chartType: params.chartType
            }, {
                valueCount: chartConst.SPECTRUM_LEGEND_TICK_COUNT
            });
        }

        // 03. y axis dimension 등록
        this._registerYAxisDimension(componentManager, boundsMaker, scaleModel, 'yAxis', isVertical);
        this._registerYAxisDimension(componentManager, boundsMaker, scaleModel, 'rightYAxis', isVertical);

        // 04. x axis scale 추가
        if (scaleOption.xAxis) {
            scaleModel.addScale('xAxis', options.xAxis, {
                valueType: scaleOption.xAxis.valueType || 'value'
            });
        }

        // 05. axis data map 생성 및 설정
        scaleModel.setAxisDataMap();

        // 06. series 영역 dimension 등록
        boundsMaker.registerSeriesDimension();

        // 07. circle legend가 있을 경우에 circle legend dimension 등록
        if (componentManager.has('circleLegend') && options.circleLegend.visible) {
            boundsMaker.registerCircleLegendDimension(scaleModel.axisDataMap);
        }

        if (componentManager.has('xAxis')) {
            // 08. 자동 tick 계산 옵션이 있을 경우에 axisData 갱신
            if (predicate.isAutoTickInterval(options.xAxis.tickInterval)) {
                scaleModel.updateXAxisDataForAutoTickInterval(addingDataMode);
            }

            // 09. x축 label의 회전 여부 관련한 axisData 갱신
            scaleModel.updateXAxisDataForLabel(addingDataMode);
        }

        // 10. 나머지 영역 dimension 등록 및 각 영역의 position 정보 등록
        boundsMaker.registerBoundsData(scaleModel.axisDataMap.xAxis);
    },

    /**
     * Build layout bounds and scale data.
     * @param {DataProcessor} dataProcessor - DataProcessor instance
     * @param {ComponentManager} componentManager - ComponentManager instance
     * @param {object} params - parameter for building layout bounds and scale data.
     * @returns {{
     *      dimensionMap: object,
     *      positionMap: object,
     *      limitMap: {
     *          xAxis: ?{min: number, max: number},
     *          yAxis: ?{min: number, max: number},
     *          rightYAxis: ?{min: number, max: number},
     *          legend: ?{min: number, max: number},
     *      },
     *      axisDataMap: object
     * }}
     */
    build: function(dataProcessor, componentManager, params) {
        var boundsMaker = this._createBoundsMaker(dataProcessor, params);
        var scaleModel = this._createScaleModel(dataProcessor, boundsMaker, params);
        var boundsAndScale;

        this._setLayoutBoundsAndScale(dataProcessor, componentManager, boundsMaker, scaleModel, params);

        boundsAndScale = {
            dimensionMap: boundsMaker.dimensionMap,
            positionMap: boundsMaker.positionMap,
            limitMap: scaleModel.makeLimitMap(),
            axisDataMap: scaleModel.axisDataMap
        };

        if (predicate.isBubbleChart(params.chartType)) {
            boundsAndScale.maxRadius = boundsMaker.calculateMaxRadius(scaleModel.axisDataMap);
        }

        return boundsAndScale;
    }
};

module.exports = boundsAndScaleBuilder;
