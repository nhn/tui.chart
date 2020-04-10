import Component from './component';
import { ChartState, Options } from '@t/store/store';
import { PlotModel } from '@t/components/plot';
import { crispPixel, makeTickPixelPositions } from '@src/helpers/calculator';
import Painter from '@src/painter';

export default class Plot extends Component {
  models: Record<string, PlotModel[]> = {};

  initialize() {
    this.type = 'plot';
  }

  renderBands() {}

  renderLines() {}

  renderModels(relativePositions: number[], vertical: boolean): PlotModel[] {
    return relativePositions.map(position => {
      const x = vertical ? crispPixel(position) : crispPixel(0);
      const y = vertical ? crispPixel(0) : crispPixel(position);
      const width = vertical ? 0 : this.rect.width;
      const height = vertical ? this.rect.height : 0;

      return { type: 'plot', x, y, width, height };
    });
  }

  getTickPixelPositions(vertical: boolean, axes: Record<string, any>) {
    const size = vertical ? this.rect.width : this.rect.height;
    const { tickCount } = vertical ? axes.xAxis : axes.yAxis;

    return makeTickPixelPositions(size, tickCount);
  }

  render({ layout, axes }: ChartState<Options>) {
    this.rect = layout.plot;

    this.models.plot = [
      ...this.renderModels(this.getTickPixelPositions(false, axes), false),
      ...this.renderModels(this.getTickPixelPositions(true, axes), true)
    ];
  }

  beforeDraw(painter: Painter) {
    painter.ctx.strokeStyle = 'rgba(0, 0, 0, 0.05)';
    painter.ctx.lineWidth = 1;
  }
}
