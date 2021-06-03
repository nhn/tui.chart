import { tooltipTemplates } from '@src/helpers/tooltipTemplate';
import { GeoFeatureResponderModel } from '@t/components/geoFeature';

const defaultTooltipTheme = {
  background: 'rgba(85, 85, 85, 0.95)',
  borderColor: 'rgba(255, 255, 255, 0)',
  borderWidth: 0,
  borderRadius: 3,
  borderStyle: 'solid',
  body: {
    fontSize: 12,
    fontFamily: 'Arial, sans-serif',
    fontWeight: 'normal',
    color: '#ffffff',
  },
};

describe('default tooltip template', () => {
  it('should create tooltip markup properly using the theme and body template strings', () => {
    const model: GeoFeatureResponderModel = {
      type: 'geoFeature',
      responderType: 'geoFeature',
      feature: {
        id: 'test-id',
        properties: {
          name: 'test-name',
          id: 'test-id',
        },
      },
      data: 100,
      color: '#555',
    };
    const body = 'body template';

    expect(tooltipTemplates['default'](model, body, defaultTooltipTheme)).toMatchInlineSnapshot(
      `"<div class=\\"toastui-chart-tooltip\\" style=\\"border: 0px solid rgba(255, 255, 255, 0);border-radius: 3px;background: rgba(85, 85, 85, 0.95);\\">body template</div>"`
    );
  });
});

describe('default tooltip body template', () => {
  it('should create tooltip body markup properly using the theme and model', () => {
    const model: GeoFeatureResponderModel = {
      type: 'geoFeature',
      responderType: 'geoFeature',
      feature: {
        id: 'test-id',
        properties: {
          name: 'test-name',
          id: 'test-id',
        },
      },
      data: 100,
      color: '#555',
    };

    expect(tooltipTemplates.defaultBody(model, defaultTooltipTheme)).toMatchInlineSnapshot(`
      "
          <div class=\\"toastui-chart-tooltip-series-wrapper\\" style=\\"font-weight: normal; font-family: Arial, sans-serif; font-size: 12px; color: #ffffff;\\">
            <div class=\\"toastui-chart-tooltip-series\\">
              <span class=\\"toastui-chart-series-name\\">
          <i class=\\"toastui-chart-icon\\" style=\\"background: #555\\"></i>
          <span class=\\"toastui-chart-name\\">test-name</span>
        </span>
              <span class=\\"toastui-chart-series-value\\">100</span>
            </div>
          </div>"
    `);
  });
});
