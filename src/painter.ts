import Chart from '@src/charts/chart';

export type Brush = (ctx: CanvasRenderingContext2D, brushModel: any) => void;

export default class Painter {
  width = 0;

  height = 0;

  brushes: Record<string, Brush> = {};

  chart: Chart;

  ctx!: CanvasRenderingContext2D;

  constructor(chart: Chart) {
    this.chart = chart;
  }

  setup() {
    const { height, width } = this.chart.store.state.chart;

    if (!this.ctx) {
      const canvas = document.createElement('canvas');
      this.chart.el.appendChild(canvas);

      canvas.addEventListener('click', this.chart);
      canvas.addEventListener('mousemove', this.chart);

      const ctx = canvas.getContext('2d');

      if (ctx) {
        this.ctx = ctx;
      }
    }

    this.ctx.canvas.height = this.height = height;
    this.ctx.canvas.width = this.width = width;
  }

  add(name: string, brush: Brush) {
    this.brushes[name] = brush;
  }

  addGroups(groups: any[]) {
    groups.forEach(group => {
      Object.keys(group).forEach(key => {
        this.add(key, group[key]);
      });
    });
  }

  paint(name: string, brushModel: any) {
    if (this.brushes[name]) {
      this.brushes[name](this.ctx, brushModel);
    } else {
      console.log(this.brushes);
      throw new Error(`Brush don't exist in painter: ${name}`);
    }
  }

  paintForEach(brushModels: any[]) {
    brushModels.forEach(m => this.paint(m.type, m));
  }

  beforeFrame() {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }

  beforeDraw(transX: number, transY: number) {
    this.ctx.save();
    this.ctx.translate(transX, transY);
  }

  afterDraw() {
    this.ctx.restore();
  }
}
