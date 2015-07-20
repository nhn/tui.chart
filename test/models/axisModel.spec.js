/**
 * @fileoverview test axis model
 * @author NHN Ent.
 *         FE Development Team <jiung.kang@nhnent.com>
 */

'use strict';

var AxisModel = require('../../src/js/models/axisModel.js');

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

        it('_setLabelAxisData', function() {
            var scale;

            axisModel._setLabelAxisData(labels);
            expect(axisModel.labels.join(',')).toEqual(labels.join(','));
            expect(axisModel.tickCount).toEqual(labels.length + 1);
            expect(axisModel.scale).toBeNull();
            expect(axisModel.isLabelAxis()).toBeTruthy();
        });

        it('_pickMinMax', function() {
            var minMax = axisModel._pickMinMax([80, 40, 60, 20]);
            expect(minMax.min).toEqual(20);
            expect(minMax.max).toEqual(80);
        });

        it('getCalculateScale', function() {
            var scale = axisModel._calculateScale(10, 100);
            expect(scale.max).toEqual(104.5);
            expect(scale.min).toEqual(0);

            scale = axisModel._calculateScale(20, 100);
            expect(scale.max).toEqual(104);
            expect(scale.min).toEqual(16);

            scale = axisModel._calculateScale(20, 100, 0);
            expect(scale.max).toEqual(104);
            expect(scale.min).toEqual(0);
        });

        it('_pickMaxLenUnderPoint', function() {
            var point = axisModel._pickMaxLenUnderPoint([1.12, 2.2, 3.33, 4.456]);
            expect(point).toEqual(3);
        });

        it('_formatLabels', function() {
            var labels = axisModel._formatLabels([1.111, 2.2222, 3.3333333, 4, 5.55], 2);
            expect(labels).toEqual([1.11, 2.22, 3.33, 4.00, 5.55]);
            labels = axisModel._formatLabels([1.111, 2.2222, 3.3333333, 4, 5.55], 0);
            expect(labels).toEqual([1, 2, 3, 4, 6]);
        });

        it('_makeLabelsFromScale', function() {
            var tickCount = 5,
                scale = {min: 20, max: 100},
                step = axisModel.getScaleStep(scale, tickCount),
                labels = axisModel._makeLabelsFromScale(scale, step);
            expect(labels).toEqual([20, 40, 60, 80, 100]);
        });

        it('_setValueAxisData', function() {
            var scale;

            axisModel._setValueAxisData(values);
            scale = axisModel.scale;
            expect(axisModel.labels.join(',')).toEqual('0,47,94,141,188');
            expect(scale.min).toEqual(0);
            expect(scale.max).toEqual(188);
            expect(axisModel.isValueAxis()).toBeTruthy();
        });

        it('setData', function() {
            axisModel._setData({labels: labels});
            expect(axisModel.isLabelAxis()).toBeTruthy();

            axisModel._setData({values: values});
            expect(axisModel.isValueAxis()).toBeTruthy();
        });
    });

    describe('test construct', function() {
        it('init label axis', function() {
            var data = {labels: labels},
                options = {
                    title: 'label title'
                },
                axisModel = new AxisModel(data, options);
            expect(axisModel.isLabelAxis()).toBeTruthy();
            expect(axisModel.title).toEqual('label title');
        });

        it('init value axis', function() {
            var data = {values: [[1.11222], [2.222], [3.3333], [4.44444], [5.555555]]},
                options = {
                    format: '0.00',
                    minValue: 0,
                    title: 'value title'
                },
                axisModel = new AxisModel(data, options),
                lenUnderPoint = ((axisModel.labels[1] + '').split('.'))[1].length;
            expect(lenUnderPoint).toEqual(2);
            expect(axisModel.scale.min).toEqual(0);
            expect(axisModel.title).toEqual('value title');
        });
    });
});