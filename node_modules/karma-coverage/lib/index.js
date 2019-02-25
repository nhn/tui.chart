// karma-coverage
// ==============
//
// Main entry point for the karma-coverage module.
// Exposes the preprocessor and reporter plugins.

// Registering one additional (karma specific) reporter: in-memory
require('istanbul').Report.register(require('./in-memory-report'))

module.exports = {
  'preprocessor:coverage': ['factory', require('./preprocessor')],
  'reporter:coverage': ['type', require('./reporter')]
}
