/**
 * @fileoverview test axis view
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var AxisView = require('../../src/js/views/axisView.js'),
    AxisModel = require('../../src/js/models/axisModel.js');

var isIE8 = window.navigator.userAgent.indexOf('MSIE 8.0') > -1;

xdescribe('test Axis View', function() {
    var tmpAxisModel = new AxisModel(),
        valueData = {
            values: [[10], [20], [30], [40], [50]],
            chartDimension: {width: 400, height: 300},
            formatFunctions: tmpAxisModel.findFormatFunctions('0.00')
        },
        labelData = {labels: ['label1', 'label2', 'label3']},
        options = {
            min: 0,
            title: 'value title'
        },
        theme = {
            tickColor: 'black',
            label: {
                fontSize: 12
            }
        };

    it('test _renderTitleArea', function() {
        var axisView = new AxisView(),
            title = 'Axis title.',
            elTitle = axisView._renderTitleArea(title, theme);

        expect(elTitle.innerHTML).toEqual(title);

        elTitle = axisView._renderTitleArea(title, theme, true, 50);
        expect(elTitle.style.width).toEqual('50px');

        if (!isIE8) {
            expect(elTitle.style.top).toEqual('50px');
        }

        elTitle = axisView._renderTitleArea('');
        expect(elTitle).toBeUndefined();
    });

    it('test _makeLabelCssTexts', function() {
        var axisView = new AxisView(),
            cssTexts = axisView._makeLabelCssTexts(true, true, 100);
        expect(cssTexts).toEqual(['height:100px', 'line-height:100px']);

        cssTexts = axisView._makeLabelCssTexts(true, false, 100);
        expect(cssTexts).toEqual([]);

        cssTexts = axisView._makeLabelCssTexts(false, true, 100);
        expect(cssTexts).toEqual(['width:100px']);

        cssTexts = axisView._makeLabelCssTexts(false, false, 100);
        expect(cssTexts).toEqual(['width:100px']);
    });

    it('test _makeLabelsHtml', function() {
        var axisView = new AxisView(),
            labelsHtml = axisView._makeLabelsHtml([10, 20, 30], ['label1', 'label2', 'label3'], 'left', []),
            compareHtml = '<div class="ne-chart-label" style="left:10px">label1</div>' +
                '<div class="ne-chart-label" style="left:20px">label2</div>' +
                '<div class="ne-chart-label" style="left:30px">label3</div>';

        expect(labelsHtml).toEqual(compareHtml);
    });

    describe('test value type axis', function() {
        var axisModel, axisView, el;

        beforeEach(function() {
            axisModel = new AxisModel(valueData, options);
            axisView = new AxisView(axisModel, theme);
            el = axisView.el;
        });

        it('test horizontal _renderTickArea', function() {
            var elTickArea, compareHtml, elTemp, elCompare, children, compareChildren;

            elTickArea = axisView._renderTickArea(300);

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

            el.appendChild(elTickArea);
            children = elCompare.childNodes;

            expect(elTickArea.style.cssText).toEqual(elCompare.style.cssText);

            ne.util.forEachArray(children, function(child, index) {
                expect(child.style.cssText).toEqual(compareChildren[index].style.cssText);
            });
        });

        it('test vertical _renderTickArea', function() {
            var elTickArea, compareHtml, elTemp, elCompare, children, compareChildren;

            axisModel.changeVerticalState(true);

            elTickArea = axisView._renderTickArea(300);

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

            el.appendChild(elTickArea);
            children = elCompare.childNodes;

            expect(elTickArea.style.cssText).toEqual(elCompare.style.cssText);

            ne.util.forEachArray(children, function(child, index) {
                expect(child.style.cssText).toEqual(compareChildren[index].style.cssText);
            });
        });

        it('test horizontal _renderLabelArea', function() {
            var elTickArea, elTemp, compareHtml, elTempArea, childNodes, tmpChildNodes;

            elTickArea = axisView._renderLabelArea(300);

            compareHtml = '<div class="ne-chart-label-area" style="font-size:12px;left:-75px;">' +
                '<div class="ne-chart-label" style="width:150px;left:0px">0.00</div>' +
                '<div class="ne-chart-label" style="width:150px;left:150px">30.00</div>' +
                '<div class="ne-chart-label" style="width:150px;left:299px">60.00</div>' +
                '</div>';

            elTemp = document.createElement('DIV');
            elTemp.innerHTML = compareHtml;
            elTempArea = elTemp.firstChild;

            expect(elTickArea.style.cssText).toEqual(elTempArea.style.cssText);

            childNodes = elTickArea.childNodes;
            tmpChildNodes = elTempArea.childNodes;

            ne.util.forEachArray(childNodes, function(child, index) {
                var tmpChild = tmpChildNodes[index];
                expect(child.style.cssText).toEqual(tmpChild.style.cssText);
                expect(child.innerHTML).toEqual(tmpChild.innerHTML);
            });
        });

        it('test vertical _renderLabelArea', function() {
            var elTickArea, elTemp, compareHtml, elTempArea, childNodes, tmpChildNodes;

            axisModel.changeVerticalState(true);

            elTickArea = axisView._renderLabelArea(300, 100);

            compareHtml = '<div class="ne-chart-label-area" style="width:75px;top:7px">' +
                '<div class="ne-chart-label" style="bottom: 0px">0.00</div>' +
                '<div class="ne-chart-label" style="bottom: 150px">30.00</div>' +
                '<div class="ne-chart-label" style="bottom: 299px">60.00</div>' +
                '</div>';

            elTemp = document.createElement('DIV');
            elTemp.innerHTML = compareHtml;
            elTempArea = elTemp.firstChild;

            expect(parseInt(elTickArea.style.width) / 10).toBeCloseTo(parseInt(elTempArea.style.width) / 10, 0);
            expect(parseInt(elTickArea.style.top) / 10).toBeCloseTo(parseInt(elTempArea.style.top) / 10, 0);

            childNodes = elTickArea.childNodes;
            tmpChildNodes = elTempArea.childNodes;

            ne.util.forEachArray(childNodes, function(child, index) {
                var tmpChild = tmpChildNodes[index];
                expect(child.style.cssText).toEqual(tmpChild.style.cssText);
                expect(child.innerHTML).toEqual(tmpChild.innerHTML);
            });
        });
    });

    describe('test label type axis', function() {
        var axisModel, axisView, el;

        beforeEach(function () {
            axisModel = new AxisModel(labelData, options);
            axisView = new AxisView(axisModel, theme);
            el = axisView.el;
        });
        it('test horizontal _renderTickArea', function() {
            var elTickArea, compareHtml, elTemp, elCompare, children, compareChildren;

            elTickArea = axisView._renderTickArea(300);

            compareHtml = '<div class="ne-chart-tick-area" style="border-top-color: black;">' +
                '<div class="ne-chart-tick" style="background-color:black;left: 0px"></div>' +
                '<div class="ne-chart-tick" style="background-color:black;left: 100px"></div>' +
                '<div class="ne-chart-tick" style="background-color:black;left: 199px"></div>' +
                '<div class="ne-chart-tick" style="background-color:black;left: 299px"></div>' +
                '</div>';

            elTemp = document.createElement('DIV');
            elTemp.innerHTML = compareHtml;
            elCompare = elTemp.firstChild;
            compareChildren = elCompare.childNodes;

            el.appendChild(elTickArea);
            children = elCompare.childNodes;

            expect(elTickArea.style.cssText).toEqual(elCompare.style.cssText);

            ne.util.forEachArray(children, function(child, index) {
                expect(child.style.cssText).toEqual(compareChildren[index].style.cssText);
            });
        });

        it('test vertical _renderTickArea', function() {
            var elTickArea, compareHtml, elTemp, elCompare, children, compareChildren;

            axisModel.changeVerticalState(true);

            elTickArea = axisView._renderTickArea(300);

            compareHtml = '<div class="ne-chart-tick-area" style="border-right-color: black;">' +
                '<div class="ne-chart-tick" style="background-color:black;bottom: 0px"></div>' +
                '<div class="ne-chart-tick" style="background-color:black;bottom: 100px"></div>' +
                '<div class="ne-chart-tick" style="background-color:black;bottom: 199px"></div>' +
                '<div class="ne-chart-tick" style="background-color:black;bottom: 299px"></div>' +
                '</div>';

            elTemp = document.createElement('DIV');
            elTemp.innerHTML = compareHtml;
            elCompare = elTemp.firstChild;
            compareChildren = elCompare.childNodes;

            el.appendChild(elTickArea);
            children = elCompare.childNodes;

            expect(elTickArea.style.cssText).toEqual(elCompare.style.cssText);

            ne.util.forEachArray(children, function(child, index) {
                expect(child.style.cssText).toEqual(compareChildren[index].style.cssText);
            });
        });

        it('test horizontal _renderLabelArea', function() {
            var elTickArea, elTemp, compareHtml, elTempArea, childNodes, tmpChildNodes;

            elTickArea = axisView._renderLabelArea(300);

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

        it('test vertical _renderLabelArea', function() {
            var elTickArea, elTemp, compareHtml, elTempArea, childNodes, tmpChildNodes;

            axisModel.changeVerticalState(true);

            elTickArea = axisView._renderLabelArea(300, 100);

            compareHtml = '<div class="ne-chart-label-area" style="width: 75px;">' +
                '<div class="ne-chart-label" style="height:100px;line-height:100px;top: 0px">label1</div>' +
                '<div class="ne-chart-label" style="height:100px;line-height:100px;top: 100px">label2</div>' +
                '<div class="ne-chart-label" style="height:100px;line-height:100px;top: 199px">label3</div>' +
                '</div>';

            elTemp = document.createElement('DIV');
            elTemp.innerHTML = compareHtml;
            elTempArea = elTemp.firstChild;

            expect(parseInt(elTickArea.style.width) / 10).toBeCloseTo(parseInt(elTempArea.style.width) / 10, 0);

            childNodes = elTickArea.childNodes;
            tmpChildNodes = elTempArea.childNodes;

            ne.util.forEachArray(childNodes, function(child, index) {
                var tmpChild = tmpChildNodes[index];

                expect(child.style.cssText).toEqual(tmpChild.style.cssText);
                expect(child.innerHTML).toEqual(tmpChild.innerHTML);
            });
        });
    });
});