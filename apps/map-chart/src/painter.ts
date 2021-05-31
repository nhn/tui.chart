import MapChart from '@src/chart';
import { geoMercator, geoPath, GeoPath, GeoProjection, GeoSphere } from 'd3-geo';
import { getRatio, setSize } from '@src/helpers/painter';
import { GeoFeatureModel } from '@t/components/geoFeature';
import { Rect } from '@t/store';
import { RectModel } from '@t/components/common';

type BrushModel = GeoFeatureModel[] | RectModel[];
type Brush = (ctx: CanvasRenderingContext2D, brushModel: BrushModel, gp: GeoPath) => void;
const noBrushError = (brushName: string) => `Brush don't exist in painter: ${brushName}`;

export default class Painter {
  width = 0;

  height = 0;

  brushes: Record<string, Brush> = {};

  chart: MapChart;

  gp!: GeoPath;

  projection!: GeoProjection;

  canvas!: HTMLCanvasElement;

  ctx!: CanvasRenderingContext2D;

  constructor(chart: MapChart) {
    this.chart = chart;
  }

  getProjectionAppliedScale({ width: w, height: h }: Rect) {
    const projection = geoMercator();
    const left = 0; // @TODO: remove after set layout
    const top = 0; // @TODO: remove after set layout
    const bottom = h + top;
    const right = w + left;

    const { width, height, refScale, refX, refY } = this.computeBounds(projection);

    const chartWidth = right - left;
    const chartHeight = bottom - top;

    const scale = Math.min(chartWidth / width, chartHeight / height);
    const viewWidth = width * scale;
    const viewHeight = height * scale;

    const x = (chartWidth - viewWidth) * 0.5 + left;
    const y = (chartHeight - viewHeight) * 0.5 + top;

    projection.scale(refScale * scale).translate([scale * refX + x, scale * refY + y]);

    return projection;
  }

  computeBounds(projection: GeoProjection) {
    const outline: GeoSphere = { type: 'Sphere' };
    const [[x, y], [x2, y2]] = geoPath(projection.fitWidth(this.width, outline)).bounds(outline);
    const [refX, refY] = projection.translate();

    const height = Math.ceil(y2 - y);
    const width = Math.ceil(x2 - x);

    return {
      width,
      height,
      aspectRatio: width / height,
      refScale: projection.scale(),
      refX,
      refY,
    };
  }

  setup() {
    const { chart, layout } = this.chart.store.state;
    const { height, width } = chart;

    if (!this.canvas) {
      const canvas = document.createElement('canvas');
      this.canvas = canvas;
      this.chart.el.appendChild(canvas);

      canvas.addEventListener('click', this.chart);
      canvas.addEventListener('mousedown', this.chart);
      canvas.addEventListener('mouseup', this.chart);
      canvas.addEventListener('mousemove', this.chart);
      canvas.addEventListener('mouseout', this.chart);

      const ctx = canvas.getContext('2d');

      if (ctx) {
        this.ctx = ctx;
      }
    }

    this.setSize(this.canvas, this.ctx, width, height);
    this.projection = this.getProjectionAppliedScale(layout.map);
    this.gp = geoPath(this.projection);
  }

  setSize(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, width: number, height: number) {
    const ratio = getRatio();
    this.width = width * ratio || 0;
    this.height = height * ratio || 0;
    setSize(canvas, ctx, width, height, ratio);
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
      this.brushes[name](this.ctx, brushModel, this.gp);
    } else {
      throw new Error(noBrushError(name));
    }
  }

  paintForEach(brushModel: BrushModel) {
    brushModel.forEach((m) => this.paint(m.type, m));
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
