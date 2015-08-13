/**
 * @fileoverview test axis model
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var maker = require('../../src/js/helpers/axisDataMaker.js'),
    converter = require('../../src/js/helpers/dataConverter.js'),
    renderUtil = require('../../src/js/helpers/renderUtil.js');

describe('axisDataMaker', function() {
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

    it('makeLabelAxisData()', function() {
        var result = maker.makeLabelAxisData({
            labels: ['label1', 'label2', 'label3']
        });
        expect(result).toEqual({
            labels: ['label1', 'label2', 'label3'],
            tickCount: 4,
            validTickCount: 0,
            isLabelAxis: true,
            isVertical: false,
            axisType: 'label'
        });
    });

    it('_makeValues()', function() {
        var values = maker._makeValues(groupValues);
        expect(values).toEqual([70, 10, 20, 20, 80, 30]);

        values = maker._makeValues(groupValues, 'normal');
        expect(values).toEqual([70, 10, 20, 20, 80, 30, 80, 40, 110]);
    });

    it('_getBaseSize()', function() {
        var baseSize = maker._getBaseSize({
            width: 400,
            height: 300
        });

        expect(baseSize).toEqual(400);

        baseSize = maker._getBaseSize({
            width: 400,
            height: 300
        }, true);

        expect(baseSize).toEqual(300);
    });

    it('_getCandidateTickCounts()', function() {
        var tickCounts = maker._getCandidateTickCounts({
            width: 320
        });
        expect(tickCounts).toEqual([5, 6, 7, 8]);
    });

    it('_getComparingValue()', function() {
        var value = maker._getComparingValue(10, 90, {
            scale: {
                min: 0,
                max: 80
            },
            step: 20
        });
        expect(value).toEqual(20);
    });

    it('_selectTickInfo()', function() {
        var tickInfo = maker._selectTickInfo(10, 90, [
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

    it('_getTickInfo()', function() {
        var tickInfo = maker._getTickInfo({
            min: 10,
            max: 90,
            seriesDimension: {
                width: 500,
                height: 400
            }
        }, {});
        expect(tickInfo).toEqual({
            scale: {min: 0, max: 100},
            tickCount: 6,
            step: 20,
            labels: [0, 20, 40, 60, 80, 100]
        });
    });

    it('_makeIntegerTypeInfo()', function() {
        var intTypeInfo = maker._makeIntegerTypeInfo(1, 100, {});
        expect(intTypeInfo).toEqual({
            min: 1,
            max: 100,
            options: {},
            divideNum: 1
        });

        intTypeInfo = maker._makeIntegerTypeInfo(0.1, 0.9, {});
        expect(intTypeInfo).toEqual({
            min: 1,
            max: 9,
            options: {},
            divideNum: 10
        });

        intTypeInfo = maker._makeIntegerTypeInfo(0.1, 0.9, {min: 0.2, max: 0.8});
        expect(intTypeInfo).toEqual({
            min: 1,
            max: 9,
            options: {min: 2, max: 8},
            divideNum: 10
        });
    });

    it('_makeOriginalTypeTickInfo()', function() {
        var tickInfo = maker._makeOriginalTypeTickInfo({
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

        tickInfo = maker._makeOriginalTypeTickInfo({
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

    it('_normalizeStep()', function() {
        var result = maker._normalizeStep(0);
        expect(result).toEqual(0);

        result = maker._normalizeStep(1.6);
        expect(result).toEqual(2);

        result = maker._normalizeStep(4);
        expect(result).toEqual(5);

        result = maker._normalizeStep(6);
        expect(result).toEqual(10);

        result = maker._normalizeStep(40);
        expect(result).toEqual(40);

        result = maker._normalizeStep(1005);
        expect(result).toEqual(1010);

        result = maker._normalizeStep(0.4);
        expect(result).toEqual(0.5);

        result = maker._normalizeStep(0.07);
        expect(result).toEqual(0.1);
    });

    it('_normalizeMin()', function() {
        var result = maker._normalizeMin(1.6, 2);
        expect(result).toEqual(0);

        result = maker._normalizeMin(1.6, 1);
        expect(result).toEqual(1);

        result = maker._normalizeMin(2.3, 2);
        expect(result).toEqual(2);

        result = maker._normalizeMin(3.3, 2);
        expect(result).toEqual(2);

        result = maker._normalizeMin(3.3, 5);
        expect(result).toEqual(0);

        result = maker._normalizeMin(7.3, 5);
        expect(result).toEqual(5);

        result = maker._normalizeMin(7.3, 10);
        expect(result).toEqual(0);

        result = maker._normalizeMin(-100, 30);
        expect(result).toEqual(-120);

        result = maker._normalizeMin(-10, 30);
        expect(result).toEqual(-30);

        result = maker._normalizeMin(-10, 5);
        expect(result).toEqual(-10);
    });

    it('_minimizeTickScale()', function() {
        var tickInfo = maker._minimizeTickScale({
            userMin: 10,
            userMax: 90,
            tickInfo: {
                scale: {min: 0, max: 100},
                step: 25,
                tickCount: 6
            },
            options: {}
        });

        expect(tickInfo).toEqual({
            scale: {min: 0, max: 100},
            step: 25,
            tickCount: 5,
            labels: [0, 25, 50, 75, 100]
        });

        tickInfo = maker._minimizeTickScale({
            userMin: 20,
            userMax: 90,
            tickInfo: {
                scale: {min: 0, max: 100},
                step: 25,
                tickCount: 6
            },
            options: {}
        });

        expect(tickInfo).toEqual({
            scale: {min: 0, max: 100},
            step: 25,
            tickCount: 5,
            labels: [0, 25, 50, 75, 100]
        });

        tickInfo = maker._minimizeTickScale({
            userMin: -6,
            userMax: -1,
            tickInfo: {
                scale: {min: -10, max: 10},
                step: 5,
                tickCount: 6
            },
            options: {min: -10}
        });

        expect(tickInfo).toEqual({
            scale: {min: -10, max: 10},
            step: 5,
            tickCount: 5,
            labels: [-10, -5, 0, 5, 10]
        });
    });

    it('_divideTickStep()', function() {
        var result = maker._divideTickStep({
            step: 50,
            scale: {
                min: 0,
                max: 100
            },
            tickCount: 3
        }, 4);

        expect(result).toEqual({
            step: 25,
            scale: {
                min: 0,
                max: 100
            },
            tickCount: 5,
            labels: [0, 25, 50, 75, 100]
        });
    });

    it('_makeTickInfo', function() {
        var result = maker._makeTickInfo({
            tickCount: 5,
            min: 0,
            max: 100,
            userMin: 10,
            userMax: 90,
            isMinus: false,
            options: {}
        });

        expect(result).toEqual({
            scale: {
                min: 0,
                max: 120
            },
            step: 30,
            tickCount: 5,
            labels: [0, 30, 60, 90, 120]
        });
    });

    it('_getTickInfoCandidates()', function() {
        var candidates = maker._getTickInfoCandidates({
            min: 10,
            max: 90,
            tickCounts: [4, 5]
        }, {});
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

    it('_formatLabels()', function() {
        var fns = converter._findFormatFunctions('1,000.00'),
            result = maker._formatLabels([1000, 2000.2222, 3000.555555, 4, 5.55], fns);

        expect(result).toEqual(['1,000.00', '2,000.22', '3,000.56', '4.00', '5.55']);

        fns = converter._findFormatFunctions('0001');
        result = maker._formatLabels([1, 2, 3], fns);
        expect(result).toEqual(['0001', '0002', '0003']);
    });

    it('_makeLabelsFromScale()', function() {
        var tickCount = 5,
            scale = {min: 20, max: 100},
            step = renderUtil.getScaleStep(scale, tickCount),
            _labels = maker._makeLabelsFromScale(scale, step);
        expect(_labels).toEqual([20, 40, 60, 80, 100]);
    });

    it('normal makeValueAxisData()', function() {
        var result = maker.makeValueAxisData({
            values: groupValues,
            seriesDimension: {
                width: 320,
                height: 320
            },
            options: {}
        });

        expect(result).toEqual({
            labels: [0, 30, 60, 90],
            tickCount: 4,
            validTickCount: 4,
            scale: {
                min: 0,
                max: 90
            },
            isVertical: false,
            axisType: 'value'
        });
    });

    it('normal stacked makeValueAxisData()', function() {
        var result = maker.makeValueAxisData({
            values: groupValues,
            seriesDimension: {
                width: 320,
                height: 320
            },
            stacked: 'normal',
            options: {}
        });

        expect(result).toEqual({
            labels: [0, 30, 60, 90, 120],
            tickCount: 5,
            validTickCount: 5,
            scale: {
                min: 0,
                max: 120
            },
            isVertical: false,
            axisType: 'value'
        });
    });

    it('percent stacked makeValueAxisData()', function() {
        var result = maker.makeValueAxisData({
            values: groupValues,
            seriesDimension: {
                width: 320,
                height: 320
            },
            stacked: 'percent',
            options: {}
        });

        expect(result).toEqual({
            labels: [0, 25, 50, 75, 100],
            tickCount: 5,
            validTickCount: 5,
            scale: {
                min: 0,
                max: 100
            },
            isVertical: false,
            axisType: 'value'
        });
    });
});