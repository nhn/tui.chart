var themeFactory = require('../factories/themeFactory.js');

var DEFAULT_COLOR = '#000000',
    DEFAULT_BACKGROUND = '#ffffff',
    DEFAULT_AXIS = {
        tickColor: DEFAULT_COLOR,
        title: {
            fontSize: 12,
            color: DEFAULT_COLOR
        },
        label: {
            fontSize: 12,
            color: DEFAULT_COLOR
        }
    };

var defaultTheme = {
    chart: {
        colors: ['red', 'orange', 'yellow', 'green', 'blue'],
        background: DEFAULT_BACKGROUND,
        fontFamily: 'Verdana'
    },
    title: {
        fontSize: 14,
        color: DEFAULT_COLOR
    },
    vAxis: DEFAULT_AXIS,
    hAxis: DEFAULT_AXIS,
    plot: {
        lineColor: '#dddddd'
    },
    legend: {
        label: {
            fontSize: 12,
            color: DEFAULT_COLOR
        }
    }
};

themeFactory.register('default', defaultTheme);