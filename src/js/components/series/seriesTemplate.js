/**
 * @fileoverview This is templates of series.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var templateMaker = require('../../helpers/templateMaker');

var htmls = {
    HTML_SERIES_LABEL: '<div class="tui-chart-series-label" style="{{ cssText }}"{{ rangeLabelAttribute }}>' +
        '{{ label }}</div>',
    TEXT_CSS_TEXT: 'left:{{ left }}px;top:{{ top }}px;font-family:{{ fontFamily }};' +
        'font-size:{{ fontSize }}px;font-weight:{{ fontWeight }}{{opacity}}',
    TEXT_CSS_TEXT_FOR_LINE_TYPE: 'left:{{ left }}%;top:{{ top }}%;font-family:{{ fontFamily }};' +
    'font-size:{{ fontSize }}px;font-weight:{{ fontWeight }}{{opacity}}',
    HTML_ZOOM_BUTTONS: '<a class="tui-chart-zoom-btn" href="#" data-magn="1">' +
            '<div class="horizontal-line"></div><div class="vertical-line"></div></a>' +
        '<a class="tui-chart-zoom-btn" href="#" data-magn="-1"><div class="horizontal-line"></div></a>',
    HTML_SERIES_BLOCK: '<div class="tui-chart-series-block" style="{{ cssText }}">{{ label }}</div>'
};

module.exports = {
    tplSeriesLabel: templateMaker.template(htmls.HTML_SERIES_LABEL),
    tplCssText: templateMaker.template(htmls.TEXT_CSS_TEXT),
    tplCssTextForLineType: templateMaker.template(htmls.TEXT_CSS_TEXT_FOR_LINE_TYPE),
    ZOOM_BUTTONS: htmls.HTML_ZOOM_BUTTONS,
    tplSeriesBlock: templateMaker.template(htmls.HTML_SERIES_BLOCK)
};
