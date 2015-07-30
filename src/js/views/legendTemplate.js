/**
 * @fileoverview This is legend view templates.
 * @author NHN Ent.
 *         FE Development Team <jiung.kang@nhnent.com>
 */

var templateMaker = require('./templateMaker.js');

var tags = {
    HTML_LEGEND: '<div class="ne-chart-legend">' +
        '<div class="ne-chart-legend-rect" style="{{ cssText }}"></div>' +
        '<div class="ne-chart-legend-label" style="height:{{ height }}px">{{ label }}</div></div>'
};

module.exports = {
    TPL_LEGEND: templateMaker.template(tags.HTML_LEGEND)
};