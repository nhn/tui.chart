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
        lineColor: '#dddddd',
        background: '#ffffff'
    },
    series: {
        colors: ['red', 'orange', 'yellow', 'green', 'blue'],
        borderColor: 'blue'
    },
    legend: {
        label: {
            fontSize: 12,
            color: DEFAULT_COLOR
        }
    }
};

module.exports = defaultTheme;