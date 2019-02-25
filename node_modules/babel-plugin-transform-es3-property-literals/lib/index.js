"use strict";

exports.__esModule = true;

exports.default = function (_ref) {
  var t = _ref.types;

  return {
    visitor: {
      ObjectProperty: {
        exit: function exit(_ref2) {
          var node = _ref2.node;

          var key = node.key;
          if (!node.computed && t.isIdentifier(key) && !t.isValidIdentifier(key.name)) {
            node.key = t.stringLiteral(key.name);
          }
        }
      }
    }
  };
};

module.exports = exports["default"];