import Chart from '@toast-ui/chart';

const creator = {
  line: Chart.lineChart,
};

const chartEvents = [
  // 'load',
  // 'selectLegend',
  // 'selectSeries',
  // 'unselectSeries',
  // 'beforeShowTooltip',
  // 'afterShowTooltip',
  // 'beforeHideTooltip',
  // 'zoom',
  // 'changeCheckedLegends',
];

export const createComponent = (type) => ({
  name: `${type}-chart`,
  template: '<div ref="tuiChart"></div>',
  props: {
    data: {
      type: Object,
      requried: true,
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
      handler(newVal) {
        this.chartInstance.setData(newVal);
      },
      deep: true,
    },
  },
  mounted() {
    this.computedOptions = Object.assign({}, this.options);

    const op = Object.assign(
      {},
      {
        el: this.$refs.tuiChart,
        data: this.data,
        options: this.computedOptions,
      }
    );

    this.chartInstance = this.creator(op);
    console.log(this.chartInstance);
    // this.addEventListeners();
  },
  destoryed() {
    chartEvents.forEach((event) => {
      this.chartInstance.off(event);
    });
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
