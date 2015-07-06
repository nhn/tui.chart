/**
 * @fileoverview test axis model
 * @author NHN Ent.
 *         FE Development Team <jiung.kang@nhnent.com>
 */

'use strict';

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
            [70],
            [20],
            [180],
            [150],
            [120]
        ];

    describe('test method', function() {
        var axisModel;

        beforeEach(function() {
            axisModel = new AxisModel();
        });

        it('setLabelAxisData', function() {
            var scale;

            axisModel.setLabelAxisData(labels);
            expect(axisModel.getLabels().join(',')).toEqual(labels.join(','));
            expect(axisModel.getTickCount()).toEqual(labels.length);
            expect(axisModel.getScale()).toBeNull();
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

        it('pickMinMax', function() {
            var minMax = axisModel.pickMinMax(values);
            expect(minMax.min).toEqual(20);
            expect(minMax.max).toEqual(180);
        });

        it('setValueAxisData', function() {
            var scale;

            axisModel.setValueAxisData(values);
            scale = axisModel.getScale();
            expect(axisModel.getLabels().join(',')).toEqual('0,47,94,141,188');
            expect(scale.min).toEqual(0);
            expect(scale.max).toEqual(188);
            expect(axisModel.isValueAxis()).toBeTruthy();
        });

        it('setData', function() {
            axisModel.setData({labels: labels});
            expect(axisModel.isLabelAxis()).toBeTruthy();

            axisModel.setData({values: values});
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