'use strict';

var themeFactory = require('../../src/js/factories/themeFactory.js');

describe('test themeFactory', function() {
    themeFactory.register('newTheme', {
        plot: {
            lineColor: '#e5dbc4',
            background: '#f6f1e5'
        }
    });

    describe('get()', function() {
        it('등록된 테마를 요청했을 경우에는 테마를 반환합니다.', function () {
            var theme = themeFactory.get('newTheme');

            expect(theme.plot).toEqual({
                lineColor: '#e5dbc4',
                background: '#f6f1e5'
            });
        });

        it('등록되지 않은 테마를 요청했을 경우에는 예외를 발생시킵니다.', function () {
            expect(function() {
                themeFactory.get('newTheme1', 'line');
            }).toThrowError('Not exist newTheme1 theme.');
        });
    });

    describe('_initTheme()', function() {
        it('기본 테마 정보에 신규 테마 정보를 병합하여 반환합니다.', function () {
            var actual = themeFactory._initTheme({
                series: {
                    colors: ['gray']
                }
            });

            expect(actual.series.colors).toEqual(['gray', '#ac4142', '#d28445', '#f4bf75', '#90a959', '#75b5aa', '#6a9fb5', '#aa759f', '#8f5536']);
        });
    });

    describe('_filterChartTypes()', function() {
        it('chartType을 key로 하는 값들만 걸러낸 결과를 반환합니다.', function () {
            var result = themeFactory._filterChartTypes({
                column: {},
                line: {},
                colors: [],
                fontSize: 12
            }, ['colors', 'fontSize']);

            expect(result).toEqual({
                column: {},
                line: {}
            });
        });
    });

    describe('_concatColors()', function() {
        it('테마의 colors값 뒤에 인자로 넘기는 colors값을 붙인 후 결과를 반환합니다.', function () {
            var theme = {
                colors: ['gray'],
                singleColors: ['blue']
            };
            themeFactory._concatColors(theme, ['black', 'white']);

            expect(theme).toEqual({
                colors: ['gray', 'black', 'white'],
                singleColors: ['blue', 'black', 'white']
            });
        });
    });

    describe('_concatDefaultColors()', function() {
        it('단일 차트 테마의 series.colors 뒤에 인자로 넘기는 colors값을 붙인 후 결과를 반환합니다.', function () {
            var theme = {
                series: {
                    colors: ['gray']
                }
            };
            themeFactory._concatDefaultColors(theme, ['red', 'orange']);
            expect(theme).toEqual({
                series: {
                    colors: ['gray', 'red', 'orange']
                }
            });
        });

        it('combo 차트 테마의 series.colors값 뒤에 인자로 엄기는 colors값을 붙인 후 결과를 반환합니다.', function () {
            var theme = {
                series: {
                    column: {
                        colors: ['gray']
                    },
                    line: {
                        colors: ['blue']
                    }
                }
            };
            themeFactory._concatDefaultColors(theme, ['red', 'orange']);
            expect(theme).toEqual({
                series: {
                    column: {
                        colors: ['gray', 'red', 'orange']
                    },
                    line: {
                        colors: ['blue', 'red', 'orange']
                    }
                }
            });
        });
    });

    describe('_overwriteTheme()', function() {
        it('두번째 인자 테마에 첫번째 인자 테마 속성 중 key가 같은 속성을 덮어씌웁니다.', function () {
            var result = themeFactory._overwriteTheme(
                {
                    series: {
                        color: ['blue'],
                        borderColor: 'black'
                    }
                },
                {
                    series: {
                        color: ['red']
                    }
                }
            );

            expect(result).toEqual({
                series: {
                    color: ['blue']
                }
            });
        });
    });

    describe('_copyProperty()', function() {
        it('promName에 해당하는 속성을 fromTheme으로 부터 toTheme으로 복사합니다.', function () {
            var actual = themeFactory._copyProperty({
                propName: 'series',
                fromTheme: {
                    series: {
                        column: {
                            colors: ['blue', 'red', 'orange']
                        }
                    }
                },
                toTheme: {
                    series: {
                        colors: ['red', 'orange']
                    }
                },
                rejectionProps: ['colors'] // rejectionProps는 차트 이외의 속성을 필터링하는데 사용됩니다.
            });

            expect(actual.series.column.colors).toEqual(['blue', 'red', 'orange']);
        });
    });

    describe('_getInheritTargetThemeItems()', function() {
        it('단일차트 테마에서 폰트를 상속 받을 대상 테마 아이템을 얻습니다.', function() {
            var theme = {
                    title: {},
                    xAxis: {
                        title: {},
                        label: {}
                    },
                    yAxis: {
                        title: {},
                        label: {}
                    },
                    series: {
                        label: {}
                    },
                    legend: {
                        label: {}
                    }
                },
                result = themeFactory._getInheritTargetThemeItems(theme);

            expect(result).toEqual([
                theme.title,
                theme.xAxis.title,
                theme.xAxis.label,
                theme.legend.label,
                theme.yAxis.title,
                theme.yAxis.label,
                theme.series.label
            ]);
        });

        it('콤보차트 테마에서 폰트를 상속 받을 대상 테마 아이템을 얻습니다.', function() {
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
                        label: {}
                    },
                    legend: {
                        label: {}
                    }
                },
                result = themeFactory._getInheritTargetThemeItems(theme);

            expect(result).toEqual([
                theme.title,
                theme.xAxis.title,
                theme.xAxis.label,
                theme.legend.label,
                theme.yAxis.column.title,
                theme.yAxis.column.label,
                theme.yAxis.line.title,
                theme.yAxis.line.label,
                theme.series.label
            ]);
        });
    });

    describe('_inheritThemeFont', function() {
        it('폰트속성이 없는 테마 아이템에 기본 폰트를 상속합니다.', function() {
            var theme = {
                    chart: {
                        fontFamily: 'Verdana'
                    },
                    title: {},
                    xAxis: {
                        title: {}
                    }
                };
            themeFactory._inheritThemeFont(theme, [
                theme.title,
                theme.xAxis.title
            ]);

            expect(theme.title.fontFamily).toBe('Verdana');
            expect(theme.xAxis.title.fontFamily).toBe('Verdana');
        })
    });

    describe('_copyColorInfoToOther()', function() {
        it('series 테마의 color 속성들을 legend 테마로 복사합니다.', function () {
            var legendTheme = {};

            themeFactory._copyColorInfoToOther({
                colors: ['red', 'orange'],
                singleColors: ['red', 'orange'],
                borderColor: 'blue'
            }, legendTheme);

            expect(legendTheme).toEqual({
                colors: ['red', 'orange'],
                singleColors: ['red', 'orange'],
                borderColor: 'blue'
            });
        });

        it('3번째 인자로 colors를 넘기게 되면 인자로 넘긴 colors를 legend의 colors로 복사합니다..', function () {
            var legendTheme = {};

            themeFactory._copyColorInfoToOther({}, legendTheme, ['black', 'gray']);

            expect(legendTheme.colors).toEqual(['black', 'gray']);
        });
    });

    describe('_copyColorInfo()', function() {
        it('단일 차트에서 series color속성을 legend color 속성으로 복사합니다.', function() {
            var theme = {
                series: {
                    colors: ['red', 'orange']
                },
                legend: {},
                tooltip: {}
            };

            themeFactory._copyColorInfo(theme);

            expect(theme.legend.colors).toEqual(['red', 'orange']);
            expect(theme.tooltip.colors).toEqual(['red', 'orange']);
        });

        it('콤보 차트에서 series color속성을 legend color 속성으로 복사합니다.', function() {
            var theme = {
                series: {
                    column: {
                        colors: ['red', 'orange']
                    },
                    line: {
                        colors: ['blue', 'green']
                    }
                },
                legend: {},
                tooltip: {}
            };

            themeFactory._copyColorInfo(theme);

            expect(theme.legend).toEqual({
                column: {
                    colors: ['red', 'orange']
                },
                line: {
                    colors: ['blue', 'green']
                }
            });

            expect(theme.tooltip).toEqual({
                column: {
                    colors: ['red', 'orange']
                },
                line: {
                    colors: ['blue', 'green']
                }
            });
        });
    });
});
