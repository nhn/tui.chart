/**
 * @fileoverview test plugin raphael
 * @author NHN Ent.
 *         FE Development Team <jiung.kang@nhnent.com>
 */

'use strict';

var pluginFactory = require('../../src/js/factories/pluginFactory.js');

var supportsSvg = function() {
    return document.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#Image", "1.1");
};

describe('test pluginRaphael', function() {
    var graphRenderer,
        data = {
            dimension: {width: 200, height: 100},
            model: {
                percentValues: [
                    [0.2, 0.4],
                    [0.6, 0.3]
                ],
                colors: ['red', 'blue'],
                pickLastColors: function() {
                    return [];
                }
            },
            options: {barType: 'bar'}
        },
        isSvgSupport = supportsSvg();

    it('test get instance', function() {
        graphRenderer = pluginFactory.get('raphael', 'bar');
        expect(!!graphRenderer).toBeTruthy();
    });

    describe('test BarChart renderer', function() {
        var dimension = data.dimension,
            values = data.model.percentValues[0],
            colors = data.model.colors,
            lastColor = 'black',
            groupIndex = 0,
            container,
            paper;

        beforeEach(function() {
            container = document.createElement('DIV');
            paper = Raphael(container, dimension.width, dimension.height);
        });

        it('test _renderBars', function() {
            var maxBarWidth = dimension.width / 2,
                svg, rects, compareHtml;

            graphRenderer._renderBars(paper, dimension, maxBarWidth, values, colors, lastColor, groupIndex);

            if (isSvgSupport) {
                svg = container.firstChild;
                expect(svg.getAttribute('width')).toEqual('200');
                expect(svg.getAttribute('height')).toEqual('100');
                rects = svg.getElementsByTagName('rect');

                expect(rects[0].getAttribute('width')).toEqual('33');
                expect(rects[0].getAttribute('x')).toEqual('16.5');
                expect(rects[0].getAttribute('y')).toEqual('81');
                expect(rects[0].getAttribute('fill')).toEqual('#ff0000');
                expect(rects[1].getAttribute('height')).toEqual('40');
                expect(rects[1].getAttribute('x')).toEqual('49.5');
                expect(rects[1].getAttribute('y')).toEqual('61');
                expect(rects[1].getAttribute('fill')).toEqual('#000000');
            } else {
                compareHtml = '<DIV style="CLIP: rect(0px 200px 100px 0px); POSITION: relative; WIDTH: 200px; DISPLAY: inline-block; HEIGHT: 100px; OVERFLOW: hidden; TOP: 0px; LEFT: 0px">' +
                    '<SPAN style="POSITION: absolute; PADDING-BOTTOM: 0px; LINE-HEIGHT: 1; MARGIN: 0px; PADDING-LEFT: 0px; PADDING-RIGHT: 0px; TOP: -9999em; PADDING-TOP: 0px; LEFT: -9999em"></SPAN>' +
                    '<?xml:namespace prefix = rvml ns = "urn:schemas-microsoft-com:vml" />' +
                    '<rvml:shape style="POSITION: absolute; FILTER: ; WIDTH: 1px; HEIGHT: 1px; TOP: 0px; BEHAVIOR: url(#default#VML); LEFT: 0px" class=rvml raphael="true" raphaelid="0" coordsize = "21600,21600" path = " m356400,1749600 l1069200,1749600,1069200,2181600,356400,2181600 xe">' +
                        '<rvml:stroke class=rvml on="false" color="#000000" opacity="1" miterlimit="8"></rvml:stroke>' +
                        '<rvml:skew class=rvml on="true" matrix="1,0,0,1,0,0"></rvml:skew>' +
                        '<rvml:fill class=rvml on="true" color="#ff0000" src type="solid"></rvml:fill>' +
                    '</rvml:shape>' +
                    '<rvml:shape style="POSITION: absolute; FILTER: ; WIDTH: 1px; HEIGHT: 1px; TOP: 0px; BEHAVIOR: url(#default#VML); LEFT: 0px" class=rvml raphael="true" raphaelid="1" coordsize = "21600,21600" path = " m1069200,1317600 l1782000,1317600,1782000,2181600,1069200,2181600 xe">' +
                        '<rvml:stroke class=rvml on="false" color="#000000" opacity="1" miterlimit="8"></rvml:stroke>' +
                        '<rvml:skew class=rvml on="true" matrix="1,0,0,1,0,0"></rvml:skew>' +
                        '<rvml:fill class=rvml on="true" color="#000000" src type="solid"></rvml:fill>' +
                    '</rvml:shape></DIV>';

                expect(container.innerHTML).toEqual(compareHtml);
            }
        });

        it('test _renderColumns', function() {
            var maxBarHeight = dimension.height / 2,
                svg, rects, compareHtml;

            graphRenderer._renderColumns(paper, dimension, maxBarHeight, values, colors, '', groupIndex);

            if (isSvgSupport) {
                svg = container.firstChild;
                expect(svg.getAttribute('width')).toEqual('200');
                expect(svg.getAttribute('height')).toEqual('100');
                rects = svg.getElementsByTagName('rect');

                expect(rects[0].getAttribute('width')).toEqual('40');
                expect(rects[0].getAttribute('x')).toEqual('-1');
                expect(rects[0].getAttribute('y')).toEqual('8');
                expect(rects[0].getAttribute('fill')).toEqual('#ff0000');

                expect(rects[1].getAttribute('height')).toEqual('16');
                expect(rects[1].getAttribute('x')).toEqual('-1');
                expect(rects[1].getAttribute('y')).toEqual('24');
                expect(rects[1].getAttribute('fill')).toEqual('#0000ff');
            } else {
                compareHtml = '<DIV style="CLIP: rect(0px 200px 100px 0px); POSITION: relative; WIDTH: 200px; DISPLAY: inline-block; HEIGHT: 100px; OVERFLOW: hidden; TOP: 0px; LEFT: 0px">' +
                    '<SPAN style="POSITION: absolute; PADDING-BOTTOM: 0px; LINE-HEIGHT: 1; MARGIN: 0px; PADDING-LEFT: 0px; PADDING-RIGHT: 0px; TOP: -9999em; PADDING-TOP: 0px; LEFT: -9999em"></SPAN>' +
                    '<?xml:namespace prefix = rvml ns = "urn:schemas-microsoft-com:vml" />' +
                    '<rvml:shape style="POSITION: absolute; FILTER: ; WIDTH: 1px; HEIGHT: 1px; TOP: 0px; BEHAVIOR: url(#default#VML); LEFT: 0px" class=rvml raphael="true" raphaelid="2" coordsize = "21600,21600" path = " m-21600,172800 l842400,172800,842400,518400,-21600,518400 xe">' +
                        '<rvml:stroke class=rvml on="false" color="#000000" opacity="1" miterlimit="8"></rvml:stroke>' +
                        '<rvml:skew class=rvml on="true" matrix="1,0,0,1,0,0"></rvml:skew>' +
                        '<rvml:fill class=rvml on="true" color="#ff0000" src type="solid"></rvml:fill>' +
                    '</rvml:shape>' +
                    '<rvml:shape style="POSITION: absolute; FILTER: ; WIDTH: 1px; HEIGHT: 1px; TOP: 0px; BEHAVIOR: url(#default#VML); LEFT: 0px" class=rvml raphael="true" raphaelid="3" coordsize = "21600,21600" path = " m-21600,518400 l1706400,518400,1706400,864000,-21600,864000 xe">' +
                        '<rvml:stroke class=rvml on="false" color="#000000" opacity="1" miterlimit="8"></rvml:stroke>' +
                        '<rvml:skew class=rvml on="true" matrix="1,0,0,1,0,0"></rvml:skew>' +
                        '<rvml:fill class=rvml on="true" color="#0000ff" src type="solid"></rvml:fill>' +
                    '</rvml:shape></DIV>';
                expect(container.innerHTML).toEqual(compareHtml);
            }
        });
    });

    it('test render', function() {
        var container = document.createElement('DIV'),
            svg, rects, compareHtml;

        data.options.barType = 'column';
        graphRenderer.render(container, data);

        if (isSvgSupport) {
            svg = container.firstChild;
            expect(svg.getAttribute('width')).toEqual('200');
            expect(svg.getAttribute('height')).toEqual('100');
            rects = svg.getElementsByTagName('rect');

            expect(rects[0].getAttribute('width')).toEqual('33');
            expect(rects[0].getAttribute('x')).toEqual('16.5');
            expect(rects[0].getAttribute('y')).toEqual('81');
            expect(rects[0].getAttribute('fill')).toEqual('#ff0000');

            expect(rects[1].getAttribute('height')).toEqual('40');
            expect(rects[1].getAttribute('x')).toEqual('49.5');
            expect(rects[1].getAttribute('y')).toEqual('61');
            expect(rects[1].getAttribute('fill')).toEqual('#0000ff');

            expect(rects[2].getAttribute('width')).toEqual('33');
            expect(rects[2].getAttribute('x')).toEqual('116.5');
            expect(rects[2].getAttribute('y')).toEqual('41');
            expect(rects[2].getAttribute('fill')).toEqual('#ff0000');

            expect(rects[3].getAttribute('height')).toEqual('30');
            expect(rects[3].getAttribute('x')).toEqual('149.5');
            expect(rects[3].getAttribute('y')).toEqual('71');
            expect(rects[3].getAttribute('fill')).toEqual('#0000ff');
        } else {
            compareHtml = '<DIV style="CLIP: rect(0px 200px 100px 0px); POSITION: relative; WIDTH: 200px; DISPLAY: inline-block; HEIGHT: 100px; OVERFLOW: hidden; TOP: 0px; LEFT: 0px">' +
                '<SPAN style="POSITION: absolute; PADDING-BOTTOM: 0px; LINE-HEIGHT: 1; MARGIN: 0px; PADDING-LEFT: 0px; PADDING-RIGHT: 0px; TOP: -9999em; PADDING-TOP: 0px; LEFT: -9999em"></SPAN>' +
                '<?xml:namespace prefix = rvml ns = "urn:schemas-microsoft-com:vml" />' +
                '<rvml:shape style="POSITION: absolute; FILTER: ; WIDTH: 1px; HEIGHT: 1px; TOP: 0px; BEHAVIOR: url(#default#VML); LEFT: 0px" class=rvml raphael="true" raphaelid="4" coordsize = "21600,21600" path = " m356400,1749600 l1069200,1749600,1069200,2181600,356400,2181600 xe">' +
                    '<rvml:stroke class=rvml on="false" color="#000000" opacity="1" miterlimit="8"></rvml:stroke>' +
                    '<rvml:skew class=rvml on="true" matrix="1,0,0,1,0,0"></rvml:skew>' +
                    '<rvml:fill class=rvml on="true" color="#ff0000" src type="solid"></rvml:fill>' +
                '</rvml:shape>' +
                '<rvml:shape style="POSITION: absolute; FILTER: ; WIDTH: 1px; HEIGHT: 1px; TOP: 0px; BEHAVIOR: url(#default#VML); LEFT: 0px" class=rvml raphael="true" raphaelid="5" coordsize = "21600,21600" path = " m1069200,1317600 l1782000,1317600,1782000,2181600,1069200,2181600 xe">' +
                    '<rvml:stroke class=rvml on="false" color="#000000" opacity="1" miterlimit="8"></rvml:stroke>' +
                    '<rvml:skew class=rvml on="true" matrix="1,0,0,1,0,0"></rvml:skew>' +
                    '<rvml:fill class=rvml on="true" color="#0000ff" src type="solid"></rvml:fill>' +
                '</rvml:shape>' +
                '<rvml:shape style="POSITION: absolute; FILTER: ; WIDTH: 1px; HEIGHT: 1px; TOP: 0px; BEHAVIOR: url(#default#VML); LEFT: 0px" class=rvml raphael="true" raphaelid="6" coordsize = "21600,21600" path = " m2516400,885600 l3229200,885600,3229200,2181600,2516400,2181600 xe">' +
                    '<rvml:stroke class=rvml on="false" color="#000000" opacity="1" miterlimit="8"></rvml:stroke>' +
                    '<rvml:skew class=rvml on="true" matrix="1,0,0,1,0,0"></rvml:skew>' +
                    '<rvml:fill class=rvml on="true" color="#ff0000" src type="solid"></rvml:fill>' +
                '</rvml:shape>' +
                '<rvml:shape style="POSITION: absolute; FILTER: ; WIDTH: 1px; HEIGHT: 1px; TOP: 0px; BEHAVIOR: url(#default#VML); LEFT: 0px" class=rvml raphael="true" raphaelid="7" coordsize = "21600,21600" path = " m3229200,1533600 l3942000,1533600,3942000,2181600,3229200,2181600 xe">' +
                    '<rvml:stroke class=rvml on="false" color="#000000" opacity="1" miterlimit="8"></rvml:stroke>' +
                    '<rvml:skew class=rvml on="true" matrix="1,0,0,1,0,0"></rvml:skew>' +
                    '<rvml:fill class=rvml on="true" color="#0000ff" src type="solid"></rvml:fill>' +
                '</rvml:shape></DIV>';
            expect(container.innerHTML).toEqual(compareHtml);
        }

        data.options.barType = 'bar';
        container = document.createElement('DIV');

        graphRenderer.render(container, data);

        if (isSvgSupport) {
            svg = container.firstChild;
            expect(svg.getAttribute('width')).toEqual('200');
            expect(svg.getAttribute('height')).toEqual('100');
            rects = svg.getElementsByTagName('rect');

            expect(rects[0].getAttribute('width')).toEqual('40');
            expect(rects[0].getAttribute('x')).toEqual('-1');
            expect(rects[0].getAttribute('y')).toEqual('8');
            expect(rects[0].getAttribute('fill')).toEqual('#ff0000');

            expect(rects[1].getAttribute('height')).toEqual('16');
            expect(rects[1].getAttribute('x')).toEqual('-1');
            expect(rects[1].getAttribute('y')).toEqual('24');
            expect(rects[1].getAttribute('fill')).toEqual('#0000ff');

            expect(rects[2].getAttribute('width')).toEqual('120');
            expect(rects[2].getAttribute('x')).toEqual('-1');
            expect(rects[2].getAttribute('y')).toEqual('58');
            expect(rects[2].getAttribute('fill')).toEqual('#ff0000');

            expect(rects[3].getAttribute('height')).toEqual('16');
            expect(rects[3].getAttribute('x')).toEqual('-1');
            expect(rects[3].getAttribute('y')).toEqual('74');
            expect(rects[3].getAttribute('fill')).toEqual('#0000ff');
        } else {
            compareHtml = '<DIV style="CLIP: rect(0px 200px 100px 0px); POSITION: relative; WIDTH: 200px; DISPLAY: inline-block; HEIGHT: 100px; OVERFLOW: hidden; TOP: 0px; LEFT: 0px">' +
                '<SPAN style="POSITION: absolute; PADDING-BOTTOM: 0px; LINE-HEIGHT: 1; MARGIN: 0px; PADDING-LEFT: 0px; PADDING-RIGHT: 0px; TOP: -9999em; PADDING-TOP: 0px; LEFT: -9999em"></SPAN>' +
                '<?xml:namespace prefix = rvml ns = "urn:schemas-microsoft-com:vml" />' +
                '<rvml:shape style="POSITION: absolute; FILTER: ; WIDTH: 1px; HEIGHT: 1px; TOP: 0px; BEHAVIOR: url(#default#VML); LEFT: 0px" class=rvml raphael="true" raphaelid="8" coordsize = "21600,21600" path = " m-21600,172800 l842400,172800,842400,518400,-21600,518400 xe">' +
                    '<rvml:stroke class=rvml on="false" color="#000000" opacity="1" miterlimit="8"></rvml:stroke>' +
                    '<rvml:skew class=rvml on="true" matrix="1,0,0,1,0,0"></rvml:skew>' +
                    '<rvml:fill class=rvml on="true" color="#ff0000" src type="solid"></rvml:fill>' +
                '</rvml:shape>' +
                '<rvml:shape style="POSITION: absolute; FILTER: ; WIDTH: 1px; HEIGHT: 1px; TOP: 0px; BEHAVIOR: url(#default#VML); LEFT: 0px" class=rvml raphael="true" raphaelid="9" coordsize = "21600,21600" path = " m-21600,518400 l1706400,518400,1706400,864000,-21600,864000 xe">' +
                    '<rvml:stroke class=rvml on="false" color="#000000" opacity="1" miterlimit="8"></rvml:stroke>' +
                    '<rvml:skew class=rvml on="true" matrix="1,0,0,1,0,0"></rvml:skew>' +
                    '<rvml:fill class=rvml on="true" color="#0000ff" src type="solid"></rvml:fill>' +
                '</rvml:shape>' +
                '<rvml:shape style="POSITION: absolute; FILTER: ; WIDTH: 1px; HEIGHT: 1px; TOP: 0px; BEHAVIOR: url(#default#VML); LEFT: 0px" class=rvml raphael="true" raphaelid="10" coordsize = "21600,21600" path = " m-21600,1252800 l2570400,1252800,2570400,1598400,-21600,1598400 xe">' +
                    '<rvml:stroke class=rvml on="false" color="#000000" opacity="1" miterlimit="8"></rvml:stroke>' +
                    '<rvml:skew class=rvml on="true" matrix="1,0,0,1,0,0"></rvml:skew>' +
                    '<rvml:fill class=rvml on="true" color="#ff0000" src type="solid"></rvml:fill>' +
                '</rvml:shape>' +
                '<rvml:shape style="POSITION: absolute; FILTER: ; WIDTH: 1px; HEIGHT: 1px; TOP: 0px; BEHAVIOR: url(#default#VML); LEFT: 0px" class=rvml raphael="true" raphaelid="11" coordsize = "21600,21600" path = " m-21600,1598400 l1274400,1598400,1274400,1944000,-21600,1944000 xe">' +
                    '<rvml:stroke class=rvml on="false" color="#000000" opacity="1" miterlimit="8"></rvml:stroke>' +
                    '<rvml:skew class=rvml on="true" matrix="1,0,0,1,0,0"></rvml:skew>' +
                    '<rvml:fill class=rvml on="true" color="#0000ff" src type="solid"></rvml:fill>' +
                '</rvml:shape></DIV>';
            expect(container.innerHTML).toEqual(compareHtml);
        }
    });
});
