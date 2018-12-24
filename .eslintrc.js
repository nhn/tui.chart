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
      'indent': [2, 4, {SwitchCase: 1, ignoreComments: false, ImportDeclaration: 1, flatTernaryExpressions: false}],
      'prefer-destructuring': ['error', {
          VariableDeclarator: {array: true, object: true}
      }]
  }
};
