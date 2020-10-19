import { TooltipModel, TooltipData, TooltipTitleValues } from '@t/components/tooltip';
import { DefaultTooltipTemplate } from '@t/options';

export function getSeriesNameTpl(label: string, color: string) {
  return `<span class="series-name">
    <i class="icon" style="background: ${color}"></i>
    <span class="name">${label}</span>
  </span>`;
}

export function getTitleValueTpl(title: string, value: string) {
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

export function getDefaultBodyTemplate({ data }: TooltipModel) {
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

export function getBoxPlotTemplate({ data }: TooltipModel) {
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

export function getBulletTemplate({ data }: TooltipModel) {
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

export function getPieTemplate({ data }: TooltipModel) {
  return `<div class="tooltip-series-wrapper">
    ${data
      .map(
        ({ label, color, formattedValue, percentValue }) =>
          `<div class="tooltip-series">
        ${getSeriesNameTpl(label, color)}
        <span class="series-value">${percentValue}% (${formattedValue!})</span>
      </div>`
      )
      .join('')}
  </div>`;
}

export function getHeatmapTemplate({ data }: TooltipModel) {
  console.log(data);

  return `<div class="tooltip-series-wrapper">
    ${data
      .map(
        ({ label, color, formattedValue }) =>
          `
          <div class="tooltip-series">
            ${label}
          </div>
          <div class="tooltip-series">
        ${getSeriesNameTpl(formattedValue!, color)}
      </div>`
      )
      .join('')}
  </div>`;
}
