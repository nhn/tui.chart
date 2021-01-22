import {
  TooltipModel,
  TooltipData,
  TooltipTitleValues,
  TooltipTemplateType,
} from '@t/components/tooltip';
import { DefaultTooltipTemplate } from '@t/options';
import { pieTooltipLabelFormatter } from './pieSeries';
import { TooltipTheme } from '@t/theme';
import { getFontStyleString } from './style';
import { isNumber } from './utils';
import { isRangeValue } from './range';

function getSeriesNameTemplate(label: string, color: string) {
  return `<span class="series-name">
    <i class="icon" style="background: ${color}"></i>
    <span class="name">${label}</span>
  </span>`;
}

function getTitleValueTemplate(title: string, value: string) {
  return `<div class="tooltip-series">
    <span class="series-name">${title}</span>
    <span class="series-value">${value}</span>
  </div>`;
}

function getColorValueTemplate(color: string, value: string) {
  return `<div class="tooltip-series">
    <i class="icon" style="background: ${color}"></i>
    <span class="series-value">${value}</span>
  </div>`;
}

function makeBulletDataTemplate(data: TooltipTitleValues, titleType: string) {
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
    .map(({ formattedValue, color }) => getColorValueTemplate(color!, formattedValue!))
    .join('');
}

export function getDefaultTemplate(
  model: TooltipModel,
  { header, body }: DefaultTooltipTemplate,
  theme: Required<TooltipTheme>
) {
  const { borderColor, borderWidth, background, borderRadius, borderStyle } = theme;
  const style = `border: ${borderWidth}px ${borderStyle} ${borderColor};border-radius: ${borderRadius}px;background: ${background};`;

  return `<div class="tooltip" style="${style}">${header}${body}</div>`;
}

export function getHeaderTemplate({ category }: TooltipModel, theme: Required<TooltipTheme>) {
  return category
    ? `<div class="tooltip-category" style="${getFontStyleString(theme.header)}">${category}</div>`
    : '';
}

function getDefaultBodyTemplate({ data }: TooltipModel, theme: Required<TooltipTheme>) {
  return `<div class="tooltip-series-wrapper" style="${getFontStyleString(theme.body)}">
      ${data
        .map(
          ({ label, color, formattedValue }) =>
            `<div class="tooltip-series">
                ${getSeriesNameTemplate(label, color)}
                <span class="series-value">${formattedValue}</span>
              </div>`
        )
        .join('')}
    </div>`;
}

function getBoxPlotTemplate({ data }: TooltipModel, theme: Required<TooltipTheme>) {
  const groupedData = data.reduce<TooltipData>((acc, item, index) => {
    if (!index) {
      return item;
    }

    if (acc.category === item.category && acc.label === item.label) {
      acc.value = [...(acc.value as TooltipTitleValues), ...(item.value as TooltipTitleValues)];
    }

    return acc;
  }, {} as TooltipData);

  return `<div class="tooltip-series-wrapper" style="${getFontStyleString(theme.body)}">
    ${[groupedData]
      .map(
        ({ label, color, value: values }) =>
          `<div class="tooltip-series">
            ${getSeriesNameTemplate(label, color)}
          </div>
          <div>
        ${(values as TooltipTitleValues)
          .map(({ title, formattedValue }) => getTitleValueTemplate(title, formattedValue!))
          .join('')}
          </div>`
      )
      .join('')}
  </div>`;
}

function getBulletTemplate({ data }: TooltipModel, theme: Required<TooltipTheme>) {
  return data.length > 1
    ? getBulletGroupedTemplate(data, theme)
    : getBulletBasicTemplate(data, theme);
}

function getBulletBasicTemplate(data: TooltipData[], theme: Required<TooltipTheme>) {
  return `<div class="tooltip-series-wrapper" style="${getFontStyleString(theme.body)}">
    ${data
      .map(
        ({ label, color, value: values }) =>
          `<div class="tooltip-series">${getSeriesNameTemplate(label, color)}</div>
          ${(values as TooltipTitleValues)
            .map(({ title, formattedValue }) => getTitleValueTemplate(title, formattedValue!))
            .join('')}`
      )
      .join('')}
  </div>`;
}

function getBulletGroupedTemplate(data: TooltipData[], theme: Required<TooltipTheme>) {
  const bulletData = data.map(({ value }) => value[0]);
  const [actual, ranges, markers] = ['Actual', 'Range', 'Marker'].map((titleType) =>
    makeBulletDataTemplate(bulletData, titleType)
  );

  return `<div class="tooltip-category" style="${getFontStyleString(theme.header)}">
      ${data[0].label}
    </div>
    <div class="tooltip-series-wrapper" style="${getFontStyleString(theme.body)}">
      ${actual ? '<div class="tooltip-title">Actual</div>' : ''} ${actual}
      ${ranges ? '<div class="tooltip-title">Ranges</div>' : ''} ${ranges}
      ${markers ? '<div class="tooltip-title">Markers</div>' : ''} ${markers}
    </div>`;
}

function getPieTemplate({ data }: TooltipModel, theme: Required<TooltipTheme>) {
  return `<div class="tooltip-series-wrapper" style="${getFontStyleString(theme.body)}">
    ${data
      .map(
        ({ label, color, formattedValue, percentValue }) =>
          `<div class="tooltip-series">
        ${getSeriesNameTemplate(label, color)}
        <span class="series-value">${pieTooltipLabelFormatter(
          percentValue!
        )}&nbsp;&nbsp;(${formattedValue!})</span>
      </div>`
      )
      .join('')}
  </div>`;
}

function getHeatmapTemplate({ data }: TooltipModel, theme: Required<TooltipTheme>) {
  return `${data
    .map(
      ({ label, color, formattedValue }) =>
        `<div class="tooltip-category" style="${getFontStyleString(theme.header)}">
          ${label}
        </div>
        <div class="tooltip-series-wrapper" style="${getFontStyleString(theme.body)}">
          <div class="tooltip-series">${getSeriesNameTemplate(formattedValue!, color)}</div>
        </div>`
    )
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

export function getBodyTemplate(type?: TooltipTemplateType) {
  return tooltipTemplates[type || 'defaultBody'];
}
