'use strict';

var DEFAULT_COLOR = '#000000';
var DEFAULT_BACKGROUND = '#ffffff';
var DEFAULT_FONTWEIGHT = 'normal';
var EMPTY = '';
var DEFAULT_AXIS = {
    tickColor: DEFAULT_COLOR,
    title: {
        fontSize: 12,
        fontFamily: EMPTY,
        color: DEFAULT_COLOR,
        fontWeight: DEFAULT_FONTWEIGHT
    },
    label: {
        fontSize: 12,
        fontFamily: EMPTY,
        color: DEFAULT_COLOR,
        fontWeight: DEFAULT_FONTWEIGHT
    }
};

var defaultTheme = {
    chart: {
        background: DEFAULT_BACKGROUND,
        fontFamily: 'Verdana'
    },
    title: {
        fontSize: 18,
        fontFamily: EMPTY,
        color: DEFAULT_COLOR,
        fontWeight: DEFAULT_FONTWEIGHT
    },
    yAxis: DEFAULT_AXIS,
    xAxis: DEFAULT_AXIS,
    plot: {
        lineColor: '#dddddd',
        background: '#ffffff',
        label: {
            fontSize: 11,
            fontFamily: EMPTY,
            color: '#888'
        }
    },
    series: {
        label: {
            fontSize: 11,
            fontFamily: EMPTY,
            color: DEFAULT_COLOR,
            fontWeight: DEFAULT_FONTWEIGHT
        },
        colors: ['#ac4142', '#d28445', '#f4bf75', '#90a959', '#75b5aa', '#6a9fb5', '#aa759f', '#8f5536'],
        singleColors: [],
        borderColor: EMPTY,
        borderWidth: EMPTY,
        selectionColor: EMPTY,
        startColor: '#F4F4F4',
        endColor: '#345391',
        overColor: '#F0C952'
    },
    legend: {
        label: {
            fontSize: 12,
            fontFamily: EMPTY,
            color: DEFAULT_COLOR,
            fontWeight: DEFAULT_FONTWEIGHT
        }
    },
    tooltip: {},
    chartExportMenu: {
        backgroundColor: '#fff',
        borderRadius: 0,
        borderWidth: 1,
        color: '#000'
    }
};

module.exports = defaultTheme;
