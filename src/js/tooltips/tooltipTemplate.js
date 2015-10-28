/**
 * @fileoverview This is templates of tooltip.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

var templateMaker = require('../helpers/templateMaker');

var tags = {
    HTML_TOOLTIP: '<div class="ne-chart-tooltip"></div>',
    HTML_DEFAULT_TEMPLATE: '<div class="ne-chart-default-tooltip">' +
        '<div>{{ category }}</div>' +
        '<div>' +
            '<span>{{ legend }}</span>:' +
            '&nbsp;<span>{{ value }}</span>' +
            '<span>{{ suffix }}</span>' +
        '</div>' +
    '</div>',
    HTML_GROUP: '<div class="ne-chart-default-tooltip ne-chart-group-tooltip">' +
        '<div>{{ category }}</div>' +
        '{{ items }}' +
    '</div>',
    HTML_GROUP_ITEM: '<div>' +
        '<div class="ne-chart-legend-rect {{ chartType }}" style="{{ cssText }}"></div>&nbsp;<span>{{ legend }}</span>:' +
        '&nbsp;<span>{{ value }}</span>' +
        '<span>{{ suffix }}</span>' +
    '</div>',
    GROUP_CSS_TEXT: 'background-color:{{ color }}',
    HTML_GROUP_HOVER: '<div class="ne-chart-group-tooltip-hover"></div>'
};

module.exports = {
    tplTooltip: templateMaker.template(tags.HTML_TOOLTIP),
    tplDefault: templateMaker.template(tags.HTML_DEFAULT_TEMPLATE),
    tplGroup: templateMaker.template(tags.HTML_GROUP),
    tplGroupItem: templateMaker.template(tags.HTML_GROUP_ITEM),
    tplGroupCssText: templateMaker.template(tags.GROUP_CSS_TEXT),
    HTML_GROUP_HOVER: tags.HTML_GROUP_HOVER
};
