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
        fontSize: 18,
        color: DEFAULT_COLOR
    },
    vAxis: DEFAULT_AXIS,
    hAxis: DEFAULT_AXIS,
    plot: {
        lineColor: '#dddddd',
        background: '#ffffff'
    },
    series: {
        colors: ['#ac4142', '#d28445', '#f4bf75', '#90a959', '#75b5aa', '#6a9fb5', '#aa759f', '#8f5536']
    },
    legend: {
        label: {
            fontSize: 12,
            color: DEFAULT_COLOR
        }
    }
};

module.exports = defaultTheme;