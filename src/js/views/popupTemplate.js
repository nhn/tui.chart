/**
 * @fileoverview This is popup view templates.
 * @author NHN Ent.
 *         FE Development Team <jiung.kang@nhnent.com>
 */

var templateMaker = require('./templateMaker.js');

var tags = {
    HTML_POPUP: '<div class="ne-chart-popup" id="{= id }">' +
        '<div>{= label }</div>' +
        '<div>' +
            '<span>{= legendLabel }</span>:' +
            '<span>{= value }</span>' +
        '</div>' +
    '</div>'
};

module.exports = {
    TPL_POPUP: templateMaker.template(tags.HTML_POPUP)
};
