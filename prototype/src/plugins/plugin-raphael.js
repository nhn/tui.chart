var _ = require('underscore'),
    chart = require('../chart.js'),
    Raphael = require('raphael'),
    pluginRaphael;

pluginRaphael = {
    renderer: {
        Bar: function($container, data, inCallback, outCallback) {
            var height = data.height,
                width = data.width,
                values = data.values,
                makers = data.maekers,
                paper = Raphael($container[0], width, height),
                seriesWidth = parseInt(width/values.length);

            _.each(data.values, function(values, index) {
                var value = values[0],
                    _seriesWidth = parseInt(seriesWidth/3),
                    seriesHeight = parseInt(value),
                    top = height - seriesHeight,
                    left = parseInt(seriesWidth * index) + (seriesWidth - _seriesWidth) / 2,
                    rect = paper.rect(left, top, _seriesWidth, seriesHeight),
                    pos = {
                        left: left,
                        top: top,
                        width: _seriesWidth,
                        height: seriesHeight
                    };

                rect.attr({
                    fill: 'red'
                });

                rect.hover(function() {
                    inCallback(pos, index);
                }, function() {
                    outCallback(index);
                });
            });
        }
    }
};

chart.registPlugin('RAPHAEL', pluginRaphael);
