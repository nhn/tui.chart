/**
 * @fileoverview Test for TooltipBase.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */
import snippet from 'tui-code-snippet';
import TooltipBase from '../../../src/js/components/tooltips/tooltipBase';
import dom from '../../../src/js/helpers/domHandler';

describe('TooltipBase', () => {
  let tooltip;

  beforeEach(() => {
    tooltip = new TooltipBase({
      eventBus: new snippet.CustomEvents(),
      options: {}
    });
  });

  describe('_getTooltipElement', () => {
    it('should creat tooltip element.', () => {
      const actual = tooltip._getTooltipElement();
      expect(actual).toBeDefined();
      expect(actual.className).toBe('tui-chart-tooltip');
    });

    it('should return existing tooltip element, if this.tooltipElement is not null.', () => {
      const tooltipElement = dom.create('DIV');
      tooltip.tooltipElement = tooltipElement;
      const actual = tooltip._getTooltipElement();
      const expected = tooltipElement;
      expect(actual).toBe(expected);
    });
  });

  describe('getTooltipDimension()', () => {
    it('should return tooltip dimension', () => {
      const tooltipElement = dom.create('DIV');
      tooltipElement.style.width = '100px';
      tooltipElement.style.height = '100px';
      document.body.appendChild(tooltipElement);
      const actual = tooltip.getTooltipDimension(tooltipElement);
      const expected = {
        width: 100,
        height: 100
      };
      expect(actual).toEqual(expected);
    });
  });
});
