var $ = require('jquery'),
    chart = require('./chart.js'),
    mock = [
        ['Element', 'Density'],
        ['Copper', 8.94],
        ['Silver', 10.49],
        ['Gold', 19.30],
        ['Platinum', 21.45]
    ],
    options = {
        size: {
            width: 500,
            height: 450
        }
    };

chart.barChart($('body'), mock, options);
