/**
 * @fileoverview test axis view
 * @author NHN Ent.
 *         FE Development Team <jiung.kang@nhnent.com>
 */

'use strict';

var AxisView = require('../../src/js/views/axisView.js'),
    AxisModel = require('../../src/js/models/axisModel.js');

describe('test Axis View', function() {
    var valueData = {values: [[10], [20], [30], [40], [50]]},
        labelData = {labels: ['label1', 'label2', 'label3']},
        options = {
            format: '0.00',
            minValue: 0,
            title: 'value title'
        };

    it('test _makeLabelCssTexts', function() {
        var axisView = new AxisView(),
            cssTexts = axisView._makeLabelCssTexts(true, true, 12, 100);
        expect(cssTexts).toEqual(['font-size:12px', 'height:100px', 'line-height:100px']);

        cssTexts = axisView._makeLabelCssTexts(true, false, 12, 100);
        expect(cssTexts).toEqual(['font-size:12px']);

        cssTexts = axisView._makeLabelCssTexts(false, true, 12, 100);
        expect(cssTexts).toEqual(['font-size:12px', 'width:100px']);

        cssTexts = axisView._makeLabelCssTexts(false, false, 12, 100);
        expect(cssTexts).toEqual(['font-size:12px', 'width:100px']);
    });

    it('test _makeLabelsHtml', function() {
        var axisView = new AxisView(),
            labelsHtml = axisView._makeLabelsHtml([10, 20, 30], ['label1', 'label2', 'label3'], 'left', []),
            compareHtml = '<div class="label" style="left:10px">label1</div>' +
                '<div class="label" style="left:20px">label2</div>' +
                '<div class="label" style="left:30px">label3</div>';

        expect(labelsHtml).toEqual(compareHtml)
    });

    it('test _renderTitleArea', function() {
        var axisView = new AxisView(),
            elTitle = axisView._renderTitleArea('Axis title.');

        expect(elTitle.innerHTML).toEqual('Axis title.');
        elTitle = axisView._renderTitleArea('');
        expect(elTitle).toBeUndefined();
    });

    describe('test value type axis', function() {
        var axisModel, axisView, el;

        beforeEach(function() {
            axisModel = new AxisModel(valueData, options);
            axisView = new AxisView(axisModel);
            el = axisView.el;
        });

        it('test horizontal _renderTickArea', function() {
            var elTickArea, compareHtml, elTemp;

            elTickArea = axisView._renderTickArea(300);

            compareHtml = '<div class="tick-area">' +
                '<div class="tick" style="left: 0px"></div>' +
                '<div class="tick" style="left: 75px"></div>' +
                '<div class="tick" style="left: 150px"></div>' +
                '<div class="tick" style="left: 224px"></div>' +
                '<div class="tick" style="left: 299px"></div>' +
                '</div>';
            elTemp = document.createElement('DIV');
            elTemp.innerHTML = compareHtml;
            el.appendChild(elTickArea);

            expect(el.innerHTML).toEqual(elTemp.innerHTML);
        });

        it('test vertical _renderTickArea', function() {
            var elTickArea, compareHtml, elTemp;

            axisModel.changeVerticalState(true);

            elTickArea = axisView._renderTickArea(300);

            compareHtml = '<div class="tick-area">' +
                '<div class="tick" style="bottom: 0px"></div>' +
                '<div class="tick" style="bottom: 75px"></div>' +
                '<div class="tick" style="bottom: 150px"></div>' +
                '<div class="tick" style="bottom: 224px"></div>' +
                '<div class="tick" style="bottom: 299px"></div>' +
                '</div>';
            elTemp = document.createElement('DIV');
            elTemp.innerHTML = compareHtml;
            el.appendChild(elTickArea);

            expect(el.innerHTML).toEqual(elTemp.innerHTML);
        });

        it('test horizontal _renderLabelArea', function() {
            var elTickArea, elTemp, compareHtml, elTempArea, childNodes, tmpChildNodes;

            elTickArea = axisView._renderLabelArea(300);

            compareHtml = '<div class="label-area" style="left:-37px;">' +
                '<div class="label" style="font-size:12px;width:75px;left:0px">0</div>' +
                '<div class="label" style="font-size:12px;width:75px;left:75px">13</div>' +
                '<div class="label" style="font-size:12px;width:75px;left:150px">26</div>' +
                '<div class="label" style="font-size:12px;width:75px;left:224px">39</div>' +
                '<div class="label" style="font-size:12px;width:75px;left:299px">52</div>' +
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

            axisModel.changeVerticalState(true)

            elTickArea = axisView._renderLabelArea(300, 100);

            compareHtml = '<div class="label-area" style="width:63px;top:7px">' +
                '<div class="label" style="font-size:12px;bottom: 0px">0</div>' +
                '<div class="label" style="font-size:12px;bottom: 75px">13</div>' +
                '<div class="label" style="font-size:12px;bottom: 150px">26</div>' +
                '<div class="label" style="font-size:12px;bottom: 224px">39</div>' +
                '<div class="label" style="font-size:12px;bottom: 299px">52</div>' +
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
            axisView = new AxisView(axisModel);
            el = axisView.el;
        });
        it('test horizontal _renderTickArea', function() {
            var elTickArea, compareHtml, elTemp;

            elTickArea = axisView._renderTickArea(300);

            compareHtml = '<div class="tick-area">' +
                '<div class="tick" style="left: 0px"></div>' +
                '<div class="tick" style="left: 100px"></div>' +
                '<div class="tick" style="left: 199px"></div>' +
                '<div class="tick" style="left: 299px"></div>' +
                '</div>';
            elTemp = document.createElement('DIV');
            elTemp.innerHTML = compareHtml;
            el.appendChild(elTickArea);

            expect(el.innerHTML).toEqual(elTemp.innerHTML);
        });

        it('test vertical _renderTickArea', function() {
            var elTickArea, compareHtml, elTemp;

            axisModel.changeVerticalState(true);

            elTickArea = axisView._renderTickArea(300);

            compareHtml = '<div class="tick-area">' +
                '<div class="tick" style="bottom: 0px"></div>' +
                '<div class="tick" style="bottom: 100px"></div>' +
                '<div class="tick" style="bottom: 199px"></div>' +
                '<div class="tick" style="bottom: 299px"></div>' +
                '</div>';
            elTemp = document.createElement('DIV');
            elTemp.innerHTML = compareHtml;
            el.appendChild(elTickArea);

            expect(el.innerHTML).toEqual(elTemp.innerHTML);
        });

        it('test horizontal _renderLabelArea', function() {
            var elTickArea, elTemp, compareHtml, elTempArea, childNodes, tmpChildNodes;

            elTickArea = axisView._renderLabelArea(300);

            compareHtml = '<div class="label-area">' +
                '<div class="label" style="font-size:12px;width:100px;left: 0px">label1</div>' +
                '<div class="label" style="font-size:12px;width:100px;left: 100px">label2</div>' +
                '<div class="label" style="font-size:12px;width:100px;left: 199px">label3</div>' +
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

            compareHtml = '<div class="label-area" style="width: 63px;">' +
                '<div class="label" style="font-size:12px;height:100px;line-height:100px;top: 0px">label1</div>' +
                '<div class="label" style="font-size:12px;height:100px;line-height:100px;top: 100px">label2</div>' +
                '<div class="label" style="font-size:12px;height:100px;line-height:100px;top: 199px">label3</div>' +
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