import React from 'react';
import TuiChart from 'tui-chart';
import maps from './maps';

const creator = {
  bar: TuiChart.barChart,
  column: TuiChart.columnChart,
  line: TuiChart.lineChart,
  area: TuiChart.areaChart,
  bubble: TuiChart.bubbleChart,
  scatter: TuiChart.scatterChart,
  pie: TuiChart.pieChart,
  combo: TuiChart.comboChart,
  map: TuiChart.mapChart,
  heatmap: TuiChart.heatmapChart,
  treemap: TuiChart.treemapChart,
  radial: TuiChart.radialChart,
  boxplot: TuiChart.boxplotChart,
  bullet: TuiChart.bulletChart
};

export default function(chartType) {
  return class ChartFactory extends React.Component {
    rootEl = React.createRef();
    chartInst = null;

    getRootElement() {
      return this.rootEl.current;
    }

    getInstance() {
      return this.chartInst;
    }

    bindEventHandlers() {
      Object.keys(this.props)
        .filter((key) => /on[A-Z][a-zA-Z]+/.test(key))
        .forEach((key) => {
          const eventName = key[2].toLowerCase() + key.slice(3);
          this.chartInst.on(eventName, this.props[key]);
        });
    }

    registerMap() {
      const {
        options: {map}
      } = this.props;

      TuiChart.registerMap(map, maps[map]);
    }

    componentDidMount() {
      const props = [this.props.data, this.props.options];

      if (chartType === 'map') {
        this.registerMap();
      }

      this.chartInst = new creator[chartType](this.rootEl.current, ...props);

      this.bindEventHandlers();
    }

    shouldComponentUpdate(nextProps) {
      const {data: currentData} = this.props;
      const {data: nextData} = nextProps;

      if (currentData !== nextData) {
        this.getInstance().setData(nextData);
      }

      return false;
    }

    render() {
      return <div ref={this.rootEl} />;
    }
  };
}
