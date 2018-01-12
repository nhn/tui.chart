/**
 * @fileoverview Test for seriesCalculator.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var seriesCalculator = require('../../../src/js/models/bounds/seriesCalculator');
var chartConst = require('../../../src/js/const');

describe('Test for seriesCalculator', function() {
    describe('calculateWidth()', function() {
        it('calculate width', function() {
            var dimensionMap = {
                chart: {
                    width: 500
                },
                legend: {
                    width: 50
                },
                yAxis: {
                    width: 50
                },
                rightYAxis: {
                    width: 0
                }
            };
            var legendOption = {
                visible: true
            };
            var actual = seriesCalculator.calculateWidth(dimensionMap, legendOption);

            expect(actual).toBe(380);
        });

        it('calculate width, when align option is left', function() {
            var dimensionMap = {
                chart: {
                    width: 500
                },
                legend: {
                    width: 50
                },
                yAxis: {
                    width: 50
                },
                rightYAxis: {
                    width: 0
                }
            };
            var legendOption = {
                align: chartConst.LEGEND_ALIGN_LEFT,
                visible: true
            };
            var actual = seriesCalculator.calculateWidth(dimensionMap, legendOption);

            expect(actual).toBe(380);
        });

        it('calculate width, when align option is top', function() {
            var dimensionMap = {
                chart: {
                    width: 500
                },
                yAxis: {
                    width: 50
                },
                rightYAxis: {
                    width: 0
                }
            };
            var legendOption = {
                align: chartConst.LEGEND_ALIGN_TOP,
                visible: true
            };
            var actual = seriesCalculator.calculateWidth(dimensionMap, legendOption);

            expect(actual).toBe(430);
        });

        it('calculate width, when align option is bottom', function() {
            var dimensionMap = {
                chart: {
                    width: 500
                },
                yAxis: {
                    width: 50
                },
                rightYAxis: {
                    width: 0
                }
            };
            var legendOption = {
                align: chartConst.LEGEND_ALIGN_TOP,
                visible: true
            };
            var actual = seriesCalculator.calculateWidth(dimensionMap, legendOption);

            expect(actual).toBe(430);
        });

        it('calculate width, when visible option is false', function() {
            var dimensionMap = {
                chart: {
                    width: 500
                },
                yAxis: {
                    width: 50
                },
                rightYAxis: {
                    width: 0
                }
            };
            var legendOption = {
                visible: false
            };
            var actual = seriesCalculator.calculateWidth(dimensionMap, legendOption);

            expect(actual).toBe(430);
        });
    });

    describe('calculateHeight()', function() {
        it('calculate height', function() {
            var dimensionMap = {
                chart: {
                    height: 400
                },
                title: {
                    height: 50
                },
                xAxis: {
                    height: 50
                },
                chartExportMenu: {
                    height: 30
                },
                legend: {
                    height: 10
                }
            };
            var legendOption = {
                visible: true
            };
            var actual = seriesCalculator.calculateHeight(dimensionMap, legendOption);

            expect(actual).toBe(280);
        });

        it('calculate height, when align option is left', function() {
            var dimensionMap = {
                chart: {
                    height: 400
                },
                title: {
                    height: 50
                },
                xAxis: {
                    height: 50
                },
                chartExportMenu: {
                    height: 30
                },
                legend: {
                    height: 50
                }
            };
            var legendOption = {
                align: chartConst.LEGEND_ALIGN_LEFT,
                visible: true
            };
            var actual = seriesCalculator.calculateHeight(dimensionMap, legendOption);

            expect(actual).toBe(280);
        });

        it('calculate height, when align option is top', function() {
            var dimensionMap = {
                chart: {
                    height: 400
                },
                title: {
                    height: 50
                },
                legend: {
                    height: 50
                },
                xAxis: {
                    height: 50
                },
                chartExportMenu: {
                    height: 30
                }
            };
            var legendOption = {
                align: chartConst.LEGEND_ALIGN_TOP,
                visible: true
            };
            var actual = seriesCalculator.calculateHeight(dimensionMap, legendOption);

            expect(actual).toBe(230);
        });

        it('calculate height, when align option is bottom', function() {
            var dimensionMap = {
                chart: {
                    height: 400
                },
                title: {
                    height: 50
                },
                legend: {
                    height: 50
                },
                xAxis: {
                    height: 50
                },
                chartExportMenu: {
                    height: 30
                }
            };
            var legendOption = {
                align: chartConst.LEGEND_ALIGN_TOP,
                visible: true
            };
            var actual = seriesCalculator.calculateHeight(dimensionMap, legendOption);

            expect(actual).toBe(230);
        });

        it('calculate height, when visible option is false', function() {
            var dimensionMap = {
                chart: {
                    height: 400
                },
                title: {
                    height: 50
                },
                xAxis: {
                    height: 50
                },
                chartExportMenu: {
                    height: 30
                }
            };
            var legendOption = {
                visible: false
            };
            var actual = seriesCalculator.calculateHeight(dimensionMap, legendOption);

            expect(actual).toBe(280);
        });
    });
});
