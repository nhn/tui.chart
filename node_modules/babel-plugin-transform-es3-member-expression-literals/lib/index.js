"use strict";

exports.__esModule = true;

exports.default = function (_ref) {
  var t = _ref.types;

  return {
    visitor: {
      MemberExpression: {
        exit: function exit(_ref2) {
          var node = _ref2.node;

          var prop = node.property;
          if (!node.computed && t.isIdentifier(prop) && !t.isValidIdentifier(prop.name)) {
            node.property = t.stringLiteral(prop.name);
            node.computed = true;
          }
        }
      }
    }
  };
};

module.exports = exports["default"];