/**
 * @fileoverview Test for axisTypeMixer.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var axisTypeMixer = require('../../src/js/charts/axisTypeMixer.js');
var Tooltip = require('../../src/js/components/tooltips/tooltip');
var GroupTooltip = require('../../src/js/components/tooltips/groupTooltip');
var GroupTypeEventDetector = require('../../src/js/components/mouseEventDetectors/groupTypeEventDetector');
var BoundsTypeEventDetector = require('../../src/js/components/mouseEventDetectors/boundsTypeEventDetector');

describe('Test for ComboChart', function() {
    var componentMap = {};
    var spyObjs = {};
    var componentManager, dataProcessor;

    beforeAll(function() {
        spyObjs = jasmine.createSpyObj('spyObjs', ['_addComponent', 'makeTooltipData', '_makeAxesData']);
        spyObjs.makeTooltipData.and.callFake(function(classType) {
            return classType;
        });

        tui.util.extend(axisTypeMixer, spyObjs);

        componentManager = jasmine.createSpyObj('componentManager', ['register']);
        axisTypeMixer.componentManager = componentManager;
        componentManager.register.and.callFake(function(name, params) {
            componentMap[name] = params;
        });

        dataProcessor = jasmine.createSpyObj('dataProcessor',
                                    ['getCategories', 'isCoordinateType', 'addDataRatios', 'addDataRatiosForCoordinateType']);

        axisTypeMixer.dataProcessor = dataProcessor;
        axisTypeMixer.options = {};
    });

    describe('_addAxesComponents', function() {
        it('axis 컴포넌트들을 추가합니다..', function() {
            var axes = [
                {
                    name: 'xAxis'
                },
                {
                    name: 'yAxis'
                }
            ];

            axisTypeMixer._addAxisComponents(axes, true);

            expect(componentMap.yAxis).toBeDefined();
            expect(componentMap.xAxis).toBeDefined();
            expect(componentMap.rightYAxis).not.toBeDefined();
        });

        it('rightYAxis을 목록에 포함시키면 컴포넌트로 등록됩니다.', function() {
            var axes = [
                {
                    name: 'xAxis'
                },
                {
                    name: 'yAxis'
                },
                {
                    name: 'rightYAxis'
                }
            ];

            axisTypeMixer._addAxisComponents(axes, true);
            expect(componentMap.xAxis).toBeDefined();
            expect(componentMap.yAxis).toBeDefined();
            expect(componentMap.rightYAxis).toBeDefined();
        });
    });

    describe('_addSeriesComponents', function() {
        it('series 컴포넌트들을 추가합니다..', function() {
            axisTypeMixer.theme = {
                chart: {}
            };

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
        it('if grouped option is true, use GroupTooltip class', function() {
            axisTypeMixer.options = {
                tooltip: {
                    grouped: true
                }
            };
            axisTypeMixer._addTooltipComponent();
            expect(componentMap.tooltip).toBe('groupTooltip');
        });

        it('if grouped option is false, use Tooltip class', function() {
            axisTypeMixer.options = {
                tooltip: {
                    grouped: false
                }
            };
            axisTypeMixer._addTooltipComponent();
            expect(componentMap.tooltip).toBe('tooltip');
        });
    });

    describe('addComponentsForAxisType()', function() {
        it('axis type chart의 컴포넌트들을 추가합니다..', function() {
            axisTypeMixer.options = {
                legend: {
                    visible: true
                },
                tooltip: {},
                xAxis: {},
                series: {},
                chartExportMenu: {}
            };

            axisTypeMixer._addComponentsForAxisType({
                axis: ['xAxis', 'yAxis'],
                processedData: {},
                seires: [
                    {
                        name: 'columnSreies',
                        data: {},
                        SeriesClass: ''
                    }, {
                        name: 'lineSeries',
                        data: {},
                        SeriesClass: ''
                    }
                ],
                plot: true
            });

            expect(componentMap.plot).toBeDefined();
            expect(componentMap.yAxis).toBeDefined();
            expect(componentMap.xAxis).toBeDefined();
            expect(componentMap.legend).toBeDefined();
            expect(componentMap.columnSreies).toBeDefined();
            expect(componentMap.lineSeries).toBeDefined();
            expect(componentMap.tooltip).toEqual('tooltip');
        });
    });

    describe('addDataRatios()', function() {
        it('add data ratios, when chart is coordinate type', function() {
            dataProcessor.isCoordinateType.and.returnValue(true);
            axisTypeMixer.chartType = 'line';
            axisTypeMixer.options = {};

            axisTypeMixer.addDataRatios('limitMap');

            expect(dataProcessor.addDataRatiosForCoordinateType).toHaveBeenCalledWith('line', 'limitMap', false);
        });

        it('add data ratios, when chart is not coordinate type', function() {
            var limitMap = {
                column: {
                    min: 0,
                    max: 100
                },
                line: {
                    min: 200,
                    max: 800
                }
            };
            var stackType;

            dataProcessor.isCoordinateType.and.returnValue(false);
            axisTypeMixer.axisDataMap = {

            };
            axisTypeMixer.chartTypes = ['column', 'line'];
            axisTypeMixer.isVertical = true;

            axisTypeMixer.addDataRatios(limitMap);

            expect(dataProcessor.addDataRatios).toHaveBeenCalledWith({
                min: 0,
                max: 100
            }, stackType, 'column');
            expect(dataProcessor.addDataRatios).toHaveBeenCalledWith({
                min: 200,
                max: 800
            }, stackType, 'line');
        });
    });

    describe('_addMouseEventDetectorComponentForGroupTooltip()', function() {
        it('그룹 툴팁을 위한 custom event 컴포넌트는 GroupTypeEventDetector 클래스로 생성합니다.', function() {
            axisTypeMixer.options.series = {};
            axisTypeMixer._addMouseEventDetectorComponentForGroupTooltip();

            expect(componentMap.mouseEventDetector.classType).toBe('groupTypeEventDetector');
        });
    });

    describe('_addMouseEventDetectorComponentForNormalTooltip()', function() {
        it('일반 툴팁을 위한 custom event 컴포넌트는 BoundsTypeEventDetector 클래스로 생성합니다.', function() {
            axisTypeMixer.options.series = {};
            axisTypeMixer._addMouseEventDetectorComponentForNormalTooltip();

            expect(componentMap.mouseEventDetector.classType).toBe('boundsTypeEventDetector');
        });
    });
});
