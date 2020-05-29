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
    let maxLength = 0;

    this.models = [
      tooltipInfos.reduce<TooltipModel>(
        (acc, item) => {
          const { data } = item;

          if (!acc.x && !acc.y) {
            acc.x = item.x;
            acc.y = item.y;
          } else {
            acc.x = (acc.x + item.x) / 2;
            acc.y = (acc.y + item.y) / 2;
          }

          acc.x += 15;
          acc.y -= 10;

          maxLength = Math.max(
            maxLength,
            data.label.length + data.value.toString().length
          );

          acc.data.push(data);

          if (!acc.category && data.category) {
            acc.category = data.category;
          }

          return acc;
        },
        { type: 'tooltip', x: 0, y: 0, data: [] }
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
