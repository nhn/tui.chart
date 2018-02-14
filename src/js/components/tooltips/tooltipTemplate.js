/**
 * @fileoverview This is templates of tooltip.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var templateMaker = require('../../helpers/templateMaker');

var htmls = {
    HTML_DEFAULT_TEMPLATE: '<div class="tui-chart-default-tooltip">' +
        '<div class="head {{ categoryVisible }}">{{ category }}</div>' +
        '<div class="body">' +
            '<span class="tui-chart-legend-rect {{ chartType }}" style="{{ cssText }}"></span>' +
            '<span class="title">{{ legend }}</span>' +
            '<span class="value">{{ label }}{{ suffix }}</span>' +
        '</div>' +
    '</div>',

    HTML_PIE_TEMPLATE: '<div class="tui-chart-default-tooltip">' +
        '<div class="head {{ categoryVisible }}">{{ category }}</div>' +
        '<div class="body">' +
            '<span class="tui-chart-legend-rect {{ chartType }}" style="{{ cssText }}"></span>' +
            '<span class="title">{{ legend }}</span>' +
            '<span class="value">{{ ratioLabel }} ( {{ label }} {{ suffix }})</span>' +
        '</div>' +
    '</div>',

    HTML_COORDINATE_TYPE_CHART_TEMPLATE: '<div class="tui-chart-default-tooltip">' +
        '<div>{{ category }}</div>' +
        '<div class="body">' +
            '<span class="title">{{ legend }}</span>' +
            '<span class="value">{{ label }}</span>' +
        '</div>{{ valueTypes }}' +
    '</div>',

    HTML_GROUP: '<div class="tui-chart-default-tooltip tui-chart-group-tooltip">' +
        '<div class="head">{{ category }}</div>' +
        '<table class="body">' +
            '{{ items }}' +
        '</table>' +
    '</div>',

    HTML_GROUP_TYPE: '<tr>' +
        '<td colspan="3" class="tui-chart-tooltip-type">{{ type }}</div>' +
    '</tr>',

    HTML_GROUP_ITEM: '<tr>' +
        '<td>' +
            '<div class="tui-chart-legend-rect {{ chartType }}" style="{{ cssText }}"></div>' +
        '</td>' +
        '<td>{{ legend }}</td>' +
        '<td class="value">{{ value }} {{ suffix }}</td>' +
    '</tr>',

    GROUP_CSS_TEXT: 'background-color:{{ color }}',
    HTML_MAP_CHART_DEFAULT_TEMPLATE: '<div class="tui-chart-default-tooltip">' +
        '<div>{{ name }}: {{ value }}{{ suffix }}</div>' +
    '</div>',
    HTML_BOXPLOT_TEMPLATE: '<div class="tui-chart-default-tooltip">' +
        '<div class="head {{ categoryVisible }}">{{ category }}</div>' +
            '<table class="body">' +
                '<tr>' +
                    '<td colspan="2">{{ legend }}</td>' +
                '</tr>' +
                '<tr>' +
                    '<td>Maximum: </td>' +
                    '<td class="value">{{ maxLabel }} {{ suffix }}</td>' +
                '</tr>' +
                '<tr>' +
                    '<td>Upper Quartile: </td>' +
                    '<td class="value">{{ uqLabel }} {{ suffix }}</td>' +
                '</tr>' +
                '<tr>' +
                    '<td>Median: </td>' +
                    '<td class="value">{{ medianLabel }} {{ suffix }}</td>' +
                '</tr>' +
                '<tr>' +
                    '<td>Lower Quartile: </td>' +
                    '<td class="value">{{ lqLabel }} {{ suffix }}</td>' +
                '</tr>' +
                '<tr>' +
                    '<td>Minimum: </td>' +
                    '<td class="value">{{ minLabel }} {{ suffix }}</td>' +
                '</tr>' +
            '</table>' +
    '</div>',
    HTML_BOXPLOT_OUTLIER: '<div class="tui-chart-default-tooltip">' +
        '<div class="head {{ categoryVisible }}">{{ category }}</div>' +
            '<div class="body">' +
                '<span>{{ legend }}</span>' +
            '</div>' +
            '<div class="body">' +
                '<span>Outlier: </span>' +
                '<span class="value">{{ label }} {{ suffix }}</span>' +
            '</div>' +
    '</div>',
    HTML_BULLET_TEMPLATE: '<div class="tui-chart-default-tooltip">' +
        '<div class="body {{ categoryVisible }}">' +
            '<span>{{ category }}</span>' +
            '<span class="value">{{ label }} {{ suffix }}</span>' +
        '</div>' +
    '</div>'
};

module.exports = {
    tplDefault: templateMaker.template(htmls.HTML_DEFAULT_TEMPLATE),
    tplPieChart: templateMaker.template(htmls.HTML_PIE_TEMPLATE),
    tplCoordinatetypeChart: templateMaker.template(htmls.HTML_COORDINATE_TYPE_CHART_TEMPLATE),
    tplGroup: templateMaker.template(htmls.HTML_GROUP),
    tplGroupType: templateMaker.template(htmls.HTML_GROUP_TYPE),
    tplGroupItem: templateMaker.template(htmls.HTML_GROUP_ITEM),
    tplGroupCssText: templateMaker.template(htmls.GROUP_CSS_TEXT),
    tplMapChartDefault: templateMaker.template(htmls.HTML_MAP_CHART_DEFAULT_TEMPLATE),
    tplBoxplotChartDefault: templateMaker.template(htmls.HTML_BOXPLOT_TEMPLATE),
    tplBoxplotChartOutlier: templateMaker.template(htmls.HTML_BOXPLOT_OUTLIER),
    tplBulletChartDefault: templateMaker.template(htmls.HTML_BULLET_TEMPLATE)
};
