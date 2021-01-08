import {
  AreaChart,
  BarChart,
  BoxPlotChart,
  BulletChart,
  BubbleChart,
  ColumnChart,
  ColumnLineChart,
  HeatmapChart,
  LineChart,
  LineAreaChart,
  LineScatterChart,
  NestedPieChart,
  PieChart,
  RadarChart,
  ScatterChart,
  TreemapChart,
} from '@toast-ui/chart';

const creator = {
  area: AreaChart,
  bar: BarChart,
  boxPlot: BoxPlotChart,
  bubble: BubbleChart,
  bullet: BulletChart,
  column: ColumnChart,
  columnLine: ColumnLineChart,
  heatmap: HeatmapChart,
  line: LineChart,
  lineArea: LineAreaChart,
  lineScatter: LineScatterChart,
  nestedPie: NestedPieChart,
  pie: PieChart,
  radar: RadarChart,
  scatter: ScatterChart,
  treemap: TreemapChart,
};

export const chartType = Object.keys(creator);

const chartEvents = [
  'clickLegendLabel',
  'clickLegendCheckbox',
  'selectSeries',
  'unselectSeries',
  'hoverSeries',
  'unhoverSeries',
  'zoom',
  'resetZoom',
];

export const createComponent = (type) => ({
  name: `${type}-chart`,
  template: '<div ref="toastuiChart"></div>',
  props: {
    data: {
      type: Object,
      required: true,
    },
    options: {
      type: Object,
    },
  },
  data() {
    return {
      Creator: creator[type],
      chartInstance: null,
      computedOptions: {},
    };
  },
  watch: {
    data: {
      handler(newData) {
        this.chartInstance.setData(newData);
      },
      deep: true,
    },
    options: {
      handler(newOptions) {
        this.chartInstance.setOptions(newOptions);
      },
      deep: true,
    },
  },
  mounted() {
    this.computedOptions = Object.assign({}, this.options);

    this.chartInstance = new this.Creator({
      el: this.$refs.toastuiChart,
      data: this.data,
      options: this.computedOptions,
    });
    this.addEventListeners();
  },
  destroyed() {
    this.chartInstance.destroy();
  },
  methods: {
    addEventListeners() {
      chartEvents.forEach((event) => {
        this.chartInstance.on(event, (...args) => {
          this.$emit(event, ...args);
        });
      });
    },
    invoke(methodName, ...args) {
      let result;
      if (this.chartInstance[methodName]) {
        result = this.chartInstance[methodName](...args);
      }

      return result;
    },
    getRootElement() {
      return this.$refs.toastuiChart;
    },
  },
});
