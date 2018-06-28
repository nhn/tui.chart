/**
 * @fileoverview Test for BubbleChart.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

import BarChart from '../../src/js/charts/barChart';

describe('Test for BarChart', () => {
    let barInstance;

    describe('constructor()', () => {
        beforeEach(() => {
            spyOn(BarChart.prototype, '_createComponentManager').and.returnValue({
                register: jasmine.createSpy('register')
            });

            BarChart.prototype.options = {
                chartType: 'bar'
            };
            barInstance = new BarChart({
                categories: ['cate1', 'cate2', 'cate3'],
                series: {
                    'chartType': []
                }
            }, {
                title: {
                    fontSize: 14
                }
            }, {
                chartType: 'bar',
                yAxis: [{
                    title: 'Temperature (Celsius)'
                }, {
                    title: 'Age Group2'
                }]
            });
        });

        it('hasRightYAxis property must be set.', () => {
            expect(barInstance.hasRightYAxis).toEqual(jasmine.any(Boolean));
        });

        it('When the second yAxis option is present, the rightYaxis component must be registered.', () => {
            const allCallForRegistComponent = barInstance.componentManager.register.calls.allArgs();

            expect(allCallForRegistComponent.some(callArgs => callArgs[0] === 'rightYAxis')).toBe(true);
        });
    });
});
