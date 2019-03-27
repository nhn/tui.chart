/**
 * @fileoverview Bounds and scale data builder.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */

import BoundsModel from '../models/bounds/boundsModel';
import ScaleDataModel from '../models/scaleData/scaleDataModel';
import chartConst from '../const';
import predicate from '../helpers/predicate';

/**
 * Bounds and scale data builder.
 * @module boundsAndScaleBuilder
 * @private
 */
export default {
    /**
     * Create BoundsModel.
     * @param {DataProcessor} dataProcessor - DataProcessor instance
     * @param {object} params - parameters
     * @returns {BoundsModel}
     * @private
     */
    _createBoundsModel(dataProcessor, params) {
        return new BoundsModel({
            chartType: params.chartType,
            seriesTypes: params.seriesTypes,
            options: params.options,
            theme: params.theme,
            dataProcessor,
            hasAxes: params.hasAxes,
            isVertical: params.isVertical
        });
    },

    /**
     * Create ScaleDataModel.
     * @param {DataProcessor} dataProcessor - DataProcessor instance
     * @param {BoundsModel} boundsModel - BoundsModel instance
     * @param {object} params - parameters
     * @returns {ScaleDataModel}
     * @private
     */
    _createScaleDataModel(dataProcessor, boundsModel, params) {
        return new ScaleDataModel({
            chartType: params.chartType,
            seriesTypes: params.seriesTypes,
            options: params.options,
            theme: params.theme,
            dataProcessor,
            boundsModel,
            hasRightYAxis: params.hasRightYAxis,
            addedDataCount: params.addedDataCount
        });
    },

    /**
     * Add y axis scale.
     * @param {ScaleDataModel} scaleDataModel - ScaleDataModel instance
     * @param {string} name - component name
     * @param {object} scaleOption - option for add scale
     * @param {object} yAxisOptions - option for yAxis
     */
    addYAxisScale(scaleDataModel, name, scaleOption, yAxisOptions) {
        scaleDataModel.addScale(name, (scaleOption && scaleOption.options) || yAxisOptions || {}, {
            valueType: scaleOption.valueType || 'value',
            areaType: scaleOption.areaType,
            chartType: scaleOption.chartType
        }, scaleOption.additionalOptions);
    },

    /**
     * Register dimension for y axis.
     * @param {ComponentManager} componentManager - ComponentManager instance
     * @param {BoundsModel} boundsModel - BoundsModel instance
     * @param {object.<string, object>} scaleDataMap - scale data map
     * @param {string} axisName - axis name like yAxis and rightYAxis
     * @param {boolean} isVertical - whether vertical or not
     * @private
     */
    _registerYAxisDimension(componentManager, boundsModel, scaleDataMap, axisName, isVertical) {
        const yAxis = componentManager.get(axisName);
        let limit = null;
        let yAxisLabels = [];

        if (!yAxis) {
            return;
        }
        const scaleData = scaleDataMap[axisName];

        if (scaleData) {
            limit = scaleData.limit;
            yAxisLabels = scaleData.labels;
        }
        boundsModel.registerYAxisDimension({
            limit,
            axisName,
            options: yAxis.options,
            theme: yAxis.theme,
            yAxisLabels,
            isVertical
        });
    },

    /**
     * Set layout bounds and scale.
     * @param {DataProcessor} dataProcessor - DataProcessor instance
     * @param {ComponentManager} componentManager - ComponentManager instance
     * @param {BoundsModel} boundsModel - BoundsModel instance
     * @param {ScaleDataModel} scaleDataModel - ScaleDataModel instance
     * @param {object} params - parameter for setting layout bounds and scale data.
     * @private
     */
    _setLayoutBoundsAndScale(dataProcessor, componentManager, boundsModel, scaleDataModel, params) {
        const {
            options,
            scaleOption = {},
            addingDataMode,
            isVertical
        } = params;

        // 01. register base dimension
        if (componentManager.has('xAxis')) {
            boundsModel.registerXAxisHeight();
        }

        if (componentManager.has('legend')) {
            if (componentManager.get('legend').colorSpectrum) {
                boundsModel.registerSpectrumLegendDimension();
            } else {
                boundsModel.registerLegendDimension();
            }
        }

        // 02. add scale of y axis and legend
        if (scaleOption.yAxis) {
            this.addYAxisScale(scaleDataModel, 'yAxis', scaleOption.yAxis, params.options.yAxis);
        }

        if (scaleOption.rightYAxis) {
            this.addYAxisScale(scaleDataModel, 'rightYAxis', scaleOption.rightYAxis);
        }

        if (scaleOption.legend) {
            scaleDataModel.addScale('legend', {}, {
                chartType: params.chartType
            }, {
                tickCounts: [chartConst.SPECTRUM_LEGEND_TICK_COUNT]
            });
        }

        const {scaleDataMap} = scaleDataModel;

        if (scaleDataMap.legend && componentManager.get('legend') && componentManager.get('legend').colorSpectrum) {
            boundsModel.registerSpectrumLegendDimension(scaleDataMap.legend.limit);
        }

        // 03. register y axis dimension
        this._registerYAxisDimension(componentManager, boundsModel, scaleDataMap, 'yAxis', isVertical);
        this._registerYAxisDimension(componentManager, boundsModel, scaleDataMap, 'rightYAxis', isVertical);

        // 04. add x axis scale
        if (scaleOption.xAxis) {
            scaleDataModel.addScale('xAxis', options.xAxis, {
                valueType: scaleOption.xAxis.valueType || 'value'
            }, scaleOption.xAxis.additionalOptions);
        }

        // 05. create and configure axis data map
        if (params.hasAxes) {
            scaleDataModel.setAxisDataMap();
        }

        // 06. register series dimension
        boundsModel.registerSeriesDimension();

        // 07. register circle legend dimension, if there is a circle legend
        if (componentManager.has('circleLegend') && options.circleLegend.visible) {
            boundsModel.registerCircleLegendDimension(scaleDataModel.axisDataMap);
        }

        if (componentManager.has('xAxis')) {
            // 08. update axisData, when autoTickInterval option exist
            if (predicate.isAutoTickInterval(options.xAxis.tickInterval)) {
                scaleDataModel.updateXAxisDataForAutoTickInterval(params.prevXAxisData, addingDataMode);
            }

            // 09. update axisData related to the rotation of label on x axis
            scaleDataModel.updateXAxisDataForLabel(addingDataMode);
        }

        // 10. regiser dimension of rest components
        //     register positon of all components
        boundsModel.registerBoundsData(scaleDataModel.axisDataMap.xAxis);
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
     *          legend: ?{min: number, max: number}
     *      },
     *      axisDataMap: ?object,
     *      maxRadius: ?number,
     *      legendScaleData: ?object
     * }}
     */
    build(dataProcessor, componentManager, params) {
        const boundsModel = this._createBoundsModel(dataProcessor, params);
        const scaleDataModel = this._createScaleDataModel(dataProcessor, boundsModel, params);

        this._setLayoutBoundsAndScale(dataProcessor, componentManager, boundsModel, scaleDataModel, params);

        const boundsAndScale = {
            dimensionMap: boundsModel.dimensionMap,
            positionMap: boundsModel.positionMap,
            limitMap: scaleDataModel.makeLimitMap(params.seriesTypes || [params.chartType], params.isVertical)
        };

        if (scaleDataModel.axisDataMap) {
            boundsAndScale.axisDataMap = scaleDataModel.axisDataMap;
        }

        if (predicate.isBubbleChart(params.chartType)) {
            boundsAndScale.maxRadius = boundsModel.calculateMaxRadius(scaleDataModel.axisDataMap);
        }

        if (scaleDataModel.scaleDataMap.legend) {
            boundsAndScale.legendScaleData = scaleDataModel.scaleDataMap.legend;
        }

        return boundsAndScale;
    }
};
