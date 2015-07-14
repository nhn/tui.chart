var pluginFactory = require('../../src/js/factories/pluginFactory.js');

describe('test pluginRaphael', function() {
    var graphRenderer;

    it('test get instance', function() {
        graphRenderer = pluginFactory.get('raphael', 'bar');
        expect(!!graphRenderer).toBeTruthy();
    });

    describe('test BarChart renderer', function() {

        var size = {
                width: 400,
                height: 250
            },
            values = [
                [0.2, 0.4],
                [0.6, 0.3],
                [0.3, 0.3],
                [0.8, 0.1]
            ],
            colors = ['red', 'blue'],
            groupIndex = 0,
            container,
            paper;

        beforeEach(function() {
            container = document.createElement('DIV');
            paper = Raphael(container, size.width, size.height);
        });

        it('test _renderVerticalBars', function() {
            var maxBarWidth = size.width;
            document.body.appendChild(container);
            graphRenderer._renderVerticalBars(paper, size, maxBarWidth, values, colors, groupIndex);

            console.log(container);
        });

    });
});
