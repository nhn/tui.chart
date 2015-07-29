/**
 * @fileoverview This is plot view templates.
 * @author NHN Ent.
 *         FE Development Team <jiung.kang@nhnent.com>
 */

var templateMaker = require('./templateMaker.js');

var tags = {
    HTML_PLOT_LINE: '<div class="ne-chart-plot-line {= className }" style="{= cssText }"></div>'
};

module.exports = {
    TPL_PLOT_LINE: templateMaker.template(tags.HTML_PLOT_LINE)
};
