/**
 * @fileoverview This is templates of series.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */
import templateMaker from '../../helpers/templateMaker';

const htmls = {
  HTML_SERIES_LABEL:
    '<div class="tui-chart-series-label" style="{{ cssText }}"{{ rangeLabelAttribute }}>' +
    '{{ label }}</div>',
  TEXT_CSS_TEXT:
    'left:{{ left }}px;top:{{ top }}px;font-family:{{ fontFamily }};' +
    'font-size:{{ fontSize }}px;font-weight:{{ fontWeight }}{{opacity}}',
  TEXT_CSS_TEXT_FOR_LINE_TYPE:
    'left:{{ left }}%;top:{{ top }}%;font-family:{{ fontFamily }};' +
    'font-size:{{ fontSize }}px;font-weight:{{ fontWeight }}{{opacity}}',
  HTML_ZOOM_BUTTONS:
    '<a class="tui-chart-zoom-btn zoom-in" href="#" data-magn="1"></a>' +
    '<a class="tui-chart-zoom-btn zoom-out" href="#" data-magn="-1"></a>',
  HTML_SERIES_BLOCK: '<div class="tui-chart-series-block" style="{{ cssText }}">{{ label }}</div>'
};

export default {
  tplSeriesLabel: templateMaker.template(htmls.HTML_SERIES_LABEL),
  tplCssText: templateMaker.template(htmls.TEXT_CSS_TEXT),
  tplCssTextForLineType: templateMaker.template(htmls.TEXT_CSS_TEXT_FOR_LINE_TYPE),
  ZOOM_BUTTONS: htmls.HTML_ZOOM_BUTTONS,
  tplSeriesBlock: templateMaker.template(htmls.HTML_SERIES_BLOCK)
};
