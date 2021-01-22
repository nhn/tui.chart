import { lineChart } from '../src/index';
import '@toast-ui/chart/dist/toastui-chart.min.css';
import { temperatureData } from './data';

export default {
  title: 'options',
};

export const event = () => {
  const options = {
    chart: { height: 500, width: 1000 },
    xAxis: { pointOnColumn: true },
    series: { selectable: true },
  };

  return {
    components: {
      'line-chart': lineChart,
    },
    created() {
      this.chartProps = { data: temperatureData, options };
    },
    methods: {
      hoverSeries(ev) {
        console.log(ev, 'hover!');
      },
      selectSeries(ev) {
        console.log(ev, 'select!');
      },
    },
    template: `
      <line-chart 
        :data="chartProps.data" 
        :options="chartProps.options" 
        @hoverSeries="hoverSeries" 
        @selectSeries="selectSeries">
      </line-chart>`,
  };
};

export const invokeMethod = () => {
  const options = {
    chart: { height: 500, width: 1000 },
    xAxis: { pointOnColumn: true },
  };

  return {
    components: {
      'line-chart': lineChart,
    },
    created() {
      this.chartProps = { data: temperatureData, options };
    },
    methods: {
      showSeriesDataLabel() {
        this.$refs.chartRef.invoke('showSeriesDataLabel');
      },
      hideSeriesDataLabel() {
        this.$refs.chartRef.invoke('hideSeriesDataLabel');
      },
    },
    template: `
      <div>
        <line-chart
          ref="chartRef"
          :data="chartProps.data"
          :options="chartProps.options"
        ></line-chart>
        <button @click="showSeriesDataLabel">show label</button>
        <button @click="hideSeriesDataLabel">hide label</button>
      </div>`,
  };
};
