/**
 * @fileoverview Test for MapChart.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

import MapChart from '../../src/js/charts/mapChart';
import ChartBase from '../../src/js/charts/chartBase';
import mapManager from '../../src/js/factories/mapManager';
import themeManager from '../../src/js/themes/themeManager';

describe('Test for MapChart', () => {
    let mapInstance;
    const rawData = {
        series: {
            map: [
                {
                    code: 'ZM',
                    data: 21.1481766
                },
                {
                    code: 'ZW',
                    data: 39.41024945
                }
            ]
        }
    };
    const theme = themeManager.get('default', 'map', rawData.series);
    const options = {
        chart: {
            width: 900,
            height: 700,
            title: 'Population density of World (per ㎢)',
            format: '0.00'
        },
        map: 'world',
        chartType: 'map',
        theme: 'default',
        legend: {
            align: 'bottom'
        }
    };

    beforeEach(() => {
        spyOn(mapManager, 'get').and.callFake(() => ([]));

        mapInstance = new MapChart(rawData, theme, options);

        spyOn(MapChart.prototype, 'setData').and.callThrough();
        spyOn(ChartBase.prototype, 'setData');
    });

    describe('setData()', () => {
        const mapData = [{
            bound: {},
            code: 'AE',
            label: '108.69',
            labelPosition: {left: 626.625, top: 393.59},
            name: 'United Arab Emirates',
            path: 'M619.87,393.72L620.37,393.57L6',
            ratio: 0.19761067854545455
        }];

        const newRawData = {
            series: [
                {
                    code: 'ZW',
                    data: 39.41024945
                }
            ]
        };

        it('should set mapModel.mapData to array', () => {
            mapInstance.componentManager.componentMap.mapSeries.mapModel.mapData = mapData;
            expect(mapInstance.componentManager.componentMap.mapSeries.mapModel.mapData).toEqual(mapData);
        });

        it('should set mapModel.mapData to null', () => {
            mapInstance.setData(newRawData);
            expect(mapInstance.componentManager.componentMap.mapSeries.mapModel.mapData).toBe(null);
        });

        it('should call base setData() function', () => {
            mapInstance.setData(newRawData);
            expect(ChartBase.prototype.setData).toHaveBeenCalled();
        });
    });
});
