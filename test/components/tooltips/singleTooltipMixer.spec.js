/**
 * @fileoverview Test for singleTooltipMixer.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var singleTooltipMixer = require('../../../src/js/components/tooltips/singleTooltipMixer');
var chartConst = require('../../../src/js/const');
var dom = require('../../../src/js/helpers/domHandler');
var renderUtil = require('../../../src/js/helpers/renderUtil');

describe('singleTooltip', function() {
    var tooltip, dataProcessor;

    beforeAll(function() {
        dataProcessor = jasmine.createSpyObj('dataProcessor', ['getCategories', 'getFormattedGroupValues', 'getLegendLabels', 'getValue']);
        dataProcessor.getCategories.and.returnValue(['Silver', 'Gold']);
        dataProcessor.getFormattedGroupValues.and.returnValue([['10', '20']]);
        dataProcessor.getLegendLabels.and.returnValue(['Density1', 'Density2']);

        tooltip = singleTooltipMixer;
        tooltip.dataProcessor = dataProcessor;
        tooltip.layout = {
            position: {
                top: 0,
                left: 0
            }
        };
    });

    describe('_setIndexesCustomAttribute()', function() {
        it('툴팁 엘리먼트에 index정보들을 custom attribute로 설정합니다.', function() {
            var elTooltip = dom.create('DIV');
            tooltip._setIndexesCustomAttribute(elTooltip, {
                groupIndex: 0,
                index: 1
            });
            expect(parseInt(elTooltip.getAttribute('data-groupIndex'), 10)).toBe(0);
            expect(parseInt(elTooltip.getAttribute('data-index'), 10)).toBe(1);
        });
    });

    describe('_getIndexesCustomAttribute()', function() {
        it('툴팁 엘리먼트에 설정된 index custom attribute들을 객체로 생성하여 반환합니다.', function() {
            var elTooltip = dom.create('DIV'),
                actual;
            elTooltip.setAttribute('data-groupIndex', 0);
            elTooltip.setAttribute('data-index', 1);
            actual = tooltip._getIndexesCustomAttribute(elTooltip);

            expect(actual.groupIndex).toBe(0);
            expect(actual.index).toBe(1);
        });
    });

    describe('_setShowedCustomAttribute()', function() {
        it('툴팁 엘리먼트에 showed custom attribute 값을 설정합니다.', function() {
            var elTooltip = dom.create('DIV'),
                isShowed;
            tooltip._setShowedCustomAttribute(elTooltip, true);
            isShowed = elTooltip.getAttribute('data-showed') === 'true' || elTooltip.getAttribute('data-showed') === true;
            expect(isShowed).toBe(true);
        });
    });

    describe('_isShowedTooltip()', function() {
        it('툴팁에 showed custom attribute값으로 "true"가 설정되어있는 보여지고 있는 상태입니다.', function() {
            var elTooltip = dom.create('DIV'),
                actual;
            elTooltip.setAttribute('data-showed', true);
            actual = tooltip._isShowedTooltip(elTooltip);
            expect(actual).toBe(true);
        });
    });

    describe('_makeLeftPositionOfNotBarChart()', function() {
        it('Bar차트가 아닌 차트에서 align옵션에 "left"이 포함된 경우의 left position 정보를 계산합니다.', function() {
            var actual = tooltip._makeLeftPositionOfNotBarChart(50, 'left', -30, 5),
                expected = 75;
            expect(actual).toBe(expected);
        });

        it('Bar차트가 아닌 차트에서 align옵션에 "center"가 포함된 경우의 left position 정보를 계산합니다.', function() {
            var actual = tooltip._makeLeftPositionOfNotBarChart(50, 'center', -30),
                expected = 65;
            expect(actual).toBe(expected);
        });

        it('Bar차트가 아닌 차트에서 align옵션에 "right"가 포함된 경우의 left position 정보를 계산합니다.', function() {
            var actual = tooltip._makeLeftPositionOfNotBarChart(50, 'right', -30, 5),
                expected = 55;
            expect(actual).toBe(expected);
        });
    });

    describe('_makeTopPositionOfNotBarChart()', function() {
        it('Bar차트가 아닌 차트에서 align옵션에 "bottom"이 포함된 경우의 top position 정보를 계산합니다.', function() {
            var actual = tooltip._makeTopPositionOfNotBarChart(50, 'bottom', 30, 5),
                expected = 85;
            expect(actual).toBe(expected);
        });

        it('Bar차트가 아닌 차트에서 align옵션에 "middle"이 포함된 경우의 top position 정보를 계산합니다.', function() {
            var actual = tooltip._makeTopPositionOfNotBarChart(50, 'middle', 30),
                expected = 65;
            expect(actual).toBe(expected);
        });

        it('Bar차트가 아닌 차트에서 align옵션에 "top"이 포함된 경우의 top position 정보를 계산합니다.', function() {
            var actual = tooltip._makeTopPositionOfNotBarChart(50, 'top'),
                expected = 45;
            expect(actual).toBe(expected);
        });
    });

    describe('makeTooltipPositionForNotBarChart()', function() {
        it('Bar차트가 아닌 차트의 포지션 정보를 툴팁의 포지션 정보로 계산하여 반환합니다.', function() {
            var actual = tooltip._makeTooltipPositionForNotBarChart({
                    bound: {
                        width: 25,
                        height: 50,
                        top: 50,
                        left: 10
                    },
                    dimension: {
                        width: 50,
                        height: 30
                    },
                    alignOption: '',
                    positionOption: {
                        left: 0,
                        top: 0
                    }
                }),
                expected = {
                    left: 15,
                    top: 10
                };

            expect(actual).toEqual(expected);
        });
    });

    describe('_makeTooltipPositionToMousePosition()', function() {
        it('PIE 차트인 경우에는 마우스 이동 포지션 기준으로 계산하여 반환합니다.', function() {
            var actual, expected;
            tooltip.seriesPosition = {
                left: 10,
                top: 0
            };

            tooltip.containerBound = {left: 10, top: 0};
            actual = tooltip._makeTooltipPositionToMousePosition({
                mousePosition: {
                    left: 50,
                    top: 50
                },
                dimension: {
                    width: 50,
                    height: 30
                },
                alignOption: '',
                positionOption: {
                    left: 0,
                    top: 0
                }
            });
            expected = {
                left: 55,
                top: 10
            };

            expect(actual).toEqual(expected);
        });
    });

    describe('_makeLeftPositionForBarChart()', function() {
        it('Bar차트의 align옵션에 "left"이 포함된 경우의 left position 정보를 계산합니다.', function() {
            var actual = tooltip._makeLeftPositionForBarChart(50, 'left', 30),
                expected = 20;
            expect(actual).toBe(expected);
        });

        it('Bar차트의 align옵션에 "center"가 포함된 경우의 left position 정보를 계산합니다.', function() {
            var actual = tooltip._makeLeftPositionForBarChart(50, 'center', 30),
                expected = 35;
            expect(actual).toBe(expected);
        });

        it('Bar차트의 align옵션에 "right"가 포함된 경우의 left position 정보를 계산합니다.', function() {
            var actual = tooltip._makeLeftPositionForBarChart(50, 'right', 30),
                expected = 55;
            expect(actual).toBe(expected);
        });
    });

    describe('_makeTopPositionForBarChart()', function() {
        it('Bar차트의 align옵션에 "top"이 포함된 경우의 left position 정보를 계산합니다.', function() {
            var actual = tooltip._makeTopPositionForBarChart(50, 'top', -30),
                expected = 80;
            expect(actual).toBe(expected);
        });

        it('Bar차트의 align옵션에 "middle"이나 "bottom"이 포함된 경우의 left position 정보를 계산합니다.', function() {
            var actual = tooltip._makeTopPositionForBarChart(50, 'middle', -30),
                expected = 65;
            expect(actual).toBe(expected);
        });
    });

    describe('_makeTooltipPositionForBarChart()', function() {
        it('Bar차트의 포지션 정보를 툴팁의 포지션 정보로 계산하여 반환합니다.', function() {
            var acutal = tooltip._makeTooltipPositionForBarChart({
                    bound: {
                        width: 50,
                        height: 25,
                        top: 10,
                        left: 0
                    },
                    id: 'id-0-0',
                    dimension: {
                        width: 50,
                        height: 30
                    },
                    alignOption: '',
                    positionOption: {
                        left: 0,
                        top: 0
                    }
                }),
                expected = {
                    left: 55,
                    top: 10
                };

            expect(acutal).toEqual(expected);
        });
    });

    describe('_makeTooltipPositionForTreemapChart()', function() {
        it('make tooltip position for treemap chart', function() {
            var actual;

            spyOn(renderUtil, 'getRenderedLabelHeight').and.returnValue(20);

            actual = tooltip._makeTooltipPositionForTreemapChart({
                bound: {
                    width: 80,
                    height: 60,
                    top: 40,
                    left: 50
                },
                id: 'id-0-0',
                dimension: {
                    width: 50,
                    height: 40
                },
                positionOption: {
                    left: 0,
                    top: 0
                }
            });

            expect(actual).toEqual({
                left: 65,
                top: 50
            });
        });

        it('make tooltip position for treemap chart, when position option', function() {
            var actual;

            spyOn(renderUtil, 'getRenderedLabelHeight').and.returnValue(20);

            actual = tooltip._makeTooltipPositionForTreemapChart({
                bound: {
                    width: 80,
                    height: 60,
                    top: 40,
                    left: 50
                },
                id: 'id-0-0',
                dimension: {
                    width: 50,
                    height: 40
                },
                positionOption: {
                    left: 20,
                    top: -20
                }
            });

            expect(actual).toEqual({
                left: 85,
                top: 30
            });
        });
    });

    describe('_moveToSymmetry()', function() {
        it('id를 통해서 얻은 value가 음수일 경우 position을 기준점(axis상에 0이 위치하는 좌표값) 대칭 이동 시킵니다.', function() {
            var actual;

            dataProcessor.getValue.and.returnValue(-3);

            tooltip.chartType = 'bar';

            actual = tooltip._moveToSymmetry(
                {
                    left: 120
                },
                {
                    bound: {
                        left: 60,
                        width: 60
                    },
                    sizeType: 'width',
                    positionType: 'left',
                    indexes: {
                        groupIndex: 0,
                        index: 2
                    },
                    dimension: {
                        width: 50
                    },
                    addPadding: 0,
                    chartType: 'column'
                }
            );

            expect(actual).toEqual({
                left: 10
            });
        });
    });

    describe('_adjustPosition()', function() {
        beforeAll(function() {
            tooltip.dimensionMap = {
                chart: {
                    width: 200,
                    height: 100
                }
            };
            tooltip.layout = {
                position: {
                    left: 10,
                    top: 10
                }
            };
        });

        it('차트 왼쪽 영역을 넘어가는 툴팁 포지션의 left값을 보정합니다.', function() {
            var tooltipDimension = {
                    width: 50,
                    height: 50
                },
                position = {
                    left: -20,
                    top: 10
                },
                actual, expected;

            actual = tooltip._adjustPosition(tooltipDimension, position);
            expected = -10;

            expect(actual.left).toBe(expected);
        });

        it('차트 오른쪽 영역을 넘어가는 툴팁 포지션의 left값을 보정합니다.', function() {
            var tooltipDimension = {
                    width: 50,
                    height: 50
                },
                position = {
                    left: 180,
                    top: 10
                },
                actual, expected;

            actual = tooltip._adjustPosition(tooltipDimension, position);
            expected = 140;
            expect(actual.left).toBe(expected);
        });

        it('차트 위쪽 영역을 넘어가는 툴팁 포지션의 top값을 보정합니다.', function() {
            var tooltipDimension = {
                    width: 50,
                    height: 50
                },
                position = {
                    left: 10,
                    top: -20
                },
                actual, expected;
            actual = tooltip._adjustPosition(tooltipDimension, position);
            expected = -10;
            expect(actual.top).toBe(expected);
        });

        it('차트 아래쪽 영역을 넘어가는 툴팁 포지션의 top값을 보정합니다.', function() {
            var tooltipDimension = {
                    width: 50,
                    height: 50
                },
                position = {
                    left: 10,
                    top: 80
                },
                actual, expected;
            actual = tooltip._adjustPosition(tooltipDimension, position);
            expected = 40;
            expect(actual.top).toBe(expected);
        });
    });

    describe('_makeTooltipPosition()', function() {
        it('세로 타입 차트의 포지션 정보를 툴팁의 포지션 정보로 계산하여 반환합니다.', function() {
            var actual, expected;
            tooltip.bound = {};
            spyOn(tooltip, '_adjustPosition').and.callFake(function(tooltimDimension, position) {
                return position;
            });
            actual = tooltip._makeTooltipPosition({
                bound: {
                    width: 25,
                    height: 50,
                    top: 50,
                    left: 10
                },
                dimension: {
                    width: 50,
                    height: 30
                },
                alignOption: '',
                positionOption: {
                    left: 0,
                    top: 0
                }
            });
            expected = {
                left: 5,
                top: 0
            };

            expect(actual).toEqual(expected);
        });

        it('가로 타입 차트의 포지션 정보를 툴팁의 포지션 정보로 계산하여 반환합니다.', function() {
            var actual, expected;
            tooltip.bound = {};
            spyOn(tooltip, '_adjustPosition').and.callFake(function(tooltimDimension, position) {
                return position;
            });
            actual = tooltip._makeTooltipPosition({
                bound: {
                    width: 50,
                    height: 25,
                    top: 10,
                    left: 0
                },
                chartType: chartConst.CHART_TYPE_BAR,
                id: 'id-0-0',
                dimension: {
                    width: 50,
                    height: 30
                },
                alignOption: '',
                positionOption: {
                    left: 0,
                    top: 0
                }
            });
            expected = {
                left: 45,
                top: 0
            };
            expect(actual).toEqual(expected);
        });

        it('make tooltip position for treemap chart', function() {
            var actual;

            tooltip.bound = {};
            spyOn(tooltip, '_adjustPosition').and.callFake(function(tooltimDimension, position) {
                return position;
            });
            spyOn(renderUtil, 'getRenderedLabelHeight').and.returnValue(20);

            actual = tooltip._makeTooltipPosition({
                bound: {
                    width: 50,
                    height: 25,
                    top: 50,
                    left: 0
                },
                chartType: chartConst.CHART_TYPE_TREEMAP,
                id: 'id-0-0',
                dimension: {
                    width: 50,
                    height: 40
                },
                alignOption: '',
                positionOption: {
                    left: 0,
                    top: 0
                }
            });

            expect(actual).toEqual({
                left: -10,
                top: 32.5
            });
        });
    });
});
