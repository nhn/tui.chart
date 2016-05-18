/**
 * @fileoverview Test for ComboChart.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var comboTypeMixer = require('../../src/js/charts/comboTypeMixer.js');

describe('Test for comboTypeMixer', function() {
    describe('_makeOptionsMap()', function() {
        it('옵션이 있을 경우에는 각 chartType에 맞는 옵션을 추출하여 chartType을 key로 하는 y축 옵션 정보 맵을 생성합니다.', function() {
            var actual;

            comboTypeMixer.options = {
                series: {
                    column: {
                        stacked: 'normal'
                    },
                    line: {
                        hasDot: true
                    }
                },
                tooltip: {
                    column: {
                        suffix: '%'
                    },
                    line: {
                        position: 'left top'
                    }
                },
                chartType: 'combo'
            };

            actual = comboTypeMixer._makeOptionsMap(['column', 'line']);

            expect(actual.column).toEqual({
                stacked: 'normal'
            });
            expect(actual.line).toEqual({
                hasDot: true
            });
        });
    });

    describe('_makeThemeMap()', function() {
        beforeEach(function() {
            comboTypeMixer.dataProcessor = jasmine.createSpyObj('dataProcessor', ['getLegendLabels']);
            comboTypeMixer.dataProcessor.getLegendLabels.and.callFake(function(chartType) {
                var legendMap = {
                    column: ['Legend1', 'Legend2'],
                    line: ['Legend1', 'Legend2', 'Legend3']
                };
                return legendMap[chartType];
            });
        });

        it('chartType을 key로 하는 테마 맵을 생성합니다.', function() {
            var actual;

            comboTypeMixer.theme = {
                series: {
                    colors: ['red', 'orange', 'green', 'blue', 'gray']
                }
            };

            actual = comboTypeMixer._makeThemeMap(['column', 'line']);

            expect(actual.column).toBeTruthy();
            expect(actual.line).toBeTruthy();
        });

        it('series의 colors를 하나만 설정하게 되면 두번째 차트의 colors 색상 순서는 첫번째 차트 레이블 갯수에 영향을 받습니다.', function() {
            var actual;

            comboTypeMixer.theme = {
                series: {
                    colors: ['green', 'blue', 'gray', 'red', 'orange']
                }
            };

            actual = comboTypeMixer._makeThemeMap(['column', 'line']);

            expect(actual.column.colors).toEqual(['green', 'blue', 'gray', 'red', 'orange']);
            expect(actual.line.colors).toEqual(['gray', 'red', 'orange', 'green', 'blue']);
        });

        it('series의 colors는 차트별로 설정하게 되면 그대로 할당되게 됩니다.', function() {
            var actual;

            comboTypeMixer.theme = {
                series: {
                    column: {
                        colors: ['green', 'blue']
                    },
                    line: {
                        colors: ['blue', 'gray', 'red']
                    }
                }
            };

            actual = comboTypeMixer._makeThemeMap(['column', 'line']);

            expect(actual.column.colors).toEqual(['green', 'blue']);
            expect(actual.line.colors).toEqual(['blue', 'gray', 'red']);
        });
    });
});
