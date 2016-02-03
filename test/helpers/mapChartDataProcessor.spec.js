/**
 * @fileoverview Test for MapChartDataProcessor.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var MapChartDataProcessor = require('../../src/js/helpers/mapChartDataProcessor.js');

describe('test MapChartDataProcessor', function() {
    var dataProcessor;

    beforeEach(function() {
        dataProcessor = new MapChartDataProcessor();
    });

    describe('_makeValueMap()', function() {
        it('valueMap을 생성합니다.', function() {
            var rawSeriesData = [
                    {
                        code: 'KR',
                        data: 100
                    },
                    {
                        code: 'JP',
                        data: 50
                    }
                ],
                actual = dataProcessor._makeValueMap(rawSeriesData, {}),
                expected = {
                    KR: {
                        value: 100,
                        formattedValue: 100
                    },
                    JP: {
                        value: 50,
                        formattedValue: 50
                    }
                };

            expect(actual).toEqual(expected);
        });

        it('format options을 추가하여 valueMap을 생성합니다.', function() {
            var rawSeriesData = [
                    {
                        code: 'KR',
                        data: 100
                    },
                    {
                        code: 'JP',
                        data: 50
                    }
                ],
                options = {
                    chart: {
                        format: '0100'
                    }
                },
                actual = dataProcessor._makeValueMap(rawSeriesData, options),
                expected = {
                    KR: {
                        value: 100,
                        formattedValue: '0100'
                    },
                    JP: {
                        value: 50,
                        formattedValue: '0050'
                    }
                };

            expect(actual).toEqual(expected);
        });

        it('name속성을 추가하여 valueMap을 생성합니다.', function() {
            var rawSeriesData = [
                    {
                        code: 'KR',
                        name: 'South Korea',
                        data: 100
                    },
                    {
                        code: 'JP',
                        name: 'Japan',
                        data: 50
                    }
                ],
                options = {
                    chart: {
                        format: '0100'
                    }
                },
                actual = dataProcessor._makeValueMap(rawSeriesData, options),
                expected = {
                    KR: {
                        name: 'South Korea',
                        value: 100,
                        formattedValue: '0100'
                    },
                    JP: {
                        name: 'Japan',
                        value: 50,
                        formattedValue: '0050'
                    }
                };

            expect(actual).toEqual(expected);
        });
    });

    describe('getValues', function() {
        it('valueMap에서 value 속성만 뽑아서 반환합니다', function() {
            var actual, expected;

            dataProcessor.data = {
                valueMap: {
                    KR: {
                        value: 100
                    },
                    JP: {
                        value: 50
                    }
                }
            };

            actual = dataProcessor.getValues();
            expected = [100, 50];

            expect(actual).toEqual(expected);
        });
    });

    describe('registerPercentValues()', function() {
        it('percent values를 등록합니다.', function() {
            var limit = {
                    min: 0,
                    max: 200
                },
                actual, krExpected, jpExpected;

            dataProcessor.data = {
                valueMap: {
                    KR: {
                        value: 100
                    },
                    JP: {
                        value: 50
                    }
                }
            };
            dataProcessor.registerPercentValues(limit);
            actual = dataProcessor.getValueMap();
            krExpected = 0.5;
            jpExpected = 0.25;

            expect(actual.KR.percentValue).toBe(krExpected);
            expect(actual.JP.percentValue).toBe(jpExpected);
        });
    });
});
