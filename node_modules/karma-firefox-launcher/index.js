'use strict'

var fs = require('fs')
var path = require('path')

var PREFS = [
  'user_pref("browser.shell.checkDefaultBrowser", false);',
  'user_pref("browser.bookmarks.restore_default_bookmarks", false);',
  'user_pref("dom.disable_open_during_load", false);',
  'user_pref("dom.max_script_run_time", 0);',
  'user_pref("dom.min_background_timeout_value", 10);',
  'user_pref("extensions.autoDisableScopes", 0);',
  'user_pref("browser.tabs.remote.autostart", false);',
  'user_pref("browser.tabs.remote.autostart.2", false);',
  'user_pref("extensions.enabledScopes", 15);'
].join('\n')

// Get all possible Program Files folders even on other drives
// inspect the user's path to find other drives that may contain Program Files folders
var getAllPrefixes = function () {
  var drives = []
  var paden = process.env.Path.split(';')
  var re = /^[A-Z]:\\/i
  var pad
  for (var p = 0; p < paden.length; p++) {
    pad = paden[p]
    if (re.test(pad) && drives.indexOf(pad[0]) === -1) {
      drives.push(pad[0])
    }
  }

  var result = []
  var prefixes = [process.env.PROGRAMFILES, process.env['PROGRAMFILES(X86)']]
  var prefix
  for (var i = 0; i < prefixes.length; i++) {
    if (typeof prefixes[i] !== 'undefined') {
      for (var d = 0; d < drives.length; d += 1) {
        prefix = drives[d] + prefixes[i].substr(1)
        if (result.indexOf(prefix) === -1) {
          result.push(prefix)
        }
      }
    }
  }
  return result
}

// Return location of firefox.exe file for a given Firefox directory
// (available: "Mozilla Firefox", "Aurora", "Nightly").
var getFirefoxExe = function (firefoxDirName) {
  if (process.platform !== 'win32' && process.platform !== 'win64') {
    return null
  }

  var prefix
  var prefixes = getAllPrefixes()
  var suffix = '\\' + firefoxDirName + '\\firefox.exe'

  for (var i = 0; i < prefixes.length; i++) {
    prefix = prefixes[i]
    if (fs.existsSync(prefix + suffix)) {
      return prefix + suffix
    }
  }

  return 'C:\\Program Files' + suffix
}

var getFirefoxWithFallbackOnOSX = function () {
  if (process.platform !== 'darwin') {
    return null
  }

  var firefoxDirNames = Array.prototype.slice.call(arguments)
  var prefix = '/Applications/'
  var suffix = '.app/Contents/MacOS/firefox-bin'

  var bin
  var homeBin
  for (var i = 0; i < firefoxDirNames.length; i++) {
    bin = prefix + firefoxDirNames[i] + suffix

    if ('HOME' in process.env) {
      homeBin = path.join(process.env.HOME, bin)

      if (fs.existsSync(homeBin)) {
        return homeBin
      }
    }

    if (fs.existsSync(bin)) {
      return bin
    }
  }
}

var makeHeadlessVersion = function (Browser) {
  var HeadlessBrowser = function () {
    Browser.apply(this, arguments)
    var execCommand = this._execCommand
    this._execCommand = function (command, args) {
      execCommand.call(this, command, args.concat('-headless'))
    }
  }

  HeadlessBrowser.prototype = Object.create(Browser.prototype, {
    name: { value: Browser.prototype.name + 'Headless' }
  })
  HeadlessBrowser.$inject = Browser.$inject
  return HeadlessBrowser
}

