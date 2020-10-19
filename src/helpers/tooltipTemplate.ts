import {
  TooltipModel,
  TooltipData,
  TooltipTitleValues,
  TooltipTemplateType,
} from '@t/components/tooltip';
import { DefaultTooltipTemplate } from '@t/options';

function pieTooltipLabelFormatter(percentValue: number) {
  const percentageString = percentValue.toFixed(4);
  const percent = parseFloat(percentageString);
  const needSlice = percent < 0.0009 || percentageString.length > 5;

  return `${needSlice ? percentageString.substr(0, 4) : String(percent)}%  `;
}

function getSeriesNameTpl(label: string, color: string) {
  return `<span class="series-name">
    <i class="icon" style="background: ${color}"></i>
    <span class="name">${label}</span>
  </span>`;
}

function getTitleValueTpl(title: string, value: string) {
  return `<div class="tooltip-series">
    <span class="series-name">${title}</span>
    <span class="series-value">${value}</span>
  </div>`;
}

export function getDefaultTemplate(model: TooltipModel, { header, body }: DefaultTooltipTemplate) {
  return `<div class="tooltip">${header}${body}</div>`;
}

export function getHeaderTemplate({ category }: TooltipModel) {
  return category ? `<div class="tooltip-category">${category}</div>` : '';
}

function getDefaultBodyTemplate({ data }: TooltipModel) {
  return `<div class="tooltip-series-wrapper">
      ${data
        .map(
          ({ label, color, formattedValue }) =>
            `<div class="tooltip-series">
                ${getSeriesNameTpl(label, color)}
                <span class="series-value">${formattedValue}</span>
              </div>`
        )
        .join('')}
    </div>`;
}

function getBoxPlotTemplate({ data }: TooltipModel) {
  const groupedData = data.reduce<TooltipData>((acc, item, index) => {
    if (!index) {
      acc = item;

      return acc;
    }

    if (acc.category === item.category && acc.label === item.label) {
      acc.value = [...acc.value, ...item.value] as TooltipTitleValues;
    }

    return acc;
  }, {} as TooltipData);

  return `<div class="tooltip-series-wrapper">
    ${[groupedData]
      .map(
        ({ label, color, value: values }) =>
          `<div class="tooltip-series">
            ${getSeriesNameTpl(label, color)}
          </div>
          <div>
        ${(values as TooltipTitleValues)
          .map(({ title, formattedValue }) => getTitleValueTpl(title, formattedValue!))
          .join('')}
          </div>`
      )
      .join('')}
  </div>`;
}

function getBulletTemplate({ data }: TooltipModel) {
  return `<div class="tooltip-series-wrapper">
    ${data
      .map(
        ({ label, color, value: values }) =>
          `<div class="tooltip-series">
            ${getSeriesNameTpl(label, color)}
          </div>
          ${(values as TooltipTitleValues)
            .map(({ title, formattedValue }) => getTitleValueTpl(title, formattedValue!))
            .join('')}`
      )
      .join('')}
  </div>`;
}

function getPieTemplate({ data }: TooltipModel) {
  return `<div class="tooltip-series-wrapper">
    ${data
      .map(
        ({ label, color, formattedValue, percentValue }) =>
          `<div class="tooltip-series">
        ${getSeriesNameTpl(label, color)}
        <span class="series-value">${pieTooltipLabelFormatter(
          percentValue!
        )} (${formattedValue!})</span>
      </div>`
      )
      .join('')}
  </div>`;
}

function getHeatmapTemplate({ data }: TooltipModel) {
  return `${data
    .map(
      ({ label, color, formattedValue }) =>
        `<div class="tooltip-category">
          ${label}
        </div>
        <div class="tooltip-series-wrapper">
          <div class="tooltip-series">${getSeriesNameTpl(formattedValue!, color)}</div>
        </div>`
    )
    .join('')}`;
}

export function getBodyTemplate(type?: TooltipTemplateType) {
  return {
    default: getDefaultBodyTemplate,
    boxPlot: getBoxPlotTemplate,
    bullet: getBulletTemplate,
    pie: getPieTemplate,
    heatmap: getHeatmapTemplate,
  }[type || 'default'];
}
