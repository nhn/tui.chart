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
        it('등록된 테마를 요청했을 경우의 결과 확인', function () {
            var theme = themeFactory.get('newTheme');

            expect(theme.plot).toEqual({
                lineColor: '#e5dbc4',
                background: '#f6f1e5'
            });
        });

        it('등록되지 않은 테마를 요청했을 경우의 결과 확인', function () {
            try {
                themeFactory.get('newTheme1', 'line');
            } catch (e) {
                expect(e.message).toEqual('Not exist newTheme1 theme.');
            }
        });
    });

    describe('_initTheme()', function() {
        it('테마 초기화 결과 반환', function () {
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
        it('chartType에 해당하는 값들만 걸러낸 결과 반환', function () {
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
        it('기존 colors값에 인자로 넘기는 colors값이 정상적으로 붙여졌는지 결과 확인', function () {
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
        it('단일 차트에서 series.colors에 인자로 넘기는 colors값이 정상적으로 붙여졌는지 결과 확인', function () {
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

        it('combo 차트에서 인자로 넘기는 colors값이 정상적으로 붙여졌는지 결과 확인', function () {
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
        it('extend된 테마 반환', function () {
            var result = themeFactory._extendTheme(
                {
                    series: {
                        color: ['blue'],
                        borderColor: 'black'
                    }
                },
                {
                    series: {
                        color: ['red'],
                        borderColor: 'yellow'
                    }
                }
            );

            expect(result).toEqual({
                series: {
                    color: ['blue'],
                    borderColor: 'black'
                }
            });
        });
    });

    describe('_copyProperty()', function() {
        it('속성이 복사된 결과 반환', function () {
            var result = themeFactory._copyProperty({
                defaultTheme: {
                    series: {
                        colors: ['red', 'orange']
                    }
                },
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
        it('인자로 넘긴 color 속성들이 legend 테마로 복사가 잘 되었는지 확인', function () {
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
        it('단일 차트에서 테마 상속(fontFamily, colors)이 잘 이루어졌는지 확인', function () {
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

        it('Combo 차트에서 테마 상속(fontFamily, colors)이 잘 이루어졌는지 확인', function () {
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
