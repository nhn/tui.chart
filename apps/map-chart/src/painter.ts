import MapChart from '@src/chart';
import { geoMercator, geoPath, GeoPath } from 'd3-geo';

type BrushModel = '';
type Brush = (ctx: CanvasRenderingContext2D, brushModel: BrushModel) => void;
const noBrushError = (brushName: string) => `Brush don't exist in painter: ${brushName}`;
// for IE
interface MSWindowScreen extends Screen {
  deviceXDPI: number;
  logicalXDPI: number;
}

export default class Painter {
  width = 0;

  height = 0;

  brushes: Record<string, Brush> = {};

  chart: MapChart;

  gp!: GeoPath;

  canvas!: HTMLCanvasElement;

  ctx!: CanvasRenderingContext2D;

  constructor(chart: MapChart) {
    this.chart = chart;
  }

  getProjectionAppliedScale() {
    const projection = geoMercator();
    const left = 0;
    const top = 0;
    const w = 500;
    const h = 500;

    const area = {
      bottom: h + top,
      height: h,
      left, // canvas 시작점
      right: w + left,
      top, // canvas 시작정
      width: w,
    };

    const { width, height, refScale, refX, refY } = this.computeBounds(projection);

    const chartWidth = area.right - area.left;
    const chartHeight = area.bottom - area.top;

    const scale = Math.min(chartWidth / width, chartHeight / height);
    const viewWidth = width * scale;
    const viewHeight = height * scale;

    const x = (chartWidth - viewWidth) * 0.5 + area.left;
    const y = (chartHeight - viewHeight) * 0.5 + area.top;

    projection.scale(refScale * scale).translate([scale * refX + x, scale * refY + y]);

    return projection;
  }

  computeBounds(projection) {
    const outline = { type: 'Sphere' };
    const canvasWidth = 500;
    const bounds = geoPath(projection.fitWidth(canvasWidth, outline)).bounds(outline);

    const height = Math.ceil(bounds[1][1] - bounds[0][1]);
    const width = Math.ceil(bounds[1][0] - bounds[0][0]);
    const t = projection.translate();

    return {
      width,
      height,
      aspectRatio: width / height,
      refScale: projection.scale(),
      refX: t[0],
      refY: t[1],
    };
  }

  setup() {
    // const { height = 500, width = 500 } = this.chart.store.state.chart;
    const height = 500;
    const width = 500;

    if (!this.canvas) {
      const canvas = document.createElement('canvas');

      this.canvas = canvas;

      this.chart.el.appendChild(canvas);

      canvas.addEventListener('click', this.chart);
      canvas.addEventListener('mousemove', this.chart);
      canvas.addEventListener('mousedown', this.chart);
      canvas.addEventListener('mouseup', this.chart);

      const ctx = canvas.getContext('2d');

      if (ctx) {
        this.ctx = ctx;
      }
    }

    this.setSize(width, height);
    const projection = this.getProjectionAppliedScale();
    this.gp = geoPath(projection);
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
    // 여기서 어떻게 하냐/
    console.log(brushModel, 'mo');

    if (this.brushes[name]) {
      this.brushes[name](this.ctx, brushModel);
    } else {
      throw new Error(noBrushError(name));
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

  // 이런거 해줄게 있을까? d3-geo 쓸건데.
  beforeDraw(transX: number, transY: number) {
    this.ctx.save();
    this.ctx.translate(transX, transY);
  }

  afterDraw() {
    this.ctx.restore();
  }
}
