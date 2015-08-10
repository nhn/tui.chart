/**
 * @fileoverview test axis model
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
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
        groupValues = [
            [70, 10],
            [20, 20],
            [80, 30]
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

        it('_getBaseSize', function() {
            var baseSize = axisModel._getBaseSize({
                width: 400
            });

            expect(baseSize).toEqual(220);

            axisModel.changeVerticalState(true);

            baseSize = axisModel._getBaseSize({
                height: 300
            });

            expect(baseSize).toEqual(220);
        });

        it('_getCandidateTickCounts', function() {
            var tickCounts = axisModel._getCandidateTickCounts({
                width: 500
            });
            expect(tickCounts).toEqual([5, 6, 7, 8]);
        });

        it('_minimizeTickScale', function() {
            var tickInfo = axisModel._minimizeTickScale(10, 90, {
                scale: {min: 0, max: 100},
                step: 25,
                tickCount: 6
            }, {});
            expect(tickInfo).toEqual({
                scale: {min: 0, max: 100},
                step: 25,
                tickCount: 5,
                labels: [0, 25, 50, 75, 100]
            });

            tickInfo = axisModel._minimizeTickScale(10, 90, {
                scale: {min: 0, max: 100},
                step: 25,
                tickCount: 6
            }, {});

            expect(tickInfo).toEqual({
                scale: {min: 0, max: 100},
                step: 25,
                tickCount: 5,
                labels: [0, 25, 50, 75, 100]
            });

            tickInfo = axisModel._minimizeTickScale(20, 90, {
                scale: {min: 0, max: 100},
                step: 25,
                tickCount: 6
            }, {});

            expect(tickInfo).toEqual({
                scale: {min: 0, max: 100},
                step: 25,
                tickCount: 5,
                labels: [0, 25, 50, 75, 100]
            });

            tickInfo = axisModel._minimizeTickScale(-6, -1, {
                scale: {min: -10, max: 10},
                step: 5,
                tickCount: 6
            }, {min: -10});

            expect(tickInfo).toEqual({
                scale: {min: -10, max: 10},
                step: 5,
                tickCount: 5,
                labels: [-10, -5, 0, 5, 10]
            });
        });

        it('_getTickInfoCandidates', function() {
            var candidates = axisModel._getTickInfoCandidates(10, 90, [4, 5], {});
            expect(candidates).toEqual([
                {
                    scale: {min: 0, max: 120},
                    tickCount: 4,
                    step: 40,
                    labels: [0, 40, 80, 120]
                },
                {
                    scale: {min: 0, max: 120},
                    tickCount: 5,
                    step: 30,
                    labels: [0, 30, 60, 90, 120]
                }
            ]);
        });

        it('_getComparingValue', function() {
            var value = axisModel._getComparingValue({
                min: 0,
                max: 80
            }, 20, 10, 90);
            expect(value).toEqual(20);
        });

        it('_selectTickInfo', function() {
            var tickInfo = axisModel._selectTickInfo(10, 90, [
                {
                    scale: {min: 0, max: 105},
                    tickCount: 4,
                    step: 35,
                    labels: [0, 35, 70, 105]
                },
                {
                    scale: {min: 0, max: 100},
                    tickCount: 5,
                    step: 25,
                    labels: [0, 25, 50, 75, 100]
                }
            ]);

            expect(tickInfo).toEqual({
                scale: {min: 0, max: 100},
                tickCount: 5,
                step: 25,
                labels: [0, 25, 50, 75, 100]
            });
        });

        it('_getTickInfo', function() {
            var tickInfo = axisModel._getTickInfo(10, 90, {
                width: 500,
                height: 400
            }, {});
            expect(tickInfo).toEqual({
                scale: {min: 0, max: 100},
                tickCount: 6,
                step: 20,
                labels: [0, 20, 40, 60, 80, 100]
            });
        });

        it('_normalizeStep', function() {
            var result = axisModel._normalizeStep(0);
            expect(result).toEqual(0);

            result = axisModel._normalizeStep(1.6);
            expect(result).toEqual(2);

            result = axisModel._normalizeStep(4);
            expect(result).toEqual(5);

            result = axisModel._normalizeStep(6);
            expect(result).toEqual(10);

            result = axisModel._normalizeStep(40);
            expect(result).toEqual(40);

            result = axisModel._normalizeStep(1005);
            expect(result).toEqual(1010);

            result = axisModel._normalizeStep(0.4);
            expect(result).toEqual(0.5);

            result = axisModel._normalizeStep(0.07);
            expect(result).toEqual(0.1);
        });

        it('_normalizeMin', function() {
            var result = axisModel._normalizeMin(1.6, 2);
            expect(result).toEqual(0);

            result = axisModel._normalizeMin(1.6, 1);
            expect(result).toEqual(1);

            result = axisModel._normalizeMin(2.3, 2);
            expect(result).toEqual(2);

            result = axisModel._normalizeMin(3.3, 2);
            expect(result).toEqual(2);

            result = axisModel._normalizeMin(3.3, 5);
            expect(result).toEqual(0);

            result = axisModel._normalizeMin(7.3, 5);
            expect(result).toEqual(5);

            result = axisModel._normalizeMin(7.3, 10);
            expect(result).toEqual(0);

            result = axisModel._normalizeMin(-100, 30);
            expect(result).toEqual(-120);

            result = axisModel._normalizeMin(-10, 30);
            expect(result).toEqual(-30);

            result = axisModel._normalizeMin(-10, 5);
            expect(result).toEqual(-10);
        });

        it('_calculateScale', function() {
            var scale = axisModel._calculateScale(10, 100, 5, {});
            expect(scale.max).toEqual(104.5);
            expect(scale.min).toEqual(0);

            scale = axisModel._calculateScale(20, 100, 5, {});
            expect(scale.max).toEqual(104);
            expect(scale.min).toEqual(16);

            scale = axisModel._calculateScale(20, 100, 5, 0, {});
            expect(scale.max).toEqual(104);
            expect(scale.min).toEqual(16);

            scale = axisModel._calculateScale(-100, -20, 5, 0, {});
            expect(scale.max).toEqual(-16);
            expect(scale.min).toEqual(-100);

            scale = axisModel._calculateScale(-100, 20, 5, 0, {});
            expect(scale.max).toEqual(26);
            expect(scale.min).toEqual(-100);
        });

        it('_formatLabels', function() {
            var fns = axisModel.findFormatFunctions('1,000.00'),
                result = axisModel._formatLabels([1000, 2000.2222, 3000.555555, 4, 5.55], fns);

            expect(result).toEqual(['1,000.00', '2,000.22', '3,000.56', '4.00', '5.55']);

            fns = axisModel.findFormatFunctions('0001');
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

        it('_makeValues', function() {
            var values = axisModel._makeValues(groupValues);
            expect(values).toEqual([70, 10, 20, 20, 80, 30]);

            values = axisModel._makeValues(groupValues, 'normal');
            expect(values).toEqual([70, 10, 20, 20, 80, 30, 80, 40, 110]);
        });

        it('_makeIntegerTypeInfo', function() {
            var intTypeInfo = axisModel._makeIntegerTypeInfo(1, 100, {});
            expect(intTypeInfo).toEqual({
                min: 1,
                max: 100,
                options: {},
                divideNum: 1
            });

            intTypeInfo = axisModel._makeIntegerTypeInfo(0.1, 0.9, {});
            expect(intTypeInfo).toEqual({
                min: 1,
                max: 9,
                options: {},
                divideNum: 10
            });

            intTypeInfo = axisModel._makeIntegerTypeInfo(0.1, 0.9, {min: 0.2, max: 0.8});
            expect(intTypeInfo).toEqual({
                min: 1,
                max: 9,
                options: {min: 2, max: 8},
                divideNum: 10
            });
        });

        it('_makeOriginalTypeTickInfo', function() {
            var tickInfo = axisModel._makeOriginalTypeTickInfo({
                step: 5,
                scale: {
                    min: 1,
                    max: 10
                },
                labels: [2, 3, 9]
            }, 1);
            expect(tickInfo).toEqual({
                step: 5,
                scale: {
                    min: 1,
                    max: 10
                },
                labels: [2, 3, 9]
            });

            tickInfo = axisModel._makeOriginalTypeTickInfo({
                step: 5,
                scale: {
                    min: 1,
                    max: 10
                },
                labels: [2, 3, 9]
            }, 10);
            expect(tickInfo).toEqual({
                step: 0.5,
                scale: {
                    min: 0.1,
                    max: 1
                },
                labels: [0.2, 0.3, 0.9]
            });
        });

        it('normal _setValueAxisData', function() {
            var scale;

            axisModel._setValueAxisData(groupValues, {
                width: 400,
                height: 300
            });
            scale = axisModel.scale;
            expect(axisModel.labels).toEqual([0, 30, 60, 90]);
            expect(scale.min).toEqual(0);
            expect(scale.max).toEqual(90);
            expect(axisModel.isValueAxis()).toBeTruthy();
        });

        it('normal stacked _setValueAxisData', function() {
            var scale;

            axisModel._setValueAxisData(groupValues, {
                width: 400,
                height: 300
            }, [], 'normal');
            scale = axisModel.scale;
            expect(axisModel.labels).toEqual([0, 60, 120]);
            expect(scale.min).toEqual(0);
            expect(scale.max).toEqual(120);
        });

        it('percent stacked _setValueAxisData', function() {
            var scale;

            axisModel._setValueAxisData(groupValues, {
                width: 400,
                height: 300
            }, [], 'percent');
            scale = axisModel.scale;
            expect(axisModel.labels).toEqual([0, 25, 50, 75, 100]);
            expect(scale.min).toEqual(0);
            expect(scale.max).toEqual(100);
        });

        it('setData', function() {
            axisModel._setData({labels: labels});
            expect(axisModel.isLabelAxis()).toBeTruthy();

            axisModel._setData({values: groupValues, chartDimension: {
                width: 400,
                height: 300
            }});
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
                    chartDimension: {width: 400, height: 300},
                    formatFunctions: tmpAxisModel.findFormatFunctions('0.00')
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