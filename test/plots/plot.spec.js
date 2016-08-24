/**
 * @fileoverview test plot
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var Plot = require('../../src/js/plots/plot.js');
var DataProcessor = require('../../src/js/dataModels/dataProcessor');
var chartConst = require('../../src/js/const');
var dom = require('../../src/js/helpers/domHandler.js');
var renderUtil = require('../../src/js/helpers/renderUtil.js');

describe('Test for Plot', function() {
    var plot, dataProcessor, boundsMaker;

    beforeEach(function() {
        dataProcessor = new DataProcessor({}, '', {});
        boundsMaker = jasmine.createSpyObj('boundsMaker', ['getPosition', 'getDimension', 'getAxesData']);
        plot = new Plot({
            dataProcessor: dataProcessor,
            boundsMaker: boundsMaker,
            theme: {
                lineColor: 'black'
            }
        });

    });

    describe('_renderPlotArea()', function() {
        it('plotContainer와 dimension정보를 renderDimension()에 전달하여 너비 높이를 렌더링 합니다. ', function() {
            boundsMaker.getDimension.and.returnValue({
                width: 400,
                height: 300
            });
            spyOn(renderUtil, 'renderDimension');
            spyOn(renderUtil, 'renderPosition');
            spyOn(plot, '_renderPlotLines');

            plot._renderPlotArea('plotContainer');

            expect(renderUtil.renderDimension).toHaveBeenCalledWith('plotContainer', {
                width: 400,
                height: 300
            });
        });

        it('options.showLine을 설정하지 않으면 기본값이 true로 설정되어 line을 렌더링 합니다.', function() {
            boundsMaker.getDimension.and.returnValue({
                width: 400,
                height: 300
            });
            spyOn(renderUtil, 'renderDimension');
            spyOn(renderUtil, 'renderPosition');
            spyOn(plot, '_renderPlotLines');

            plot._renderPlotArea('plotContainer');

            expect(plot._renderPlotLines).toHaveBeenCalledWith('plotContainer', {
                width: 400,
                height: 300
            });
        });

        it('options.showLine이 false이면 _renderLines()을 호출하지 않습니다.', function() {
            boundsMaker.getDimension.and.returnValue({
                width: 400,
                height: 300
            });
            spyOn(renderUtil, 'renderDimension');
            spyOn(renderUtil, 'renderPosition');
            spyOn(plot, '_renderPlotLines');
            plot.options = {
                showLine: false
            };

            plot._renderPlotArea('plotContainer');

            expect(plot._renderPlotLines).not.toHaveBeenCalled();
        });

        it('if line type chart, execute _renderOptionalLines function', function() {
            boundsMaker.getDimension.and.returnValue({
                width: 400,
                height: 300
            });
            spyOn(renderUtil, 'renderDimension');
            spyOn(renderUtil, 'renderPosition');
            spyOn(plot, '_renderOptionalLines');
            plot.chartType = chartConst.CHART_TYPE_LINE;
            plot.options = {
                showLine: false
            };
            plot._renderPlotArea('plotContainer');

            expect(plot._renderOptionalLines).toHaveBeenCalledWith('plotContainer', {
                width: 400,
                height: 300
            });
        });
    });

    describe('_makeLineHtml()', function() {
        it('make line html, for vertical line', function() {
            var position = 50
            var standardWidth = 100;
            var templateParams = plot._makeVerticalLineTemplateParams({
                height: '50px',
                color: 'red'
            });
            var actual = plot._makeLineHtml(position, standardWidth, templateParams);
            var expected = '<div class="tui-chart-plot-line vertical" style="left:50%;width:1px;height:50px;background-color:red"></div>';

            expect(actual).toBe(expected);
        });

        it('make line html, for horizontal line', function() {
            var position = 50
            var standardWidth = 100;
            var templateParams = plot._makeHorizontalLineTemplateParams({
                width: '50px',
                color: 'red'
            });
            var actual = plot._makeLineHtml(position, standardWidth, templateParams);
            var expected = '<div class="tui-chart-plot-line horizontal" style="bottom:50%;width:50px;height:1px;background-color:red"></div>';

            expect(actual).toBe(expected);
        });
    });

    describe('_createOptionalLineValueRange()', function() {
        it('create value range for optional line, when optionalLineData has range property', function() {
            var optionalLineData = {
                range: [10, 20]
            };
            var actual = plot._createOptionalLineValueRange(optionalLineData);

            expect(actual).toEqual([10, 20]);
        });

        it('create value range for optional line, when optionalLineData has value property', function() {
            var optionalLineData = {
                value: 10
            };
            var actual = plot._createOptionalLineValueRange(optionalLineData);

            expect(actual).toEqual([10]);
        });

        it('create value range for optional line, when xAxisType is datetime type', function() {
            var optionalLineData = {
                range: ['01/01/2016', '01/03/2016']
            };
            var actual;

            plot.xAxisType = chartConst.AXIS_TYPE_DATETIME;
            actual = plot._createOptionalLineValueRange(optionalLineData);

            expect(actual).toEqual([
                (new Date('01/01/2016')).getTime(),
                (new Date('01/03/2016')).getTime()
            ]);
        });
    });

    describe('_createOptionalLinePosition()', function() {
        it('create position for optional line, when value axis', function() {
            var xAxisData = {
                dataMin: 20,
                distance: 200
            };
            var actual = plot._createOptionalLinePosition(xAxisData, 400, 120);

            expect(actual).toBe(200);
        });

        it('create position for optional line, when value axis and has maximum value', function() {
            var xAxisData = {
                dataMin: 20,
                distance: 200
            };
            var actual = plot._createOptionalLinePosition(xAxisData, 400, 220);

            expect(actual).toBe(399);
        });
    });

    describe('_createOptionalLinePositionWhenLabelAxis()', function() {
        beforeEach(function() {
            dataProcessor.categoriesMap = {
                x: ['cate1', 'cate2', 'cate3', 'cate4']
            };
        });

        it('create position for optional line, when label axis', function() {
            var actual;

            actual = plot._createOptionalLinePositionWhenLabelAxis(300, 'cate2');

            expect(actual).toBe(100);
        });

        it('create position for optional line, when label axis and has last value', function() {
            var actual;

            actual = plot._createOptionalLinePositionWhenLabelAxis(300, 'cate4');

            expect(actual).toBe(299);
        });

        it('if has not included value in categories, returns null', function() {
            var actual;

            actual = plot._createOptionalLinePositionWhenLabelAxis(300, 'cate5');

            expect(actual).toBeNull();
        });
    });

    describe('_createOptionalLinePositionMap()', function() {
        it('create position map for optional line, when x axis is label type', function() {
            var optionalLineData = {
                range: ['cate2', 'cate3']
            };
            var xAxisData = {
                isLabelAxis: true,
                dataMin: 20,
                distance: 200
            };
            var actual;

            dataProcessor.categoriesMap = {
                x: ['cate1', 'cate2', 'cate3', 'cate4']
            };

            actual = plot._createOptionalLinePositionMap(optionalLineData, xAxisData, 300);

            expect(actual).toEqual({
                start: 100,
                end: 200
            });
        });

        it('create position map for optional line, when x axis is label type and first value in range not included in categories', function() {
            var optionalLineData = {
                range: ['cate0', 'cate3']
            };
            var xAxisData = {
                isLabelAxis: true
            };
            var actual;

            dataProcessor.categoriesMap = {
                x: ['cate1', 'cate2', 'cate3', 'cate4']
            };

            actual = plot._createOptionalLinePositionMap(optionalLineData, xAxisData, 300);

            expect(actual).toEqual({
                start: 0,
                end: 200
            });
        });

        it('create position map for optional line, when x axis is value type', function() {
            var optionalLineData = {
                range: [170, 220]
            };
            var xAxisData = {
                isLabelAxis: false,
                dataMin: 20,
                distance: 200
            };
            var actual;

            actual = plot._createOptionalLinePositionMap(optionalLineData, xAxisData, 400);

            expect(actual).toEqual({
                start: 300,
                end: 399
            });
        });
    });

    describe('_makeOptionalLineHtml()', function() {
        it('make optional line html', function() {
            var optionalLineData = {
                value: 170,
                color: 'red'
            };
            var xAxisData = {
                dataMin: 20,
                distance: 200
            };
            var templateParams = {
                className: '',
                positionType: 'left',
                height: '100px'
            }
            var actual = plot._makeOptionalLineHtml(xAxisData, 400, templateParams, optionalLineData);
            var expected = '<div class="tui-chart-plot-line "' +
                ' style="left:75%;width:1px;height:100px;background-color:red"></div>';

            expect(actual).toBe(expected);
        });

        it('make optional band html', function() {
            var optionalLineData = {
                range: [170, 220],
                color: 'yellow'
            };
            var xAxisData = {
                dataMin: 20,
                distance: 200
            };
            var templateParams = {
                className: '',
                positionType: 'left',
                height: '200px'
            }
            var actual = plot._makeOptionalLineHtml(xAxisData, 400, templateParams, optionalLineData);
            var expected = '<div class="tui-chart-plot-line "' +
                ' style="left:75%;width:24.75%;height:200px;background-color:yellow"></div>';

            expect(actual).toBe(expected);
        });
    });

    describe('_makeOptionalLinesHtml()', function() {
        it('make optional lines html', function() {
            var lines = [
                {
                    value: 170,
                    color: 'red'
                },
                {
                    value: 200,
                    color: 'blue'
                }
            ];
            var dimension = {
                width: 400,
                height: 200
            };
            var actual, expected;

            boundsMaker.getAxesData.and.returnValue({
                xAxis: {
                    dataMin: 20,
                    distance: 200
                }
            });

            actual = plot._makeOptionalLinesHtml(lines, dimension);
            expected = '<div class="tui-chart-plot-line vertical"' +
                    ' style="left:75%;width:1px;height:200px;background-color:red"></div>' +
                '<div class="tui-chart-plot-line vertical"' +
                    ' style="left:90%;width:1px;height:200px;background-color:blue"></div>';

            expect(actual).toBe(expected);
        });
    });

    describe('_renderOptionalLines', function() {
        it('render optional lines and bands', function() {
            var container = dom.create('DIV');
            var dimension = {
                width: 400,
                height: 200
            };
            var expectedContainer = dom.create('DIV');
            var optionalContainer, expected;

            plot.options.bands = [
                {
                    range: [70, 120],
                    color: 'yellow'
                }
            ];
            plot.options.lines = [
                {
                    value: 170,
                    color: 'red'
                },
                {
                    value: 200,
                    color: 'blue'
                }
            ];
            boundsMaker.getAxesData.and.returnValue({
                xAxis: {
                    dataMin: 20,
                    distance: 200
                }
            });

            plot._renderOptionalLines(container, dimension);

            expected = '<div class="tui-chart-plot-line vertical"' +
                ' style="left:25%;width:25%;height:200px;background-color:yellow"></div>' +
                '<div class="tui-chart-plot-line vertical"' +
                ' style="left:75%;width:1px;height:200px;background-color:red"></div>' +
                '<div class="tui-chart-plot-line vertical"' +
                ' style="left:90%;width:1px;height:200px;background-color:blue"></div>';
            expectedContainer.innerHTML = expected;

            optionalContainer = container.firstChild;

            expect(optionalContainer.className).toBe('tui-chart-plot-optional-lines-area');
            expect(optionalContainer.innerHTML).toBe(expectedContainer.innerHTML);
        });
    });

    describe('_renderPlotLines()', function() {
        it('vTickCount=5 width=400인 경우에는 시작 라인을 제외한 4개의 가로라인(horizontal)을 라인을 50px(or 40px) 간격으로 아래에서 부터 렌더링합니다.', function() {
            var container = dom.create('DIV');
            var lineContainer, childNodes;

            plot.bound = {
                dimension: {width: 400, height: 200},
                position: {top: 5, right: 5}
            };
            boundsMaker.getAxesData.and.returnValue({
                yAxis: {
                    validTickCount: 5
                },
                xAxis: {
                    validTickCount: 0
                }
            });

            plot._renderPlotLines(container, plot.bound.dimension);
            lineContainer = container.firstChild;
            childNodes = lineContainer.childNodes;

            expect(lineContainer.className).toBe('tui-chart-plot-lines-area');
            expect(childNodes.length).toBe(4);
            expect(dom.hasClass(childNodes[0], 'horizontal')).toBe(true);
            expect(dom.hasClass(childNodes[3], 'horizontal')).toBe(true);
            expect(childNodes[0].style.bottom).toBe('25%');
            expect(childNodes[1].style.bottom).toBe('50%');
            expect(childNodes[2].style.bottom).toBe('75%');
            expect(childNodes[3].style.bottom).toBe('99.5%');
            expect(childNodes[0].style.width).toBe('400px');
            expect(childNodes[3].style.width).toBe('400px');
        });
    });

    describe('_makeLinesHtml()', function() {
        it('make lines html', function() {
            var positions = [0, 50, 100, 150];
            var templateParams = plot._makeVerticalLineTemplateParams({
                height: 200,
                color: 'red'
            });
            var actual = plot._makeLinesHtml(positions, 200, templateParams);
            var expected = '<div class="tui-chart-plot-line vertical"' +
                    ' style="left:0%;width:1px;height:200;background-color:red"></div>' +
                '<div class="tui-chart-plot-line vertical"' +
                    ' style="left:25%;width:1px;height:200;background-color:red"></div>' +
                '<div class="tui-chart-plot-line vertical"' +
                    ' style="left:50%;width:1px;height:200;background-color:red"></div>' +
                '<div class="tui-chart-plot-line vertical"' +
                    ' style="left:75%;width:1px;height:200;background-color:red"></div>';

            expect(actual).toBe(expected);
        });
    });

    describe('_makeVerticalPositions()', function() {
        it('make positions for vertical line', function() {
            var positions;

            boundsMaker.getAxesData.and.returnValue({
                yAxis: {
                    validTickCount: 5
                }
            });
            positions = plot._makeVerticalPositions(200);
            expect(positions).toEqual([50, 100, 150, 199]);
        });

        it('if yAxis.validTickCount is zero, returns empty array', function() {
            var positions;
            boundsMaker.getAxesData.and.returnValue({
                yAxis: {
                    validTickCount: 0
                }
            });
            positions = plot._makeVerticalPositions(200);
            expect(positions).toEqual([]);
        });
    });

    describe('_makeDividedPlotPositions()', function() {
        it('make divided positions of plot', function() {
            var actual, expected;

            boundsMaker.getDimension.and.returnValue({
                width: 50
            });

            actual = plot._makeDividedPlotPositions(450, 8);
            expected = [0, 50, 100, 150, 300, 350, 400, 449];

            expect(actual).toEqual(expected);
        });
    });

    describe('_makeHorizontalPositions()', function() {
        it('make positions for horizontal line', function() {
            var actual;

            boundsMaker.getAxesData.and.returnValue({
                xAxis: {
                    validTickCount: 5
                }
            });
            actual = plot._makeHorizontalPositions(200);

            expect(actual).toEqual([50, 100, 150, 199]);
        });

        it('if xAxis.validTickCount is zero, returns empty array', function() {
            var actual;

            boundsMaker.getAxesData.and.returnValue({
                xAxis: {
                    validTickCount: 0
                }
            });
            actual = plot._makeHorizontalPositions(200);

            expect(actual).toEqual([]);
        });

        it('if divided option is true, returns result to executing _makeDividedPlotPositions() function', function() {
            var actual, expected;

            boundsMaker.getDimension.and.returnValue({
                width: 50
            });
            boundsMaker.getAxesData.and.returnValue({
                xAxis: {
                    validTickCount: 0
                }
            });
            plot.options.divided = true;

            actual = plot._makeHorizontalPositions(350);
            expected = plot._makeDividedPlotPositions(350);

            expect(actual).toEqual(expected);
        });
    });

    describe('render()', function() {
        it('render for plot area', function() {
            var container, lineContainer, childNodes;;

            boundsMaker.getPosition.and.returnValue({
                top: 5,
                left: 5
            });
            boundsMaker.getDimension.and.returnValue({
                width: 400,
                height: 200
            });
            boundsMaker.getAxesData.and.returnValue({
                yAxis: {
                    validTickCount: 5
                },
                xAxis: {
                    validTickCount: 0
                }
            });
            container = plot.render();

            expect(container.style.width).toBe('400px');
            expect(container.style.height).toBe('200px');
            expect(container.style.top).toBe('5px');
            expect(container.style.left).toBe('5px');
            expect(container.className).toBe('tui-chart-plot-area');

            lineContainer = container.firstChild;
            childNodes = lineContainer.childNodes;

            expect(lineContainer.className).toBe('tui-chart-plot-lines-area');
            expect(childNodes.length).toBe(4);
            expect(dom.hasClass(childNodes[0], 'horizontal')).toBe(true);
            expect(dom.hasClass(childNodes[3], 'horizontal')).toBe(true);
            expect(childNodes[0].style.bottom).toBe('25%');
            expect(childNodes[1].style.bottom).toBe('50%');
            expect(childNodes[2].style.bottom).toBe('75%');
            expect(childNodes[3].style.bottom).toBe('99.5%');
            expect(childNodes[0].style.width).toBe('400px');
            expect(childNodes[3].style.width).toBe('400px');
        });
    });
});
