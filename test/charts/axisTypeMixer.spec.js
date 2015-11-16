/**
 * @fileoverview test axisTypeMixer.js
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var axisTypeMixer = require('../../src/js/charts/axisTypeMixer.js'),
    Tooltip = require('../../src/js/tooltips/tooltip'),
    GroupTooltip = require('../../src/js/tooltips/groupTooltip');

describe('ComboChart', function() {
    var componentMap = {};
    beforeAll(function() {
        axisTypeMixer.addComponent = jasmine.createSpy('addComponent').and.callFake(function(name, ComponentClass) {
            componentMap[name] = ComponentClass;
        });
    });

    beforeEach(function() {
        componentMap = {};
    });

    describe('_addAxesComponents', function() {
        it('axis 컴포넌트들을 추가합니다..', function() {
            axisTypeMixer._addAxisComponents(['xAxis', 'yAxis'], true);
            expect(componentMap.yAxis).toBeDefined();
            expect(componentMap.xAxis).toBeDefined();
            expect(componentMap.yrAxis).not.toBeDefined();
        });

        it('yrAxis을 목록에 포함시키면 컴포넌트로 등록됩니다.', function() {
            axisTypeMixer._addAxisComponents(['xAxis', 'yAxis', 'yrAxis'], true);
            expect(componentMap.xAxis).toBeDefined();
            expect(componentMap.yAxis).toBeDefined();
            expect(componentMap.yrAxis).toBeDefined();
        });
    });

    describe('_addSeriesComponents', function() {
        it('series 컴포넌트들을 추가합니다..', function() {
            axisTypeMixer._addSeriesComponents(
                [
                    {
                        name: 'columnSreies',
                        data: {},
                        SeriesClass: ''
                    }, {
                        name: 'lineSeries',
                        data: {},
                        SeriesClass: ''
                    }
                ], {}
            );
            expect(componentMap.columnSreies).toBeDefined();
            expect(componentMap.lineSeries).toBeDefined();
        });
    });

    describe('_addTooltipComponent', function() {
        it('isGroupedTooltip값이 true이면 그룹 툴팁 컴포넌트를 추가합니다..', function() {
            axisTypeMixer.isGroupedTooltip = true;
            axisTypeMixer._addTooltipComponent({}, {});
            expect(componentMap.tooltip).toEqual(GroupTooltip);
        });

        it('isGroupedTooltip값이 true가 아니면 툴팁 컴포넌트를 추가합니다..', function() {
            axisTypeMixer.isGroupedTooltip = false;
            axisTypeMixer._addTooltipComponent({}, {});
            expect(componentMap.tooltip).toEqual(Tooltip);
        });
    });

    describe('addComponentsForAxisType()', function() {
        it('axis type chart의 컴포넌트들을 추가합니다..', function() {
            axisTypeMixer.options = {};
            axisTypeMixer.addComponentsForAxisType({
                axes: ['xAxis', 'yAxis'],
                convertedData: {},
                serieses: [
                    {
                        name: 'columnSreies',
                        data: {},
                        SeriesClass: ''
                    }, {
                        name: 'lineSeries',
                        data: {},
                        SeriesClass: ''
                    }
                ]
            });

            expect(componentMap.plot).toBeDefined();
            expect(componentMap.yAxis).toBeDefined();
            expect(componentMap.xAxis).toBeDefined();
            expect(componentMap.legend).toBeDefined();
            expect(componentMap.columnSreies).toBeDefined();
            expect(componentMap.lineSeries).toBeDefined();
            expect(componentMap.tooltip).toEqual(Tooltip);
        });
    });
});
