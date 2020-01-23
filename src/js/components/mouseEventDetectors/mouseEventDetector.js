/**
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */

import predicate from '../../helpers/predicate';
import areaTypeEventDetectorFactory from './areaTypeEventDetector';
import simpleEventDetectorFactory from './simpleEventDetector';
import groupTypeEventDetectorFactory from './groupTypeEventDetector';
import boundsTypeEventDetectorFactory from './boundsTypeEventDetector';
import mapChartEventDetectorFactory from './mapChartEventDetector';

/**
 * Factory for MouseEventDetector
 * @param {object} params parameter
 * @returns {object}
 * @ignore
 */
export default function mouseEventDetectorFactory(params) {
  const { chartOptions, seriesTypes } = params;
  const {
    chartType,
    series: { zoomable, allowSelect: seriesAllowSelect }
  } = chartOptions;
  let factory;

  if (params.chartOptions.tooltip.grouped) {
    factory = groupTypeEventDetectorFactory;
  } else if (predicate.isMapChart(chartType)) {
    factory = mapChartEventDetectorFactory;
  } else if (
    predicate.isBarTypeChart(chartType) ||
    predicate.isBoxplotChart(chartType) ||
    predicate.isHeatmapChart(chartType) ||
    predicate.isTreemapChart(chartType) ||
    predicate.isBulletChart(chartType)
  ) {
    factory = boundsTypeEventDetectorFactory;
  } else if (
    predicate.isCoordinateTypeChart(chartType) ||
    predicate.isPieChart(chartType) ||
    predicate.isPieDonutComboChart(chartType, seriesTypes)
  ) {
    factory = simpleEventDetectorFactory;
  } else {
    factory = areaTypeEventDetectorFactory;
  }

  params.chartType = chartType;
  // @todo replace chartType, chartTypes to seriesTypes, problem of the whole component
  params.chartTypes = seriesTypes;
  params.zoomable = zoomable;
  params.allowSelect = seriesAllowSelect;

  return factory(params);
}

mouseEventDetectorFactory.componentType = 'mouseEventDetector';
