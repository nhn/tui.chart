var _ = require('underscore'),
    plugins = {};

module.exports = {
    get: function(type, data, options) {
        if (plugins[type]) {
            return plugins[type];
        } else {
            throw new Error(type + ' plugin은 존재하지 않습니다.');
        }
    },
    register: function(type, plugin) {
        plugins[type] = plugin;
    }
};