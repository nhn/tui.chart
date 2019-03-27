/**
 * @fileoverview Test for bullet chart series
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */
import barSeriesFactory from '../../../src/js/components/series/bulletChartSeries';
import SeriesDataModel from '../../../src/js/models/data/seriesDataModel';
import SeriesGroup from '../../../src/js/models/data/seriesGroup';
import SeriesItem from '../../../src/js/models/data/seriesDataModelForBullet';
import chartConst from '../../../src/js/const';
import snippet from 'tui-code-snippet';

describe('BulletChartSeries', () => {
    let series, seriesDataModel, dataProcessor;

    beforeEach(() => {
        series = new barSeriesFactory.BulletChartSeries({
            chartType: 'bullet',
            theme: {},
            options: {},
            eventBus: new snippet.CustomEvents()
        });
        series.layout = {
            dimension: {
                width: 300,
                height: 400
            },
            position: {
                top: 50,
                left: 100
            }
        };

        seriesDataModel = new SeriesDataModel();
        dataProcessor = jasmine.createSpyObj('dataProcessor', ['getSeriesDataModel']);
        dataProcessor.getSeriesDataModel.and.returnValue(seriesDataModel);
        series.dataProcessor = dataProcessor;
        seriesDataModel.groups = [
            new SeriesGroup([
                new SeriesItem({
                    datum: 25,
                    type: chartConst.BULLET_TYPE_ACTUAL,
                    chartType: 'bullet'
                }),
                new SeriesItem({
                    datum: 1,
                    type: chartConst.BULLET_TYPE_MARKER,
                    chartType: 'bullet'
                }),
                new SeriesItem({
                    datum: [-1, 10],
                    type: chartConst.BULLET_TYPE_RANGE,
                    chartType: 'bullet'
                })
            ]),
            new SeriesGroup([
                new SeriesItem({
                    datum: 11,
                    type: chartConst.BULLET_TYPE_ACTUAL,
                    chartType: 'bullet'
                })
            ])
        ];
    });

    describe('_makeBaseDataForMakingBound()', () => {
        it('should set category axis to yAxis, when it is a horizontal chart', () => {
            series.isVertical = false;
            const baseData = series._makeBaseDataForMakingBound();

            expect(baseData.categoryAxisTop).toBe(50);
            expect(baseData.categoryAxisLeft).toBe(100);
            expect(baseData.categoryAxisWidth).toBe(400);
            expect(baseData.valueAxisWidth).toBe(300);
            expect(baseData.itemWidth).toBe(200);
        });

        it('should set category axis to xAxis, when it is a vertical chart', () => {
            series.isVertical = true;
            const baseData = series._makeBaseDataForMakingBound();

            expect(baseData.categoryAxisTop).toBe(450);
            expect(baseData.categoryAxisLeft).toBe(100);
            expect(baseData.categoryAxisWidth).toBe(300);
            expect(baseData.valueAxisWidth).toBe(400);
            expect(baseData.itemWidth).toBe(150);
        });
    });

    describe('_makeBounds()', () => {
        let baseData, iterationData, item;

        beforeEach(() => {
            baseData = {
                categoryAxisTop: 50,
                categoryAxisLeft: 30,
                itemWidth: 15
            };
            spyOn(series, '_makeBaseDataForMakingBound').and.returnValue(baseData);
            spyOn(series, '_makeBulletChartBound');
        });

        it('should make bounds data', () => {
            const bounds = series._makeBounds(baseData, iterationData, item);

            expect(bounds.length).toBe(2);
            expect(bounds[0].length).toBe(3);
            expect(bounds[1].length).toBe(1);
        });
    });

    describe('_updateIterationData', () => {
        let iterationData, itemWidth;

        beforeEach(() => {
            iterationData = {
                top: 50,
                left: 30
            };
            itemWidth = 15;
        });

        it('should move iterationData\'s top position by itemWidth, when it is a horizontal chart', () => {
            series.isVertical = true;
            series._updateIterationData(iterationData, itemWidth);

            expect(iterationData.top).toBe(50);
            expect(iterationData.left).toBe(45);
        });

        it('should move iterationData\'s left position by itemWidth, when it is a virtical chart', () => {
            series.isVertical = false;
            series._updateIterationData(iterationData, itemWidth);

            expect(iterationData.top).toBe(65);
            expect(iterationData.left).toBe(30);
        });
    });

    describe('_makeBarBound()', () => {
        let model, widthRatio, baseData, iterationData, valueAxisWidth;

        beforeEach(() => {
            model = {
                startValue: 0, startLabel: '0', startRatio: 0.16666,
                endValue: 25, endLabel: '25', endRatio: 0.83333,
                ratioDistance: 0.67777
            };
            widthRatio = 0.5;
            valueAxisWidth = 400;
            baseData = {
                categoryAxisTop: 50,
                categoryAxisLeft: 30,
                valueAxisWidth,
                itemWidth: 15
            };
            iterationData = {
                top: baseData.categoryAxisTop,
                left: baseData.categoryAxisLeft
            };
        });

        it('should create a horizontal bound, when it is a horizontal chart', () => {
            series.isVertical = false;
            const barBound = series._makeBarBound(model, widthRatio, baseData, iterationData);

            expect(barBound.top).toBe(53.75);
            expect(barBound.left).toBe(92.22399999999999);
            expect(barBound.width).toBe(271.108);
            expect(barBound.height).toBe(7.5);
        });

        it('should create a virtical bound, when it is vertical chart', () => {
            series.isVertical = true;
            iterationData.top += valueAxisWidth;
            const barBound = series._makeBarBound(model, widthRatio, baseData, iterationData);

            expect(barBound.top).toBe(116.668);
            expect(barBound.left).toBe(33.75);
            expect(barBound.width).toBe(7.5);
            expect(barBound.height).toBe(271.108);
        });

        it('should set bar width, according to widthRatio', () => {
            series.isVertical = true;
            iterationData.top += valueAxisWidth;
            let barBound = series._makeBarBound(model, widthRatio, baseData, iterationData);

            expect(barBound.width).toBe(7.5);
            expect(barBound.width).toBe(7.5);

            series.isVertical = false;
            barBound = series._makeBarBound(model, widthRatio, baseData, iterationData);

            expect(barBound.height).toBe(7.5);
            expect(barBound.height).toBe(7.5);
        });

        it('should set bar height, according to ratioDistance', () => {
            series.isVertical = true;
            iterationData.top += valueAxisWidth;
            let barBound = series._makeBarBound(model, widthRatio, baseData, iterationData);

            expect(barBound.height).toBe(271.108);

            series.isVertical = false;
            iterationData.top -= valueAxisWidth;
            barBound = series._makeBarBound(model, widthRatio, baseData, iterationData);

            expect(barBound.width).toBe(271.108);
        });
    });

    describe('_makeLineBound', () => {
        let model, widthRatio, baseData, iterationData;

        beforeEach(() => {
            model = {endRatio: 0.16666};
            widthRatio = 0.5;
            baseData = {
                categoryAxisTop: 50,
                categoryAxisLeft: 30,
                valueAxisWidth: 400,
                itemWidth: 15
            };
            iterationData = {
                top: baseData.categoryAxisTop,
                left: baseData.categoryAxisLeft
            };
        });

        it('should create a horizontal bound, when it is a horizontal chart', () => {
            series.isVertical = false;
            const lineBound = series._makeLineBound(model, widthRatio, baseData, iterationData);

            expect(lineBound.top).toBe(53.75);
            expect(lineBound.left).toBe(96.664);
            expect(lineBound.width).toBe(3);
            expect(lineBound.height).toBe(lineBound.length);
        });

        it('should create a virtical bound, when it is verical chart', () => {
            series.isVertical = true;
            const lineBound = series._makeLineBound(model, widthRatio, baseData, iterationData);

            expect(lineBound.top).toBe(-16.664);
            expect(lineBound.left).toBe(33.75);
            expect(lineBound.width).toBe(lineBound.length);
            expect(lineBound.height).toBe(3);
        });

        it('should set bar width, according to widthRatio', () => {
            series.isVertical = true;
            const lineBound = series._makeLineBound(model, widthRatio, baseData, iterationData);

            expect(lineBound.length).toBe(7.5);
        });
    });
});
