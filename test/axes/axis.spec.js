/**
 * @fileoverview test axis
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var Axis = require('../../src/js/axes/axis.js'),
    dom = require('../../src/js/helpers/domHandler.js'),
    renderUtil = require('../../src/js/helpers/renderUtil.js');

describe('Axis', function() {
    var axis;

    beforeAll(function() {
        // 브라우저마다 렌더된 너비, 높이 계산이 다르기 때문에 일관된 결과가 나오도록 처리함
        spyOn(renderUtil, 'getRenderedLabelHeight').and.returnValue(20);
    });

    beforeEach(function() {
        axis = new Axis({
            data: {
                labels: ['label1', 'label2', 'label3'],
                tickCount: 4,
                isLabelAxis: true
            },
            theme: {
                title: {
                    fontSize: 12
                },
                label: {
                    fontSize: 12
                },
                tickColor: 'black'
            },
            bound: {
                dimension: {
                    width: 100,
                    height: 200
                },
                position: {
                    top: 20
                }
            },
            options: {
                title: 'Axis Title'
            }
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
            if (!renderUtil.isIE8()) {
                expect(elTitle.style.top).toBe('50px');
            }
        });

        it('우측 y axis 타이틀 영역의 css style을 렌더링합니다. 우측에 배치되기 때문에 right값으로 설정됩니다.', function() {
            var elTitle = dom.create('DIV');
            axis._renderTitleAreaStyle(elTitle, 50, true);
            expect(elTitle.style.width).toBe('50px');
            expect(elTitle.style.right).toBe('-50px');
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
    });

    describe('_renderLabelArea()', function() {
        it('axis 영역의 너비가 300인 레이블 타입 x축 레이블 영역은 너비 100px과 간격 100px(or 99px)로 레이블값을 포함하여 렌더링 됩니다.', function() {
            var elLabelArea, childNodes;

            axis.data = {
                labels: ['label1', 'label2', 'label3'],
                tickCount: 4,
                isLabelAxis: true,
                isVertical: false
            };

            elLabelArea = axis._renderLabelArea(300);
            childNodes = elLabelArea.childNodes;

            expect(childNodes.length).toBe(3);
            expect(childNodes[0].style.left).toBe('0px');
            expect(childNodes[1].style.left).toBe('100px');
            expect(childNodes[2].style.left).toBe('199px');
            expect(childNodes[0].style.width).toBe('100px');
            expect(childNodes[1].style.width).toBe('100px');
            expect(childNodes[2].style.width).toBe('100px');
            expect(childNodes[0].innerHTML).toBe('label1');
            expect(childNodes[1].innerHTML).toBe('label2');
            expect(childNodes[2].innerHTML).toBe('label3');
        });

        it('axis 영역의 높이가 300인 레이블 타입 y축 레이블 영역은 높이 100px과 간격 100px(or 99px)로 레이블값을 포함하여 렌더링 됩니다.', function() {
            var elLabelArea, childNodes;

            axis.data.isVertical = true;
            elLabelArea = axis._renderLabelArea(300, 100);
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
            expect(childNodes[0].innerHTML).toBe('label1');
            expect(childNodes[1].innerHTML).toBe('label2');
            expect(childNodes[2].innerHTML).toBe('label3');
        });

        it('axis 영역의 너비가 300인 벨류 타입 x축 레이블 영역은 너비 150px과 간격 150px(or 149px)로 벨류형태의 레이블 값을 포함하여 렌더링 됩니다.', function() {
            var elLabelArea, childNodes;

            axis.data = {
                labels: ['0.00', '30.00', '60.00'],
                tickCount: 3
            };

            elLabelArea = axis._renderLabelArea(300);
            childNodes = elLabelArea.childNodes;

            expect(childNodes.length).toBe(3);

            // 벨류 타입의 경우는 tick 옆에 배치되기 때문에 레이블 타입과는 다른 간격으로 놓이게 됩니다.
            expect(childNodes[0].style.left).toBe('0px');
            expect(childNodes[1].style.left).toBe('150px');
            expect(childNodes[2].style.left).toBe('299px');
            expect(childNodes[0].style.width).toBe('150px');
            expect(childNodes[1].style.width).toBe('150px');
            expect(childNodes[2].style.width).toBe('150px');
            expect(childNodes[0].innerHTML).toBe('0.00');
            expect(childNodes[1].innerHTML).toBe('30.00');
            expect(childNodes[2].innerHTML).toBe('60.00');
        });

        it('axis 영역의 높이가 300인 벨류 타입 y축 레이블 영역은 150px(or 149px)의 간격으로 벨류형태의 레이블 값을 포함하여 렌더링 됩니다.', function() {
            var elLabelArea, childNodes;

            axis.data = {
                labels: ['0.00', '30.00', '60.00'],
                tickCount: 3,
                isVertical: true
            };

            elLabelArea = axis._renderLabelArea(300, 100);
            childNodes = elLabelArea.childNodes;

            expect(childNodes.length).toBe(3);
            expect(childNodes[0].style.bottom).toBe('0px');
            expect(childNodes[1].style.bottom).toBe('150px');
            expect(childNodes[2].style.bottom).toBe('299px');
            expect(childNodes[0].innerHTML).toBe('0.00');
            expect(childNodes[1].innerHTML).toBe('30.00');
            expect(childNodes[2].innerHTML).toBe('60.00');
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

    describe('_makeLabelsHtml()', function() {
        it('간격이 10px인 레이블 영역 html을 생성합니다.', function() {
            var labelsHtml = axis._makeLabelsHtml({
                    positions: [10, 20, 30],
                    labels: ['label1', 'label2', 'label3'],
                    posType: 'left',
                    cssTexts: []
                }),
                compareHtml = '<div class="ne-chart-label" style="left:10px">label1</div>' +
                    '<div class="ne-chart-label" style="left:20px">label2</div>' +
                    '<div class="ne-chart-label" style="left:30px">label3</div>';

            expect(labelsHtml).toBe(compareHtml);
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

    describe('render()', function() {
        it('레이블 타입 axis의 전체 영역을 렌더링 합니다.', function() {
            var el;
            axis.data.isVertical = false;
            el = axis.render();

            expect(el.style.width).toBe('100px');
            expect(el.style.height).toBe('200px');
            expect(el.style.top).toBe('20px');
            expect(dom.hasClass(el, 'horizontal')).toBeTruthy();
            expect(el.childNodes[0].className).toBe('ne-chart-title-area');
            expect(el.childNodes[1].className).toBe('ne-chart-tick-area');
            expect(el.childNodes[2].className).toBe('ne-chart-label-area');
        });
    });
});
