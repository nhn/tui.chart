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

    it('get()', function() {
        var theme = themeFactory.get('newTheme');

        expect(theme.plot).toEqual({
            lineColor: '#e5dbc4',
            background: '#f6f1e5'
        });
    });

    it('get() not exist', function() {
        try {
            themeFactory.get('newTheme1', 'line');
        } catch(e) {
            expect(e.message).toEqual('Not exist newTheme1 theme.');
        }
    });

    it('_initTheme()', function() {
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

    it('_filterChartTypes()', function() {
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

    it('_concatColors()', function() {
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

    it('_concatDefaultColors() not exist series', function() {
        var theme = {};
        themeFactory._concatDefaultColors(theme, ['red', 'orange']);
        expect(theme).toBeDefined();
    });

    it('_concatDefaultColors() normal', function() {
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

    it('_concatDefaultColors() combo chart', function() {
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

    it('_extendTheme()', function() {
        var result = themeFactory._extendTheme(
            {
                series: {
                    color: ['blue'],
                    borderColor: 'black'
                },
                plot: {
                    lineColor: 'orange'
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

    it('_copyProperty()', function() {
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

    it('_copyColorInfoToLegend()', function() {
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

    it('_inheritThemeProperty() normal', function() {
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

    it('_inheritThemeProperty() combo chart', function() {
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
