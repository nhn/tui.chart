import Chart from '@toast-ui/chart';

const chartEvents = [
  'click-legend-label',
  'clickLegendLabel',
  'click-legend-checkbox',
  'clickLegendCheckbox',
  'select-series',
  'selectSeries',
  'unselect-series',
  'unselectSeries',
  'hover-series',
  'hoverSeries',
  'unhover-series',
  'unhoverSeries',
  'zoom',
  'reset-zoom',
  'resetZoom',
];

function getChartEventName(vueEventName) {
  const splittedEventName = vueEventName.split('-');

  return splittedEventName.length === 1
    ? vueEventName
    : splittedEventName.reduce(
        (acc, cur, idx) => (idx ? acc + cur[0].toUpperCase() + cur.slice(1, cur.length) : cur),
        ''
      );
}

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
      creator: Chart[`${type}Chart`],
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
      chartEvents.forEach((e) => {
        const event = getChartEventName(e);

        this.chartInstance.on(event, (...args) => {
          this.$emit(e, ...args);
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
