/**
 * @fileoverview This is templates of series.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var templateMaker = require('../helpers/templateMaker');

var htmls = {
    HTML_SERIES_LABEL: '<div class="tui-chart-series-label" style="{{ cssText }}" data-group-index="{{ groupIndex }}" data-index="{{ index }}">{{ value }}</div>',
    TEXT_CSS_TEXT: 'left:{{ left }}px;top:{{ top }}px;font-family:{{ fontFamily }};font-size:{{ fontSize }}px{{opacity}}',
    HTML_ZOOM_BUTTONS: '<a class="tui-chart-zoom-btn" href="#" data-magn="2"><div class="horizontal-line"></div><div class="vertical-line"></div></a>' +
            '<a class="tui-chart-zoom-btn" href="#" data-magn="0.5"><div class="horizontal-line"></div></a>'
};

module.exports = {
    tplSeriesLabel: templateMaker.template(htmls.HTML_SERIES_LABEL),
    tplCssText: templateMaker.template(htmls.TEXT_CSS_TEXT),
    ZOOM_BUTTONS: htmls.HTML_ZOOM_BUTTONS
};
