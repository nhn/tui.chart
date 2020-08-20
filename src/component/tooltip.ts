import Component from './component';
import { ChartState, Options } from '@t/store/store';
import { TooltipInfo, TooltipModel } from '@t/components/tooltip';
import { getValueString } from '@src/helpers/tooltip';
import { isNumber } from '@src/helpers/utils';

import '../css/tooltip.css';

export default class Tooltip extends Component {
  chartEl!: HTMLDivElement;

  tooltipContainerEl!: HTMLDivElement;

  templateFunc!: (model: TooltipModel) => string;

  onSeriesPointHovered = (tooltipInfos: TooltipInfo[]) => {
    if (tooltipInfos.length) {
      this.renderTooltip(tooltipInfos);
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
    const margin = 15;
    const { target } = model;

    const startX = this.rect.x + model.x;
    let x = startX + margin + target.radius + target.width;
    let y = this.rect.y + model.y;

    const { overflowX, overflowY } = this.isTooltipContainerOverflow(x, y);
    const { width, height } = this.tooltipContainerEl.getBoundingClientRect();

    if (overflowX) {
      x = startX - (target.radius + width) > 0 ? startX - (target.radius + width) : startX + margin;
    }

    if (overflowY) {
      y = this.rect.y + model.y + margin - height;
    }

    return { x, y };
  }

  setTooltipPosition(model: TooltipModel) {
    const { x, y } = this.getPositionInRect(model);
    this.tooltipContainerEl.style.left = `${x}px`;
    this.tooltipContainerEl.style.top = `${y}px`;
  }

  renderTooltip(tooltipInfo: TooltipInfo[]) {
    const model = tooltipInfo.reduce<TooltipModel>(
      (acc, item) => {
        const { data, x, y, radius, width } = item;

        acc.x = acc.x ? (acc.x + x) / 2 : x;
        acc.y = acc.y ? (acc.y + y) / 2 : y;

        if (isNumber(radius)) {
          acc.target.radius = radius;
        }

        if (width) {
          acc.target.width = width;
        }

        acc.data.push(data);

        if (!acc.category && data.category) {
          acc.category = data.category;
        }

        return acc;
      },
      { type: 'tooltip', x: 0, y: 0, data: [], target: { radius: 0, width: 0 } }
    );

    this.tooltipContainerEl.innerHTML = this.templateFunc(model);
    this.setTooltipPosition(model);
  }

  getHtml(model: TooltipModel) {
    const { category, data } = model;

    return `
      <div class="tooltip">
        ${category ? `<div class="tooltip-category">${category}</div>` : ''}
        <div class="tooltip-series-wrapper">
          ${data
            .map(
              ({ label, color, value }) =>
                `<div class="tooltip-series">
                  <span class="series-name">
                    <i class="icon" style="background: ${color}"></i>
                    <span class="name">${label}</span>
                  </span>
                  <span class="series-value">${getValueString(value)}</span>
                </div>`
            )
            .join('')}
        </div>
      </div>
    `;
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
    this.templateFunc = options?.tooltip?.template ?? this.getHtml;
  }
}
