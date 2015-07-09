var templateMaker = require('./templateMaker.js');

var tags = {
    TAG_AXIS_TICK: '<div class="tick" style="{= position }"></div>'
};

module.exports = {
    TPL_AXIS_TICK: templateMaker.template(tags.TAG_AXIS_TICK)
};