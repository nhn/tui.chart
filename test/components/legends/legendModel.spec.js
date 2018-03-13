/**
 * @fileoverview Test for LegendModel.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var LegendModel = require('../../../src/js/components/legends/legendModel'),
    renderUtil = require('../../../src/js/helpers/renderUtil');

describe('Test for LegendModel', function() {
    var legendModel;

    beforeAll(function() {
        spyOn(renderUtil, 'getRenderedLabelHeight').and.returnValue(20);
    });

    beforeEach(function() {
        legendModel = new LegendModel({
            labels: [
                'legend1',
                'legend2'
            ],
            legendData: [
                {
                    label: 'legend1',
                    visible: true
                },
                {
                    label: 'legend2',
                    visible: true
                }
            ],
            theme: {
                label: {
                    fontSize: 12
                },
                column: {
                    colors: ['red', 'orange']
                }
            },
            chartType: 'column'
        });
    });

    describe('_addSendingDatum()', function() {
        it('add sending data of column, index 1', function() {
            legendModel.data[1] = {
                chartType: 'column',
                index: 1
            };
            legendModel._addSendingDatum(1);

            expect(legendModel.checkedIndexesMap.column[1]).toBe(true);
        });
    });

    describe('_initCheckedIndexes()', function() {
        it('should reset checkedIndexes(used to legend checkbox', function() {
            spyOn(legendModel, 'updateCheckedLegendsWith');
            legendModel.labelInfos = [
                {
                    chartType: 'column',
                    index: 0
                },
                {
                    chartType: 'column',
                    index: 1
                }
            ];

            legendModel._initCheckedIndexes();

            expect(legendModel.checkedWholeIndexes).toEqual([true, true]);
            expect(legendModel.updateCheckedLegendsWith).toHaveBeenCalledWith([0, 1]);
        });
    });

    describe('_setThemeToLegendData()', function() {
        it('should set theme information and index to legend data', function() {
            var legendData = [{}, {}];
            var theme = {
                colors: ['red', 'blue'],
                borderColor: 'black'
            };

            legendModel._setThemeToLegendData(legendData, theme);

            expect(legendData[0]).toEqual({
                theme: {
                    color: 'red',
                    borderColor: 'black'
                },
                index: 0,
                seriesIndex: 0
            });
            expect(legendData[1]).toEqual({
                theme: {
                    color: 'blue',
                    borderColor: 'black'
                },
                index: 1,
                seriesIndex: 1
            });
        });

        it('should set increased index for checked indexes only. If not, it should set index to -1', function() {
            var legendData = [{}, {}];
            var theme = {
                colors: ['red', 'blue'],
                borderColor: 'black'
            };
            var checkedIndexes = [];

            checkedIndexes[1] = true;
            legendModel._setThemeToLegendData(legendData, theme, checkedIndexes);

            expect(legendData[0].seriesIndex).toEqual(-1);
            expect(legendData[1].seriesIndex).toEqual(0);
        });
    });

    describe('_setData()', function() {
        it('should make label data by labelInfos and theme, if seriesTypes is empty', function() {
            var legendData = [{}, {}];
            var expected = [{}, {}];
            var colorTheme = {
                colors: ['red', 'blue'],
                borderColor: 'black'
            };
            var actual;

            legendModel.legendData = legendData;
            legendModel.theme[legendModel.chartType] = colorTheme;

            legendModel._setData();

            actual = legendModel.data;
            legendModel._setThemeToLegendData(expected, colorTheme);

            expect(actual).toEqual(expected);
        });

        it('should make legend data by seriesTypes, and set index for each chartType', function() {
            var legendData = [{}, {}];
            var seriesTypes = ['column', 'line'];
            var labelMap = {
                column: ['legend1'],
                line: ['legend2']
            };
            var theme = {
                column: {
                    colors: ['red']
                },
                line: {
                    colors: ['blue']
                }
            };
            var expected;

            legendModel.legendData = legendData;
            legendModel.theme = theme;
            legendModel.seriesTypes = seriesTypes;
            legendModel.labels = labelMap;

            legendModel._setData();

            expected = [
                {
                    theme: {
                        color: 'red'
                    },
                    index: 0,
                    seriesIndex: 0
                },
                {
                    theme: {
                        color: 'blue'
                    },
                    index: 0,
                    seriesIndex: 0
                }
            ];

            expect(legendModel.data).toEqual(expected);
        });
    });

    describe('toggleSelectedIndex()', function() {
        it('should set index to selectedIndex, when selectedIndex is not same to index', function() {
            legendModel.toggleSelectedIndex(0);

            expect(legendModel.selectedIndex).toBe(0);
        });

        it('should return null if selectedIndex is same to index', function() {
            legendModel.selectedIndex = 0;
            legendModel.toggleSelectedIndex(0);

            expect(legendModel.selectedIndex).toBeNull();
        });
    });

    describe('getCheckedIndexes()', function() {
        it('return checked data of series of singleChart', function() {
            var checkedLegends = [true, true];
            var actual, expected;

            legendModel.checkedIndexesMap = {
                'pie': checkedLegends
            };
            legendModel.chartType = 'pie';

            actual = legendModel.getCheckedIndexes();
            expected = {
                'pie': [true, true]
            };

            expect(actual).toEqual(expected);
        });

        it('return checked data of series of comboChart', function() {
            var checkedIndexesMap = {
                'column': [true, true],
                'line': [true]
            };

            legendModel.checkedIndexesMap = checkedIndexesMap;
            legendModel.chartType = 'combo';

            expect(legendModel.getCheckedIndexes()).toEqual(checkedIndexesMap);
        });
    });

    describe('updateCheckedData()', function() {
        it('should update checkbox check data', function() {
            var checkedIndexes = [];
            var checkedIndexesMap = {
                column: [true],
                line: [true]
            };

            checkedIndexes[0] = true;
            checkedIndexes[2] = true;

            legendModel.data = [
                {
                    chartType: 'column',
                    index: 0
                },
                {
                    chartType: 'column',
                    index: 1
                },
                {
                    chartType: 'line',
                    index: 0
                }
            ];

            legendModel.updateCheckedLegendsWith([0, 2]);

            expect(legendModel.checkedIndexesMap).toEqual(checkedIndexesMap);
            expect(legendModel.checkedWholeIndexes).toEqual(checkedIndexes);
        });
    });
});
