'use strict';

var DEFAULT_COLOR = '#000000';
var DEFAULT_BACKGROUND = '#ffffff';
var DEFAULT_FONTWEIGHT = 'normal';
var EMPTY = '';
var DEFAULT_AXIS = {
    tickColor: DEFAULT_COLOR,
    title: {
        fontSize: 11,
        fontFamily: EMPTY,
        color: '#bbbbbb',
        fontWeight: DEFAULT_FONTWEIGHT
    },
    label: {
        fontSize: 11,
        fontFamily: EMPTY,
        color: DEFAULT_COLOR,
        fontWeight: DEFAULT_FONTWEIGHT
    }
};

var defaultTheme = {
    chart: {
        background: {
            color: DEFAULT_BACKGROUND,
            opacity: 1
        },
        fontFamily: 'Arial'
    },
    title: {
        fontSize: 18,
        fontFamily: 'Arial',
        color: DEFAULT_COLOR,
        fontWeight: DEFAULT_FONTWEIGHT
    },
    yAxis: DEFAULT_AXIS,
    xAxis: DEFAULT_AXIS,
    plot: {
        lineColor: '#f4f4f4',
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
        colors: ['#00a9ff', '#ffb840', '#ff5a46', '#00bd9f', '#785fff', '#f28b8c', '#989486', '#516f7d', '#29dbe3', '#dddddd'],
        borderColor: EMPTY,
        borderWidth: EMPTY,
        selectionColor: EMPTY,
        startColor: '#F4F4F4',
        endColor: '#345391',
        overColor: '#F0C952',
        dot: {
            fillColor: EMPTY,
            fillOpacity: 1,
            strokeColor: EMPTY,
            strokeOpacity: 1,
            strokeWidth: 2,
            radius: 0,
            hover: {
                fillColor: EMPTY,
                fillOpacity: 1,
                strokeColor: '#fff',
                strokeOpacity: 1,
                strokeWidth: 4,
                radius: 6
            }
        },
        ranges: []
    },
    legend: {
        label: {
            fontSize: 11,
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
