/**
 * @fileoverview This is templates of series.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

var templateMaker = require('../helpers/templateMaker.js');

var tags = {
    HTML_SERIES_LABEL_AREA: '<div class="ne-chart-series-label-area">{{ html }}</div>',
    HTML_SERIES_LABEL: '<div class="ne-chart-series-label" style="{{ cssText }}" data-group-index="{{ groupIndex }}" data-index="{{ index }}">{{ value }}</div>',
    TEXT_CSS_POSITION: 'left:{{ left }}px;top:{{ top }}px'
};

module.exports = {
    TPL_SERIES_LABEL_AREA: templateMaker.template(tags.HTML_SERIES_LABEL_AREA),
    TPL_SERIES_LABEL: templateMaker.template(tags.HTML_SERIES_LABEL),
    TPL_CSS_POSITION: templateMaker.template(tags.TEXT_CSS_POSITION)
};
