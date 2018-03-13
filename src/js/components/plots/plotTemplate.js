/**
 * @fileoverview This is templates of plot view .
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var templateMaker = require('../../helpers/templateMaker');

var tags = {
    HTML_PLOT_LINE: '<div class="tui-chart-plot-line {{ className }}"' +
        ' style="{{ positionType }}:{{ positionValue }};width:{{ width }};height:{{ height }};' +
        'background-color:{{ color }}{{ opacity }}">' +
    '</div>'
};

module.exports = {
    tplPlotLine: templateMaker.template(tags.HTML_PLOT_LINE)
};
