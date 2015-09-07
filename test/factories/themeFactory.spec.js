'use strict';

var themeFactory = require('../../src/js/factories/themeFactory.js');
    //chartConst = require('../../src/js/const.js');

//require('../../src/js/registerThemes.js');

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
            var result = themeFactory._initTheme({
                series: {
                    colors: ['gray']
                }
            });

            expect(result).toEqual({
                chart: {background: '#ffffff', fontFamily: 'Verdana'},
                title: {fontSize: 18, fontFamily: '', color: '#000000'},
                yAxis: {
                    tickColor: '#000000',
                    title: {fontSize: 12, fontFamily: '', color: '#000000'},
                    label: {fontSize: 12, fontFamily: '', color: '#000000'}
                },
                xAxis: {
                    tickColor: '#000000',
                    title: {fontSize: 12, fontFamily: '', color: '#000000'},
                    label: {fontSize: 12, fontFamily: '', color: '#000000'}
                },
                plot: {lineColor: '#dddddd', background: '#ffffff'},
                series: {colors: ['gray', '#ac4142', '#d28445', '#f4bf75', '#90a959', '#75b5aa', '#6a9fb5', '#aa759f', '#8f5536']},
                legend: {label: {'fontSize': 12, fontFamily: '', color: '#000000'}}
            });
        });
    });

    describe('_filterChartTypes()', function() {
        it('chartType을 key로 하는 값들만 걸러낸 결과를 반환합니다.(두번째 인자인 rejectProps에 해당하는 속성을 걸러내면 chartTyep 속성만 남게됩니다.)', function () {
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

    describe('_extendTheme()', function() {
        it('두번째 인자 테마에 첫번째 인자 테마 속성 중 key가 같은 속성을 덮어씌웁니다.', function () {
            var result = themeFactory._extendTheme(
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
        it('promName에 해당하는 속성을 fromTheme으로 부터 toTheme으로 복사합니다. (rejectProps는 차트 이외의 속성을 필터링하는데 사용됩니다.)', function () {
            var result = themeFactory._copyProperty({
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
                rejectProps: ['colors']
            });

            expect(result).toEqual({
                series: {
                    column: {
                        colors: ['blue', 'red', 'orange']
                    }
                }
            });
        });
    });

    describe('_copyColorInfoToLegend()', function() {
        it('인자로 넘긴 color 속성들을 legend 테마로 복사합니다.', function () {
            var legendTheme = {};
            themeFactory._copyColorInfoToLegend({
                singleColors: ['red', 'orange'],
                borderColor: 'blue'
            }, legendTheme);
            expect(legendTheme).toEqual({
                singleColors: ['red', 'orange'],
                borderColor: 'blue'
            });
        });
    });

    describe('_inheritThemeProperty()', function() {
        it('단일 차트에서 chart.fontFamily를 다른 속성의 fontFamily로 복사하고 seires.colors속성은 legend.colors로 복사 합니다.', function () {
            var theme = {
                chart: {
                    fontFamily: 'Verdana'
                },
                title: {},
                yAxis: {
                    title: {},
                    label: {}
                },
                xAxis: {
                    title: {},
                    label: {}
                },
                legend: {
                    label: {}
                },
                series: {
                    colors: ['red', 'orange']
                }
            };

            themeFactory._inheritThemeProperty(theme);

            expect(theme).toEqual({
                chart: {
                    fontFamily: 'Verdana'
                },
                title: {
                    fontFamily: 'Verdana'
                },
                yAxis: {
                    title: {
                        fontFamily: 'Verdana'
                    },
                    label: {
                        fontFamily: 'Verdana'
                    }
                },
                xAxis: {
                    title: {
                        fontFamily: 'Verdana'
                    },
                    label: {
                        fontFamily: 'Verdana'
                    }
                },
                legend: {
                    label: {
                        fontFamily: 'Verdana'
                    },
                    colors: ['red', 'orange']
                },
                series: {
                    colors: ['red', 'orange']
                }
            });
        });

        it('Combo 차트에서 chart.fontFamily를 다른 속성의 fontFamily로 복사하고 seires.colors속성은 legend.colors로 복사 합니다.', function () {
            var theme = {
                chart: {
                    fontFamily: 'Verdana'
                },
                title: {},
                yAxis: {
                    column: {
                        title: {},
                        label: {}
                    }
                },
                xAxis: {
                    title: {},
                    label: {}
                },
                legend: {
                    label: {}
                },
                series: {
                    column: {
                        colors: ['red', 'orange']
                    }
                }
            };

            themeFactory._inheritThemeProperty(theme);

            expect(theme).toEqual({
                chart: {
                    fontFamily: 'Verdana'
                },
                title: {
                    fontFamily: 'Verdana'
                },
                yAxis: {
                    column: {
                        title: {
                            fontFamily: 'Verdana'
                        },
                        label: {
                            fontFamily: 'Verdana'
                        }
                    }
                },
                xAxis: {
                    title: {
                        fontFamily: 'Verdana'
                    },
                    label: {
                        fontFamily: 'Verdana'
                    }
                },
                legend: {
                    label: {
                        fontFamily: 'Verdana'
                    },
                    column: {
                        colors: ['red', 'orange']
                    }
                },
                series: {
                    column: {
                        colors: ['red', 'orange']
                    }
                }
            });
        });
    });
});
