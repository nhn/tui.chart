import Component from './component';
import { ChartState } from '@src/store/store';

import { TooltipData, TooltipModel } from '@src/brushes/tooltip';

import { throttle } from '@src/helpers/utils';

// type DrawModels = LinePointsModel | ClipRectAreaModel | CircleModel;

export default class Tooltip extends Component {
  models!: TooltipModel[];

  data!: TooltipData[];

  isShow = false;

  needLoop!: () => void;

  initialize() {
    this.type = 'tooltip';
    this.name = 'tooltip';

    this.eventBus.on('seriesPointHovered', (tooltipData: TooltipData[]) => {
      this.data = tooltipData;

      if (this.data.length) {
        this.isShow = true;
        this.renderTooltip();
      } else {
        this.isShow = false;
      }
    });

    this.needLoop = throttle(() => {
      if (this.isShow) {
        this.eventBus.emit('needSubLoop', {
          onFrame: delta => {
            this.update(delta);
          },
          duration: 200,
          requestor: this
        });
      }
    }, 100);
  }

  render({ layout }: ChartState) {
    this.rect = layout.plot;
    this.models = [];
  }

  renderTooltip() {
    let maxLength = 0;

    this.models = [
      this.data.reduce<TooltipModel>(
        (acc, item) => {
          if (!acc.x && !acc.y) {
            acc.x = item.x;
            acc.y = item.y;
          } else {
            acc.x = (acc.x + item.x) / 2;
            acc.y = (acc.y + item.y) / 2;
          }

          acc.x += 10;
          acc.y += 10;

          maxLength = Math.max(
            maxLength,
            item.data.label.length + item.data.value.toString().length
          );

          acc.width = Math.max(maxLength * 15 + 10, 200);
          acc.data.push(item.data);

          return acc;
        },
        {
          type: 'tooltip',
          x: 0,
          y: 0,
          width: 0,
          height: 0,
          data: []
        }
      )
    ];

    this.models[0].height = Math.max(this.data.length * 30 + 10, 130);

    if (!this.drawModels) {
      this.drawModels = [{ ...this.models[0] }];
    } else {
      this.needLoop();
    }
  }
}
