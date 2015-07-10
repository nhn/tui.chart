var AxisView = require('../../src/js/views/axisView.js'),
    AxisModel = require('../../src/js/models/axisModel.js');

describe('test Axis View', function() {
    var valueData = {values: [[10], [20], [30], [40], [50]]},
        labelData = {labels: ['label1', 'label2', 'lable3']},
        options = {
            format: '0.00',
            minValue: 0,
            title: 'value title'
        };

    describe('test method', function() {
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

                axisModel.verticalIs();

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

                axisModel.verticalIs();

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
        });
    });
});