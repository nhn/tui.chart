'use strict';

var chartConst = require('../const');
var themeManager = require('./themeManager');
var defaultTheme = require('./defaultTheme');

themeManager.register(chartConst.DEFAULT_THEME_NAME, defaultTheme);
