/**
 * @fileoverview test series
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */
import Series from '../../../src/js/components/series/series';
import chartConst from '../../../src/js/const';
import dom from '../../../src/js/helpers/domHandler';
import renderUtil from '../../../src/js/helpers/renderUtil';
import snippet from 'tui-code-snippet';

describe('Series', () => {
    let series;

    beforeEach(() => {
        series = new Series({
            chartType: 'bar',
            tooltipPrefix: 'tooltip-prefix-',
            theme: {
                label: {
                    fontFamily: 'Verdana',
                    fontSize: 11,
                    fontWeight: 'normal'
                },
                colors: ['blue']
            },
            options: {},
            eventBus: new snippet.CustomEvents()
        });
    });

    describe('_getLimitDistanceFromZeroPoint()', () => {
        it('should calculate limit distance from zero, if 0 is between min, max value.', () => {
            const result = series._getLimitDistanceFromZeroPoint(100, {
                min: -20,
                max: 80
            });
            expect(result).toEqual({
                toMax: 80,
                toMin: 20
            });
        });

        it('should set {toMax: size, toMin: 0}, if min, max are positive number.', () => {
            const result = series._getLimitDistanceFromZeroPoint(100, {
                min: 20,
                max: 80
            });
            expect(result).toEqual({
                toMax: 100,
                toMin: 0
            });
        });

        it('should set {toMax: 0, toMin: 0}, if min, max are negative number.', () => {
            const result = series._getLimitDistanceFromZeroPoint(100, {
                min: -80,
                max: -20
            });
            expect(result).toEqual({
                toMax: 0,
                toMin: 0
            });
        });
    });

    describe('renderBounds()', () => {
        it('should render position of series area.', () => {
            const seriesContainer = dom.create('DIV');

            spyOn(renderUtil, 'isOldBrowser').and.returnValue(false);

            series._renderPosition(seriesContainer, {
                top: 20,
                left: 20
            });

            expect(seriesContainer.style.top).toBe('20px');
            expect(seriesContainer.style.left).toBe('20px');
        });
    });

    describe('_findLabelElement()', () => {
        it('should return target element if target is series label element.', () => {
            const elTarget = dom.create('DIV', chartConst.CLASS_NAME_SERIES_LABEL);
            const actual = series._findLabelElement(elTarget);
            const expected = elTarget;

            expect(actual).toBe(expected);
        });
    });
});
