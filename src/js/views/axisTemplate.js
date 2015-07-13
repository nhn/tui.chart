/**
 * @fileoverview This is axis view templates.
 * @author NHN Ent.
 *         FE Development Team <jiung.kang@nhnent.com>
 */

var templateMaker = require('./templateMaker.js');

var tags = {
    HTML_AXIS_TICK: '<div class="tick" style="{= position }"></div>',
    HTML_AXIS_LABEL: '<div class="label" style="{= cssText }">{= label }</div>'
};

module.exports = {
    TPL_AXIS_TICK: templateMaker.template(tags.HTML_AXIS_TICK),
    TPL_AXIS_LABEL: templateMaker.template(tags.HTML_AXIS_LABEL)
};