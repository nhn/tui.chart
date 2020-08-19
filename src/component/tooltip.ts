import Component from './component';
import { ChartState, Options } from '@t/store/store';
import { TooltipInfo, TooltipModel } from '@t/components/tooltip';
import { getValueString } from '@src/helpers/tooltip';

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

  renderTooltip(tooltipInfos: TooltipInfo[]) {
    const model = tooltipInfos.reduce<TooltipModel>(
      (acc, item) => {
        const { data } = item;
        // @TODO: 마우스 포지션 비교해서 잡는게 좋을듯?

        if (!acc.x && !acc.y) {
          acc.x = item.x;
          acc.y = item.y;
        } else {
          acc.x = (acc.x + item.x) / 2;
          acc.y = (acc.y + item.y) / 2;
        }

        acc.data.push(data);

        if (!acc.category && data.category) {
          acc.category = data.category;
        }

        return acc;
      },
      { type: 'tooltip', x: 0, y: 0, data: [] }
    );

    const leftMargin = 25;
    const left = this.rect.x + model.x + leftMargin;
    const top = this.rect.y + model.y;

    this.tooltipContainerEl.style.top = `${top}px`;
    this.tooltipContainerEl.style.left = `${left}px`;
    this.tooltipContainerEl.innerHTML = this.getHtml(model);
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
