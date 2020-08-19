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

  isShow = false;

  onSeriesPointHovered = (tooltipInfos: TooltipInfo[]) => {
    this.isShow = !!tooltipInfos.length;

    if (this.isShow) {
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

  // @TODO: position overflow 체크
  // @TODO: 마우스 툴팁 위로 올라갔을 때 이벤트 탐지 안되는 것 해결 필요

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

    const leftMargin = 20;
    const left = this.rect.x + model.x + rForAdding + leftMargin + wForAdding;
    const top = this.rect.y + model.y;

    this.tooltipContainerEl.innerHTML = this.getHtml(model);
    this.setContainerPosition(top, left);
  }

  setContainerPosition(top: number, left: number) {
    this.tooltipContainerEl.style.top = `${top}px`;
    this.tooltipContainerEl.style.left = `${left}px`;
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
