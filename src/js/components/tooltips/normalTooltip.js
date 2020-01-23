/**
 * @fileoverview NormalTooltip component.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */
import TooltipBase from './tooltipBase';
import singleTooltipMixer from './singleTooltipMixer';
import chartConst from '../../const';
import predicate from '../../helpers/predicate';
import tooltipTemplate from './tooltipTemplate';
import snippet from 'tui-code-snippet';
const DEFAULT_TOOLTIP_COLOR = '#aaa';

/**
 * @classdesc NormalTooltip component.
 * @class NormalTooltip
 * @private
 */
class NormalTooltip extends TooltipBase {
  /**
   * NormalTooltip component.
   * @constructs NormalTooltip
   * @private
   * @override
   */
  constructor(params) {
    super(params);
    /**
     * Color spectrum
     * @type {ColorSpectrum}
     */
    this.colorSpectrum = params.colorSpectrum;
  }

  /**
   * Make tooltip html.
   * @param {string} category category
   * @param {{value: string, legend: string, chartType: string, suffix: ?string}} item item data
   * @returns {string} tooltip html
   * @private
   */
  _makeTooltipHtml(category, item) {
    const template = this._getTooltipTemplate(item);

    return template(
      snippet.extend(
        {
          categoryVisible: category ? 'show' : 'hide',
          category
        },
        item
      )
    );
  }

  /**
   * get tooltip template from a templates collection
   * @param {{value: string, legend: string, chartType: string, suffix: ?string}} item item data
   * @returns {string} tooltip template
   * @private
   */
  _getTooltipTemplate(item) {
    let template = tooltipTemplate.tplDefault;

    if (predicate.isBoxplotChart(this.chartType)) {
      template = this._getBoxplotTooltipTemplate(item);
    } else if (
      predicate.isPieChart(this.chartType) ||
      predicate.isPieDonutComboChart(this.chartType, this.chartTypes)
    ) {
      template = tooltipTemplate.tplPieChart;
    } else if (this.dataProcessor.coordinateType) {
      template = tooltipTemplate.tplCoordinatetypeChart;
    } else if (predicate.isBulletChart(this.chartType)) {
      template = tooltipTemplate.tplBulletChartDefault;
    } else if (predicate.isHeatmapChart(this.chartType)) {
      template = tooltipTemplate.tplHeatmapChart;
    }

    return template;
  }

  /**
   * Get tooltip template of box plot chart
   * If item has outlierIndex, return outlier template
   * Otherwise, return box plot default template
   * @param {{value: string, legend: string, chartType: string, suffix: ?string}} item item data
   * @returns {string} tooltip template
   * @private
   */
  _getBoxplotTooltipTemplate(item) {
    let template = tooltipTemplate.tplBoxplotChartDefault;

    if (snippet.isNumber(item.outlierIndex)) {
      template = tooltipTemplate.tplBoxplotChartOutlier;
      item.label = item.outliers[item.outlierIndex].label;
    }

    return template;
  }

  /**
   * Make html for value types like x, y, r
   * @param {{x: ?number, y: ?number, r: ?number}} data - data
   * @param {Array.<string>} valueTypes - types of value
   * @returns {string}
   * @private
   */
  _makeHtmlForValueTypes(data, valueTypes) {
    return valueTypes
      .map(type => {
        if (data[type]) {
          return `<tr><td>${type}</td><td class="${chartConst.CLASS_NAME_TOOLTIP_VALUE}">${data[type]}</td></tr>`;
        }

        return '';
      })
      .join('');
  }

  /**
   * Make single tooltip html.
   * @param {string} chartType chart type
   * @param {{groupIndex: number, index: number}} indexes indexes
   * @returns {string} tooltip html
   * @private
   */
  _makeSingleTooltipHtml(chartType, indexes) {
    const { groupIndex } = indexes;
    let data = this._findTooltipData(chartType, indexes);
    let color = this._findTooltipColor(chartType, indexes, data);

    if (predicate.isBoxplotChart(this.chartType) && snippet.isNumber(indexes.outlierIndex)) {
      data.outlierIndex = indexes.outlierIndex;
    }
    if (this.colorSpectrum) {
      color = this.colorSpectrum.getColor(data.colorRatio || data.ratio);
    }

    data.chartType = this.chartType;
    data.cssText = `background-color: ${color}`;
    data = Object.assign(
      {
        suffix: this.suffix
      },
      data
    );
    data.valueTypes = this._makeHtmlForValueTypes(data, ['x', 'y', 'r']);

    return this.templateFunc(data.category, data, this.getRawCategory(groupIndex));
  }

  /**
   * Find data for tooltip
   * @param {string} chartType chart type
   * @param {{groupIndex: number, index: number}} indexes indexes
   * @returns {string} data for tooltip
   * @private
   */
  _findTooltipData(chartType, indexes) {
    const chartData = this.data[chartType];
    let selectIndex = indexes.groupIndex;

    if (predicate.isRadialChart(chartType) && chartData.length === selectIndex) {
      selectIndex = 0;
    }

    return Object.assign({}, snippet.pick(chartData, selectIndex, indexes.index));
  }