// https://developer.mozilla.org/en-US/docs/Command_Line_Options
var FirefoxBrowser = function (id, baseBrowserDecorator, args) {
  baseBrowserDecorator(this)

  this._getPrefs = function (prefs) {
    if (typeof prefs !== 'object') {
      return PREFS
    }
    var result = PREFS
    for (var key in prefs) {
      result += 'user_pref("' + key + '", ' + JSON.stringify(prefs[key]) + ');\n'
    }
    return result
  }

  this._start = function (url) {
    var self = this
    var command = this._getCommand()
    var profilePath = args.profile || self._tempDir
    var flags = args.flags || []
    var extensionsDir

    if (Array.isArray(args.extensions)) {
      extensionsDir = path.resolve(profilePath, 'extensions')
      fs.mkdirSync(extensionsDir)
      args.extensions.forEach(function (ext) {
        var extBuffer = fs.readFileSync(ext)
        var copyDestination = path.resolve(extensionsDir, path.basename(ext))
        fs.writeFileSync(copyDestination, extBuffer)
      })
    }

    fs.writeFileSync(profilePath + '/prefs.js', this._getPrefs(args.prefs))
    self._execCommand(
      command,
      [url, '-profile', profilePath, '-no-remote'].concat(flags)
    )
  }
}

FirefoxBrowser.prototype = {
  name: 'Firefox',

  DEFAULT_CMD: {
    linux: 'firefox',
    freebsd: 'firefox',
    darwin: getFirefoxWithFallbackOnOSX('Firefox'),
    win32: getFirefoxExe('Mozilla Firefox')
  },
  ENV_CMD: 'FIREFOX_BIN'
}

FirefoxBrowser.$inject = ['id', 'baseBrowserDecorator', 'args']

var FirefoxHeadlessBrowser = makeHeadlessVersion(FirefoxBrowser)

var FirefoxDeveloperBrowser = function () {
  FirefoxBrowser.apply(this, arguments)
}

FirefoxDeveloperBrowser.prototype = {
  name: 'FirefoxDeveloper',
  DEFAULT_CMD: {
    linux: 'firefox',
    darwin: getFirefoxWithFallbackOnOSX('FirefoxDeveloperEdition', 'FirefoxAurora'),
    win32: getFirefoxExe('Firefox Developer Edition')
  },
  ENV_CMD: 'FIREFOX_DEVELOPER_BIN'
}

FirefoxDeveloperBrowser.$inject = ['id', 'baseBrowserDecorator', 'args']

var FirefoxDeveloperHeadlessBrowser = makeHeadlessVersion(FirefoxDeveloperBrowser)

var FirefoxAuroraBrowser = function () {
  FirefoxBrowser.apply(this, arguments)
}

FirefoxAuroraBrowser.prototype = {
  name: 'FirefoxAurora',
  DEFAULT_CMD: {
    linux: 'firefox',
    darwin: getFirefoxWithFallbackOnOSX('FirefoxAurora'),
    win32: getFirefoxExe('Aurora')
  },
  ENV_CMD: 'FIREFOX_AURORA_BIN'
}

FirefoxAuroraBrowser.$inject = ['id', 'baseBrowserDecorator', 'args']

var FirefoxAuroraHeadlessBrowser = makeHeadlessVersion(FirefoxAuroraBrowser)

var FirefoxNightlyBrowser = function () {
  FirefoxBrowser.apply(this, arguments)
}

FirefoxNightlyBrowser.prototype = {
  name: 'FirefoxNightly',

  DEFAULT_CMD: {
    linux: 'firefox',
    darwin: getFirefoxWithFallbackOnOSX('FirefoxNightly'),
    win32: getFirefoxExe('Nightly')
  },
  ENV_CMD: 'FIREFOX_NIGHTLY_BIN'
}

FirefoxNightlyBrowser.$inject = ['id', 'baseBrowserDecorator', 'args']

var FirefoxNightlyHeadlessBrowser = makeHeadlessVersion(FirefoxNightlyBrowser)

// PUBLISH DI MODULE
module.exports = {
  'launcher:Firefox': ['type', FirefoxBrowser],
  'launcher:FirefoxHeadless': ['type', FirefoxHeadlessBrowser],
  'launcher:FirefoxDeveloper': ['type', FirefoxDeveloperBrowser],
  'launcher:FirefoxDeveloperHeadless': ['type', FirefoxDeveloperHeadlessBrowser],
  'launcher:FirefoxAurora': ['type', FirefoxAuroraBrowser],
  'launcher:FirefoxAuroraHeadless': ['type', FirefoxAuroraHeadlessBrowser],
  'launcher:FirefoxNightly': ['type', FirefoxNightlyBrowser],
  'launcher:FirefoxNightlyHeadless': ['type', FirefoxNightlyHeadlessBrowser]
}
