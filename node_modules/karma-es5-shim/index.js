var path = require('path');

var createPattern = function (pattern) {
    return {
        pattern: pattern,
        included: true,
        served: true,
        watched: false
    };
};

var initShim = function (files) {
    files.unshift(createPattern(path.resolve(require.resolve('es5-shim'))));
};

initShim.$inject = ['config.files'];
module.exports = {
    'framework:es5-shim': ['factory', initShim]
};
