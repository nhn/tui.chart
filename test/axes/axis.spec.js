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
        it('타이틀 너비가 50인 좌측 y axis 타이틀 영역의 css style을 렌더링 합니다.(세로 영역임에도 회전되어 처리되기 때문에 높이 대신 너비 값을 설정 합니다.)', function() {
            var elTitle = dom.create('DIV');
            axis._renderTitleAreaStyle(elTitle, 50);
            expect(elTitle.style.width).toEqual('50px');
            expect(elTitle.style.left).toEqual('0px');
            if (!renderUtil.isIE8()) {
                expect(elTitle.style.top).toEqual('50px');
            }
        });

        it('우측 y axis 타이틀 영역의 css style을 렌더링합니다. 우측에 배치되기 때문에 right값으로 설정됩니다.', function() {
            var elTitle = dom.create('DIV');
            axis._renderTitleAreaStyle(elTitle, 50, true);
            expect(elTitle.style.width).toEqual('50px');
            expect(elTitle.style.right).toEqual('-50px');
            expect(elTitle.style.top).toEqual('0px');
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

            expect(elTitle.innerHTML).toEqual('Axis Title');
            expect(elTitle.style.width).toEqual('200px');
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

            expect(childNodes.length).toEqual(5);
            expect(childNodes[0].style.left).toEqual('0px');
            expect(childNodes[1].style.left).toEqual('75px');
            expect(childNodes[2].style.left).toEqual('150px');
            expect(childNodes[3].style.left).toEqual('224px');
            expect(childNodes[4].style.left).toEqual('299px');
        });

        it('axis 영역의 높이가 300이고 tick count가 5인 y축(벨류 타입) tick 영역에는 5개의 tick이 75px(or 74px) 간격으로 밑에서 부터 렌더링 됩니다.', function() {
            var elTickArea, childNodes;

            axis.data = {
                tickCount: 5,
                isVertical: true
            };
            elTickArea = axis._renderTickArea(300);
            childNodes = elTickArea.childNodes;

            expect(childNodes.length).toEqual(5);
            expect(childNodes[0].style.bottom).toEqual('0px');
            expect(childNodes[1].style.bottom).toEqual('75px');
            expect(childNodes[2].style.bottom).toEqual('150px');
            expect(childNodes[3].style.bottom).toEqual('224px');
            expect(childNodes[4].style.bottom).toEqual('299px');
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

            expect(childNodes.length).toEqual(3);
            expect(childNodes[0].style.left).toEqual('0px');
            expect(childNodes[1].style.left).toEqual('100px');
            expect(childNodes[2].style.left).toEqual('199px');
            expect(childNodes[0].style.width).toEqual('100px');
            expect(childNodes[1].style.width).toEqual('100px');
            expect(childNodes[2].style.width).toEqual('100px');
            expect(childNodes[0].innerHTML).toEqual('label1');
            expect(childNodes[1].innerHTML).toEqual('label2');
            expect(childNodes[2].innerHTML).toEqual('label3');
        });

        it('axis 영역의 높이가 300인 레이블 타입 y축 레이블 영역은 높이 100px과 간격 100px(or 99px)로 레이블값을 포함하여 렌더링 됩니다.', function() {
            var elLabelArea, childNodes;

            axis.data.isVertical = true;
            elLabelArea = axis._renderLabelArea(300, 100);
            childNodes = elLabelArea.childNodes;

            expect(childNodes.length).toEqual(3);
            expect(childNodes[0].style.top).toEqual('0px');
            expect(childNodes[1].style.top).toEqual('100px');
            expect(childNodes[2].style.top).toEqual('199px');
            expect(childNodes[0].style.height).toEqual('100px');
            expect(childNodes[1].style.height).toEqual('100px');
            expect(childNodes[2].style.height).toEqual('100px');
            expect(childNodes[0].style.lineHeight).toEqual('100px');
            expect(childNodes[1].style.lineHeight).toEqual('100px');
            expect(childNodes[2].style.lineHeight).toEqual('100px');
            expect(childNodes[0].innerHTML).toEqual('label1');
            expect(childNodes[1].innerHTML).toEqual('label2');
            expect(childNodes[2].innerHTML).toEqual('label3');
        });

        it('axis 영역의 너비가 300인 벨류 타입 x축 레이블 영역은 너비 150px과 간격 150px(or 149px)로 벨류형태의 레이블 값을 포함하여 렌더링 됩니다.' +
            '벨류 타입의 경우는 tick 옆에 배치되기 때문에 레이블 타입과는 다른 간격으로 놓이게 됩니다.', function() {
            var elLabelArea, childNodes;

            axis.data = {
                labels: ['0.00', '30.00', '60.00'],
                tickCount: 3
            };

            elLabelArea = axis._renderLabelArea(300);
            childNodes = elLabelArea.childNodes;

            expect(childNodes.length).toEqual(3);
            expect(childNodes[0].style.left).toEqual('0px');
            expect(childNodes[1].style.left).toEqual('150px');
            expect(childNodes[2].style.left).toEqual('299px');
            expect(childNodes[0].style.width).toEqual('150px');
            expect(childNodes[1].style.width).toEqual('150px');
            expect(childNodes[2].style.width).toEqual('150px');
            expect(childNodes[0].innerHTML).toEqual('0.00');
            expect(childNodes[1].innerHTML).toEqual('30.00');
            expect(childNodes[2].innerHTML).toEqual('60.00');
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

            expect(childNodes.length).toEqual(3);
            expect(childNodes[0].style.bottom).toEqual('0px');
            expect(childNodes[1].style.bottom).toEqual('150px');
            expect(childNodes[2].style.bottom).toEqual('299px');
            expect(childNodes[0].innerHTML).toEqual('0.00');
            expect(childNodes[1].innerHTML).toEqual('30.00');
            expect(childNodes[2].innerHTML).toEqual('60.00');
        });
    });

    describe('_getRenderedTitleHeight()', function() {
        it('렌더링된 타이틀 높이를 반환합니다. (브라우저별로 수치가 약간씩 다름으로 범위 비교를 합니다.)', function() {
            var result = axis._getRenderedTitleHeight();
            expect(result).toBeGreaterThan(12);
            expect(result).toBeLessThan(17);
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

            expect(labelsHtml).toEqual(compareHtml);
        });
    });

    describe('_changeLabelAreaPosition()', function() {
        it('레이블 타입 축(x,y 모두 포함)의 경우에는 레이블 영역 위치 이동은 없습니다. (레이블이 타입의 경우 기본 설정이 가운데 배치되기 때문에 위치 이동 필요 없습니다.)', function() {
            var elLabelArea = dom.create('DIV');
            axis._changeLabelAreaPosition({
                elLabelArea: elLabelArea,
                isLabelAxis: true
            });
            expect(elLabelArea.style.top).toEqual('');
            expect(elLabelArea.style.left).toEqual('');
        });

        it('벨류 타입 y축의 경우는 레이블을 tick의 중앙에 위치 시키기 위해 영역이 top 이동 됩니다. (브라우저별로 수치가 약간씩 다름으로 범위 비교를 합니다.)', function() {
            var elLabelArea = dom.create('DIV'),
                top;
            axis._changeLabelAreaPosition({
                elLabelArea: elLabelArea,
                theme: {
                    fontSize: 12
                },
                isVertical: true
            });

            top = parseInt(elLabelArea.style.top, 10);

            expect(top).toBeGreaterThan(5);
            expect(top).toBeLessThan(9);
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
            expect(elLabelArea.style.left).toEqual('-25px');
        });
    });

    describe('render()', function() {
        it('레이블 타입 axis의 전체 영역을 렌더링 합니다.', function() {
            var el;
            axis.data.isVertical = false;
            el = axis.render();

            expect(el.style.width).toEqual('100px');
            expect(el.style.height).toEqual('200px');
            expect(el.style.top).toEqual('20px');
            expect(dom.hasClass(el, 'horizontal')).toBeTruthy();
            expect(el.childNodes[0].className).toEqual('ne-chart-title-area');
            expect(el.childNodes[1].className).toEqual('ne-chart-tick-area');
            expect(el.childNodes[2].className).toEqual('ne-chart-label-area');
        });
    });
});
