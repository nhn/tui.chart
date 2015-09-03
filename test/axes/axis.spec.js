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
    var labelData = {
            labels: ['label1', 'label2', 'label3'],
            tickCount: 4,
            isLabelAxis: true
        },
        valueData = {
            labels: ['0.00', '30.00', '60.00'],
            tickCount: 3
        },
        theme = {
            title: {
                fontSize: 12
            },
            label: {
                fontSize: 12
            },
            tickColor: 'black'
        },
        bound = {
            dimension: {
                width: 100,
                height: 200
            },
            position: {
                top: 20
            }
        },
        axis;

    beforeEach(function() {
        axis = new Axis({
            data: labelData,
            theme: theme,
            bound: bound,
            options: {
                title: 'Axis Title'
            }
        });
    });

    describe('_renderTitleAreaStyle()', function() {
        it('좌측 y axis의 타이틀일 경우의 css style 렌더링', function() {
            var elTitle = dom.create('DIV');
            axis._renderTitleAreaStyle(elTitle, 50);
            expect(elTitle.style.width).toEqual('50px');
            expect(elTitle.style.left).toEqual('0px');
            if (!renderUtil.isIE8()) {
                expect(elTitle.style.top).toEqual('50px');
            }
        });

        it('우측 y axis의 타이틀일 경우의 css style 렌더링', function() {
            var elTitle = dom.create('DIV');
            axis._renderTitleAreaStyle(elTitle, 50, true);
            expect(elTitle.style.width).toEqual('50px');
            expect(elTitle.style.right).toEqual('-50px');
            expect(elTitle.style.top).toEqual('0px');
        });
    });

    describe('_renderTitleArea()', function() {
        it('타이틀이 있을 경우에는 타이틀영역이 정상 렌더링됨', function() {
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
        it('타이틀이 없을 경우에는 타이틀영역 렌더링 되지 않음', function() {
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
        it('너비가 300인 경우의 가로축 tick 영역 렌더링', function() {
            var elTickArea, compareHtml, elTemp, elCompare, children, compareChildren;

            axis.data.isVertical = false;
            elTickArea = axis._renderTickArea(300);

            compareHtml = '<div class="tick-area" style="border-top-color: black;">' +
                '<div class="ne-chart-tick" style="background-color:black;left: 0px"></div>' +
                '<div class="ne-chart-tick" style="background-color:black;left: 75px"></div>' +
                '<div class="ne-chart-tick" style="background-color:black;left: 150px"></div>' +
                '<div class="ne-chart-tick" style="background-color:black;left: 224px"></div>' +
                '<div class="ne-chart-tick" style="background-color:black;left: 299px"></div>' +
                '</div>';

            elTemp = document.createElement('DIV');
            elTemp.innerHTML = compareHtml;
            elCompare = elTemp.firstChild;
            compareChildren = elCompare.childNodes;
            children = elCompare.childNodes;

            expect(elTickArea.style.cssText).toEqual(elCompare.style.cssText);

            ne.util.forEachArray(children, function(child, index) {
                expect(child.style.cssText).toEqual(compareChildren[index].style.cssText);
            });
        });

        it('높이가 300인 경우의 세로축 tick 영역 렌더링', function() {
            var elTickArea, compareHtml, elTemp, elCompare, children, compareChildren;

            axis.data.isVertical = true;
            elTickArea = axis._renderTickArea(300);

            compareHtml = '<div class="ne-chart-tick-area" style="border-right-color: black;">' +
                '<div class="ne-chart-tick" style="background-color:black;bottom: 0px"></div>' +
                '<div class="ne-chart-tick" style="background-color:black;bottom: 75px"></div>' +
                '<div class="ne-chart-tick" style="background-color:black;bottom: 150px"></div>' +
                '<div class="ne-chart-tick" style="background-color:black;bottom: 224px"></div>' +
                '<div class="ne-chart-tick" style="background-color:black;bottom: 299px"></div>' +
                '</div>';

            elTemp = document.createElement('DIV');
            elTemp.innerHTML = compareHtml;
            elCompare = elTemp.firstChild;
            compareChildren = elCompare.childNodes;

            children = elCompare.childNodes;

            expect(elTickArea.style.cssText).toEqual(elCompare.style.cssText);

            ne.util.forEachArray(children, function(child, index) {
                expect(child.style.cssText).toEqual(compareChildren[index].style.cssText);
            });
        });
    });

    describe('_renderLabelArea()', function() {
        it('너비가 300인 레이블 타입 가로축의 레이블 영역 렌더링', function() {
            var elTickArea, elTemp, compareHtml, elTempArea, childNodes, tmpChildNodes;

            axis.data.isVertical = false;
            elTickArea = axis._renderLabelArea(300);

            compareHtml = '<div class="ne-chart-label-area">' +
                '<div class="ne-chart-label" style="width:100px;left: 0px">label1</div>' +
                '<div class="ne-chart-label" style="width:100px;left: 100px">label2</div>' +
                '<div class="ne-chart-label" style="width:100px;left: 199px">label3</div>' +
                '</div>';

            elTemp = document.createElement('DIV');
            elTemp.innerHTML = compareHtml;
            elTempArea = elTemp.firstChild;

            childNodes = elTickArea.childNodes;
            tmpChildNodes = elTempArea.childNodes;

            ne.util.forEachArray(childNodes, function(child, index) {
                var tmpChild = tmpChildNodes[index];
                expect(child.style.cssText).toEqual(tmpChild.style.cssText);
                expect(child.innerHTML).toEqual(tmpChild.innerHTML);
            });
        });

        it('높이가 300이고 너비가 100인 레이블 타입 세로축의 레이블 영역 렌더링', function() {
            var elLabelArea, elTemp, compareHtml, elTempArea, childNodes, tmpChildNodes;

            axis.data.isVertical = true;
            elLabelArea = axis._renderLabelArea(300, 100);

            compareHtml = '<div class="ne-chart-label-area" style="width: 75px;">' +
                '<div class="ne-chart-label" style="height:100px;line-height:100px;top: 0px">label1</div>' +
                '<div class="ne-chart-label" style="height:100px;line-height:100px;top: 100px">label2</div>' +
                '<div class="ne-chart-label" style="height:100px;line-height:100px;top: 199px">label3</div>' +
                '</div>';

            elTemp = document.createElement('DIV');
            elTemp.innerHTML = compareHtml;
            elTempArea = elTemp.firstChild;

            expect(parseInt(elLabelArea.style.width, 10) / 10).toBeCloseTo(parseInt(elTempArea.style.width, 10) / 10, 0);

            childNodes = elLabelArea.childNodes;
            tmpChildNodes = elTempArea.childNodes;

            ne.util.forEachArray(childNodes, function(child, index) {
                var tmpChild = tmpChildNodes[index];

                expect(child.style.cssText).toEqual(tmpChild.style.cssText);
                expect(child.innerHTML).toEqual(tmpChild.innerHTML);
            });
        });

        it('너비가 300인 값 타입 가로축의 레이블 영역 렌더링', function() {
            var eLabelArea, elTemp, compareHtml, elTempArea, childNodes, tmpChildNodes;

            axis.data = valueData;
            eLabelArea = axis._renderLabelArea(300);

            compareHtml = '<div class="ne-chart-label-area" style="font-size:12px;left:-75px;">' +
                '<div class="ne-chart-label" style="width:150px;left:0px">0.00</div>' +
                '<div class="ne-chart-label" style="width:150px;left:150px">30.00</div>' +
                '<div class="ne-chart-label" style="width:150px;left:299px">60.00</div>' +
                '</div>';

            elTemp = document.createElement('DIV');
            elTemp.innerHTML = compareHtml;
            elTempArea = elTemp.firstChild;

            expect(eLabelArea.style.cssText).toEqual(elTempArea.style.cssText);

            childNodes = eLabelArea.childNodes;
            tmpChildNodes = elTempArea.childNodes;

            ne.util.forEachArray(childNodes, function(child, index) {
                var tmpChild = tmpChildNodes[index];
                expect(child.style.cssText).toEqual(tmpChild.style.cssText);
                expect(child.innerHTML).toEqual(tmpChild.innerHTML);
            });
        });

        it('높이가 300이고 너비가 100인 값 타입 세로축의 레이블 영역 렌더링', function() {
            var elTickArea, elTemp, compareHtml, elTempArea, childNodes, tmpChildNodes;

            axis.data = valueData;
            axis.data.isVertical = true;

            elTickArea = axis._renderLabelArea(300, 100);

            compareHtml = '<div class="ne-chart-label-area" style="width:75px;top:7px">' +
                '<div class="ne-chart-label" style="bottom: 0px">0.00</div>' +
                '<div class="ne-chart-label" style="bottom: 150px">30.00</div>' +
                '<div class="ne-chart-label" style="bottom: 299px">60.00</div>' +
                '</div>';

            elTemp = document.createElement('DIV');
            elTemp.innerHTML = compareHtml;
            elTempArea = elTemp.firstChild;

            expect(parseInt(elTickArea.style.width, 10) / 10).toBeCloseTo(parseInt(elTempArea.style.width, 10) / 10, 0);
            expect(parseInt(elTickArea.style.top, 10) / 10).toBeCloseTo(parseInt(elTempArea.style.top, 10) / 10, 0);

            childNodes = elTickArea.childNodes;
            tmpChildNodes = elTempArea.childNodes;

            ne.util.forEachArray(childNodes, function(child, index) {
                var tmpChild = tmpChildNodes[index];
                expect(child.style.cssText).toEqual(tmpChild.style.cssText);
                expect(child.innerHTML).toEqual(tmpChild.innerHTML);
            });
        });
    });

    describe('_getRenderedTitleHeight()', function() {
        it('렌더링된 타이틀 높이 반환 (브라우저별로 수치가 약간씩 다름으로 범위 비교)', function() {
            var result = axis._getRenderedTitleHeight();
            expect(result).toBeGreaterThan(12);
            expect(result).toBeLessThan(17);
        });
    });

    describe('_makeLabelCssTexts()', function() {
        it('레이블 타입 세로축의 css 배열 생성', function() {
            var cssTexts = axis._makeLabelCssTexts({
                isVertical: true,
                isLabelAxis: true,
                labelWidth: 100
            });
            expect(cssTexts).toEqual(['height:100px', 'line-height:100px']);
        });

        it('레이블 타입 가로축의 css 배열 생성', function() {
            var cssTexts = axis._makeLabelCssTexts({
                isVertical: false,
                isLabelAxis: true,
                labelWidth: 100
            });
            expect(cssTexts).toEqual(['width:100px']);
        });

        it('값 타입 세로축의 경우는 빈 css 배열이 생성됨', function() {
            var cssTexts = axis._makeLabelCssTexts({
                isVertical: true,
                isLabelAxis: false,
                labelWidth: 100
            });
            expect(cssTexts).toEqual([]);
        });

        it('값 타입 가로축의 css 배열 생성', function() {
            var cssTexts = axis._makeLabelCssTexts({
                isVertical: false,
                isLabelAxis: false,
                labelWidth: 100
            });
            expect(cssTexts).toEqual(['width:100px']);
        });
    });

    describe('_makeLabelsHtml()', function() {
        it('레이블 영역 html 생성', function() {
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
        it('레이블 타입일 경우 레이블 영역 위치 이동 없음 (레이블이 타입의 경우 기본 설정이 가운데 배치되기 때문에 위치 이동 필요 없음)', function() {
            var elLabelArea = dom.create('DIV');
            axis._changeLabelAreaPosition({
                elLabelArea: elLabelArea,
                isLabelAxis: true
            });
            expect(elLabelArea.style.top).toEqual('');
        });

        it('값 타입 세로축의 경우 레이블 영역이 세로 위치 이동 됨 (레이블을 tick의 중앙에 위치시키기 위함)', function() {
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

        it('값 타입 가로축의 경우 레이블 영역이 가로 위치 이동 됨 (레이블을 tick의 중앙에 위치시키기 위함)', function() {
            var elLabelArea = dom.create('DIV');
            axis._changeLabelAreaPosition({
                elLabelArea: elLabelArea,
                theme: {
                    fontSize: 12
                },
                labelWidth: 50
            });
            expect(elLabelArea.style.left).toEqual('-25px');
        });
    });

    describe('render()', function() {
        it('axis 영역 전체 렌더링', function() {
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
