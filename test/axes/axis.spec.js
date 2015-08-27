/**
 * @fileoverview test axis
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var Axis = require('../../src/js/axes/axis.js'),
    dom = require('../../src/js/helpers/domHandler.js');

describe('test Axis', function() {
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

    it('_renderTitleArea()', function() {
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

    it('_renderTickArea(300) horizontal', function() {
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

    it('_renderTickArea(300) vertical', function() {
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

    it('_renderLabelArea() label horizontal', function() {
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

    it('_renderLabelArea() label vertical', function() {
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

    it('_renderLabelArea() value horizontal', function() {
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

    it('_renderLabelArea() value vertical', function() {
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

    it('_getRenderedTitleHeight()', function() {
        var result = axis._getRenderedTitleHeight();
        expect(result).toBeGreaterThan(12);
        expect(result).toBeLessThan(17);
    });

    it('_makeLabelCssTexts() label vertical', function() {
        var cssTexts = axis._makeLabelCssTexts({
            isVertical: true,
            isLabelAxis: true,
            labelWidth: 100
        });
        expect(cssTexts).toEqual(['height:100px', 'line-height:100px']);
    });

    it('_makeLabelCssTexts() label horizontal', function() {
        var cssTexts = axis._makeLabelCssTexts({
            isVertical: false,
            isLabelAxis: true,
            labelWidth: 100
        });
        expect(cssTexts).toEqual(['width:100px']);
    });

    it('_makeLabelCssTexts() value vertical', function() {
        var cssTexts = axis._makeLabelCssTexts({
            isVertical: true,
            isLabelAxis: false,
            labelWidth: 100
        });
        expect(cssTexts).toEqual([]);
    });

    it('_makeLabelCssTexts() value horizontal', function() {
        var cssTexts = axis._makeLabelCssTexts({
            isVertical: false,
            isLabelAxis: false,
            labelWidth: 100
        });
        expect(cssTexts).toEqual(['width:100px']);
    });

    it('_makeLabelsHtml()', function() {
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

    it('_changeLabelAreaPosition() label', function() {
        var elLabelArea = dom.create('DIV');
        axis._changeLabelAreaPosition({
            elLabelArea: elLabelArea,
            isLabelAxis: true
        });
        expect(elLabelArea.style.top).toEqual('');
    });

    it('_changeLabelAreaPosition() value vertical', function() {
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

    it('_changeLabelAreaPosition() value horizontal', function() {
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

    it('render()', function() {
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
