/**
 * @fileoverview This is templates of legend view.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var templateMaker = require('../../helpers/templateMaker');

var htmls = {
    HTML_CHECKBOX: '<div class="tui-chart-legend-checkbox-area"><input class="tui-chart-legend-checkbox"' +
        ' type="checkbox" value="{{ index }}"{{ checked }} /></div>',
    HTML_LEGEND: '<div class="tui-chart-legend{{ unselected }}" style="height:{{ height }}px">' +
        '{{ checkbox }}<div class="tui-chart-legend-rect {{ iconType }}" style="{{ rectCssText }}"></div>' +
        '<div class="tui-chart-legend-label" style="height:{{ labelHeight }}px{{ labelWidth }}"' +
            ' data-index="{{ index }}">{{ label }}</div></div>',
    HTML_TICK: '<div class="tui-chart-map-legend-tick" style="{{ position }}"></div>' +
        '<div class="tui-chart-map-legend-tick-label" style="{{ labelPosition }}">{{ label }}</div>',
    HTML_CIRCLE_LEGEND_LABEL: '<div class="tui-chart-circle-legend-label"' +
            ' style="left: {{ left }}px;top: {{ top }}px">{{ label }}</div>'
};

module.exports = {
    tplCheckbox: templateMaker.template(htmls.HTML_CHECKBOX),
    tplLegend: templateMaker.template(htmls.HTML_LEGEND),
    tplTick: templateMaker.template(htmls.HTML_TICK),
    tplCircleLegendLabel: templateMaker.template(htmls.HTML_CIRCLE_LEGEND_LABEL)
};
