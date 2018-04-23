/**
 * @fileoverview Test for BarTypeSeriesBase
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

import raphael from 'raphael';
import BarTypeSeriesBase from '../../../src/js/components/series/barTypeSeriesBase.js';
import SeriesDataModel from '../../../src/js/models/data/seriesDataModel';
import SeriesGroup from '../../../src/js/models/data/seriesGroup';
import dom from '../../../src/js/helpers/domHandler.js';
import renderUtil from '../../../src/js/helpers/renderUtil.js';

describe('BarTypeSeriesBase', () => {
    let series, dataProcessor;

    beforeAll(() => {
        // Rendered width, height is different according to browser
        // Spy these functions so that make same test environment
        spyOn(renderUtil, 'getRenderedLabelWidth').and.returnValue(40);
        spyOn(renderUtil, 'getRenderedLabelHeight').and.returnValue(20);
    });

    beforeEach(() => {
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

    describe('_getBarWidthOptionSize()', () => {
        it('should return optionBarWidth, if optionBarWidth is less than (pointInterval * 2).', () => {
            expect(series._getBarWidthOptionSize(14, 27)).toBe(27);
        });

        it('should return (pointInterval * 2) if (optionBarWidth / 2) >= pointInterval', () => {
            expect(series._getBarWidthOptionSize(14, 50)).toBe(28);
        });
        it('should return 0 if optionBarWidth < 0.', () => {
            expect(series._getBarWidthOptionSize(14, -2)).toBe(0);
        });
    });

    describe('_calculateAdditionalPosition()', () => {
        it('should return 0 when no option.', () => {
            const actual = series._calculateAdditionalPosition(14);
            const expected = 0;

            expect(actual).toBe(expected);
        });

        it('should return (barSize / 2) + ((barSize - optionSize) * itemCount / 2) when optionsSize < barSize.', () => {
            const actual = series._calculateAdditionalPosition(14, 10, 4);
            const expected = 15;
            expect(actual).toBe(expected);
        });
    });

    describe('_makeBaseDataForMakingBound()', () => {
        it('return undefined when empty rawSeriesData.', () => {
            const baseGroupSize = 60;
            const baseBarSize = 60;
            const seriesDataModel = new SeriesDataModel();

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

            const actual = series._makeBaseDataForMakingBound(baseGroupSize, baseBarSize);

            expect(actual).toBe();
        });
        it('should make baseData for calculating bounds of bar or column chart.', () => {
            const baseGroupSize = 60;
            const baseBarSize = 60;
            const seriesDataModel = new SeriesDataModel();

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

            const actual = series._makeBaseDataForMakingBound(baseGroupSize, baseBarSize);
            const expected = {
                baseBarSize: 60,
                groupSize: 60,
                barSize: 17,
                pointInterval: 20,
                firstAdditionalPosition: 20,
                basePosition: 0,
                itemCount: 2
            };

            expect(actual).toEqual(expected);
        });
    });

    describe('_makeSumValues()', () => {
        it('should calculate sum of [10, 20, 30].', () => {
            const actual = series._makeSumValues([10, 20, 30]);
            expect(actual).toBe('60');
        });

        it('should format sum, if second argument is array of format function.', () => {
            dataProcessor.getFormatFunctions.and.returnValue([value => `00${value}`]);

            const actual = series._makeSumValues([10, 20, 30]);
            expect(actual).toBe('0060');
        });
    });

    describe('_renderSeriesLabel()', () => {
        it('should call _renderNormalSeriesLabel(), if there is not stack option.', () => {
            const elLabelArea = dom.create('div');
            const paper = raphael(elLabelArea, 100, 100);
            const seriesDataModel = new SeriesDataModel();

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

        it('should call _renderStackedSeriesLabel() if there is stack option.', () => {
            const elLabelArea = dom.create('div');
            const paper = raphael(elLabelArea, 100, 100);
            const seriesDataModel = new SeriesDataModel();

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
