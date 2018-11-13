<template>
<div>
    <h1>🍞📊 TOAST UI Chart + Vue</h1>
    <tui-donut-chart
            ref="tuiDonutChart"
            :data="donutChartData"
            :options="donutChartOptions"
            @changeCheckedLegends="onChangeCheckedLegends"
    ></tui-donut-chart>
    <tui-bar-chart
            ref="tuiBarChart"
            :data="barChartData"
            :options="barChartOptions"
    ></tui-bar-chart>
    <tui-combo-chart
            ref="tuiLineColumnChart"
            :data="lineColumnData"
            :options="lineColumnOptions"
    ></tui-combo-chart>
</div>
</template>
<script>
import 'tui-chart/dist/tui-chart.css';
import {pieChart, barChart, comboChart} from '../src/index';

const chartWidth = 800;

function remakeDataForBarChart(chartData, checkedInfo) {
    const barChartSeriesData = chartData.series;
    const newBarChartSeriesData = barChartSeriesData.map(seriesItem => ({
        name: seriesItem.name,
        data: Array.from(seriesItem.data).filter((value, valueIdx) => checkedInfo[valueIdx])
    }));

    return {
        categories: Array.from(chartData.categories).filter((value, valueIdx) => checkedInfo[valueIdx]),
        series: newBarChartSeriesData
    };
}

function remakeDataForLineColumnChart(chartData, checkedInfo) {
    const comboChartSeriesData = chartData.series;
    const columnChartSeriesData = comboChartSeriesData.column;
    const lineChartSeriesData = comboChartSeriesData.line;

    return {
        categories: chartData.categories,
        series: {
            column: remakeDataForColumnChart(columnChartSeriesData, checkedInfo),
            line: remakeDataForLineChart(lineChartSeriesData, columnChartSeriesData, checkedInfo)
        }
    };
}

function remakeDataForColumnChart(chartData, checkedInfo) {
    return chartData.map((seriesItem, idx) => (
        Object.assign({}, seriesItem, {
            visible: checkedInfo[idx]
        })
    ));
}

function remakeDataForLineChart(lineChartData, columnChartData, checkedInfo) {
    const makeTotalAverage = (chartData, checked) => {
        const totalValueData = chartData.reduce((accumulator, seriesItem, idx) => {
            if (checked[idx]) {
                accumulator.forEach((accValue, accIdx) => {
                    accumulator[accIdx] += seriesItem.data[accIdx];
                });
            }

            return accumulator;
        }, [0, 0, 0]);

        return totalValueData.map(totalValue => totalValue / (checked.filter(checkInfo => checkInfo).length));
    };

    return lineChartData.map(seriesItem => ({
        name: seriesItem.name,
        data: makeTotalAverage(columnChartData, checkedInfo)
    }));
}

export default {
    components: {
        'tui-donut-chart': pieChart,
        'tui-bar-chart': barChart,
        'tui-combo-chart': comboChart
    },
    data() {
        return {
            donutChartData: {
                series: [
                    {
                        name: 'O',
                        data: 234196
                    },
                    {
                        name: 'A',
                        data: 292124
                    },
                    {
                        name: 'B',
                        data: 230728
                    },
                    {
                        name: 'AB',
                        data: 98152
                    }
                ]
            },
            donutChartOptions: {
                chart: {
                    width: chartWidth,
                    height: 700,
                    title: 'Transfusion statistics according to blood type',
                    format: '1,000'
                },
                series: {
                    radiusRange: ['40%', '100%'],
                    showLabel: true,
                    showLegend: true,
                    labelAlign: 'outer'
                },
                legend: {
                    visible: true,
                    align: 'top'
                }
            },
            barChartData: {
                categories: ['O', 'A', 'B', 'AB'],
                series: [
                    {
                        name: 'Male',
                        data: [164350, 207708, 162275, 69444]
                    },
                    {
                        name: 'Female',
                        data: [69846, 84416, 68453, 28708]
                    }
                ]
            },
            barChartOptions: {
                chart: {
                    width: chartWidth
                },
                yAxis: {
                    title: 'Blood Type'
                },
                xAxis: {
                    title: {
                        text: 'Recipient(people)',
                        offsetX: 700
                    }
                },
                legend: {
                    visible: false
                }
            },
            lineColumnData: {
                categories: ['Male', 'Female', 'All'],
                series: {
                    column: [
                        {
                            name: 'O',
                            data: [164350, 69846, 234196]
                        },
                        {
                            name: 'A',
                            data: [207708, 84416, 292124]
                        },
                        {
                            name: 'B',
                            data: [162275, 68453, 230728]
                        },
                        {
                            name: 'AB',
                            data: [69444, 28708, 98152]
                        }
                    ],
                    line: [
                        {
                            name: 'Average',
                            data: [150944, 62855, 213800]
                        }
                    ]
                }
            },
            lineColumnOptions: {
                chart: {
                    width: chartWidth,
                    height: 650,
                    title: 'Transfusion statistics according to blood type',
                    format: '1,000'
                },
                yAxis: {
                    title: 'Blood Type'
                },
                xAxis: {
                    title: {
                        text: 'Recipient',
                        offsetX: 600
                    }
                },
                legend: {
                    visible: false
                }
            }
        };
    },
    methods: {
        onChangeCheckedLegends(info) {
            console.group('changeCheckedLegends');
            console.log('Info : ', info);
            console.groupEnd();

            const {chartType} = this.$refs.tuiDonutChart.chartInstance;
            const checkedInfo = info[chartType];

            this.$refs.tuiBarChart.invoke(
                'setData',
                remakeDataForBarChart(this.barChartData, checkedInfo)
            );

            this.$refs.tuiLineColumnChart.invoke(
                'setData',
                remakeDataForLineColumnChart(this.lineColumnData, checkedInfo)
            );
        },
        onZoom()
    }
};
</script>
