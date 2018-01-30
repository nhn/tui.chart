/**
 * @fileoverview Test for BarTypeSeriesBase
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var raphael = require('raphael');
var BarTypeSeriesBase = require('../../../src/js/components/series/barTypeSeriesBase.js'),
    SeriesDataModel = require('../../../src/js/models/data/seriesDataModel'),
    SeriesGroup = require('../../../src/js/models/data/seriesGroup'),
    dom = require('../../../src/js/helpers/domHandler.js'),
    renderUtil = require('../../../src/js/helpers/renderUtil.js');

describe('BarTypeSeriesBase', function() {
    var series, dataProcessor;

    beforeAll(function() {
        // Rendered width, height is different according to browser
        // Spy these functions so that make same test environment
        spyOn(renderUtil, 'getRenderedLabelWidth').and.returnValue(40);
        spyOn(renderUtil, 'getRenderedLabelHeight').and.returnValue(20);
    });

    beforeEach(function() {
        series = new BarTypeSeriesBase();
        series.theme = {
            label: {
                fontFamily: 'Verdana',
                fontSize: 11
            }
        };

        dataProcessor = jasmine.createSpyObj('dataProcessor',
            ['getFormatFunctions', 'getFirstItemLabel', 'getFormattedValue']);

        dataProcessor.getFormatFunctions.and.returnValue([]);

        series.dataProcessor = dataProcessor;
        series.layout = {
            position: {
                top: 0,
                left: 0
            }
        };
        series._makeSeriesRenderingPosition = jasmine.createSpy('_makeSeriesRenderingPosition').and.returnValue({
            left: 0,
            top: 0
        });
        series._getSeriesDataModel = jasmine.createSpy('_getSeriesDataModel');
    });

    describe('_getBarWidthOptionSize()', function() {
        it('should return optionBarWidth, if optionBarWidth is less than (pointInterval * 2).', function() {
            expect(series._getBarWidthOptionSize(14, 27)).toBe(27);
        });

        it('should return (pointInterval * 2) if (optionBarWidth / 2) >= pointInterval', function() {
            expect(series._getBarWidthOptionSize(14, 50)).toBe(28);
        });
        it('should return 0 if optionBarWidth < 0.', function() {
            expect(series._getBarWidthOptionSize(14, -2)).toBe(0);
        });
    });

    describe('_calculateAdditionalPosition()', function() {
        it('should return 0 when no option.', function() {
            var actual = series._calculateAdditionalPosition(14);
            var expected = 0;

            expect(actual).toBe(expected);
        });

        it('should return (barSize / 2) + ((barSize - optionSize) * itemCount / 2) when optionsSize < barSize.', function() {
            var actual = series._calculateAdditionalPosition(14, 10, 4);
            var expected = 15;
            expect(actual).toBe(expected);
        });
    });

    describe('_makeBaseDataForMakingBound()', function() {
        it('return undefined when empty rawSeriesData.', function() {
            var baseGroupSize = 60;
            var baseBarSize = 60;
            var seriesDataModel = new SeriesDataModel();
            var actual;

            series._getSeriesDataModel.and.returnValue(seriesDataModel);

            seriesDataModel.groups = [
                new SeriesGroup([{
                    value: 10
                }, {
                    value: 20
                }])
            ];

            series.options = {};
            series.data = {
                limit: {
                    min: 0,
                    max: 80
                }
            };

            series._getLimitDistanceFromZeroPoint =
                jasmine.createSpy('_getLimitDistanceFromZeroPoint').and.returnValue({
                    toMin: 0
                });

            actual = series._makeBaseDataForMakingBound(baseGroupSize, baseBarSize);

            expect(actual).toBe();
        });
        it('should make baseData for calculating bounds of bar or column chart.', function() {
            var baseGroupSize = 60;
            var baseBarSize = 60;
            var seriesDataModel = new SeriesDataModel();
            var actual, expected;

            series._getSeriesDataModel.and.returnValue(seriesDataModel);

            seriesDataModel.rawSeriesData = [10, 20];
            seriesDataModel.groups = [
                new SeriesGroup([{
                    value: 10
                }, {
                    value: 20
                }])
            ];

            series.options = {};
            series.data = {
                limit: {
                    min: 0,
                    max: 80
                }
            };

            series._getLimitDistanceFromZeroPoint =
                jasmine.createSpy('_getLimitDistanceFromZeroPoint').and.returnValue({
                    toMin: 0
                });

            actual = series._makeBaseDataForMakingBound(baseGroupSize, baseBarSize);
            expected = {
                baseBarSize: 60,
                groupSize: 60,
                barSize: 16,
                pointInterval: 20,
                firstAdditionalPosition: 20,
                basePosition: 0
            };

            expect(actual).toEqual(expected);
        });
    });

    describe('_makeSumValues()', function() {
        it('should calculate sum of [10, 20, 30].', function() {
            var actual = series._makeSumValues([10, 20, 30]);
            expect(actual).toBe('60');
        });

        it('should format sum, if second argument is array of format function.', function() {
            var actual;

            dataProcessor.getFormatFunctions.and.returnValue([function(value) {
                return '00' + value;
            }]);

            actual = series._makeSumValues([10, 20, 30]);
            expect(actual).toBe('0060');
        });
    });

    describe('_renderSeriesLabel()', function() {
        it('should call _renderNormalSeriesLabel(), if there is not stack option.', function() {
            var elLabelArea = dom.create('div');
            var paper = raphael(elLabelArea, 100, 100);
            var seriesDataModel = new SeriesDataModel();

            spyOn(series, '_renderNormalSeriesLabel');

            series._getSeriesDataModel.and.returnValue(seriesDataModel);
            seriesDataModel.groups = [
                new SeriesGroup([{
                    value: -1.5,
                    label: '-1.5'
                }, {
                    value: -2.2,
                    label: '-2.2'
                }])
            ];

            series.options = {};
            series.seriesData = {
                groupBounds: [
                    [
                        {
                            end: {}
                        },
                        {
                            end: {}
                        }
                    ]
                ]
            };

            series._renderSeriesLabel(paper);

            expect(series._renderNormalSeriesLabel).toHaveBeenCalled();
        });

        it('should call _renderStackedSeriesLabel() if there is stack option.', function() {
            var elLabelArea = dom.create('div');
            var paper = raphael(elLabelArea, 100, 100);
            var seriesDataModel = new SeriesDataModel();

            spyOn(series, '_renderStackedSeriesLabel');

            series._getSeriesDataModel.and.returnValue(seriesDataModel);
            seriesDataModel.groups = [
                new SeriesGroup([{
                    value: -1.5,
                    label: '-1.5'
                }, {
                    value: -2.2,
                    label: '-2.2'
                }])
            ];

            series.options = {
                stackType: 'normal'
            };
            series.seriesData = {
                groupBounds: [
                    [
                        {
                            end: {}
                        },
                        {
                            end: {}
                        }
                    ]
                ]
            };

            series._renderSeriesLabel(paper);

            expect(series._renderStackedSeriesLabel).toHaveBeenCalled();
        });
    });
});
