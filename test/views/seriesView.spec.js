var SeriesView = require('../../src/js/views/seriesView.js'),
    SeriesModel = require('../../src/js/models/seriesModel.js');

var supportsSvg = function() {
    return document.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#Image", "1.1");
};

describe('test seriesView', function() {
    var data = {
            values: [[20], [40]],
            colors: ['blue'],
            scale: {min: 0, max: 160 },
            lastColors: ['red', 'ornage', 'yellow', 'green'],
        },
        options = {
            bars: 'vertical',
            chartType: 'bar'
        },
        size = {
            width: 200,
            height: 100
        },
        seriesModel = new SeriesModel(data),
        isSvgSupport = supportsSvg();

    it('test render', function() {
        var seriesView = new SeriesView(seriesModel, options),
            elSeries = seriesView.render(size),
            svg, rects, compareHtml;

        expect(elSeries.className).toEqual('series-area');
        expect(elSeries.style.width).toEqual('200px');
        expect(elSeries.style.height).toEqual('100px');

        if (isSvgSupport) {
            svg = elSeries.firstChild;
            expect(svg.getAttribute('width')).toEqual('200');
            expect(svg.getAttribute('height')).toEqual('100');
            rects = svg.getElementsByTagName('rect');

            expect(rects[0].getAttribute('width')).toEqual('50');
            expect(rects[0].getAttribute('x')).toEqual('25');
            expect(rects[0].getAttribute('y')).toEqual('89');
            expect(rects[0].getAttribute('fill')).toEqual('#0000ff');
            expect(rects[0].getAttribute('stroke')).toEqual('#000');

            expect(rects[1].getAttribute('height')).toEqual('25');
            expect(rects[1].getAttribute('x')).toEqual('125');
            expect(rects[1].getAttribute('y')).toEqual('76');
            expect(rects[1].getAttribute('fill')).toEqual('#0000ff');
            expect(rects[1].getAttribute('stroke')).toEqual('#000');
        } else {
            compareHtml = '<DIV style="CLIP: rect(0px 200px 100px 0px); POSITION: relative; WIDTH: 200px; DISPLAY: inline-block; HEIGHT: 100px; OVERFLOW: hidden; TOP: 0px; LEFT: 0px">' +
                '<SPAN style="POSITION: absolute; PADDING-BOTTOM: 0px; LINE-HEIGHT: 1; MARGIN: 0px; PADDING-LEFT: 0px; PADDING-RIGHT: 0px; TOP: -9999em; PADDING-TOP: 0px; LEFT: -9999em"></SPAN>' +
                '<?xml:namespace prefix = rvml ns = "urn:schemas-microsoft-com:vml" />' +
                '<rvml:shape style="POSITION: absolute; FILTER: ; WIDTH: 1px; HEIGHT: 1px; TOP: 0px; BEHAVIOR: url(#default#VML); LEFT: 0px" class=rvml raphael="true" raphaelid="12" coordsize = "21600,21600" path = " m540000,1922400 l1620000,1922400,1620000,2181600,540000,2181600 xe">' +
                    '<rvml:stroke class=rvml on="true" color="#000000" opacity="1" miterlimit="8"></rvml:stroke>' +
                    '<rvml:skew class=rvml on="true" matrix="1,0,0,1,0,0"></rvml:skew>' +
                    '<rvml:fill class=rvml on="true" color="#0000ff" src type="solid"></rvml:fill>' +
                '</rvml:shape>' +
                '<rvml:shape style="POSITION: absolute; FILTER: ; WIDTH: 1px; HEIGHT: 1px; TOP: 0px; BEHAVIOR: url(#default#VML); LEFT: 0px" class=rvml raphael="true" raphaelid="13" coordsize = "21600,21600" path = " m2700000,1641600 l3780000,1641600,3780000,2181600,2700000,2181600 xe">' +
                    '<rvml:stroke class=rvml on="true" color="#000000" opacity="1" miterlimit="8"></rvml:stroke>' +
                    '<rvml:skew class=rvml on="true" matrix="1,0,0,1,0,0"></rvml:skew>' +
                    '<rvml:fill class=rvml on="true" color="#0000ff" src type="solid"></rvml:fill>' +
                '</rvml:shape></DIV>';
            expect(elSeries.innerHTML).toEqual(compareHtml);
        }
    });

});