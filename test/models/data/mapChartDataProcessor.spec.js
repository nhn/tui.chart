/**
 * @fileoverview Test for MapChartDataProcessor.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var MapChartDataProcessor = require('../../../src/js/models/data/mapChartDataProcessor.js');

describe('Test for MapChartDataProcessor', function() {
    var dataProcessor;

    beforeEach(function() {
        dataProcessor = new MapChartDataProcessor({}, '', {});
    });

    describe('_makeValueMap()', function() {
        it('valueMap을 생성합니다.', function() {
            var actual, expected;

            dataProcessor.rawData = {
                series: {
                    map: [{
                        code: 'KR',
                        data: 100
                    },
                    {
                        code: 'JP',
                        data: 50
                    }]
                }
            };

            actual = dataProcessor._makeValueMap();
            expected = {
                KR: {
                    value: 100,
                    label: '100'
                },
                JP: {
                    value: 50,
                    label: '50'
                }
            };

            expect(actual).toEqual(expected);
        });

        it('format options을 추가하여 valueMap을 생성합니다.', function() {
            var actual, expected;

            dataProcessor.rawData = {
                series: {
                    map: [{
                        code: 'KR',
                        data: 100
                    },
                    {
                        code: 'JP',
                        data: 50
                    }]
                }
            };
            dataProcessor.options = {
                chart: {
                    format: '0100'
                }
            };
            actual = dataProcessor._makeValueMap();
            expected = {
                KR: {
                    value: 100,
                    label: '0100'
                },
                JP: {
                    value: 50,
                    label: '0050'
                }
            };

            expect(actual).toEqual(expected);
        });

        it('name속성을 추가하여 valueMap을 생성합니다.', function() {
            var actual, expected;

            dataProcessor.rawData = {
                series: {
                    map: [{
                        code: 'KR',
                        name: 'South Korea',
                        data: 100
                    },
                    {
                        code: 'JP',
                        name: 'Japan',
                        data: 50
                    }]
                }
            };

            dataProcessor.options = {
                chart: {
                    format: '0100'
                }
            };

            actual = dataProcessor._makeValueMap();
            expected = {
                KR: {
                    name: 'South Korea',
                    value: 100,
                    label: '0100'
                },
                JP: {
                    name: 'Japan',
                    value: 50,
                    label: '0050'
                }
            };

            expect(actual).toEqual(expected);
        });
    });

    describe('getValues', function() {
        it('valueMap에서 value 속성만 뽑아서 반환합니다', function() {
            var actual, expected;

            dataProcessor.valueMap = {
                KR: {
                    value: 100
                },
                JP: {
                    value: 50
                }
            };
            actual = dataProcessor.getValues();
            expected = [100, 50];

            expect(actual).toEqual(expected);
        });
    });

    describe('addDataRatios()', function() {
        it('data의 ratio를 계산하여 추가합니다.', function() {
            var limit = {
                    min: 0,
                    max: 200
                },
                actual, krExpected, jpExpected;

            dataProcessor.valueMap = {
                KR: {
                    value: 100
                },
                JP: {
                    value: 50
                }
            };
            dataProcessor.addDataRatios(limit);
            actual = dataProcessor.getValueMap();
            krExpected = 0.5;
            jpExpected = 0.25;

            expect(actual.KR.ratio).toBe(krExpected);
            expect(actual.JP.ratio).toBe(jpExpected);
        });
    });
});
