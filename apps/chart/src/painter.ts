import Chart from '@src/charts/chart';
import {
  CircleModel,
  ClipRectAreaModel,
  LinePointsModel,
  PathRectModel,
} from '@t/components/series';
import { TooltipModel } from '@t/components/tooltip';
import { Options } from '@t/store/store';
import { message } from '@src/message';

type BrushModel = ClipRectAreaModel | LinePointsModel | PathRectModel | CircleModel | TooltipModel;
type Brush = (ctx: CanvasRenderingContext2D, brushModel: BrushModel) => void;

// for IE
interface MSWindowScreen extends Screen {
  deviceXDPI: number;
  logicalXDPI: number;
}

export default class Painter {
  width = 0;

  height = 0;

  brushes: Record<string, Brush> = {};

  chart: Chart<Options>;

  canvas!: HTMLCanvasElement;

  ctx!: CanvasRenderingContext2D;

  constructor(chart: Chart<Options>) {
    this.chart = chart;
  }

  showUnsupportedCanvasFeatureError() {
    if (!this.ctx.setLineDash) {
      console.warn(message.DASH_SEGMENTS_UNAVAILABLE_ERROR);
    }
  }

  setup() {
    const { height, width } = this.chart.store.state.chart;

    if (!this.canvas) {
      const canvas = document.createElement('canvas');

      this.canvas = canvas;

      this.chart.el.appendChild(canvas);

      canvas.addEventListener('click', this.chart);
      canvas.addEventListener('mousemove', this.chart);
      canvas.addEventListener('mousedown', this.chart);
      canvas.addEventListener('mouseup', this.chart);
      canvas.addEventListener('mouseout', this.chart);

      const ctx = canvas.getContext('2d');

      if (ctx) {
        this.ctx = ctx;
      }
    }

    this.setSize(width, height);
    this.showUnsupportedCanvasFeatureError();
  }

  setSize(width: number, height: number) {
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;

    let ratio = 1;

    if ('deviceXDPI' in window.screen) {
      // IE mobile or IE
      ratio =
        (window.screen as MSWindowScreen).deviceXDPI /
        (window.screen as MSWindowScreen).logicalXDPI;
    } else if (window.hasOwnProperty('devicePixelRatio')) {
      ratio = window.devicePixelRatio;
    }

    this.width = width * ratio || 0;
    this.height = height * ratio || 0;

    this.scaleCanvasRatio(ratio);
  }

  scaleCanvasRatio(ratio: number) {
    this.canvas.width = this.width;
    this.canvas.height = this.height;

    this.ctx.scale(ratio, ratio);
  }

  add(name: string, brush: Brush) {
    this.brushes[name] = brush;
  }

  addGroups(groups: any[]) {
    groups.forEach((group) => {
      Object.keys(group).forEach((key) => {
        this.add(key, group[key]);
      });
    });
  }

  paint(name: string, brushModel: any) {
    if (this.brushes[name]) {
      this.brushes[name](this.ctx, brushModel);
    } else {
      throw new Error(message.noBrushError(name));
    }
  }

  paintForEach(brushModels: any[]) {
    brushModels.forEach((m) => this.paint(m.type, m));
  }

  beforeFrame() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.ctx.fillStyle = 'transparent';
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  beforeDraw(transX: number, transY: number) {
    this.ctx.save();
    this.ctx.translate(transX, transY);
  }

  afterDraw() {
    this.ctx.restore();
  }
}
