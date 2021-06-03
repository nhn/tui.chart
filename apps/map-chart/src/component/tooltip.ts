import Component from './component';
import { GeoFeatureResponderModel } from '@t/components/geoFeature';
import { tooltipTemplates } from '@src/helpers/tooltipTemplate';
import { getTranslateString, sanitizeHTML } from '@toast-ui/shared';
import { TooltipTemplateFunc, TooltipTheme } from '@t/components/tooltip';

export default class Tooltip extends Component {
  chartEl!: HTMLDivElement;

  tooltipContainerEl!: HTMLDivElement;

  templateFunc!: TooltipTemplateFunc;

  theme!: Required<TooltipTheme>;

  initialize({ chartEl }) {
    this.type = 'tooltip';
    this.name = 'tooltip';
    this.chartEl = chartEl;

    this.tooltipContainerEl = document.createElement('div');
    this.tooltipContainerEl.classList.add('toastui-chart-tooltip-container');
    const { width, height, top, left } = this.chartEl.getBoundingClientRect();
    this.tooltipContainerEl.style.transform = getTranslateString(
      left + width / 2,
      top + height / 2
    );

    this.chartEl.appendChild(this.tooltipContainerEl);
    this.eventBus.on('renderTooltip', this.onSeriesHovered);
  }

  render(chartState) {
    const { layout, theme } = chartState;

    this.rect = layout.map;
    this.theme = theme.tooltip;
    this.templateFunc = tooltipTemplates['default']; // @TODO: need to add custom tooltip options
  }

  onSeriesHovered = ({ responders }: { responders: GeoFeatureResponderModel[] }) => {
    this.isShow = !!responders.length;
    if (this.isShow) {
      this.renderTooltip(responders);
    } else {
      this.removeTooltip();
    }
  };

  setTooltipPosition(model: GeoFeatureResponderModel) {
    const [centerX, centerY] = model.centroid;
    const { width, height } = this.tooltipContainerEl.getBoundingClientRect();
    const x = centerX + this.rect.x - width / 2;
    const y = centerY + this.rect.y - height / 3;

    this.tooltipContainerEl.style.transform = getTranslateString(x, y);
  }

  renderTooltip(responders: GeoFeatureResponderModel[]) {
    const model = responders[0];
    this.tooltipContainerEl.innerHTML = sanitizeHTML(
      this.templateFunc(model, tooltipTemplates.defaultBody(model, this.theme), this.theme)
    );
    this.setTooltipPosition(model);
  }

  removeTooltip() {
    this.tooltipContainerEl.innerHTML = '';
  }
}
