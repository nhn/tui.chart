/**
 * @fileoverview Test for Legend.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */
import raphael from 'raphael';
import snippet from 'tui-code-snippet';
import legendFactory from '../../../src/js/components/legends/legend';
import chartConst from '../../../src/js/const';
import renderUtil from '../../../src/js/helpers/renderUtil';
import LegendModel from '../../../src/js/components/legends/legendModel';

describe('Test for Legend', () => {
  let legend, dataProcessor;

  beforeAll(() => {
    dataProcessor = jasmine.createSpyObj('dataProcessor', [
      'getLegendLabels',
      'getLegendData',
      'findChartType'
    ]);
    dataProcessor.getLegendLabels.and.returnValue(['legend1', 'legend2']);
    dataProcessor.getLegendData.and.returnValue([
      {
        label: 'legend1'
      },
      {
        label: 'legend2'
      }
    ]);
    spyOn(renderUtil, 'getRenderedLabelHeight').and.returnValue(20);
  });

  beforeEach(() => {
    legend = new legendFactory.Legend({
      dataProcessor,
      theme: {
        label: {
          fontSize: 12
        },
        column: {
          colors: ['red', 'orange']
        }
      },
      chartType: 'column',
      eventBus: new snippet.CustomEvents(),
      options: {}
    });
    spyOn(legend.eventBus, 'fire');
  });

  describe('render()', () => {
    it('should call _renderLegendArea()', () => {
      spyOn(legend, '_renderLegendArea');
      spyOn(legend, '_listenEvents');
      legend.layout = {
        position: {
          top: 20,
          right: 10
        }
      };

      legend.render({
        paper: raphael(document.createElement('DIV'), 100, 100),
        layout: {
          position: { top: 0, left: 0 }
        }
      });

      expect(legend._renderLegendArea).toHaveBeenCalled();
    });
  });

  describe('_renderLegendArea()', () => {
    it('already calculated dimension width should be reflected.', () => {
      const paper = raphael(document.createElement('DIV'), 100, 100);
      legend.dataProcessor.options = { series: {} };
      legend.layout = {
        position: {
          top: 20,
          right: 10
        },
        dimension: {
          width: 100,
          height: 100
        }
      };
      spyOn(legend.graphRenderer, 'render');

      legend._renderLegendArea(paper);

      expect(legend.graphRenderer.render.calls.argsFor(0)[0].dimension.width).toBe(100);
    });
  });

  describe('_fireChangeCheckedLegendsPublicEvent()', () => {
    it('fire selectLegend public event', () => {
      spyOn(legend.legendModel, 'getCheckedIndexes').and.returnValue({
        column: [true, false, true]
      });

      legend._fireChangeCheckedLegendsPublicEvent();

      expect(legend.eventBus.fire).toHaveBeenCalledWith(
        `${chartConst.PUBLIC_EVENT_PREFIX}changeCheckedLegends`,
        {
          column: [true, false, true]
        }
      );
    });
  });

  describe('_fireSelectLegendEvent()', () => {
    it('fire selectLegend event', () => {
      const data = {
        chartType: 'column',
        seriesIndex: 0
      };

      spyOn(legend.legendModel, 'getSelectedIndex').and.returnValue(0);
      dataProcessor.findChartType.and.callFake(chartType => chartType);

      legend._fireSelectLegendEvent(data, true);

      expect(legend.eventBus.fire).toHaveBeenCalledWith('selectLegend', 'column', 0);
    });
  });

  describe('_fireSelectLegendPublicEvent()', () => {
    it('fire select legend public event', () => {
      const data = {
        label: 'legend',
        chartType: 'bar',
        index: 1
      };

      legend._fireSelectLegendPublicEvent(data);

      expect(legend.eventBus.fire).toHaveBeenCalledWith(
        `${chartConst.PUBLIC_EVENT_PREFIX}selectLegend`,
        {
          legend: 'legend',
          chartType: 'bar',
          index: 1
        }
      );
    });
  });

  describe('presetForChangeData()', () => {
    const theme = {
      label: {
        fontFamily: 'Verdana',
        fontSize: 11,
        fontWeight: 'normal'
      },
      colors: ['blue']
    };

    it('theme should be reflected.', () => {
      spyOn(LegendModel.prototype, '_setData');
      legend.presetForChangeData(theme);

      expect(legend.theme).toEqual(theme);
    });

    it('legendModel should be reflected.', () => {
      spyOn(LegendModel.prototype, '_setData');
      legend.presetForChangeData(theme);

      expect(LegendModel.prototype._setData).toHaveBeenCalled();
    });
  });
});
