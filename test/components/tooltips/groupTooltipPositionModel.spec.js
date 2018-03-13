/**
 * @fileoverview Test for GroupTooltipPositionModel.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var GroupTooltipPositionModel = require('../../../src/js/components/tooltips/groupTooltipPositionModel'),
    chartConst = require('../../../src/js/const');

describe('GroupTooltipPositionModel', function() {
    var positionModel;

    beforeEach(function() {
        positionModel = new GroupTooltipPositionModel({}, {
            dimension: {},
            position: {}
        }, true, {});
    });

    describe('_getHorizontalDirection()', function() {
        it('should return backward, if align option contains left.', function() {
            var actual = positionModel._getHorizontalDirection('left'),
                exptected = chartConst.TOOLTIP_DIRECTION_BACKWARD;
            expect(actual).toBe(exptected);
        });

        it('should return center, if align option contains center.', function() {
            var actual = positionModel._getHorizontalDirection('center'),
                exptected = chartConst.TOOLTIP_DIRECTION_CENTER;
            expect(actual).toBe(exptected);
        });

        it('should return forward otherwise', function() {
            var actual = positionModel._getHorizontalDirection('right'),
                exptected = chartConst.TOOLTIP_DIRECTION_FORWARD;
            expect(actual).toBe(exptected);
        });
    });

    describe('_getVerticalDirection()', function() {
        it('should return backward, if align option contains top', function() {
            var actual = positionModel._getVerticalDirection('top'),
                exptected = chartConst.TOOLTIP_DIRECTION_BACKWARD;
            expect(actual).toBe(exptected);
        });

        it('should return forward, if align option contains bottom.', function() {
            var actual = positionModel._getVerticalDirection('bottom'),
                exptected = chartConst.TOOLTIP_DIRECTION_FORWARD;
            expect(actual).toBe(exptected);
        });

        it('should return center otherwise', function() {
            var actual = positionModel._getVerticalDirection('middle'),
                exptected = chartConst.TOOLTIP_DIRECTION_CENTER;
            expect(actual).toBe(exptected);
        });
    });

    describe('_setData()', function() {
        beforeEach(function() {
            spyOn(positionModel, '_makeVerticalData').and.returnValue('verticalData');
            spyOn(positionModel, '_makeHorizontalData').and.returnValue('horizontalData');
        });

        it('should set virticalData as main, and horizontalData as sub, if it is virtical chart.', function() {
            positionModel._setData({}, {}, true, {});
            expect(positionModel.mainData).toBe('verticalData');
            expect(positionModel.subData).toBe('horizontalData');
        });

        it('should set horizontalData as main, and verticalData as sub, if it is horizontal chart.', function() {
            positionModel._setData({}, {}, false, {});
            expect(positionModel.mainData).toBe('horizontalData');
            expect(positionModel.subData).toBe('verticalData');
        });

        it('should set position to zero, if options.position is not exist', function() {
            positionModel._setData({}, {}, false, {});
            expect(positionModel.positionOption.left).toBe(0);
            expect(positionModel.positionOption.top).toBe(0);
        });

        it('should upate position if options.offset exists', function() {
            positionModel._setData({}, {}, false, {
                offset: {
                    x: 10,
                    y: 20
                }
            });
            expect(positionModel.positionOption.left).toBe(10);
            expect(positionModel.positionOption.top).toBe(20);
        });
    });

    describe('_calculateMainPositionValue()', function() {
        it('should calculate position to have right spaces of 5, if forward direction.', function() {
            var tooltipSize = 50,
                range = {
                    start: 0,
                    end: 50
                },
                data = {
                    basePosition: 0,
                    direction: chartConst.TOOLTIP_DIRECTION_FORWARD
                },
                actual = positionModel._calculateMainPositionValue(tooltipSize, range, data),
                expected = 55;
            expect(actual).toBe(expected);
        });

        it('should calculate position to have left spaces of 5, if backword direction.', function() {
            var tooltipSize = 50,
                range = {
                    start: 100,
                    end: 150
                },
                data = {
                    basePosition: 0,
                    direction: chartConst.TOOLTIP_DIRECTION_BACKWARD
                },
                actual = positionModel._calculateMainPositionValue(tooltipSize, range, data),
                expected = 45;
            expect(actual).toBe(expected);
        });

        it('should calculate position to range.start, if center direction && line(rnage.start === range.end).', function() {
            var tooltipSize = 50,
                range = {
                    start: 100,
                    end: 100
                },
                data = {
                    basePosition: 0,
                    direction: chartConst.TOOLTIP_DIRECTION_CENTER
                },
                actual = positionModel._calculateMainPositionValue(tooltipSize, range, data),
                expected = 75;
            expect(actual).toBe(expected);
        });

        it('should calculate position to (range.start + range.end) /2, if center direction && !line(range.start !== range.end)', function() {
            var tooltipSize = 50,
                range = {
                    start: 100,
                    end: 150
                },
                data = {
                    basePosition: 0,
                    direction: chartConst.TOOLTIP_DIRECTION_CENTER
                },
                actual = positionModel._calculateMainPositionValue(tooltipSize, range, data),
                expected = 100;
            expect(actual).toBe(expected);
        });
    });

    describe('_calculateSubPositionValue()', function() {
        it('should position tooltip positions at the center. if it is forward direction.', function() {
            var tooltipSize = 50,
                data = {
                    basePosition: 0,
                    areaSize: 100,
                    direction: chartConst.TOOLTIP_DIRECTION_FORWARD
                },
                actual = positionModel._calculateSubPositionValue(tooltipSize, data),
                expected = 50;
            expect(actual).toBe(expected);
        });

        it('should position tooltip bottom at the middle of tooltip area, if backward direction.', function() {
            var tooltipSize = 50,
                data = {
                    basePosition: 0,
                    areaSize: 100,
                    direction: chartConst.TOOLTIP_DIRECTION_BACKWARD
                },
                actual = positionModel._calculateSubPositionValue(tooltipSize, data),
                expected = 0;
            expect(actual).toBe(expected);
        });

        it('should position tooltip at the middle of tooltip area, if center direction.', function() {
            var tooltipSize = 50,
                data = {
                    basePosition: 0,
                    areaSize: 100,
                    direction: chartConst.TOOLTIP_DIRECTION_CENTER
                },
                actual = positionModel._calculateSubPositionValue(tooltipSize, data),
                expected = 25;
            expect(actual).toBe(expected);
        });
    });

    describe('_adjustBackwardPositionValue()', function() {
        it('should not adjust position, if position value is not beyond chart backward position.', function() {
            var value = -10,
                range = {},
                tooltipSize = 50,
                data = {
                    areaPosition: 20
                },
                actual = positionModel._adjustBackwardPositionValue(value, range, tooltipSize, data),
                expected = -10;
            expect(actual).toBe(expected);
        });

        it('should flip position, if position value is beyond chart backward.', function() {
            var value = -30,
                range = {
                    start: 25,
                    end: 50
                },
                tooltipSize = 50,
                data = {
                    basePosition: 0,
                    areaPosition: 20
                },
                actual = positionModel._adjustBackwardPositionValue(value, range, tooltipSize, data),
                expected = 55;
            expect(actual).toBe(expected);
        });

        it('should re-correct chart position, if position is beyond chart area after flip', function() {
            var value = -30,
                range = {
                    start: 5,
                    end: 30
                },
                tooltipSize = 50,
                data = {
                    basePosition: 0,
                    areaPosition: 20
                },
                actual = positionModel._adjustBackwardPositionValue(value, range, tooltipSize, data),
                expected = 35;
            expect(actual).toBe(expected);
        });
    });

    describe('_adjustForwardPositionValue()', function() {
        it('should not adjust position, if position is not beyond chart forward area.', function() {
            var value = 50,
                range = {
                    start: 50,
                    end: 100
                },
                tooltipSize = 50,
                data = {
                    chartSize: 150,
                    areaPosition: 20,
                    basePosition: 0
                },
                actual = positionModel._adjustForwardPositionValue(value, range, tooltipSize, data),
                expected = 50;
            expect(actual).toBe(expected);
        });

        it('should flip position, if position is beyond chart forward area.', function() {
            var value = 50,
                range = {
                    start: 50,
                    end: 100
                },
                tooltipSize = 50,
                data = {
                    chartSize: 110,
                    areaPosition: 20,
                    basePosition: 0
                },
                actual = positionModel._adjustForwardPositionValue(value, range, tooltipSize, data),
                expected = -5;
            expect(actual).toBe(expected);
        });

        it('should re-correct position, if position is beyond chart area after flipping.', function() {
            var value = 50,
                range = {
                    start: 50,
                    end: 100
                },
                tooltipSize = 70,
                data = {
                    chartSize: 90,
                    areaPosition: 20,
                    basePosition: 0
                },
                actual = positionModel._adjustForwardPositionValue(value, range, tooltipSize, data),
                expected = 0;
            expect(actual).toBe(expected);
        });
    });

    describe('_adjustMainPositionValue()', function() {
        it('should call _adjustBackwardPositionValue() if backward direction.', function() {
            var value = -10,
                range = {},
                tooltipSize = 50,
                data = {
                    direction: chartConst.TOOLTIP_DIRECTION_BACKWARD,
                    areaPosition: 20
                },
                actual = positionModel._adjustMainPositionValue(value, range, tooltipSize, data),
                expected = positionModel._adjustBackwardPositionValue(value, range, tooltipSize, data);
            expect(actual).toBe(expected);
        });

        it('should call _adjustForwardPositionValue() if forward direction.', function() {
            var value = 50,
                range = {
                    start: 50,
                    end: 100
                },
                tooltipSize = 50,
                data = {
                    direction: chartConst.TOOLTIP_DIRECTION_FORWARD,
                    chartSize: 150,
                    areaPosition: 20,
                    basePosition: 0
                },
                actual = positionModel._adjustMainPositionValue(value, range, tooltipSize, data),
                expected = positionModel._adjustForwardPositionValue(value, range, tooltipSize, data);
            expect(actual).toBe(expected);
        });

        it('should correct tooltip position of center direction, only if tooltip is beyond chart area.', function() {
            var value = 50,
                range = {
                    start: 50,
                    end: 100
                },
                tooltipSize = 50,
                data = {
                    direction: chartConst.TOOLTIP_DIRECTION_CENTER,
                    chartSize: 110,
                    areaPosition: 20,
                    basePosition: 0
                },
                actual = positionModel._adjustMainPositionValue(value, range, tooltipSize, data),
                expected = 40;
            expect(actual).toBe(expected);
        });
    });

    describe('_adjustSubPositionValue()', function() {
        it('should adjust tooltip position of forward direction, to make tooltip is not beyond chart forward area.', function() {
            var value = 50,
                tooltipSize = 50,
                data = {
                    direction: chartConst.TOOLTIP_DIRECTION_FORWARD,
                    chartSize: 100,
                    areaPosition: 10
                },
                actual = positionModel._adjustSubPositionValue(value, tooltipSize, data),
                expected = 40;
            expect(actual).toBe(expected);
        });

        it('should adjust tooltip position of backward directoin, to make tooltip is not beyond chart backward area.', function() {
            var value = -20,
                tooltipSize = 50,
                data = {
                    direction: chartConst.TOOLTIP_DIRECTION_BACKWARD,
                    chartSize: 100,
                    areaPosition: 10
                },
                actual = positionModel._adjustSubPositionValue(value, tooltipSize, data),
                expected = -10;
            expect(actual).toBe(expected);
        });
    });

    describe('_makeMainPositionValue()', function() {
        it('should calculate main position.', function() {
            var tooltipDimension = {
                    width: 50
                },
                range = {
                    start: 50,
                    end: 100
                },
                data = {
                    basePosition: 0,
                    direction: chartConst.TOOLTIP_DIRECTION_FORWARD,
                    sizeType: 'width',
                    positionType: 'left'
                },
                actual, expected;

            positionModel.positionOption = {
                left: 10
            };

            actual = positionModel._makeMainPositionValue(tooltipDimension, range, data);
            expected = 115;
            expect(actual).toBe(expected);
        });
    });

    describe('_makeSubPositionValue()', function() {
        it('should calculate sub position.', function() {
            var tooltipDimension = {
                    width: 50
                },
                data = {
                    basePosition: 0,
                    areaPosition: 0,
                    areaSize: 100,
                    chartSize: 100,
                    direction: chartConst.TOOLTIP_DIRECTION_FORWARD,
                    sizeType: 'width',
                    positionType: 'left'
                },
                actual, expected;

            positionModel.positionOption = {
                left: 10
            };

            actual = positionModel._makeSubPositionValue(tooltipDimension, data);
            expected = 50;
            expect(actual).toBe(expected);
        });
    });

    describe('_calculatePosition()', function() {
        it('should calculate group tooltip position.', function() {
            var actual;
            positionModel.mainData = {
                positionType: 'left'
            };
            positionModel.subData = {
                positionType: 'top'
            };
            spyOn(positionModel, '_makeMainPositionValue').and.returnValue(10);
            spyOn(positionModel, '_makeSubPositionValue').and.returnValue(20);
            actual = positionModel.calculatePosition({}, {
                start: 10,
                end: 100
            });

            expect(actual.left).toBe(10);
            expect(actual.top).toBe(20);
            expect(actual).toBe(positionModel.positions['10-100']);
        });
    });
});
