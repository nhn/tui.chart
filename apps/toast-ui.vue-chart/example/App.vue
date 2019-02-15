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
    <tui-map-chart
            ref="tuiMapChart"
            :data="mapChartData"
            :options="mapChartOptions"
    >
    </tui-map-chart>
</div>
</template>
<script>
import 'tui-chart/dist/tui-chart.css';
import 'tui-chart/dist/maps/usa';
import {pieChart, barChart, comboChart, mapChart} from '../src/index';

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
        'tui-combo-chart': comboChart,
        'tui-map-chart': mapChart
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
            },
            mapChartData: {
                series: [
                    {
                        code: 'US-AK',
                        data: -3.0
                    },
                    {
                        code: 'US-AL',
                        data: 17.1
                    },
                    {
                        code: 'US-AZ',
                        data: 15.7
                    },
                    {
                        code: 'US-CA',
                        data: 15.2
                    },
                    {
                        code: 'US-CO',
                        data: 7.3
                    },
                    {
                        code: 'US-CT',
                        data: 9.4
                    },
                    {
                        code: 'US-DC',
                        data: 12.3
                    },
                    {
                        code: 'US-DE',
                        data: 12.9
                    },
                    {
                        code: 'US-FL',
                        data: 21.5
                    },
                    {
                        code: 'US-GA',
                        data: 17.5
                    },
                    {
                        code: 'US-HI',
                        data: 21.1
                    },
                    {
                        code: 'US-IA',
                        data: 8.8
                    },
                    {
                        code: 'US-ID',
                        data: 6.9
                    },
                    {
                        code: 'US-IL',
                        data: 11.0
                    },
                    {
                        code: 'US-IN',
                        data: 10.9
                    },
                    {
                        code: 'US-KS',
                        data: 12.4
                    },
                    {
                        code: 'US-KY',
                        data: 13.1
                    },
                    {
                        code: 'US-LA',
                        data: 19.1
                    },
                    {
                        code: 'US-MA',
                        data: 8.8
                    },
                    {
                        code: 'US-MD',
                        data: 12.3
                    },
                    {
                        code: 'US-ME',
                        data: 5.0
                    },
                    {
                        code: 'US-MI',
                        data: 6.9
                    },
                    {
                        code: 'US-MN',
                        data: 5.1
                    },
                    {
                        code: 'US-MO',
                        data: 12.5
                    },
                    {
                        code: 'US-MS',
                        data: 17.4
                    },
                    {
                        code: 'US-NC',
                        data: 15.0
                    },
                    {
                        code: 'US-ND',
                        data: 4.7
                    },
                    {
                        code: 'US-NE',
                        data: 9.3
                    },
                    {
                        code: 'US-NH',
                        data: 6.6
                    },
                    {
                        code: 'US-NJ',
                        data: 11.5
                    },
                    {
                        code: 'US-NM',
                        data: 11.9
                    },
                    {
                        code: 'US-NV',
                        data: 9.9
                    },
                    {
                        code: 'US-NY',
                        data: 7.4
                    },
                    {
                        code: 'US-OH',
                        data: 10.4
                    },
                    {
                        code: 'US-OK',
                        data: 15.3
                    },
                    {
                        code: 'US-OR',
                        data: 9.1
                    },
                    {
                        code: 'US-PA',
                        data: 9.3
                    },
                    {
                        code: 'US-RI',
                        data: 10.1
                    },
                    {
                        code: 'US-SC',
                        data: 16.9
                    },
                    {
                        code: 'US-SD',
                        data: 7.3
                    },
                    {
                        code: 'US-TN',
                        data: 14.2
                    },
                    {
                        code: 'US-TX',
                        data: 18.2
                    },
                    {
                        code: 'US-UT',
                        data: 9.2
                    },
                    {
                        code: 'US-VA',
                        data: 12.8
                    },
                    {
                        code: 'US-VT',
                        data: 6.1
                    },
                    {
                        code: 'US-WA',
                        data: 9.1
                    },
                    {
                        code: 'US-WI',
                        data: 11.0
                    },
                    {
                        code: 'US-WV',
                        data: 6.2
                    },
                    {
                        code: 'US-WY',
                        data: 5.6
                    }
                ]
            },
            mapChartOptions: {
                chart: {
                    width: 900,
                    height: 700,
                    title: 'Average annual temperature of USA (°C)'
                },
                map: 'usa',
                legend: {
                    align: 'bottom'
                },
                tooltip: {
                    suffix: '°C'
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
        }
    }
};
</script>
