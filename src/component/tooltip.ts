import Component from './component';
import { ChartState, Options } from '@t/store/store';
import { throttle } from '@src/helpers/utils';
import { TooltipInfo, TooltipModel } from '@t/components/tooltip';

export default class Tooltip extends Component {
  models!: TooltipModel[];

  isShow = false;

  needLoop!: () => void;

  onSeriesPointHovered = (tooltipInfos: TooltipInfo[]) => {
    this.isShow = !!tooltipInfos.length;
    if (tooltipInfos.length) {
      this.renderTooltip(tooltipInfos);
    }
  };

  renderTooltip(tooltipInfos: TooltipInfo[]) {
    this.models = [
      tooltipInfos.reduce(
        (acc, item) => {
          const { data, x, y } = item;
          // @TODO: category 없을 때 처리 필요
          const { category } = data;

          const existPrevPosition = acc.x || acc.y;

          acc.x = (existPrevPosition ? (acc.x + x) / 2 : x) + 15;
          acc.y = (existPrevPosition ? (acc.y + y) / 2 : y) - 10;

          if (acc.data[category]) {
            acc.data[category].push(data);
          } else {
            acc.data[category] = [data];
          }

          return acc;
        },
        { type: 'tooltip', x: 0, y: 0, data: {} }
      )
    ];

    if (!this.drawModels) {
      this.drawModels = [{ ...this.models[0] }];
    } else {
      this.needLoop();
    }
  }

  initialize() {
    this.type = 'tooltip';
    this.name = 'tooltip';
    this.eventBus.on('seriesPointHovered', this.onSeriesPointHovered);

    this.needLoop = throttle(() => {
      if (this.isShow) {
        this.eventBus.emit('needSubLoop', {
          onFrame: delta => {
            this.update(delta);
          },
          duration: 200,
          requester: this
        });
      }
    }, 100);
  }

  render({ layout }: ChartState<Options>) {
    this.rect = layout.plot;
    this.models = [];
  }
}
