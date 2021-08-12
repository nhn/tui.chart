import { pieTooltipLabelFormatter } from "./pieSeries";
import { getFontStyleString } from "./style";
import { isNumber } from "./utils";
import { isRangeValue } from "./range";
function getSeriesNameTemplate(label, color) {
    return `<span class="toastui-chart-series-name">
    <i class="toastui-chart-icon" style="background: ${color}"></i>
    <span class="toastui-chart-name">${label}</span>
  </span>`;
}
function getTitleValueTemplate(title, value) {
    return `<div class="toastui-chart-tooltip-series">
    <span class="toastui-chart-series-name">${title}</span>
    <span class="toastui-chart-series-value">${value}</span>
  </div>`;
}
function getColorValueTemplate(color, value) {
    return `<div class="toastui-chart-tooltip-series">
    <i class="toastui-chart-icon" style="background: ${color}"></i>
    <span class="toastui-chart-series-value">${value}</span>
  </div>`;
}
function makeBulletDataTemplate(data, titleType) {
    return data
        .filter(({ title }) => title === titleType)
        .sort((a, b) => {
        if (isRangeValue(a.value) && isRangeValue(b.value)) {
            return a.value[0] - b.value[0];
        }
        if (isNumber(a.value) && isNumber(b.value)) {
            return a.value - b.value;
        }
        return 0;
    })
        .map(({ formattedValue, color }) => getColorValueTemplate(color, formattedValue))
        .join('');
}
export function getDefaultTemplate(model, { header, body }, theme) {
    const { borderColor, borderWidth, background, borderRadius, borderStyle } = theme;
    const style = `border: ${borderWidth}px ${borderStyle} ${borderColor};border-radius: ${borderRadius}px;background: ${background};`;
    return `<div class="toastui-chart-tooltip" style="${style}">${header}${body}</div>`;
}
export function getHeaderTemplate({ category }, theme) {
    return category
        ? `<div class="toastui-chart-tooltip-category" style="${getFontStyleString(theme.header)}">
        ${category}
      </div>`
        : '';
}
function getDefaultBodyTemplate({ data }, theme) {
    return `
    <div class="toastui-chart-tooltip-series-wrapper" style="${getFontStyleString(theme.body)}">
      ${data
        .map(({ label, color, formattedValue }) => `<div class="toastui-chart-tooltip-series">
                ${getSeriesNameTemplate(label, color)}
                <span class="toastui-chart-series-value">${formattedValue}</span>
              </div>`)
        .join('')}
    </div>`;
}
function getBoxPlotTemplate({ data }, theme) {
    const groupedData = data.reduce((acc, item, index) => {
        if (!index) {
            return item;
        }
        if (acc.category === item.category && acc.label === item.label) {
            acc.value = [...acc.value, ...item.value];
        }
        return acc;
    }, {});
    return `
    <div class="toastui-chart-tooltip-series-wrapper" style="${getFontStyleString(theme.body)}">
      ${[groupedData]
        .map(({ label, color, value: values }) => `<div class="toastui-chart-tooltip-series">
              ${getSeriesNameTemplate(label, color)}
            </div>
            <div>
          ${values
        .map(({ title, formattedValue }) => getTitleValueTemplate(title, formattedValue))
        .join('')}
            </div>`)
        .join('')}
    </div>`;
}
function getBulletTemplate({ data }, theme) {
    return data.length > 1
        ? getBulletGroupedTemplate(data, theme)
        : getBulletBasicTemplate(data, theme);
}
function getBulletBasicTemplate(data, theme) {
    return `
    <div class="toastui-chart-tooltip-series-wrapper" style="${getFontStyleString(theme.body)}">
      ${data
        .map(({ label, color, value: values }) => `<div class="toastui-chart-tooltip-series">${getSeriesNameTemplate(label, color)}</div>
            ${values
        .map(({ title, formattedValue }) => getTitleValueTemplate(title, formattedValue))
        .join('')}`)
        .join('')}
    </div>`;
}
function getBulletGroupedTemplate(data, theme) {
    const bulletData = data.map(({ value }) => value[0]);
    const [actual, ranges, markers] = ['Actual', 'Range', 'Marker'].map((titleType) => makeBulletDataTemplate(bulletData, titleType));
    return `<div class="toastui-chart-tooltip-category" style="${getFontStyleString(theme.header)}">
      ${data[0].label}
    </div>
    <div class="toastui-chart-tooltip-series-wrapper" style="${getFontStyleString(theme.body)}">
      ${actual ? '<div class="toastui-chart-tooltip-title">Actual</div>' : ''} ${actual}
      ${ranges ? '<div class="toastui-chart-tooltip-title">Ranges</div>' : ''} ${ranges}
      ${markers ? '<div class="toastui-chart-tooltip-title">Markers</div>' : ''} ${markers}
    </div>`;
}
function getPieTemplate({ data }, theme) {
    return `
    <div class="toastui-chart-tooltip-series-wrapper" style="${getFontStyleString(theme.body)}">
      ${data
        .map(({ label, color, formattedValue, percentValue }) => `<div class="toastui-chart-tooltip-series">
          ${getSeriesNameTemplate(label, color)}
          <span class="toastui-chart-series-value">${pieTooltipLabelFormatter(percentValue)}&nbsp;&nbsp;(${formattedValue})</span>
        </div>`)
        .join('')}
    </div>`;
}
function getHeatmapTemplate({ data }, theme) {
    return `${data
        .map(({ label, color, formattedValue }) => `<div class="toastui-chart-tooltip-category" style="${getFontStyleString(theme.header)}">
          ${label}
        </div>
        <div class="toastui-chart-tooltip-series-wrapper" style="${getFontStyleString(theme.body)}">
          <div class="toastui-chart-tooltip-series">
            ${getSeriesNameTemplate(formattedValue, color)}
          </div>
        </div>`)
        .join('')}`;
}
export const tooltipTemplates = {
    default: getDefaultTemplate,
    defaultHeader: getHeaderTemplate,
    defaultBody: getDefaultBodyTemplate,
    boxPlot: getBoxPlotTemplate,
    bullet: getBulletTemplate,
    pie: getPieTemplate,
    heatmap: getHeatmapTemplate,
};
export function getBodyTemplate(type) {
    return tooltipTemplates[type || 'defaultBody'];
}
