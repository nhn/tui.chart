/**
 * @fileoverview Test for AxisScaleMaker.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */
import ScaleDataModel from '../../../src/js/models/scaleData/scaleDataModel.js';
import axisDataMaker from '../../../src/js/models/scaleData/axisDataMaker';

describe('Test for ScaleDataModel', () => {
  let scaleDataModel, dataProcessor, boundsModel;

  beforeEach(() => {
    dataProcessor = jasmine.createSpyObj('dataProcessor', ['getCategories', 'hasCategories']);
    boundsModel = jasmine.createSpyObj('boundsModel', ['getDimension']);
    scaleDataModel = new ScaleDataModel({
      dataProcessor,
      boundsModel,
      options: {}
    });
  });

  describe('_createAxisData()', () => {
    it('if exist scaleData, returns result by executing axisDataMaker.makeValueAxisData', () => {
      const scaleData = {
        limit: {
          min: 1000,
          max: 3000
        },
        step: 1000,
        labels: ['1,000', '2,000', '3,000'],
        axisOptions: 'options'
      };

      spyOn(axisDataMaker, 'makeValueAxisData').and.returnValue('value type');
      spyOn(axisDataMaker, 'makeLabelAxisData').and.returnValue('label type');
      dataProcessor.hasCategories.and.returnValue(true);

      const actual = scaleDataModel._createAxisData(scaleData, 'options', 'labelTheme', true);
      const expected = 'value type';

      expect(axisDataMaker.makeValueAxisData).toHaveBeenCalledWith({
        labels: ['1,000', '2,000', '3,000'],
        tickCount: 3,
        limit: {
          min: 1000,
          max: 3000
        },
        step: 1000,
        options: 'options',
        labelTheme: 'labelTheme',
        isVertical: true,
        isPositionRight: false,
        aligned: false
      });
      expect(actual).toBe(expected);
    });

    it('if not exist scaleData, returns result by executing axisDataMaker.makeLabelAxisData', () => {
      spyOn(axisDataMaker, 'makeValueAxisData').and.returnValue('value type');
      spyOn(axisDataMaker, 'makeLabelAxisData').and.returnValue('label type');
      dataProcessor.getCategories.and.returnValue(['cate1', 'cate2']);
      scaleDataModel.options.series = {};

      const actual = scaleDataModel._createAxisData(null, 'options', 'labelTheme');
      const expected = 'label type';

      expect(axisDataMaker.makeLabelAxisData).toHaveBeenCalledWith({
        labels: ['cate1', 'cate2'],
        options: 'options',
        labelTheme: 'labelTheme',
        isVertical: false,
        isPositionRight: false,
        aligned: false,
        addedDataCount: 0
      });
      expect(actual).toBe(expected);
    });

    it('Must label it with the category data in the option when option has a category property.', () => {
      spyOn(axisDataMaker, 'makeValueAxisData').and.returnValue('value type');
      spyOn(axisDataMaker, 'makeLabelAxisData').and.returnValue('label type');
      dataProcessor.getCategories.and.returnValue(['cate1', 'cate2']);
      scaleDataModel.options.series = {};

      scaleDataModel._createAxisData(
        null,
        {
          categories: ['cate3', 'cate4']
        },
        'labelTheme'
      );

      const actual = axisDataMaker.makeLabelAxisData.calls.mostRecent().args[0].labels;

      expect(actual).toEqual(['cate3', 'cate4']);
    });
  });

  describe('updateXAxisDataForAutoTickInterval()', () => {
    beforeEach(() => {
      boundsModel.getDimension.and.returnValue({
        width: 200
      });
      scaleDataModel.axisDataMap = {
        xAxis: {}
      };
    });

    it('update xAxisData, when has shifting option', () => {
      scaleDataModel.options.series = {
        shifting: true
      };
      spyOn(axisDataMaker, 'updateLabelAxisDataForAutoTickInterval');
      scaleDataModel.addedDataCount = 0;

      scaleDataModel.updateXAxisDataForAutoTickInterval({}, false);

      expect(axisDataMaker.updateLabelAxisDataForAutoTickInterval).toHaveBeenCalledWith(
        {},
        200,
        0,
        false
      );
    });

    it('update xAxisData, when has not prevUpdatedData', () => {
      scaleDataModel.options.series = {
        shifting: true
      };
      spyOn(axisDataMaker, 'updateLabelAxisDataForAutoTickInterval');
      scaleDataModel.addedDataCount = 0;

      scaleDataModel.updateXAxisDataForAutoTickInterval({}, false);

      expect(axisDataMaker.updateLabelAxisDataForAutoTickInterval).toHaveBeenCalledWith(
        {},
        200,
        0,
        false
      );
    });

    it('update xAxisData, when has not shifting option and has prevUpdatedData', () => {
      const prevXAxisData = 'previous xAxis data';

      scaleDataModel.options.series = {};
      scaleDataModel.firstTickCount = 5;
      spyOn(axisDataMaker, 'updateLabelAxisDataForStackingDynamicData');

      scaleDataModel.updateXAxisDataForAutoTickInterval(prevXAxisData);

      expect(axisDataMaker.updateLabelAxisDataForStackingDynamicData).toHaveBeenCalledWith(
        {},
        'previous xAxis data',
        5
      );
    });
  });
});
