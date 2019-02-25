module.exports = function () {
  return {
    files: [
      {pattern: 'node_modules/socket.io-client/socket.io.js', instrument: false},
      {pattern: 'node_modules/karma/static/karma.js', instrument: false},

      'src/adapter.js',
      'test/mocks.js'
    ],

    tests: [
      'test/**/*.spec.js'
    ],

    setup: function () {
      window.__karma__ = window.karma
    },

    testFramework: 'jasmine@2.4.1'
  }
}
