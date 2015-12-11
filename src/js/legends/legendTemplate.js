/**
 * @fileoverview This is templates of legend view.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

var templateMaker = require('../helpers/templateMaker');

var tags = {
    HTML_LEGEND: '<div class="tui-chart-legend" style="height:{{ height }}px">' +
        '<div class="tui-chart-legend-checkbox-area"><input class="tui-chart-legend-checkbox" type="checkbox" value="{{ index }}"{{ checked }} /></div>' +
        '<div class="tui-chart-legend-rect {{ iconType }}" style="{{ rectCssText }}"></div>' +
        '<div class="tui-chart-legend-label" style="height:{{ labelHeight }}px{{ labelFontWeight }}" data-index="{{ index }}">{{ label }}</div></div>'
};

module.exports = {
    tplLegend: templateMaker.template(tags.HTML_LEGEND)
};
