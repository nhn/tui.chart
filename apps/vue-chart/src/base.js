import Chart from '@toast-ui/chart';

const creator = {
  area: Chart.areaChart,
  bar: Chart.barChart,
  boxPlot: Chart.boxPlotChart,
  bubble: Chart.bubbleChart,
  bullet: Chart.bulletChart,
  column: Chart.columnChart,
  columnLine: Chart.columnLineChart,
  heatmap: Chart.heatmapChart,
  line: Chart.lineChart,
  lineArea: Chart.lineAreaChart,
  lineScatter: Chart.lineScatterChart,
  nestedPie: Chart.nestedPieChart,
  pie: Chart.pieChart,
  radar: Chart.radarChart,
  scatter: Chart.scatterChart,
  treemap: Chart.treemapChart,
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
  template: '<div ref="tuiChart"></div>',
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
      creator: creator[type],
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

    this.chartInstance = this.creator({
      el: this.$refs.tuiChart,
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
  },
});
