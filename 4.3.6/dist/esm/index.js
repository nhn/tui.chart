import LineChart from "./charts/lineChart";
import PieChart from "./charts/pieChart";
import HeatmapChart from "./charts/heatmapChart";
import AreaChart from "./charts/areaChart";
import LineScatterChart from "./charts/lineScatterChart";
import LineAreaChart from "./charts/lineAreaChart";
import BarChart from "./charts/barChart";
import ColumnChart from "./charts/columnChart";
import ColumnLineChart from "./charts/columnLineChart";
import BubbleChart from "./charts/bubbleChart";
import ScatterChart from "./charts/scatterChart";
import BulletChart from "./charts/bulletChart";
import NestedPieChart from "./charts/nestedPieChart";
import RadarChart from "./charts/radarChart";
import TreemapChart from "./charts/treemapChart";
import BoxPlotChart from "./charts/boxPlotChart";
import RadialBarChart from "./charts/radialBarChart";
import GaugeChart from "./charts/gaugeChart";
export default class Chart {
}
Chart.lineChart = (props) => {
    return new LineChart(props);
};
Chart.areaChart = (props) => {
    return new AreaChart(props);
};
Chart.barChart = (props) => {
    return new BarChart(props);
};
Chart.boxPlotChart = (props) => {
    return new BoxPlotChart(props);
};
Chart.columnChart = (props) => {
    return new ColumnChart(props);
};
Chart.pieChart = (props) => {
    return new PieChart(props);
};
Chart.heatmapChart = (props) => {
    return new HeatmapChart(props);
};
Chart.bubbleChart = (props) => {
    return new BubbleChart(props);
};
Chart.scatterChart = (props) => {
    return new ScatterChart(props);
};
Chart.bulletChart = (props) => {
    return new BulletChart(props);
};
Chart.radarChart = (props) => {
    return new RadarChart(props);
};
Chart.treemapChart = (props) => {
    return new TreemapChart(props);
};
Chart.nestedPieChart = (props) => {
    return new NestedPieChart(props);
};
Chart.lineAreaChart = (props) => {
    return new LineAreaChart(props);
};
Chart.lineScatterChart = (props) => {
    return new LineScatterChart(props);
};
Chart.columnLineChart = (props) => {
    return new ColumnLineChart(props);
};
Chart.radialBarChart = (props) => {
    return new RadialBarChart(props);
};
Chart.gaugeChart = (props) => {
    return new GaugeChart(props);
};
export { LineChart, AreaChart, BarChart, ColumnChart, PieChart, HeatmapChart, BubbleChart, ScatterChart, BulletChart, RadarChart, TreemapChart, NestedPieChart, LineAreaChart, LineScatterChart, ColumnLineChart, BoxPlotChart, RadialBarChart, GaugeChart, };
