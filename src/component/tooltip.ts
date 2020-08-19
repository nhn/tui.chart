import Component from './component';
import { ChartState, Options } from '@t/store/store';
import { TooltipInfo, TooltipModel } from '@t/components/tooltip';
import { getValueString } from '@src/helpers/tooltip';
import { isNumber } from '@src/helpers/utils';

import '../css/tooltip.css';

export default class Tooltip extends Component {
  models: TooltipModel[] = [];

  chartEl!: HTMLDivElement;

  tooltipContainerEl!: HTMLDivElement;

  onSeriesPointHovered = (tooltipInfos: TooltipInfo[]) => {
    if (tooltipInfos.length) {
      this.renderTooltip(tooltipInfos);
    } else {
      this.removeTooltip();
    }
  };

  getTooltipContainerEl() {
    const el = document.createElement('div');
    el.classList.add('tooltip');

    return el;
  }

  removeTooltip() {
    this.tooltipContainerEl.innerHTML = '';
  }

  isTooltipContainerOverflow(x: number, y: number) {
    const { width, height } = this.tooltipContainerEl.getBoundingClientRect();
    const { x: rectX, y: rectY, width: rectWidth, height: rectHeight } = this.rect;

    return {
      overflowX: x > rectX + rectWidth || x + width > rectX + rectWidth,
      overflowY: y > rectY + rectHeight || y + height > rectY + rectHeight,
    };
  }

  renderTooltip(tooltipInfo: TooltipInfo[]) {
    let rForAdding = 0;
    let wForAdding = 0;

    const model = tooltipInfo.reduce<TooltipModel>(
      (acc, item) => {
        const { data, x, y, radius, width } = item;

        if (!acc.x && !acc.y) {
          acc.x = x;
          acc.y = y;
        } else {
          acc.x = (acc.x + x) / 2;
          acc.y = (acc.y + y) / 2;
        }

        if (isNumber(radius)) {
          rForAdding = Math.max(radius / 2, rForAdding);
        }

        if (width) {
          wForAdding = Math.max(wForAdding, width);
        }

        acc.data.push(data);

        if (!acc.category && data.category) {
          acc.category = data.category;
        }

        return acc;
      },
      { type: 'tooltip', x: 0, y: 0, data: [] }
    );

    const leftMargin = 15;
    this.tooltipContainerEl.innerHTML = this.getHtml(model);

    let x = this.rect.x + model.x + rForAdding + leftMargin + wForAdding;
    let y = this.rect.y + model.y;

    const { overflowX, overflowY } = this.isTooltipContainerOverflow(x, y);
    const { width, height } = this.tooltipContainerEl.getBoundingClientRect();

    if (overflowX) {
      x = this.rect.x + model.x - (rForAdding + width);
    }

    if (overflowY) {
      y = this.rect.y + model.y + leftMargin - height;
    }

    this.setContainerPosition(x, y);
  }

  setContainerPosition(x: number, y: number) {
    this.tooltipContainerEl.style.top = `${y}px`;
    this.tooltipContainerEl.style.left = `${x}px`;
  }

  getHtml(model: TooltipModel) {
    const { category, data } = model;

    return `
      ${category ? `<div class="tooltip-category">${category}</div>` : ''}
      <div class="tooltip-series-wrapper">
        ${data
          .map(
            ({ label, color, value }) =>
              `
          <div class="tooltip-series">
            <span class="series-name">
              <i class="icon" style="background: ${color}"></i>
              <span class="name">${label}</span>
            </span>
            <span class="series-value">${getValueString(value)}</span>
          </div>`
          )
          .join('')}
      </div>
    `;
  }

  initialize({ chartEl }) {
    this.type = 'tooltip';
    this.name = 'tooltip';

    this.chartEl = chartEl;
    this.tooltipContainerEl = this.getTooltipContainerEl();
    this.chartEl.appendChild(this.tooltipContainerEl);

    this.eventBus.on('seriesPointHovered', this.onSeriesPointHovered);
  }

  render({ layout }: ChartState<Options>) {
    this.rect = layout.plot;
  }
}
