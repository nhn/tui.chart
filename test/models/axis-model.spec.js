/**
 * @fileoverview test bar chart model
 * @author jiung.kang@nhnent.com
 */

'user strict';

var AxisModel = require('../../src/js/models/axis-model.js');

describe('test axis model', function() {
    var labels = [
            'Element',
            'Copper',
            'Silver',
            'Gold',
            'Platinum'
        ],
        values = [
            8.94,
            10.49,
            19.30,
            21.45
        ];

    describe('test method', function() {
        var axisModel;

        beforeEach(function() {
            axisModel = new AxisModel();
        });

        it('setLabelAxis', function() {
            axisModel.setLabelAxis(labels);
            expect(axisModel.getLabels().join(',')).toEqual(labels.join(','));
            expect(axisModel.getTickCount()).toEqual(labels.length);
            expect(axisModel.getMin()).toEqual(0);
            expect(axisModel.getMax()).toEqual(0);
            expect(axisModel.isLabelAxis()).toBeTruthy();
        });

        it('getCalculateScale', function() {
            var scale = axisModel.getCalculateScale(10, 100);
            expect(scale.max).toEqual(104.5);
            expect(scale.min).toEqual(0);

            scale = axisModel.getCalculateScale(20, 100);
            expect(scale.max).toEqual(104);
            expect(scale.min).toEqual(16);
        });

        it('getScaleStep', function() {
            var tickCount = 5,
                scale = {min: 20, max: 100},
                step = axisModel.getScaleStep(scale, tickCount);
            expect(step).toEqual(20);
        });

        it('makeLabelsFromScale', function() {
            var tickCount = 5,
                scale = {min: 20, max: 100},
                step = axisModel.getScaleStep(scale, tickCount),
                labels = axisModel.makeLabelsFromScale(scale, step);
            expect(labels.join(',')).toEqual('20,40,60,80,100');
        });

        it('setValueAxis', function() {
            var min = 20,
                max = 180,
                scale = axisModel.getCalculateScale(min, max);

            axisModel.setValueAxis(min, max);
            expect(axisModel.getLabels().join(',')).toEqual('0,47,94,141,188');
            expect(axisModel.getMin()).toEqual(scale.min);
            expect(axisModel.getMax()).toEqual(scale.max);
            expect(axisModel.isValueAxis()).toBeTruthy();
        });

        it('setData', function() {
            axisModel.setData({labels: labels});
            expect(axisModel.isLabelAxis()).toBeTruthy();

            axisModel.setData({min: 20, max: 180});
            expect(axisModel.isValueAxis()).toBeTruthy();
        });
    });

    describe('test initialize', function() {
        it('init', function() {
            var options = {
                    data: {labels: labels}
                },
                axisModel = new AxisModel(options);
            expect(axisModel.isLabelAxis()).toBeTruthy();
        });
    });

});