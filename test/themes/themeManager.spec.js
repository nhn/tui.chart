/**
 * @fileoverview Test for themeManager.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var themeManager = require('../../src/js/themes/themeManager');
var chartConst = require('../../src/js/const');
var defaultTheme = require('../../src/js/themes/defaultTheme');

describe('Test for themeManager', function() {
    describe('_pickSeriesNames()', function() {
        it('pick series names from raw series data, when single chart', function() {
            var chartType = chartConst.CHART_TYPE_BAR;
            var actual = themeManager._pickSeriesNames(chartType);

            expect(actual).toEqual([chartConst.CHART_TYPE_BAR]);
        });
    });

    describe('_overwriteTheme()', function() {
        it('overwrite theme to toTheme from fromTheme', function() {
            var fromTheme = {
                series: {
                    color: ['blue'],
                    borderColor: 'black'
                }
            };
            var toTheme = {
                series: {
                    color: ['red']
                }
            };
            var result = themeManager._overwriteTheme(fromTheme, toTheme);

            expect(result).toEqual({
                series: {
                    color: ['blue']
                }
            });
        });
    });

    describe('_pickValidTheme()', function() {
        it('pick valid theme properties, when series component', function() {
            var theme = {
                column: {
                    label: {}
                },
                label: {},
                colors: [],
                borderColor: ''
            };
            var componentType = 'series';
            var actual = themeManager._pickValidTheme(theme, componentType);

            expect(actual).toEqual({
                label: {},
                colors: [],
                borderColor: ''
            });
        });

        it('pick valid theme properties, when yAxis component', function() {
            var theme = {
                column: {
                    label: {}
                },
                label: {},
                title: {},
                tickColor: ''
            };
            var componentType = 'yAxis';
            var actual = themeManager._pickValidTheme(theme, componentType);

            expect(actual).toEqual({
                label: {},
                title: {},
                tickColor: ''
            });
        });
    });

    describe('_createComponentThemeWithSeriesName()', function() {
        it('create component theme with series name, when fromTheme map has key of series name', function() {
            var seriesNames = [chartConst.CHART_TYPE_COLUMN];
            var fromTheme = {
                column: {
                    label: {
                        fontSize: 15
                    },
                    title: {
                        fontSize: 18
                    }
                }
            };
            var toTheme = {};
            var componentType = 'yAxis';
            var actual = themeManager._createComponentThemeWithSeriesName(
                seriesNames, fromTheme, toTheme, componentType
            );
            var baseTheme = JSON.parse(JSON.stringify(defaultTheme[componentType]));
            var expected = {
                column: themeManager._overwriteTheme(fromTheme.column, baseTheme)
            };

            expect(actual).toEqual(expected);
        });

        it('create component theme with series name, when fromTheme map has not key of series name', function() {
            var seriesNames = [chartConst.CHART_TYPE_COLUMN];
            var fromTheme = {};
            var toTheme = {
                label: {
                    fontSize: 15
                },
                title: {
                    fontSize: 18
                }
            };
            var componentType = 'yAxis';
            var actual = themeManager._createComponentThemeWithSeriesName(
                seriesNames, fromTheme, toTheme, componentType
            );
            var expected = {
                column: toTheme
            };

            expect(actual).toEqual(expected);
        });
    });

    describe('_setColorsTheme()', function() {
        it('set colors theme', function() {
            var theme = {};
            var rawTheme = {
                colors: ['gray'],
                singleColors: ['blue']
            };
            var baseColors = ['black', 'white'];

            themeManager._setColorsTheme(theme, rawTheme, baseColors);

            expect(theme).toEqual({
                colors: ['gray', 'black', 'white'],
                singleColors: ['blue', 'black', 'white']
            });
        });
    });

    describe('_setSeriesColors()', function() {
        it('set series colors theme, when single series', function() {
            var seriesNames = [chartConst.CHART_TYPE_COLUMN];
            var seriesThemeMap = {
                column: {}
            };
            var rawSeriesThemeMap = {
                colors: ['gray']
            };

            themeManager._setSeriesColors(seriesNames, seriesThemeMap, rawSeriesThemeMap);

            expect(seriesThemeMap.column).toEqual({
                colors: ['gray', '#ac4142', '#d28445', '#f4bf75', '#90a959', '#75b5aa', '#6a9fb5', '#aa759f', '#8f5536']
            });
        });

        it('set series colors theme, when single series and singleColors', function() {
            var seriesNames = [chartConst.CHART_TYPE_COLUMN];
            var seriesThemeMap = {
                column: {}
            };
            var rawSeriesThemeMap = {
                singleColors: ['gray']
            };

            themeManager._setSeriesColors(seriesNames, seriesThemeMap, rawSeriesThemeMap);

            expect(seriesThemeMap).toEqual({
                column: {
                    colors: ['#ac4142', '#d28445', '#f4bf75', '#90a959', '#75b5aa', '#6a9fb5', '#aa759f', '#8f5536'],
                    singleColors: [
                        'gray', '#ac4142', '#d28445', '#f4bf75', '#90a959', '#75b5aa', '#6a9fb5', '#aa759f', '#8f5536'
                    ]
                }
            });
        });

        it('set series colors theme, when combo series', function() {
            var seriesNames = [chartConst.CHART_TYPE_COLUMN, chartConst.CHART_TYPE_LINE];
            var seriesThemeMap = {
                column: {},
                line: {}
            };
            var rawSeriesThemeMap = {
                column: {
                    colors: ['red', 'green', 'blue']
                },
                line: {
                    colors: ['white', 'block']
                }
            };
            var rawSeriesData = {
                column: [{}, {}, {}, {}, {}],
                line: [{}, {}, {}]
            };

            themeManager._setSeriesColors(seriesNames, seriesThemeMap, rawSeriesThemeMap, rawSeriesData);

            expect(seriesThemeMap).toEqual({
                column: {
                    colors: ['red', 'green', 'blue', '#ac4142', '#d28445']
                },
                line: {
                    colors: ['white', 'block', '#f4bf75']
                }
            });
        });
    });

    describe('_initTheme()', function() {
        it('init theme', function() {
            var themeName = 'newTheme';
            var rawTheme = {
                series: {
                    colors: ['gray']
                }
            };
            var seriesNames = [chartConst.CHART_TYPE_COLUMN];
            var actual = themeManager._initTheme(themeName, rawTheme, seriesNames);

            expect(actual.series.column.colors).toEqual(
                ['gray', '#ac4142', '#d28445', '#f4bf75', '#90a959', '#75b5aa', '#6a9fb5', '#aa759f', '#8f5536']
            );
        });

        it('init theme, when combo chart', function() {
            var themeName = 'newTheme';
            var rawTheme = {
                series: {
                    column: {
                        colors: ['red', 'green', 'blue']
                    },
                    line: {
                        colors: ['white', 'block']
                    }
                }
            };
            var seriesNames = [chartConst.CHART_TYPE_COLUMN, chartConst.CHART_TYPE_LINE];
            var rawSeriesData = {
                column: [{}, {}, {}, {}, {}],
                line: [{}, {}, {}]
            };
            var actual = themeManager._initTheme(themeName, rawTheme, seriesNames, rawSeriesData);

            expect(actual.series.column.colors).toEqual(['red', 'green', 'blue', '#ac4142', '#d28445']);
            expect(actual.series.line.colors).toEqual(['white', 'block', '#f4bf75']);
        });
    });

    describe('_createInheritTargetThemes()', function() {
        it('create target theme for font inherit, when single chart', function() {
            var theme = {
                title: {},
                xAxis: {
                    title: {},
                    label: {}
                },
                yAxis: {
                    column: {
                        title: {},
                        label: {}
                    }
                },
                series: {
                    column: {
                        label: {}
                    }
                },
                legend: {
                    label: {}
                }
            };
            var actual = themeManager._createInheritTargetThemes(theme);

            expect(actual).toEqual([
                theme.title,
                theme.xAxis.title,
                theme.xAxis.label,
                theme.legend.label,
                theme.yAxis.column.title,
                theme.yAxis.column.label,
                theme.series.column.label
            ]);
        });

        it('create target theme for font inherit, when combo chart', function() {
            var theme = {
                title: {},
                xAxis: {
                    title: {},
                    label: {}
                },
                yAxis: {
                    column: {
                        title: {},
                        label: {}
                    },
                    line: {
                        title: {},
                        label: {}
                    }
                },
                series: {
                    column: {
                        label: {}
                    },
                    line: {
                        label: {}
                    }
                },
                legend: {
                    label: {}
                }
            };
            var actual = themeManager._createInheritTargetThemes(theme);

            expect(actual).toEqual([
                theme.title,
                theme.xAxis.title,
                theme.xAxis.label,
                theme.legend.label,
                theme.yAxis.column.title,
                theme.yAxis.column.label,
                theme.yAxis.line.title,
                theme.yAxis.line.label,
                theme.series.column.label,
                theme.series.line.label
            ]);
        });
    });

    describe('_inheritThemeFont', function() {
        it('inherit theme font', function() {
            var theme = {
                chart: {
                    fontFamily: 'Verdana'
                },
                title: {},
                xAxis: {
                    title: {},
                    label: {}
                },
                legend: {
                    label: {}
                }
            };
            themeManager._inheritThemeFont(theme, [
                theme.title,
                theme.xAxis.title
            ]);

            expect(theme.title.fontFamily).toBe('Verdana');
            expect(theme.xAxis.title.fontFamily).toBe('Verdana');
        });
    });

    describe('_copySeriesColorTheme()', function() {
        it('copy color theme to otherTheme from seriesTheme', function() {
            var seriesTheme = {
                colors: ['red', 'orange'],
                singleColors: ['red', 'orange'],
                borderColor: 'blue',
                selectionColor: 'yellow'
            };
            var otherTheme = {};

            themeManager._copySeriesColorTheme(seriesTheme, otherTheme, chartConst.CHART_TYPE_COLUMN);

            expect(otherTheme).toEqual({
                column: {
                    colors: ['red', 'orange'],
                    singleColors: ['red', 'orange'],
                    borderColor: 'blue',
                    selectionColor: 'yellow'
                }
            });
        });
    });

    describe('_copySeriesColorThemeToOther()', function() {
        it('copy series color theme to other components', function() {
            var theme = {
                series: {
                    column: {
                        colors: ['red', 'orange'],
                        singleColors: ['red', 'orange'],
                        borderColor: 'blue',
                        selectionColor: 'yellow'
                    }
                },
                legend: {},
                tooltip: {}
            };

            themeManager._copySeriesColorThemeToOther(theme);

            expect(theme.legend).toEqual({
                column: {
                    colors: ['red', 'orange'],
                    singleColors: ['red', 'orange'],
                    borderColor: 'blue',
                    selectionColor: 'yellow'
                }
            });

            expect(theme.tooltip).toEqual({
                column: {
                    colors: ['red', 'orange'],
                    singleColors: ['red', 'orange'],
                    borderColor: 'blue',
                    selectionColor: 'yellow'
                }
            });
        });
    });

    describe('get()', function() {
        beforeEach(function() {
            themeManager.register('newTheme', {
                plot: {
                    lineColor: '#e5dbc4',
                    background: '#f6f1e5'
                }
            });
        });

        it('get theme', function() {
            var themeName = 'newTheme';
            var chartType = chartConst.CHART_TYPE_COLUMN;
            var rawSeriesData = [{}, {}];
            var theme = themeManager.get(themeName, chartType, rawSeriesData);

            expect(theme.plot).toEqual({
                lineColor: '#e5dbc4',
                background: '#f6f1e5'
            });
        });

        it('get theme, when not exist theme', function() {
            expect(function() {
                themeManager.get('newTheme1');
            }).toThrowError('Not exist newTheme1 theme.');
        });
    });
});
