/**
 * @fileoverview This is templates of legend view.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

var templateMaker = require('../helpers/templateMaker');

var tags = {
    HTML_CHECKBOX: '<div class="tui-chart-legend-checkbox-area"><input class="tui-chart-legend-checkbox" type="checkbox" value="{{ index }}"{{ checked }} /></div>',
    HTML_LEGEND: '<div class="tui-chart-legend{{ unselected }}" style="height:{{ height }}px">' +
        '{{ checkbox }}<div class="tui-chart-legend-rect {{ iconType }}" style="{{ rectCssText }}"></div>' +
        '<div class="tui-chart-legend-label" style="height:{{ labelHeight }}px{{ labelWidth }}" data-index="{{ index }}">{{ label }}</div></div>',
    HTML_TICK: '<div class="tui-chart-map-legend-tick" style="top:{{ top }}px"></div>' +
        '<div class="tui-chart-map-legend-tick-label" style="top:{{ labelTop }}px">{{ label }}</div>'
};

module.exports = {
    tplCheckbox: templateMaker.template(tags.HTML_CHECKBOX),
    tplLegend: templateMaker.template(tags.HTML_LEGEND),
    tplTick: templateMaker.template(tags.HTML_TICK)
};
