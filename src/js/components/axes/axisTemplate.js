/**
 * @fileoverview This is templates or axis view.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */
import templateMaker from '../../helpers/templateMaker';
const htmls = {
    HTML_AXIS_TICK_LINE: '<div class="tui-chart-tick-line"' +
        ' style="{{ positionType }}:{{ positionValue }}px;{{ sizeType }}:{{ size }}px"></div>',
    HTML_AXIS_TICK: '<div class="tui-chart-tick" style="{{ cssText }}"></div>',
    HTML_AXIS_LABEL: '<div class="tui-chart-label{{ additionalClass }}" style="{{ cssText }}">' +
        '<span{{ spanCssText }}>{{ label }}</span></div>'
};

export default {
    tplTickLine: templateMaker.template(htmls.HTML_AXIS_TICK_LINE),
    tplAxisTick: templateMaker.template(htmls.HTML_AXIS_TICK),
    tplAxisLabel: templateMaker.template(htmls.HTML_AXIS_LABEL)
};

