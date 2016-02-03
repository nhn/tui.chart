/**
 * @fileoverview Test for GroupTooltipPositionModel.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var GroupTooltipPositionModel = require('../../src/js/tooltips/groupTooltipPositionModel'),
    chartConst = require('../../src/js/const');

describe('GroupTooltipPositionModel', function() {
    var positionModel;

    beforeEach(function() {
        positionModel = new GroupTooltipPositionModel({}, {
            dimension: {},
            position: {}
        }, true, {});
    });

    describe('_getHorizontalDirection()', function() {
        it('align option에 left가 포함되어 있으면 backward를 반환합니다.', function() {
            var actual = positionModel._getHorizontalDirection('left'),
                exptected = chartConst.TOOLTIP_DIRECTION_BACKWARD;
            expect(actual).toBe(exptected);
        });

        it('align option에 center가 포함되어 있으면 center를 반환합니다.', function() {
            var actual = positionModel._getHorizontalDirection('center'),
                exptected = chartConst.TOOLTIP_DIRECTION_CENTER;
            expect(actual).toBe(exptected);
        });

        it('나머지 경우에는 forward를 반환합니다.', function() {
            var actual = positionModel._getHorizontalDirection('right'),
                exptected = chartConst.TOOLTIP_DIRECTION_FORWARD;
            expect(actual).toBe(exptected);
        });
    });

    describe('_getVerticalDirection()', function() {
        it('align option에 top이 포함되어 있으면 backward를 반환합니다.', function() {
            var actual = positionModel._getVerticalDirection('top'),
                exptected = chartConst.TOOLTIP_DIRECTION_BACKWARD;
            expect(actual).toBe(exptected);
        });

        it('align option에 bottom이 포함되어 있으면 forward를 반환합니다.', function() {
            var actual = positionModel._getVerticalDirection('bottom'),
                exptected = chartConst.TOOLTIP_DIRECTION_FORWARD;
            expect(actual).toBe(exptected);
        });

        it('나머지 경우에는 center를 반환합니다.', function() {
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

        it('세로형 차트의 경우에는 verticalData가 mainData가 되고 horizontalData가 subData가 됩니다.', function() {
            positionModel._setData({}, {}, true, {});
            expect(positionModel.mainData).toBe('verticalData');
            expect(positionModel.subData).toBe('horizontalData');
        });

        it('가로형 차트의 경우에는 horizontalData가 mainData가 되고 verticalData가 subData가 됩니다.', function() {
            positionModel._setData({}, {}, false, {});
            expect(positionModel.mainData).toBe('horizontalData');
            expect(positionModel.subData).toBe('verticalData');
        });

        it('options.position 정보가 없는 경우에는 positionOption의 left, top이 0으로 설정됩니다.', function() {
            positionModel._setData({}, {}, false, {});
            expect(positionModel.positionOption.left).toBe(0);
            expect(positionModel.positionOption.top).toBe(0);
        });

        it('options.position 정보가 있는 경우에는 positionOption을 갱신합니다. ', function() {
            positionModel._setData({}, {}, false, {
                position: {
                    left: 10,
                    top: 20
                }
            });
            expect(positionModel.positionOption.left).toBe(10);
            expect(positionModel.positionOption.top).toBe(20);
        });
    });

    describe('_calculateMainPositionValue()', function() {
        it('direction이 forword인 경우에는 range end 오른쪽 편에 5만큼의 간격을 두고 놓이도록 값을 계산하여 반환합니다.', function() {
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

        it('direction이 backword인 경우에는 range start 왼쪽 편에 5만큼의 간격을 두고 놓이도록 값을 계산하여 반환합니다.', function() {
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

        it('direction이 center이면서 line(rnage.start === range.end)인 경우에는 tooltip의 중앙이 range.start에 놓이도록 값을 계산하여 반환합니다.', function() {
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

        it('direction이 center이면서 line이 아닌 경우에는 툴팁이 range star와 end 가운데 놓이는 값을 반환합니다.', function() {
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
        it('direction이 forword인 경우에는 툴팁이 증앙 부터 그려지도록 툴팁 영역 사이즈값을 반으로 나누어 반환합니다..', function() {
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

        it('direction이 backword인 경우에는 툴팁의 하단이 중앙에 그려지도록 영역을 반으로 나눈값에서 툴팁 사이즈를 뺀 후 반환합니다..', function() {
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

        it('direction이 center인 경우에는 툴팀 중앙이 중앙에 그려지도록 영역을 반으로 나눈값에서 툴팁을 반으로 나누 값을 뺀 후 반환합니다.', function() {
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
        it('position value가 차트 backward 영역을 넘지 않으면 보정 없이 그대로 반환합니다.', function() {
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

        it('position value가 차트 backward 영역을 넘어 서면 반전된 위치에 툴팁이 뜨도록 반전 위치를 계산하여 반환합니다.', function() {
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

        it('반전된 위치도 차트 영역을 넘어가면 먼저 위치에서 차트 안쪽으로 뜨도록 값을 조절합니다.', function() {
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
        it('position value가 차트 forward 영역을 넘지 않으면 보정 없이 그대로 반환합니다.', function() {
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

        it('position value가 차트 forward 영역을 넘어 서면 반전된 위치에 툴팁이 뜨도록 반전 위치를 계산하여 반환합니다.', function() {
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

        it('반전된 위치도 차트 영역을 넘어가면 먼저 위치에서 차트 안쪽으로 뜨도록 값을 조절합니다.', function() {
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
        it('direction이 backward이면 _adjustBackwardPositionValue의 실행 결과를 반환합니다.', function() {
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

        it('direction이 forward이면 _adjustForwardPositionValue의 실행 결과를 반환합니다.', function() {
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

        it('direction이 center이면 툴팁이 차트 영역을 넘어갈 경우에 보정만 합니다.', function() {
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
        it('direction이 forward이면 툴팁이 차트 영역을 forward방향으로 넘어가지 않도록 값을 조절하여 반환합니다.', function() {
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

        it('direction이 나머지 방향이면 툴팁이 차트 영역을 backward방향으로 넘어가지 않도록 값을 조절하여 반환합니다.', function() {
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
        it('main에 해당하는 position값을 구합니다.', function() {
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
        it('sub에 해당하는 position값을 구합니다.', function() {
            var tooltipDimension = {
                    width: 50
                },
                data = {
                    basePosition: 0,
                    areaSize: 100,
                    direction: chartConst.TOOLTIP_DIRECTION_FORWARD,
                    sizeType: 'width',
                    positionType: 'left'
                },
                actual, expected;

            positionModel.positionOption = {
                left: 10
            };

            actual = positionModel._makeSubPositionValue(tooltipDimension, data);
            expected = 60;
            expect(actual).toBe(expected);
        });
    });

    describe('_calculatePosition()', function() {
        it('그룹 툴팁의 position을 계산합니다.', function() {
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
