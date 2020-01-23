/**
 * @fileoverview Test for ChartBase.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */

import snippet from 'tui-code-snippet';
import ChartBase from '../../src/js/charts/chartBase';
import DataProcessor from '../../src/js/models/data/dataProcessor';
import themeManager from '../../src/js/themes/themeManager';

describe('Test for ChartBase', () => {
  let chartBase, chartBaseOption, componentManager, boundsModel;

  beforeAll(() => {
    componentManager = jasmine.createSpyObj('componentManager', [
      'where',
      'presetForChangeData',
      'presetBeforeRerender',
      'presetAnimationConfig'
    ]);
    boundsModel = jasmine.createSpyObj('boundsModel', ['initBoundsData', 'getDimension']);
  });

  beforeEach(() => {
    chartBaseOption = {
      chartType: 'chartType',
      rawData: {
        categories: ['cate1', 'cate2', 'cate3'],
        series: {
          chartType: [
            {
              name: 'Legend1',
              data: [20, 30, 50]
            },
            {
              name: 'Legend2',
              data: [40, 40, 60]
            },
            {
              name: 'Legend3',
              data: [60, 50, 10]
            },
            {
              name: 'Legend4',
              data: [80, 10, 70]
            }
          ]
        }
      },
      theme: {
        title: {
          fontSize: 14
        }
      },
      options: {
        chart: {
          title: 'Chart Title'
        }
      }
    };

    chartBase = new ChartBase(chartBaseOption);
    chartBase.componentManager = componentManager;
    chartBase.boundsModel = boundsModel;
  });

  describe('_setOffsetProperty()', () => {
    it('set offset property', () => {
      const options = {
        offsetX: 10
      };

      chartBase._setOffsetProperty(options, 'offsetX', 'x');

      expect(options).toEqual({
        offset: {
          x: 10
        }
      });
    });

    it('if not included fromProperty in option, this function is not working', () => {
      const options = {
        offsetY: 10
      };

      chartBase._setOffsetProperty(options, 'offsetX', 'x');

      expect(options).toEqual({
        offsetY: 10
      });
    });
  });

  describe('initializeOffset', () => {
    it('initialize offset', () => {
      const options = {
        offsetX: 10,
        offsetY: 20
      };

      chartBase._initializeOffset(options);

      expect(options).toEqual({
        offset: {
          x: 10,
          y: 20
        }
      });
    });

    it('initialize offset, when has only offsetX property', () => {
      const options = {
        offsetX: 10
      };

      chartBase._initializeOffset(options);

      expect(options).toEqual({
        offset: {
          x: 10
        }
      });
    });
  });

  describe('_initializeTitleOptions()', () => {
    it('initialize title options, when options.title is string type', () => {
      const options = {
        title: 'Title'
      };

      chartBase._initializeTitleOptions(options);

      expect(options).toEqual({
        title: {
          text: 'Title'
        }
      });
    });

    it('initialize title options, when has offsetX or offsetY property', () => {
      const options = {
        title: {
          text: 'Title',
          offsetX: 10,
          offsetY: 20
        }
      };

      chartBase._initializeTitleOptions(options);

      expect(options).toEqual({
        title: {
          text: 'Title',
          offset: {
            x: 10,
            y: 20
          }
        }
      });
    });

    it('initialize title options, when has two options', () => {
      const optionsSet = [
        {
          title: {
            text: 'Title1',
            offsetX: 10,
            offsetY: 20
          }
        },
        {
          title: {
            text: 'Title2',
            offsetX: 30,
            offsetY: 40
          }
        }
      ];

      chartBase._initializeTitleOptions(optionsSet);

      expect(optionsSet).toEqual([
        {
          title: {
            text: 'Title1',
            offset: {
              x: 10,
              y: 20
            }
          }
        },
        {
          title: {
            text: 'Title2',
            offset: {
              x: 30,
              y: 40
            }
          }
        }
      ]);
    });
  });

  describe('_initializeTooltipOptions()', () => {
    it('initialize tooltip options. when had grouped property', () => {
      const options = {
        grouped: true
      };

      chartBase._initializeTooltipOptions(options);

      expect(options).toEqual({
        grouped: true
      });
    });

    it('initialize tooltip options, when has offsetX or offsetY property', () => {
      const options = {
        offsetX: 10,
        offsetY: 20
      };

      chartBase._initializeTooltipOptions(options);

      expect(options).toEqual({
        grouped: false,
        offset: {
          x: 10,
          y: 20
        }
      });
    });

    it('(deprecated) initialize tooltip options, when has both (offsetX or offsetY) and position', () => {
      const options = {
        offsetX: 50,
        position: {
          left: 20,
          top: 30
        }
      };

      chartBase._initializeTooltipOptions(options);

      expect(options).toEqual({
        grouped: false,
        offset: {
          x: 50
        }
      });
    });
  });

  describe('_makeProcessedData()', () => {
    it('should create easy-to-use data from user data', () => {
      const actual = chartBase._createDataProcessor({
        DataProcessor,
        rawData: {
          categories: ['a', 'b', 'c']
        },
        options: {}
      });
      expect(actual instanceof DataProcessor).toBe(true);
      expect(actual.originalRawData).toEqual({
        categories: ['a', 'b', 'c']
      });
    });
  });

  describe('_updateChartDimension()', () => {
    it('should update chart width and height using passed dimension', () => {
      chartBase.options = {
        chart: {}
      };
      chartBase._updateChartDimension({
        width: 200,
        height: 100
      });
      expect(chartBase.options.chart.width).toBe(200);
      expect(chartBase.options.chart.height).toBe(100);
    });
  });

  describe('setData()', () => {
    const rawData = {
      categories: ['cate1', 'cate2', 'cate3'],
      series: {
        chartType: [
          { name: 'Legend1', data: [20, 30, 50] },
          { name: 'Legend2', data: [40, 40, 60] }
        ]
      }
    };
    beforeEach(() => {
      chartBase.options = {
        chartType: 'line',
        theme: 'default'
      };

      spyOn(themeManager, 'get');
      spyOn(chartBase, 'protectedRerender');
    });

    it('dataProcessor must reflect rawData.', () => {
      spyOn(chartBase.dataProcessor, 'initData');

      chartBase.setData(rawData);

      expect(chartBase.dataProcessor.initData).toHaveBeenCalled();
    });

    it('componentManager should be running presetForChangeData, presetBeforeRerender and presetAnimationConfig.', () => {
      chartBase.setData(rawData);

      expect(componentManager.presetForChangeData).toHaveBeenCalled();
      expect(componentManager.presetBeforeRerender).toHaveBeenCalled();
      expect(componentManager.presetAnimationConfig).toHaveBeenCalled();
    });

    it('protectedRerender () must be executed.', () => {
      chartBase.setData(rawData);

      expect(chartBase.protectedRerender).toHaveBeenCalled();
    });
  });

  describe('resize()', () => {
    it('should not update dimension, when resize is called without dimension', () => {
      spyOn(chartBase, 'readyForRender');

      chartBase.resize();

      expect(chartBase.readyForRender).not.toHaveBeenCalled();
    });

    it('should update dimension, when resize is called with dimension', () => {
      spyOn(chartBase, '_updateChartDimension').and.returnValue(false);

      chartBase.resize({
        width: 400,
        height: 300
      });

      expect(chartBase._updateChartDimension).toHaveBeenCalledWith({
        width: 400,
        height: 300
      });
    });

    it('should not update dimension, when dimension infomation does not change', () => {
      spyOn(chartBase, '_updateChartDimension').and.returnValue(false);
      spyOn(chartBase, 'readyForRender');

      chartBase.resize({
        width: 400,
        height: 300
      });

      expect(chartBase.readyForRender).not.toHaveBeenCalled();
    });
  });

  describe('_findSeriesIndexByLabel()', () => {
    it('should return index, if found same label', () => {
      const actual = chartBase._findSeriesIndexByLabel('chartType', 'Legend2');

      expect(actual).toBe(1);
    });

    it('should return -1, if not found', () => {
      const actual = chartBase._findSeriesIndexByLabel('chartType', 'legend2');

      expect(actual).toBe(-1);
    });
  });

  describe('_sendHostName()', () => {
    it('without usageStatistics option, sendHostName should occur.', () => {
      spyOn(snippet, 'sendHostname');
      chartBase = new ChartBase(chartBaseOption);
      expect(snippet.sendHostname).toHaveBeenCalled();
    });

    it('usageStatistics is false, then sendHostName should not occur.', () => {
      spyOn(snippet, 'sendHostname');
      chartBaseOption.options.usageStatistics = false;
      chartBase = new ChartBase(chartBaseOption);
      expect(snippet.sendHostname).not.toHaveBeenCalled();
    });
  });
});
