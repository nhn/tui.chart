/**
 * @fileoverview This is templates of tooltip.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var templateMaker = require('../helpers/templateMaker');

var htmls = {
    HTML_DEFAULT_TEMPLATE: '<div class="tui-chart-default-tooltip">' +
        '<div>{{ category }}</div>' +
        '<div>' +
            '<span>{{ legend }}</span>:' +
            '&nbsp;<span>{{ value }}</span>' +
            '<span>{{ suffix }}</span>' +
        '</div>' +
    '</div>',
    HTML_GROUP: '<div class="tui-chart-default-tooltip tui-chart-group-tooltip">' +
        '<div>{{ category }}</div>' +
        '{{ items }}' +
    '</div>',
    HTML_GROUP_ITEM: '<div>' +
        '<div class="tui-chart-legend-rect {{ chartType }}" style="{{ cssText }}"></div>&nbsp;<span>{{ legend }}</span>:' +
        '&nbsp;<span>{{ value }}</span>' +
        '<span>{{ suffix }}</span>' +
    '</div>',
    GROUP_CSS_TEXT: 'background-color:{{ color }}',
    HTML_MAP_CHART_DEFAULT_TEMPLATE: '<div class="tui-chart-default-tooltip">' +
        '<div>{{ name }}: {{ value }}</div>' +
    '</div>'
};

module.exports = {
    tplDefault: templateMaker.template(htmls.HTML_DEFAULT_TEMPLATE),
    tplGroup: templateMaker.template(htmls.HTML_GROUP),
    tplGroupItem: templateMaker.template(htmls.HTML_GROUP_ITEM),
    tplGroupCssText: templateMaker.template(htmls.GROUP_CSS_TEXT),
    tplMapChartDefault: templateMaker.template(htmls.HTML_MAP_CHART_DEFAULT_TEMPLATE)
};
