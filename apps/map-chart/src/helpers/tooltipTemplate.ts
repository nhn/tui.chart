import { GeoFeatureResponderModel } from '@t/components/geoFeature';
import { getFontStyleString } from '@toast-ui/shared';
import { TooltipTheme } from '@t/components/tooltip';

function getBorderStyleString(theme: Required<TooltipTheme>) {
  const { borderColor, borderWidth, borderRadius, borderStyle } = theme;

  return `border: ${borderWidth}px ${borderStyle} ${borderColor};border-radius: ${borderRadius}px`;
}

function getSeriesNameTemplate(name: string, color: string) {
  return `<span class="toastui-chart-series-name">
    <i class="toastui-chart-icon" style="background: ${color}"></i>
    <span class="toastui-chart-name">${name}</span>
  </span>`;
}

function getDefaultBodyTemplate(model: GeoFeatureResponderModel, theme: Required<TooltipTheme>) {
  const { feature, color, data } = model;
  const name = feature?.properties?.name ?? '';

  return `
    <div class="toastui-chart-tooltip-series-wrapper" style="${getFontStyleString(theme.body)}">
      <div class="toastui-chart-tooltip-series">
        ${getSeriesNameTemplate(name, color!)}
        <span class="toastui-chart-series-value">${data}</span>
      </div>
    </div>`;
}

export function getDefaultTemplate(
  model: GeoFeatureResponderModel,
  body: string,
  theme: Required<TooltipTheme>
) {
  const style = `${getBorderStyleString(theme)};background: ${theme.background};`;

  return `<div class="toastui-chart-tooltip" style="${style}">${body}</div>`;
}

export const tooltipTemplates = {
  default: getDefaultTemplate,
  defaultBody: getDefaultBodyTemplate,
};
