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
        it('should set the index information in the tooltip element as a custom attribute.', function() {
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
        it('should return tooltip indexes from custom attributes in tooltip element.', function() {
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
        it('should set showed custom attribute to tooltip element.', function() {
            var elTooltip = dom.create('DIV'),
                isShowed;
            tooltip._setShowedCustomAttribute(elTooltip, true);
            isShowed = elTooltip.getAttribute('data-showed') === 'true' || elTooltip.getAttribute('data-showed') === true;
            expect(isShowed).toBe(true);
        });
    });

    describe('_isShowedTooltip()', function() {
        it('should show tooltip if tooltip\'s showed custom attribute is true', function() {
            var elTooltip = dom.create('DIV'),
                actual;
            elTooltip.setAttribute('data-showed', true);
            actual = tooltip._isShowedTooltip(elTooltip);
            expect(actual).toBe(true);
        });
    });

    describe('_makeLeftPositionOfNotBarChart()', function() {
        it('should calculate left position, if it is not bar type chart and has "left" align option.', function() {
            var actual = tooltip._makeLeftPositionOfNotBarChart(50, 'left', -30, 5),
                expected = 75;
            expect(actual).toBe(expected);
        });

        it('should calculate left position, if it is not bar type chart and has "center" align option.', function() {
            var actual = tooltip._makeLeftPositionOfNotBarChart(50, 'center', -30),
                expected = 65;
            expect(actual).toBe(expected);
        });

        it('should calculate left position, if it is not bar type chart and has "right" align option.', function() {
            var actual = tooltip._makeLeftPositionOfNotBarChart(50, 'right', -30, 5),
                expected = 55;
            expect(actual).toBe(expected);
        });
    });

    describe('_makeTopPositionOfNotBarChart()', function() {
        it('should calculate top position, if it is not bar type chart and has "bottom" align option.', function() {
            var actual = tooltip._makeTopPositionOfNotBarChart(50, 'bottom', 30, 5),
                expected = 85;
            expect(actual).toBe(expected);
        });

        it('should calculate top position, if it is not bar type chart and has "middle" align option.', function() {
            var actual = tooltip._makeTopPositionOfNotBarChart(50, 'middle', 30),
                expected = 65;
            expect(actual).toBe(expected);
        });

        it('should calculate top position, if it is not bar type chart and has "top" align option.', function() {
            var actual = tooltip._makeTopPositionOfNotBarChart(50, 'top'),
                expected = 45;
            expect(actual).toBe(expected);
        });
    });

    describe('makeTooltipPositionForNotBarChart()', function() {
        it('should calculate position of non bar type chart using tooltip position.', function() {
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
        it('should calculate tooltip position of pie chart using mouse position.', function() {
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
        it('should calculate left position, if it is bar chart and has "left" align option', function() {
            var actual = tooltip._makeLeftPositionForBarChart(50, 'left', 30),
                expected = 20;
            expect(actual).toBe(expected);
        });

        it('should calculate left position, if it is bar chart and has "center" align option', function() {
            var actual = tooltip._makeLeftPositionForBarChart(50, 'center', 30),
                expected = 35;
            expect(actual).toBe(expected);
        });

        it('should calculate left position, if it is bar chart and has "right" align option', function() {
            var actual = tooltip._makeLeftPositionForBarChart(50, 'right', 30),
                expected = 55;
            expect(actual).toBe(expected);
        });
    });

    describe('_makeTopPositionForBarChart()', function() {
        it('should calculate top position, if it is bar chart and aligned "top".', function() {
            var actual = tooltip._makeTopPositionForBarChart(50, 'top', -30),
                expected = 80;
            expect(actual).toBe(expected);
        });

        it('should calculate top position, if it is bar chart and aligned "middle".', function() {
            var actual = tooltip._makeTopPositionForBarChart(50, 'middle', -30),
                expected = 65;
            expect(actual).toBe(expected);
        });
    });

    describe('_makeTooltipPositionForBarChart()', function() {
        it('should caluclate position of bar chart using tooltip position.', function() {
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
        it('should flip position based on origin(0,0), if value of specfic id is negative value(minus).', function() {
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

        it('should correct left position of tooltip, if left part of tooltip is invisible due to tooltip.left is beyond chart.left.', function() {
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

        it('should correct left position of tooltip, if right of tooltip is invisible due to tooltip.right is beyond chart.right.', function() {
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

        it('should correct top position of tooltip, if top of tooltip is invisible due to tooltip.top is beyond chart.top.', function() {
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

        it('should correct left position of tooltip, if bottom of tooltip is invisible due to tooltip.bottom is beyond chart.bottom.', function() {
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
        it('should calculate tooltip position using virtical chart dimension.', function() {
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

        it('should calculate tootlip position using horizontal chart dimension.', function() {
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
