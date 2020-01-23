/**
 * @fileoverview This is templates of tooltip.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */

import templateMaker from '../../helpers/templateMaker';

const htmls = {
  HTML_DEFAULT_TEMPLATE: `<div class="tui-chart-default-tooltip">
      <div class="tui-chart-tooltip-head {{ categoryVisible }}">{{ category }}</div>
      <div class="tui-chart-tooltip-body">
        <span class="tui-chart-legend-rect {{ chartType }}" style="{{ cssText }}"></span>
        <span>{{ legend }}</span>
        <span class="tui-chart-tooltip-value">{{ label }}{{ suffix }}</span>
      </div>
    </div>`,

  HTML_PIE_TEMPLATE: `<div class="tui-chart-default-tooltip">
      <div class="tui-chart-tooltip-head {{ categoryVisible }}">{{ category }}</div>
      <div class="tui-chart-tooltip-body">
        <span class="tui-chart-legend-rect {{ chartType }}" style="{{ cssText }}"></span>
        <span>{{ legend }}</span>
        <span class="tui-chart-tooltip-value">{{ ratioLabel }} ( {{ label }} {{ suffix }})</span>
      </div>
    </div>`,

  HTML_COORDINATE_TYPE_CHART_TEMPLATE: `<div class="tui-chart-default-tooltip">
    <div class="tui-chart-tooltip-head {{ categoryVisible }}">
      <span class="tui-chart-legend-rect {{ chartType }}" style="{{ cssText }}"></span>
      {{ category }}
    </div>
    <div class="tui-chart-tooltip-body">
      <span class="tui-chart-legend-rect {{ chartType }}" style="{{ cssText }}"></span>
      <span>{{ legend }}</span>
      <span class="tui-chart-tooltip-value">{{ label }}</span>
    </div>
    <table class="tui-chart-tooltip-body">{{ valueTypes }}</table>
  </div>`,

  HTML_GROUP: `<div class="tui-chart-default-tooltip tui-chart-group-tooltip">
    <div class="tui-chart-tooltip-head">{{ category }}</div>
    <table class="tui-chart-tooltip-body">
      {{ items }}
    </table>
  </div>`,

  HTML_GROUP_TYPE: `
  <tr>
    <td colspan="3" class="tui-chart-tooltip-type">{{ type }}</div>
  </tr>`,

  HTML_GROUP_ITEM: `<tr>
    <td><div class="tui-chart-legend-rect {{ chartType }}" style="{{ cssText }}"></div></td>
    <td>{{ legend }}</td>
    <td class="tui-chart-tooltip-value">{{ value }} {{ suffix }}</td>
  </tr>`,

  GROUP_CSS_TEXT: 'background-color:{{ color }}',
  HTML_MAP_CHART_DEFAULT_TEMPLATE: `<div class="tui-chart-default-tooltip">
    <div class="tui-chart-tooltip-body">
      <span class="tui-chart-legend-rect {{ chartType }}" style="{{ cssText }}"></span>
      <span>{{ name }}</span>
      <span class="tui-chart-tooltip-value">{{ value }}{{ suffix }}</span>
    </div>
  </div>`,
  HTML_HEATMAP_TEMPLATE: `<div class="tui-chart-default-tooltip">
    <div class="tui-chart-tooltip-head {{ categoryVisible }}">{{ category }}</div>
    <div class="tui-chart-tooltip-body">
      <span class="tui-chart-legend-rect {{ chartType }}" style="{{ cssText }}"></span>
      <span>{{ label }}{{ suffix }}</span>
    </div>
  </div>`,
  HTML_BOXPLOT_TEMPLATE: `<div class="tui-chart-default-tooltip">
    <div class="tui-chart-tooltip-head {{ categoryVisible }}">{{ category }}</div>
    <table class="tui-chart-tooltip-body">
      <tr>
        <td colspan="2">
          <span class="tui-chart-legend-rect {{ chartType }}" style="{{ cssText }}"></span>
          {{ legend }}
        </td>
      </tr>
      <tr>
        <td>Maximum: </td>
        <td class="tui-chart-tooltip-value">{{ maxLabel }} {{ suffix }}</td>
      </tr>
      <tr>
        <td>Upper Quartile: </td>
        <td class="tui-chart-tooltip-value">{{ uqLabel }} {{ suffix }}</td>
      </tr>
      <tr>
        <td>Median: </td>
        <td class="tui-chart-tooltip-value">{{ medianLabel }} {{ suffix }}</td>
      </tr>
      <tr>
        <td>Lower Quartile: </td>
        <td class="tui-chart-tooltip-value">{{ lqLabel }} {{ suffix }}</td>
      </tr>
      <tr>
        <td>Minimum: </td>
        <td class="tui-chart-tooltip-value">{{ minLabel }} {{ suffix }}</td>
      </tr>
    </table>
  </div>`,
  HTML_BOXPLOT_OUTLIER: `<div class="tui-chart-default-tooltip">
    <div class="tui-chart-tooltip-head {{ categoryVisible }}">{{ category }}</div>
      <div class="tui-chart-tooltip-body">
        <span>{{ legend }}</span>
      </div>
      <div class="tui-chart-tooltip-body">
        <span>Outlier: </span>
        <span class="tui-chart-tooltip-value">{{ label }} {{ suffix }}</span>
      </div>
  </div>`,
  HTML_BULLET_TEMPLATE: `<div class="tui-chart-default-tooltip">
    <div class="tui-chart-tooltip-body {{ categoryVisible }}">
      <span class="tui-chart-legend-rect {{ chartType }}" style="{{ cssText }}"></span>
      <span>{{ category }}</span>
      <span class="tui-chart-tooltip-value">{{ label }} {{ suffix }}</span>
    </div>
  </div>`
};

export default {
  tplDefault: templateMaker.template(htmls.HTML_DEFAULT_TEMPLATE),
  tplPieChart: templateMaker.template(htmls.HTML_PIE_TEMPLATE),
  tplCoordinatetypeChart: templateMaker.template(htmls.HTML_COORDINATE_TYPE_CHART_TEMPLATE),
  tplGroup: templateMaker.template(htmls.HTML_GROUP),
  tplGroupType: templateMaker.template(htmls.HTML_GROUP_TYPE),
  tplGroupItem: templateMaker.template(htmls.HTML_GROUP_ITEM),
  tplGroupCssText: templateMaker.template(htmls.GROUP_CSS_TEXT),
  tplMapChartDefault: templateMaker.template(htmls.HTML_MAP_CHART_DEFAULT_TEMPLATE),
  tplHeatmapChart: templateMaker.template(htmls.HTML_HEATMAP_TEMPLATE),
  tplBoxplotChartDefault: templateMaker.template(htmls.HTML_BOXPLOT_TEMPLATE),
  tplBoxplotChartOutlier: templateMaker.template(htmls.HTML_BOXPLOT_OUTLIER),
  tplBulletChartDefault: templateMaker.template(htmls.HTML_BULLET_TEMPLATE)
};
