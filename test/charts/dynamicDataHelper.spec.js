/**
 * @fileoverview Test for addingDynamicDataMixer.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */
import DynamicDataHelper from '../../src/js/charts/dynamicDataHelper';
import chartConst from '../../src/js/const';

describe('Test for DynamicDataHelper', () => {
  let dataProcessor, componentManager, ddh;

  beforeEach(() => {
    dataProcessor = jasmine.createSpyObj('dataProcessor', [
      'getCategoryCount',
      'shiftData',
      'addDataFromDynamicData',
      'addDataFromRemainDynamicData',
      'getValues',
      'isCoordinateType'
    ]);

    componentManager = jasmine.createSpyObj('componentManager', ['render']);

    ddh = new DynamicDataHelper({
      dataProcessor,
      componentManager,
      options: {
        series: {},
        xAxis: {}
      },
      on: () => {},
      readyForRender: jasmine.createSpy('readyForRender'),
      _renderComponents: jasmine.createSpy('_renderComponents)')
    });
  });

  describe('_calculateAnimateTickSize()', () => {
    it('calculate animate tick size, when is coordinateType chart', () => {
      const xAxisWidth = 300;

      dataProcessor.isCoordinateType.and.returnValue(true);
      dataProcessor.getValues.and.returnValue([10, 20, 30, 40]);
      ddh.chart.chartType = chartConst.CHART_TYPE_LINE;

      const actual = ddh._calculateAnimateTickSize(xAxisWidth);

      expect(dataProcessor.getValues).toHaveBeenCalledWith(chartConst.CHART_TYPE_LINE, 'x');
      expect(actual).toBe(100);
    });

    it('if not coordinateType data, get tickCount from dataProcessor.getCategoryCount function', () => {
      const xAxisWidth = 300;

      dataProcessor.isCoordinateType.and.returnValue(false);
      dataProcessor.getCategoryCount.and.returnValue(4);

      const actual = ddh._calculateAnimateTickSize(xAxisWidth);

      expect(dataProcessor.getCategoryCount).toHaveBeenCalledWith(false);
      expect(actual).toBe(100);
    });
  });

  describe('_animateForAddingData()', () => {
    beforeEach(() => {
      dataProcessor.getCategoryCount.and.returnValue(5);
      dataProcessor.isCoordinateType.and.returnValue(false);

      ddh.axisDataMap = {
        xAxis: {}
      };
      ddh.dimensionMap = {
        xAxis: {
          width: 200
        }
      };

      ddh.chart.readyForRender.and.returnValue({
        dimensionMap: ddh.dimensionMap
      });
    });

    it('should increase addesDataCount', () => {
      expect(ddh.addedDataCount).toBe(0);

      ddh._animateForAddingData();

      expect(ddh.addedDataCount).toBe(1);
    });

    it('should call readyForRender()', () => {
      ddh._animateForAddingData();

      expect(ddh.chart.readyForRender).toHaveBeenCalled();
    });

    it('should call animateForAddingData() with tickSize and shifting option for each component', () => {
      const boundsAndScale = {
        dimensionMap: {
          xAxis: {
            width: 200
          }
        }
      };

      ddh.chart.readyForRender.and.callFake(() => boundsAndScale);

      ddh._animateForAddingData();

      expect(componentManager.render).toHaveBeenCalledWith('animateForAddingData', boundsAndScale, {
        tickSize: 50,
        shifting: false
      });
    });

    it('should call dataProcessor.shiftData(), when there is shifting option', () => {
      ddh.chart.options.series.shifting = true;
      ddh._animateForAddingData();

      expect(dataProcessor.shiftData).toHaveBeenCalled();
    });
  });

  describe('_rerenderForAddingData()', () => {
    it('should call readyForRender()', () => {
      ddh._rerenderForAddingData();

      expect(ddh.chart.readyForRender).toHaveBeenCalled();
    });

    it('should call rerender() with animatable of false value', () => {
      const boundsAndScale = {
        dimensionMap: {
          xAxis: {
            width: 200
          }
        }
      };

      ddh.chart.readyForRender.and.callFake(() => boundsAndScale);

      ddh._rerenderForAddingData();

      expect(componentManager.render).toHaveBeenCalledWith('rerender', boundsAndScale);
    });
  });

  describe('_checkForAddedData()', () => {
    beforeEach(() => {
      const boundsAndScale = {
        dimensionMap: {
          xAxis: {
            width: 200
          }
        }
      };

      ddh.chart.readyForRender.and.callFake(() => boundsAndScale);
    });
    it('should append dynamic data when some dynamic data added, and then call _animateForAddingData()', () => {
      dataProcessor.addDataFromDynamicData.and.returnValue(true);
      spyOn(ddh, '_animateForAddingData');

      ddh.isInitRenderCompleted = true;
      ddh._checkForAddedData();

      expect(ddh._animateForAddingData).toHaveBeenCalled();
    });

    it('we should not animate for added data if initial render have not completed', () => {
      dataProcessor.addDataFromDynamicData.and.returnValue(true);
      spyOn(ddh, '_animateForAddingData');

      ddh.isInitRenderCompleted = false;
      ddh._checkForAddedData();

      expect(ddh._animateForAddingData).toHaveBeenCalled();
    });

    it('should call _rerenderForAddingData, _checkForAddedData 0.4 sec after dynamic data detection', done => {
      dataProcessor.addDataFromDynamicData.and.returnValue(true);
      spyOn(ddh, '_rerenderForAddingData');

      ddh._checkForAddedData();
      setTimeout(() => {
        expect(ddh._rerenderForAddingData).toHaveBeenCalled();
        done();
      }, 1000);
    });

    it('should quit lookupping and appending data, when there is no dynamic data', () => {
      dataProcessor.addDataFromDynamicData.and.returnValue(false);
      spyOn(ddh, '_animateForAddingData');

      ddh._checkForAddedData();

      expect(ddh.lookupping).toBe(false);
      expect(ddh._animateForAddingData).not.toHaveBeenCalled();
    });

    it('should not append data even thought it has dynamic data, when paused is true', () => {
      dataProcessor.addDataFromDynamicData.and.returnValue(false);
      spyOn(ddh, '_animateForAddingData');
      ddh.paused = true;

      ddh._checkForAddedData();

      expect(ddh._animateForAddingData).not.toHaveBeenCalled();
    });
  });

  describe('pauseAnimation()', () => {
    it('should set paused true', () => {
      ddh._initForAutoTickInterval = jasmine.createSpy('_initForAutoTickInterval');

      ddh.paused = false;
      ddh.pauseAnimation();

      expect(ddh.paused).toBe(true);
    });

    it('should stop timer, when there is this.rerenderingDelayTimerId value.', () => {
      spyOn(window, 'clearTimeout');

      ddh.rerenderingDelayTimerId = 1;
      ddh.pauseAnimation();

      expect(ddh.rerenderingDelayTimerId).toBeNull();
      expect(window.clearTimeout).toHaveBeenCalled();
    });

    it('should shift data, when shifting option is true and rerendering is on', () => {
      spyOn(window, 'clearTimeout');

      ddh.chart.options.series.shifting = true;

      ddh.rerenderingDelayTimerId = 1;
      ddh.pauseAnimation();

      expect(dataProcessor.shiftData).toHaveBeenCalled();
    });
  });

  describe('_changeCheckedLegends()', () => {
    beforeEach(() => {
      ddh.pauseAnimation = jasmine.createSpy('pauseAnimation');
      ddh.chart._rerender = jasmine.createSpy('_rerender');
      ddh.restartAnimation = jasmine.createSpy('restartAnimation');
      ddh.chart.protectedRerender = jasmine.createSpy('protectedRerender');
    });

    it('should stop adding data animation and rerender graph, if it is not paused', () => {
      ddh.changeCheckedLegends();

      expect(ddh.pauseAnimation).toHaveBeenCalled();
      expect(ddh.chart.protectedRerender).toHaveBeenCalled();
    });

    it('should restart andding data animation after 0.7s, if it is not paused', done => {
      ddh.changeCheckedLegends();

      setTimeout(() => {
        expect(ddh.restartAnimation).toHaveBeenCalled();
        done();
      }, 700);
    });
  });
});
