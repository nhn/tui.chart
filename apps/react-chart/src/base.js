import React from 'react';
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

export default function (chartType) {
  return class ChartFactory extends React.Component {
    rootEl = React.createRef();

    chartInst = null;

    getRootElement() {
      return this.rootEl.current;
    }

    getInstance() {
      return this.chartInst;
    }

    bindEventHandlers(props, prevProps) {
      Object.keys(props)
        .filter((key) => /on[A-Z][a-zA-Z]+/.test(key))
        .forEach((key) => {
          const eventName = key[2].toLowerCase() + key.slice(3);
          if (prevProps && prevProps[key] !== props[key]) {
            this.chartInst.off(eventName);
          }
          this.chartInst.on(eventName, this.props[key]);
        });
    }

    componentDidMount() {
      const { data, options } = this.props;
      this.chartInst = new creator[chartType]({ el: this.rootEl.current, data, options });

      this.bindEventHandlers(this.props);
    }

    shouldComponentUpdate(nextProps) {
      const currentData = this.props.data;
      const nextData = nextProps.data;

      if (currentData !== nextData) {
        this.getInstance().setData(nextData);
      }

      this.bindEventHandlers(nextProps, this.props);

      return false;
    }

    render() {
      return <div ref={this.rootEl} />;
    }
  };
}
