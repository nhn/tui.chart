var Report = require('istanbul').Report
var util = require('util')

function InMemoryReport (opt) {
  this.opt = opt
}

util.inherits(InMemoryReport, Report)

InMemoryReport.prototype.writeReport = function (collector, sync) {
  if (!this.opt.emitter || !this.opt.emitter.emit) {
    console.error('Could not raise "coverage_complete" event, missing emitter because it was not supplied during initialization of the reporter')
  } else {
    this.opt.emitter.emit('coverage_complete', this.opt.browser, collector.getFinalCoverage())
  }
}

InMemoryReport.TYPE = 'in-memory'

module.exports = InMemoryReport
