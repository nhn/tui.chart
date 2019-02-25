'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = escape;

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function escape(context, from) {
    if (from && _path2.default.isAbsolute(from)) {
        return from;
    } else {
        // Ensure context is escaped before globbing
        // Handles special characters in paths
        var absoluteContext = _path2.default.resolve(context).replace(/[\*|\?|\!|\(|\)|\[|\]|\{|\}]/g, function (substring) {
            return '[' + substring + ']';
        });

        if (!from) {
            return absoluteContext;
        }

        // Cannot use path.join/resolve as it "fixes" the path separators
        if (absoluteContext.endsWith('/')) {
            return '' + absoluteContext + from;
        } else {
            return absoluteContext + '/' + from;
        }
    }
}