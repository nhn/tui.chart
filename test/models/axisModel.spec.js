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
            axisModel._setLabelAxisData(labels);
            expect(axisModel.labels.join(',')).toEqual(labels.join(','));
            expect(axisModel.tickCount).toEqual(labels.length + 1);
            expect(axisModel.scale).toBeNull();
            expect(axisModel.isLabelAxis()).toBeTruthy();
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
            var fns = axisModel.findFormatFns('1,000.00'),
                result = axisModel._formatLabels([1000, 2000.2222, 3000.555555, 4, 5.55], fns);

            expect(result).toEqual(['1,000.00', '2,000.22', '3,000.56', '4.00', '5.55']);

            fns = axisModel.findFormatFns('0001');
            result = axisModel._formatLabels([1, 2, 3], fns);
            expect(result).toEqual(['0001', '0002', '0003']);
        });

        it('_makeLabelsFromScale', function() {
            var tickCount = 5,
                scale = {min: 20, max: 100},
                step = axisModel.getScaleStep(scale, tickCount),
                _labels = axisModel._makeLabelsFromScale(scale, step);
            expect(_labels).toEqual([20, 40, 60, 80, 100]);
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
            var tmpAxisModel = new AxisModel(),
                data = {
                    values: [[1.11222], [2.222], [3.3333], [4.44444], [5.555555]],
                    formatFns: tmpAxisModel.findFormatFns('0.00')
                },
                options = {
                    min: 0,
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