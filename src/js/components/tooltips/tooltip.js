/**
 * @fileoverview NormalTooltip component.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */

import normalTooltipFactory from './normalTooltip';
import groupTooltipFactory from './groupTooltip';
import mapChartTooltipFactory from './mapChartTooltip';
import predicate from '../../helpers/predicate';
import snippet from 'tui-code-snippet';

/**
 * Label formatter function for pie chart
 * @param {object} seriesItem series item
 * @param {object} tooltipDatum tooltip datum object
 * @param {string} labelPrefix label prefix
 * @returns {object}
 * @ignore
 */
function pieTooltipLabelFormatter(seriesItem, tooltipDatum, labelPrefix) {
  let percentageString = (seriesItem.ratio * 100).toFixed(4);
  const percent = parseFloat(percentageString);
  const needSlice = percent < 0.0009 || percentageString.length > 5;

  percentageString = needSlice ? percentageString.substr(0, 4) : String(percent);
  const ratioLabel = `${percentageString}&nbsp;%&nbsp;` || '';

  tooltipDatum.ratioLabel = labelPrefix + ratioLabel;
  tooltipDatum.label = seriesItem.tooltipLabel || (seriesItem.label ? seriesItem.label : '');

  return tooltipDatum;
}

/**
 * Factory for Tooltip
 * @param {object} params parameter
 * @returns {object|null}
 * @ignore
 */
export default function tooltipFactory(params) {
  const {
    chartOptions: { chartType },
    seriesTypes
  } = params;
  const xAxisOptions = params.chartOptions.xAxis;
  let colors = [];
  let factory;

  const legendTheme = Object.values(params.chartTheme.legend).filter(item =>
    snippet.isArray(item.colors)
  );

  legendTheme.forEach(series => {
    colors = colors.concat(series.colors);
  });

  if (chartType === 'map') {
    factory = mapChartTooltipFactory;
  } else if (params.options.grouped) {
    factory = groupTooltipFactory;
  } else {
    factory = normalTooltipFactory;
  }

  if (chartType === 'pie' || predicate.isPieDonutComboChart(chartType, seriesTypes)) {
    params.labelFormatter = pieTooltipLabelFormatter;
  }

  params.chartType = chartType;
  params.chartTypes = seriesTypes;
  params.xAxisType = xAxisOptions.type;
  params.dateFormat = xAxisOptions.dateFormat;
  params.colors = colors;

  return factory(params);
}

tooltipFactory.componentType = 'tooltip';
