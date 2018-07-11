module.exports = {
  'extends': 'tui/es6',
  'parserOptions': {
      "sourceType": "module"
  },
  'env': {
    'browser': true,
    'amd': true,
    'node': true,
    'es6': true,
    'jasmine': true,
    'jquery': true,
    'commonjs': true
  },
  'globals': {
    'tui': true
  },
  'rules': {
      'prefer-destructuring': ['error', {
          VariableDeclarator: {array: true, object: true},
          AssignmentExpression: {array: false, object: false}
      }],
      'linebreak-style': 0,
      complexity: 0,
      'newline-before-return': 0
  }
};