  /**
   * Find data for tooltip
   * @param {string} hoveredChartType - chart type
   * @param {{groupIndex: number, index: number}} indexes - indexes
   * @param {Object} data - data for tooltip render
   * @returns {string} color hex string
   * @private
   */
  _findTooltipColor(hoveredChartType, indexes, data) {
    const isBar = predicate.isBarTypeChart(this.chartType);
    const isBoxplot = predicate.isBoxplotChart(this.chartType);
    const colorByPoint = (isBar || isBoxplot) && this.dataProcessor.options.series.colorByPoint;

    const { groupIndex } = indexes;
    let { index: seriesIndex } = indexes;

    if (predicate.isBulletChart(this.chartType)) {
      seriesIndex = groupIndex;
    } else if (predicate.isTreemapChart(this.chartType)) {
      seriesIndex = data.tooltipColorIndex;
    }

    return colorByPoint ? DEFAULT_TOOLTIP_COLOR : this.tooltipColors[hoveredChartType][seriesIndex];
  }

  /**
   * Set default align option of tooltip.
   * @private
   * @override
   */
  _setDefaultTooltipPositionOption() {
    if (this.options.align) {
      return;
    }

    if (this.isVertical) {
      this.options.align = chartConst.TOOLTIP_DEFAULT_ALIGN_OPTION;
    } else {
      this.options.align = chartConst.TOOLTIP_DEFAULT_HORIZONTAL_ALIGN_OPTION;
    }
  }

  /**
   * Make parameters for show tooltip user event.
   * @param {{groupIndex: number, index: number}} indexes indexes
   * @param {object} additionParams addition parameters
   * @returns {{chartType: string, legend: string, legendIndex: number, index: number}} parameters for show tooltip
   * @private
   */
  _makeShowTooltipParams(indexes, additionParams) {
    const legendIndex = indexes.index;
    const legendData = this.dataProcessor.getLegendItem(legendIndex);

    if (!legendData) {
      return null;
    }

    const { chartType, label } = legendData;
    const params = snippet.extend(
      {
        chartType,
        legend: label,
        legendIndex,
        index: indexes.groupIndex
      },
      additionParams
    );

    if (predicate.isBoxplotChart(chartType) && snippet.isNumber(indexes.outlierIndex)) {
      params.outlierIndex = indexes.outlierIndex;
    }

    return params;
  }

  /**
   * Make tooltip datum.
   * @param {string} legendLabel - legend label
   * @param {string} category - category
   * @param {SeriesItem} seriesItem - SeriesItem
   * @returns {Object}
   * @private
   */
  _makeTooltipDatum(legendLabel = '', category = '', seriesItem) {
    const { tooltipLabel } = seriesItem;
    const { labelFormatter } = this;
    let tooltipDatum = {
      legend: legendLabel,
      label: tooltipLabel || (seriesItem.label ? seriesItem.label : ''),
      category
    };

    if (labelFormatter) {
      tooltipDatum = labelFormatter(seriesItem, tooltipDatum, '');
    }

    tooltipDatum.category = category;

    return snippet.extend(tooltipDatum, seriesItem.pickValueMapForTooltip());
  }

  /**
   * Make tooltip data.
   * @returns {Array.<object>} tooltip data
   * @override
   */
  makeTooltipData() {
    const orgLegendLabels = this.dataProcessor.getLegendLabels();
    const isPivot = predicate.isTreemapChart(this.chartType);
    let legendLabels = {};
    const tooltipData = {};

    if (snippet.isArray(orgLegendLabels)) {
      legendLabels[this.chartType] = orgLegendLabels;
    } else {
      legendLabels = orgLegendLabels;
    }

    this.dataProcessor.eachBySeriesGroup((seriesGroup, groupIndex, chartType) => {
      chartType = chartType || this.chartType;
      const isBulletChart = predicate.isBulletChart(chartType);

      const data = seriesGroup.map((seriesItem, index) => {
        const category = this.dataProcessor.makeTooltipCategory(groupIndex, index, this.isVertical);
        const legendIndex = isBulletChart ? groupIndex : index;

        if (!seriesItem) {
          return null;
        }

        return this._makeTooltipDatum(legendLabels[chartType][legendIndex], category, seriesItem);
      });

      if (!tooltipData[chartType]) {
        tooltipData[chartType] = [];
      }

      tooltipData[chartType].push(data);
    }, isPivot);

    return tooltipData;
  }
}

singleTooltipMixer.mixin(NormalTooltip);

/**
 * normalTooltipFactory
 * @param {object} params chart options
 * @returns {object} normal tooltip instance
 * @ignore
 */
export default function normalTooltipFactory(params) {
  return new NormalTooltip(params);
}

normalTooltipFactory.componentType = 'tooltip';
normalTooltipFactory.NormalTooltip = NormalTooltip;
