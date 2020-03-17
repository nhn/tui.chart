import Component from './component';
import { ChartState } from '../../types/store/store';
import { throttle } from '@src/helpers/utils';
import { TooltipInfo, TooltipModel } from '../../types/components/tooltip';

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

          maxLength = Math.max(maxLength, data.label.length + data.value.toString().length);

          acc.width = Math.max(maxLength * 15 + 10, 200); // @TODO: 너비 계산
          acc.data.push(data);

          return acc;
        },
        { type: 'tooltip', x: 0, y: 0, width: 0, height: 0, data: [] }
      )
    ];

    this.models[0].height = Math.max(tooltipInfos.length * 30 + 10, 40); // @TODO: 높이 계산

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

  render({ layout }: ChartState) {
    this.rect = layout.plot;
    this.models = [];
  }
}
