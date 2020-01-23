module.exports = {
  extends: ['tui/es6', 'plugin:prettier/recommended'],
  plugins: ['prettier'],
  parserOptions: {
    sourceType: 'module'
  },
  env: {
    browser: true,
    amd: true,
    node: true,
    es6: true,
    jasmine: true,
    jquery: true,
    commonjs: true
  },
  globals: {
    tui: true
  },
  rules: {
    'prefer-destructuring': [
      'error',
      {
        VariableDeclarator: { array: true, object: true }
      }
    ]
  }
};
