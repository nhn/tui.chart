var templateMaker = require('./templateMaker.js');

var tags = {
    HTML_AXIS_TICK: '<div class="tick" style="{= position }"></div>'
};

module.exports = {
    TPL_AXIS_TICK: templateMaker.template(tags.HTML_AXIS_TICK)
};