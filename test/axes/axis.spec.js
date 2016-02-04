/**
 * @fileoverview test axis
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var Axis = require('../../src/js/axes/axis'),
    chartConst = require('../../src/js/const'),
    dom = require('../../src/js/helpers/domHandler'),
    renderUtil = require('../../src/js/helpers/renderUtil');

describe('Axis', function() {
    var dataProcessor, boundsMaker, axis;

    beforeAll(function() {
        // 브라우저마다 렌더된 너비, 높이 계산이 다르기 때문에 일관된 결과가 나오도록 처리함
        spyOn(renderUtil, 'getRenderedLabelWidth').and.returnValue(50);
        spyOn(renderUtil, 'getRenderedLabelHeight').and.returnValue(20);
    });

    beforeEach(function() {
        dataProcessor = jasmine.createSpyObj('dataProcessor', ['getGroupValues', 'getCategories', 'getMultilineCategories']);
        boundsMaker = jasmine.createSpyObj('boundsMaker', ['registerBaseDimension', 'getDimension', 'getPosition']);
        axis = new Axis({
            theme: {
                title: {
                    fontSize: 12
                },
                label: {
                    fontSize: 12
                },
                tickColor: 'black'
            },
            options: {
                title: 'Axis Title'
            },
            dataProcessor: dataProcessor,
            boundsMaker: boundsMaker
        });
    });

    describe('_makeXAxisHeight()', function() {
        it('x축 영역의 높이를 계산하여 반환합니다.', function () {
            var actual, expected;

            axis.options.title = 'Axis Title';
            actual = axis._makeXAxisHeight();
            expected = 60;

            expect(actual).toBe(expected);
        });
    });

    describe('_makeYAxisWidth()', function() {
        it('y축 영역의 너비를 계산하여 반환합니다.', function() {
            var actual, expected;

            axis.options.title = 'Axis Title';
            actual = axis._makeYAxisWidth(['label1', 'label12']);
            expected = 97;

            expect(actual).toBe(expected);
        });
    });

    describe('_isValidAxis()', function() {
        it('component name이 rightYAxis가 아니면 true를 반환합니다.', function() {
            var actual, expected;

            axis.name = 'xAxis';
            actual = axis._isValidAxis();
            expected = true;

            expect(actual).toBe(expected);
        });

        it('component name이 rightYAxis면서 getGroupValues에 length가 0인 values가 하나라도 존재하면 false를 반환합니다.', function() {
            var actual, expected;

            axis.name = 'rightYAxis';
            dataProcessor.getGroupValues.and.returnValue([[], [1, 2, 3]]);

            actual = axis._isValidAxis();
            expected = false;

            expect(actual).toBe(expected);
        });
    });

    describe('registerDimension()', function() {
        it('_isValidAxis()가 false이면 boundsMaker에 등록하지 않습니다.', function() {
            var actualDimensions = {};

            spyOn(axis, '_isValidAxis').and.returnValues(false);
            axis.name = 'yAxis';

            boundsMaker.registerBaseDimension.and.callFake(function(name, dimension) {
                actualDimensions[name] = dimension;
            });

            axis.registerDimension();

            expect(actualDimensions[axis.name]).toBeUndefined();
        });

        it('componentType이 xAxis일 경우에는 dimension height를 계산하여 boundsMaker에 등록합니다.', function() {
            var actualDimensions = {},
                expected = {
                    height: 60
                };

            axis.name = 'xAxis';
            axis.componentType = 'xAxis';

            boundsMaker.registerBaseDimension.and.callFake(function(name, dimension) {
                actualDimensions[name] = dimension;
            });

            axis.registerDimension();

            expect(actualDimensions[axis.name]).toEqual(expected);
        });

        it('componentType이 xAxis가 아니면서 isLabel이 true이면 dimension width를 계산하여 boundsMaker에 등록합니다.', function() {
            var actualDimensions = {},
                expected = {
                    width: 97
                };

            axis.name = 'yAxis';
            axis.componentType = 'yAxis';
            axis.isLabel = true;

            dataProcessor.getCategories.and.returnValue(['cate1', 'cate2']);
            boundsMaker.registerBaseDimension.and.callFake(function(name, dimension) {
                actualDimensions[name] = dimension;
            });

            axis.registerDimension();

            expect(actualDimensions[axis.name]).toEqual(expected);
        });

        it('componentType이 xAxis가 아니면서 isLabel이 true가 아니면 boundsMaker에 등록하지 않습니다.', function() {
            var actualDimensions = {};

            axis.name = 'yAxis';
            axis.componentType = 'yAxis';

            dataProcessor.getCategories.and.returnValue(['cate1', 'cate2']);
            boundsMaker.registerBaseDimension.and.callFake(function(name, dimension) {
                actualDimensions[name] = dimension;
            });

            axis.registerDimension();

            expect(actualDimensions[axis.name]).toBeUndefined();
        });
    });

    describe('registerAdditionalDimension()', function() {
        it('_isInvalidRightYAxis()가 false이면 boundsMaker에 등록하지 않습니다.', function() {
            var actualDimensions = {};

            spyOn(axis, '_isValidAxis').and.returnValues(false);
            axis.name = 'yAxis';

            boundsMaker.registerBaseDimension.and.callFake(function(name, dimension) {
                actualDimensions[name] = dimension;
            });

            axis.registerAdditionalDimension();

            expect(actualDimensions[axis.name]).toBeUndefined();
        });

        it('componentType이 yAxis면서 isLabel이 true가 아니면 dimension width를 계산하여 boundsMaker에 등록합니다.', function() {
            var actualDimensions = {},
                expected = {
                    width: 97
                };

            axis.name = 'yAxis';
            axis.componentType = 'yAxis';

            boundsMaker.axesData = {
                yAxis: {
                    labels: ['label1', 'label2']
                }
            };
            boundsMaker.registerBaseDimension.and.callFake(function(name, dimension) {
                actualDimensions[name] = dimension;
            });

            axis.registerAdditionalDimension();

            expect(actualDimensions[axis.name]).toEqual(expected);
        });
    });

    describe('_renderTitleAreaStyle()', function() {
        it('타이틀 너비가 50인 좌측 y axis 타이틀 영역의 css style을 렌더링 합니다.', function() {
            var elTitle = dom.create('DIV');
            axis._renderTitleAreaStyle(elTitle, 50);

            // 세로 영역임에도 회전되어 처리되기 때문에 높이 대신 너비 값을 설정 합니다.
            expect(elTitle.style.width).toBe('50px');
            expect(elTitle.style.left).toBe('0px');

            // IE8에서는 회전 방법 이슈로 인해 top값을 설정하지 않습니다.
            if (!renderUtil.isOldBrowser()) {
                expect(elTitle.style.top).toBe('50px');
            }
        });

        it('우측 y axis 타이틀 영역의 css style을 렌더링합니다. 우측에 배치되기 때문에 right값으로 설정됩니다.', function() {
            var elTitle = dom.create('DIV');
            axis._renderTitleAreaStyle(elTitle, 50, true);
            expect(elTitle.style.width).toBe('50px');

            if (renderUtil.isIE7()) {
                expect(elTitle.style.right).toBe('0px');
            } else {
                expect(elTitle.style.right).toBe('-50px');
            }
            expect(elTitle.style.top).toBe('0px');
        });
    });

    describe('_renderTitleArea()', function() {
        it('타이틀이 있을 경우에는 타이틀 영역이 설정값 대로 정상 렌더링됩니다.', function() {
            var elTitle = axis._renderTitleArea({
                title: 'Axis Title',
                theme: {
                    fontSize: 12
                },
                isVertical: true,
                size: 200
            });

            expect(elTitle.innerHTML).toBe('Axis Title');
            expect(elTitle.style.width).toBe('200px');
        });
        it('타이틀이 없을 경우에는 타이틀 영역이 렌더링 되지 않고 null을 반환합니다.', function() {
            var elTitle;

            axis.options.title = '';
            elTitle = axis._renderTitleArea({
                title: '',
                theme: {
                    fontSize: 12
                },
                isVertical: true,
                size: 200
            });
            expect(elTitle).toBeNull();
        });
    });


    describe('_renderTickArea()', function() {
        it('axis 영역의 너비가 300이고 tick count가 5인 x축(레이블 타입) tick 영역에는 5개의 tick이 75px(or 74px) 간격으로 좌측에서 부터 렌더링 됩니다.', function() {
            var elTickArea, childNodes;

            axis.data = {
                tickCount: 5,
                labels: [],
                isLabelAxis: true,
                isVertical: false
            };

            elTickArea = axis._renderTickArea(300);
            childNodes = elTickArea.childNodes;

            expect(childNodes.length).toBe(5);
            expect(childNodes[0].style.left).toBe('0px');
            expect(childNodes[1].style.left).toBe('75px');
            expect(childNodes[2].style.left).toBe('150px');
            expect(childNodes[3].style.left).toBe('224px');
            expect(childNodes[4].style.left).toBe('299px');
        });

        it('axis 영역의 높이가 300이고 tick count가 5인 y축(벨류 타입) tick 영역에는 5개의 tick이 75px(or 74px) 간격으로 밑에서 부터 렌더링 됩니다.', function() {
            var elTickArea, childNodes;

            axis.data = {
                tickCount: 5,
                labels: [],
                isLabelAxis: false,
                isVertical: true
            };
            elTickArea = axis._renderTickArea(300);
            childNodes = elTickArea.childNodes;

            expect(childNodes.length).toBe(5);
            expect(childNodes[0].style.bottom).toBe('0px');
            expect(childNodes[1].style.bottom).toBe('75px');
            expect(childNodes[2].style.bottom).toBe('150px');
            expect(childNodes[3].style.bottom).toBe('224px');
            expect(childNodes[4].style.bottom).toBe('299px');
        });


        it('aligned=true이며 레이블 중에 EMPTY_AXIS_LABEL이 포함되어있는 경우 tick을 표시하지 않습니다.', function() {
            var elTickArea, childNodes;

            axis.data = {
                tickCount: 5,
                labels: ['cate1', 'cate2', chartConst.EMPTY_AXIS_LABEL, chartConst.EMPTY_AXIS_LABEL, 'cate5'],
                isLabelAxis: true,
                isVertical: false,
                aligned: true
            };

            elTickArea = axis._renderTickArea(300);
            childNodes = elTickArea.childNodes;

            expect(childNodes.length).toBe(3);
            expect(childNodes[0].style.left).toBe('0px');
            expect(childNodes[1].style.left).toBe('75px');
            expect(childNodes[2].style.left).toBe('299px');
        });
    });

    describe('_makeVerticalLabelCssText()', function() {
        it('세로 axis의 cssText를 생성합니다.', function() {
            var actual = axis._makeVerticalLabelCssText(50, 20),
                expected = ';width:40px';
            expect(actual).toBe(expected);
        });
    });

    describe('_renderLabelArea()', function() {
        it('axis 영역의 너비가 300인 레이블 타입 x축 레이블 영역은 너비 100px과 간격 100px(or 99px)로 레이블값을 포함하여 렌더링 됩니다.', function() {
            var elLabelArea, childNodes;

            elLabelArea = axis._renderLabelArea({
                labels: ['label1', 'label2', 'label3'],
                tickCount: 4,
                isLabelAxis: true,
                isVertical: false
            }, 300);
            childNodes = elLabelArea.childNodes;

            expect(childNodes.length).toBe(3);
            expect(childNodes[0].style.left).toBe('0px');
            expect(childNodes[1].style.left).toBe('100px');
            expect(childNodes[2].style.left).toBe('199px');
            expect(childNodes[0].style.width).toBe('100px');
            expect(childNodes[1].style.width).toBe('100px');
            expect(childNodes[2].style.width).toBe('100px');
            expect(childNodes[0].innerHTML.toLowerCase()).toBe('<span>label1</span>');
            expect(childNodes[1].innerHTML.toLowerCase()).toBe('<span>label2</span>');
            expect(childNodes[2].innerHTML.toLowerCase()).toBe('<span>label3</span>');
        });

        it('axis 영역의 높이가 300인 레이블 타입 y축 레이블 영역은 높이 100px과 간격 100px(or 99px)로 레이블값을 포함하여 렌더링 됩니다.', function() {
            var elLabelArea, childNodes;

            elLabelArea = axis._renderLabelArea({
                labels: ['label1', 'label2', 'label3'],
                tickCount: 4,
                isLabelAxis: true,
                isVertical: true
            }, 300, 100);
            childNodes = elLabelArea.childNodes;

            expect(childNodes.length).toBe(3);
            expect(childNodes[0].style.top).toBe('0px');
            expect(childNodes[1].style.top).toBe('100px');
            expect(childNodes[2].style.top).toBe('199px');
            expect(childNodes[0].style.height).toBe('100px');
            expect(childNodes[1].style.height).toBe('100px');
            expect(childNodes[2].style.height).toBe('100px');
            expect(childNodes[0].style.lineHeight).toBe('100px');
            expect(childNodes[1].style.lineHeight).toBe('100px');
            expect(childNodes[2].style.lineHeight).toBe('100px');
            expect(childNodes[0].innerHTML.toLowerCase()).toBe('<span>label1</span>');
            expect(childNodes[1].innerHTML.toLowerCase()).toBe('<span>label2</span>');
            expect(childNodes[2].innerHTML.toLowerCase()).toBe('<span>label3</span>');
        });

        it('axis 영역의 너비가 300인 벨류 타입 x축 레이블 영역은 너비 150px과 간격 150px(or 149px)로 벨류형태의 레이블 값을 포함하여 렌더링 됩니다.', function() {
            var elLabelArea, childNodes;

            elLabelArea = axis._renderLabelArea({
                labels: ['0.00', '30.00', '60.00'],
                tickCount: 3
            }, 300);
            childNodes = elLabelArea.childNodes;

            expect(childNodes.length).toBe(3);

            // 벨류 타입의 경우는 tick 옆에 배치되기 때문에 레이블 타입과는 다른 간격으로 놓이게 됩니다.
            expect(childNodes[0].style.left).toBe('0px');
            expect(childNodes[1].style.left).toBe('150px');
            expect(childNodes[2].style.left).toBe('299px');
            expect(childNodes[0].style.width).toBe('150px');
            expect(childNodes[1].style.width).toBe('150px');
            expect(childNodes[2].style.width).toBe('150px');
            expect(childNodes[0].innerHTML.toLowerCase()).toBe('<span>0.00</span>');
            expect(childNodes[1].innerHTML.toLowerCase()).toBe('<span>30.00</span>');
            expect(childNodes[2].innerHTML.toLowerCase()).toBe('<span>60.00</span>');
        });

        it('axis 영역의 높이가 300인 벨류 타입 y축 레이블 영역은 150px(or 149px)의 간격으로 벨류형태의 레이블 값을 포함하여 렌더링 됩니다.', function() {
            var elLabelArea, childNodes;

            elLabelArea = axis._renderLabelArea({
                labels: ['0.00', '30.00', '60.00'],
                tickCount: 3,
                isVertical: true
            }, 300, 100);
            childNodes = elLabelArea.childNodes;

            expect(childNodes.length).toBe(3);
            expect(childNodes[0].style.bottom).toBe('0px');
            expect(childNodes[1].style.bottom).toBe('150px');
            expect(childNodes[2].style.bottom).toBe('299px');
            expect(childNodes[0].innerHTML.toLowerCase()).toBe('<span>0.00</span>');
            expect(childNodes[1].innerHTML.toLowerCase()).toBe('<span>30.00</span>');
            expect(childNodes[2].innerHTML.toLowerCase()).toBe('<span>60.00</span>');
        });
    });

    describe('_getRenderedTitleHeight()', function() {
        it('렌더링된 타이틀 높이를 반환합니다.', function() {
            var result = axis._getRenderedTitleHeight();
            expect(result).toBe(20);
        });
    });

    describe('_makeLabelCssTexts()', function() {
        //여기부터 검토
        it('레이블 높이가 100인 레이블 타입 y축의 css 배열을 생성합니다.', function() {
            var cssTexts = axis._makeLabelCssTexts({
                isVertical: true,
                isLabelAxis: true,
                labelSize: 100
            });
            expect(cssTexts).toEqual(['height:100px', 'line-height:100px']);
        });

        it('레이블 너비가 100인 타입 x축의 css 배열을 생성합니다.', function() {
            var cssTexts = axis._makeLabelCssTexts({
                isVertical: false,
                isLabelAxis: true,
                labelSize: 100
            });
            expect(cssTexts).toEqual(['width:100px']);
        });

        it('벨류 타입 y축의 경우는 빈 css 배열이 생성됩니다.', function() {
            var cssTexts = axis._makeLabelCssTexts({
                isVertical: true,
                isLabelAxis: false,
                labelSize: 100
            });
            expect(cssTexts).toEqual([]);
        });

        it('너비가 100인 벨류 타입 x축의 css 배열을 생성합니다.', function() {
            var cssTexts = axis._makeLabelCssTexts({
                isVertical: false,
                isLabelAxis: false,
                labelSize: 100
            });
            expect(cssTexts).toEqual(['width:100px']);
        });
    });

    describe('_calculateRotationMovingPosition()', function() {
        it('xAxis label 회전 시 위치해야 할 position을 계산합니다.', function() {
            var actual = axis._calculateRotationMovingPosition({
                    degree: 25,
                    left: 40,
                    moveLeft: 20,
                    top: 30
                }),
                expected = {
                    top: 30,
                    left: 20
                };
            expect(actual).toEqual(expected);
        });

        it('85도 각도에서는 레이블이 가운데 위치하도록 left를 조절합니다.', function() {
            var actual = axis._calculateRotationMovingPosition({
                    degree: 85,
                    labelHeight: 20,
                    left: 40,
                    moveLeft: 20,
                    top: 30
                }),
                expected = {
                    top: 30,
                    left: 10.038053019082547
                };
            expect(actual).toEqual(expected);
        });
    });

    describe('_calculateRotationMovingPositionForIE8()', function() {
        it('IE8은 회전 방식이 다르기 때문에 계산결과가 다릅니다.', function() {
            var actual = axis._calculateRotationMovingPositionForIE8({
                    degree: 25,
                    labelWidth: 40,
                    labelHeight: 20,
                    left: 40,
                    label: 'label1',
                    theme: {}
                }),
                expected = {
                    top: 10,
                    left: 24.684610648167506
                };
            expect(actual).toEqual(expected);
        });

        it('85도 각도에서는 레이블이 가운데 위치하도록 left를 조절합니다.', function() {
            var actual = axis._calculateRotationMovingPositionForIE8({
                    degree: 85,
                    labelWidth: 20,
                    labelHeight: 20,
                    left: 40,
                    label: 'label1',
                    theme: {}
                }),
                expected = {
                    top: 10,
                    left: 65.68026588169964
                };
            expect(actual).toEqual(expected);
        });
    });

    describe('_makeCssTextForRotationMoving()', function() {
        it('_calculateRotationMovingPosition() 결과로 얻은 position 정보로 cssText를 생성합니다.', function() {
            var actual, expected;
            spyOn(renderUtil, 'isOldBrowser').and.returnValue(false);
            spyOn(axis, '_calculateRotationMovingPosition').and.returnValue({left: 10, top: 10});
            actual = axis._makeCssTextForRotationMoving();
            expected = 'left:10px;top:10px';
            expect(actual).toEqual(expected);
        });

        it('IE8의 경우는 _calculateRotationMovingPositionForIE8() 결과로 얻은 position 정보로 cssText를 생성합니다.', function() {
            var actual, expected;
            spyOn(renderUtil, 'isOldBrowser').and.returnValue(true);
            spyOn(axis, '_calculateRotationMovingPositionForIE8').and.returnValue({left: 10, top: 10});
            actual = axis._makeCssTextForRotationMoving();
            expected = 'left:10px;top:10px';
            expect(actual).toEqual(expected);
        });
    });

    describe('_makeNormalLabelsHtml()', function() {
        it('간격이 50px인 회전없는 레이블 영역 html을 생성합니다.', function() {
            var actual = axis._makeLabelsHtml({
                    positions: [30, 80, 130],
                    labels: ['label1', 'label2', 'label3'],
                    posType: 'left',
                    cssTexts: []
                }),
                expected = '<div class="tui-chart-label" style="left:30px"><span>label1</span></div>' +
                    '<div class="tui-chart-label" style="left:80px"><span>label2</span></div>' +
                    '<div class="tui-chart-label" style="left:130px"><span>label3</span></div>';

            expect(actual).toBe(expected);
        });
    });

    describe('_makeRotationLabelsHtml()', function() {
        it('45도로 회전된 레이블 영역 html을 생성합니다.', function() {
            var actual, expected;

            spyOn(axis, '_makeCssTextForRotationMoving').and.returnValue('left:10px;top:10px');
            boundsMaker.xAxisDegree = 45;
            actual = axis._makeRotationLabelsHtml({
                positions: [30, 80, 130],
                labels: ['label1', 'label2', 'label3'],
                posType: 'left',
                cssTexts: [],
                labelSize: 80
            });
            expected = '<div class="tui-chart-label tui-chart-xaxis-rotation tui-chart-xaxis-rotation45" style="left:10px;top:10px"><span>label1</span></div>' +
                '<div class="tui-chart-label tui-chart-xaxis-rotation tui-chart-xaxis-rotation45" style="left:10px;top:10px"><span>label2</span></div>' +
                '<div class="tui-chart-label tui-chart-xaxis-rotation tui-chart-xaxis-rotation45" style="left:10px;top:10px"><span>label3</span></div>';

            expect(actual).toBe(expected);
        });
    });

    describe('_makeLabelsHtml()', function() {
        it('degree 정보가 없을 경우에는 _makeNormalLabelsHtml()을 실행합니다.', function() {
            var params = {
                    positions: [30, 80, 130],
                    labels: ['label1', 'label2', 'label3'],
                    posType: 'left',
                    cssTexts: []
                },
                actual, expected;

            delete boundsMaker.xAxisDegree;
            actual = axis._makeLabelsHtml(params);
            expected = axis._makeNormalLabelsHtml(params);

            expect(actual).toBe(expected);
        });

        it('degree 정보가 있을 경우에는 _makeRotationLabelsHtml()을 실행합니다.', function() {
            var params, actual, expected;

            spyOn(renderUtil, 'isOldBrowser').and.returnValue(false);
            params = {
                positions: [30, 80, 130],
                labels: ['label1', 'label2', 'label3'],
                posType: 'left',
                cssTexts: [],
                labelSize: 80
            };
            boundsMaker.xAxisDegree = 45;
            axis.name = 'xAxis';
            actual = axis._makeLabelsHtml(params);
            expected = axis._makeRotationLabelsHtml(params);

            expect(actual).toBe(expected);
        });
    });
    describe('_changeLabelAreaPosition()', function() {
        it('레이블 타입 축(x,y 모두 포함)의 경우에는 레이블 영역 위치 이동은 없습니다.', function() {
            var elLabelArea = dom.create('DIV');
            axis._changeLabelAreaPosition({
                elLabelArea: elLabelArea,
                isLabelAxis: true
            });

            // 레이블이 타입의 경우 기본 설정이 가운데 배치되기 때문에 위치 이동 필요 없습니다.
            expect(elLabelArea.style.top).toBe('');
            expect(elLabelArea.style.left).toBe('');
        });

        it('벨류 타입 y축의 경우는 레이블을 tick의 중앙에 위치 시키기 위해 영역이 top 이동 됩니다.', function() {
            var elLabelArea = dom.create('DIV'),
                top;
            axis._changeLabelAreaPosition({
                elLabelArea: elLabelArea,
                theme: {},
                isVertical: true
            });

            top = parseInt(elLabelArea.style.top, 10);

            expect(top).toBe(10);
        });

        it('벨류 타입 x축의 경우는 레이블을 tick의 중앙에 위치 시키기 위해 영역이 left -25px 이동 됩니다.', function() {
            var elLabelArea = dom.create('DIV');
            axis._changeLabelAreaPosition({
                elLabelArea: elLabelArea,
                theme: {
                    fontSize: 12
                },
                labelSize: 50
            });
            expect(elLabelArea.style.left).toBe('-25px');
        });
    });

    describe('_renderAxisArea()', function() {

    });

    describe('_renderAxisArea()', function() {
        it('axis의 전체 영역을 렌더링 합니다.', function() {
            var container = dom.create('DIV'),
                data = {
                    labels: ['label1', 'label2', 'label3'],
                    tickCount: 4,
                    isLabelAxis: true,
                    isVertical: false
                };

            boundsMaker.getDimension.and.returnValue({
                width: 100,
                height: 200
            });
            boundsMaker.getPosition.and.returnValue({
                top: 20
            });

            axis._renderAxisArea(container, data);

            expect(container.style.width).toBe('100px');
            expect(container.style.height).toBe('200px');
            expect(container.style.top).toBe('20px');
            expect(dom.hasClass(container, 'horizontal')).toBeTruthy();
            expect(container.childNodes[0].className).toBe('tui-chart-title-area');
            expect(container.childNodes[1].className).toBe('tui-chart-tick-area');
            expect(container.childNodes[2].className).toBe('tui-chart-label-area');
        });
    });

    describe('rerender()', function() {
        it('_isInvalidRightYAxis()가 false이면 container의 내용만 비우고 끝냅니다.', function() {
            axis.axisContainer = dom.create('DIV');
            axis.axisContainer.innerHTML = 'contents';

            spyOn(axis, '_isValidAxis').and.returnValues(false);

            axis.rerender();

            expect(axis.axisContainer.innerHTML).toBe('');
        });

        it('_isInvalidRightYAxis()가 false이서 this.options가 있을 경우 options의 내용을 갱신하면서 _renderAxisArea()를 수행합니다.', function() {
            var acutal = false,
                options = {
                    title: 'ABC'
                },
                expected = true;

            spyOn(axis, '_renderAxisArea').and.callFake(function() {
                acutal = true;
            });

            axis.axisContainer = dom.create('DIV');
            axis.options = {};
            axis.rerender({
                options: options
            });

            expect(axis.options).toEqual(options);
            expect(acutal).toBe(expected);
        });
    });
});
