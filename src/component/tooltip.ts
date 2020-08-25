import Component, { ComponentName } from './component';
import { ChartState, Options } from '@t/store/store';
import {
  TooltipInfo,
  TooltipModel,
  TooltipTitleValues,
  TooltipDataValue,
} from '@t/components/tooltip';
import { getValueString } from '@src/helpers/tooltip';
import { isNumber } from '@src/helpers/utils';
import { DefaultTooltipTemplate, Formatter, SeriesDataType, TooltipTemplateFunc } from '@t/options';

import '../css/tooltip.css';

type TooltipInfoModels = { [key in ComponentName]: TooltipInfo[] };

export default class Tooltip extends Component {
  chartEl!: HTMLDivElement;

  tooltipContainerEl!: HTMLDivElement;

  templateFunc!: TooltipTemplateFunc;

  offsetX!: number;

  offsetY!: number;

  formatter?: Formatter;

  tooltipInfoModels: TooltipInfoModels = {} as TooltipInfoModels;

  onSeriesPointHovered = ({ models, name }: { models: TooltipInfo[]; name: string }) => {
    this.tooltipInfoModels[name] = [...models];
    const isShow = !!Object.values(this.tooltipInfoModels).flatMap((model) => model).length;
    if (isShow) {
      this.renderTooltip();
    } else {
      this.removeTooltip();
    }
  };

  isTooltipContainerOverflow(x: number, y: number) {
    const { width, height } = this.tooltipContainerEl.getBoundingClientRect();
    const { x: rectX, y: rectY, width: rectWidth, height: rectHeight } = this.rect;

    return {
      overflowX: x > rectX + rectWidth || x + width > rectX + rectWidth,
      overflowY: y > rectY + rectHeight || y + height > rectY + rectHeight,
    };
  }

  getPositionInRect(model: TooltipModel) {
    const { target } = model;

    const startX = this.rect.x + model.x;
    const startY = this.rect.y + model.y;
    let x = startX + target.radius + target.width + this.offsetX;
    let y = startY + this.offsetY;

    const { overflowX, overflowY } = this.isTooltipContainerOverflow(x, y);
    const { width, height } = this.tooltipContainerEl.getBoundingClientRect();

    if (overflowX) {
      x =
        startX - (width + target.radius + this.offsetX) > 0
          ? startX - (width + target.radius + this.offsetX)
          : startX + this.offsetX;
    }

    if (overflowY) {
      y =
        startY + target.height - (height + this.offsetY) > 0
          ? startY + target.height - (height + this.offsetY)
          : y;
    }

    return { x, y };
  }

  setTooltipPosition(model: TooltipModel) {
    const { x: chartX, y: chartY } = this.chartEl.getBoundingClientRect();
    const { x, y } = this.getPositionInRect(model);
    this.tooltipContainerEl.style.left = `${chartX + x}px`;
    this.tooltipContainerEl.style.top = `${chartY + y}px`;
  }

  renderTooltip() {
    const model = Object.values(this.tooltipInfoModels)
      .flatMap((item) => item)
      .reduce<TooltipModel>(
        (acc, item) => {
          const { data, x, y, radius, width, height, templateType } = item;

          acc.x = acc.x ? (acc.x + x) / 2 : x;
          acc.y = acc.y ? (acc.y + y) / 2 : y;

          if (isNumber(radius)) {
            acc.target.radius = radius;
          }

          if (width) {
            acc.target.width = width;
          }

          if (height) {
            acc.target.height = height;
          }

          acc.data.push({
            ...data,
            value: Array.isArray(data.value)
              ? data.value.map((titleValue) => ({
                  ...titleValue,
                  formattedValue: this.getFormattedValue(titleValue.value),
                }))
              : data.value,
            formattedValue: this.getFormattedValue(data.value),
          });

          if (!acc.category && data.category) {
            acc.category = data.category;
          }

          if (templateType) {
            acc.templateType = templateType;
          }

          return acc;
        },
        { type: 'tooltip', x: 0, y: 0, data: [], target: { radius: 0, width: 0, height: 0 } }
      );

    this.tooltipContainerEl.innerHTML = this.templateFunc(model, {
      header: this.getHeaderTemplate(model),
      body: this.getBodyTemplate(model),
    });
    this.setTooltipPosition(model);
  }

  getDefaultTemplate(model: TooltipModel, { header, body }: DefaultTooltipTemplate) {
    return `<div class="tooltip">${header}${body}</div>`;
  }

  getHeaderTemplate({ category }: TooltipModel) {
    return category ? `<div class="tooltip-category">${category}</div>` : '';
  }

  getBodyTemplate(model: TooltipModel) {
    return model.templateType === 'boxPlot'
      ? this.getBoxPlotTemplate(model)
      : this.getDefaultBodyTemplate(model);
  }

  getDefaultBodyTemplate({ data }: TooltipModel) {
    return `<div class="tooltip-series-wrapper">
        ${data
          .map(
            ({ label, color, formattedValue }) =>
              `<div class="tooltip-series">
                  <span class="series-name">
                    <i class="icon" style="background: ${color}"></i>
                    <span class="name">${label}</span>
                  </span>
                  <span class="series-value">${formattedValue}</span>
                </div>`
          )
          .join('')}
      </div>`;
  }

  initialize({ chartEl }) {
    this.type = 'tooltip';
    this.name = 'tooltip';

    this.chartEl = chartEl;

    this.tooltipContainerEl = document.createElement('div');
    this.tooltipContainerEl.classList.add('tooltip-container');
    this.chartEl.appendChild(this.tooltipContainerEl);

    this.eventBus.on('seriesPointHovered', this.onSeriesPointHovered);
  }

  removeTooltip() {
    this.tooltipContainerEl.innerHTML = '';
  }

  render({ layout, options }: ChartState<Options>) {
    this.rect = layout.plot;
    this.templateFunc = options?.tooltip?.template ?? this.getDefaultTemplate;
    this.offsetX = options?.tooltip?.offsetX ?? 10;
    this.offsetY = options?.tooltip?.offsetY ?? 0;
    this.formatter = options?.tooltip?.formatter;
  }

  getFormattedValue(value: TooltipDataValue) {
    return this.formatter ? this.formatter(value as SeriesDataType) : getValueString(value);
  }

  getBoxPlotTemplate({ data }: TooltipModel) {
    return `<div class="tooltip-series-wrapper">
    ${data
      .map(
        ({ label, color, value: values }) =>
          `<div class="tooltip-series">
              <span class="series-name">
                <i class="icon" style="background: ${color}"></i>
                <span class="name">${label}</span>
              </span>
            </div>
            <div>
      ${(values as TooltipTitleValues)
        .map(
          ({ title, formattedValue }) =>
            `<div class="tooltip-series">
              <span class="series-name">${title}</span>
              <span class="series-value">${formattedValue}</span>
            </div>`
        )
        .join('')}
        </div>`
      )
      .join('')}
  </div>`;
  }
}
