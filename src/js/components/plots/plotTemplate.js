/**
 * @fileoverview This is templates of plot view .
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

import templateMaker from '../../helpers/templateMaker';

const tags = {
    HTML_PLOT_LINE: '<div class="tui-chart-plot-line {{ className }}"' +
        ' style="{{ positionType }}:{{ positionValue }};width:{{ width }};height:{{ height }};' +
        'background-color:{{ color }}{{ opacity }}">' +
    '</div>'
};

export default {
    tplPlotLine: templateMaker.template(tags.HTML_PLOT_LINE)
};
