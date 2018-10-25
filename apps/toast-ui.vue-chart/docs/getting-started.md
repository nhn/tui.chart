# Getting Started

## 🚩 Table of Contents
* [Install](#-install)
    * [Using npm](#using-npm)
* [Usage](#-usage)
    * [Load](#load)
    * [Components](#components)
    * [Implement](#implement)
    * [Props](#props)
        * [data](#data)
        * [options](#options)
        * [theme](#theme)
        * [map](#map) 
    * [Event](#event)
    * [Method](#method)


## 💾 Install

### Using npm

```sh
npm install --save @toast-ui/vue-chart
```

## 📊 Usage

### Load

You can use Toast UI Chart for Vue as moudule format or namespace. When using module format, you should load `tui-chart.css` in the script.

* Using Ecmascript module

    ```js
    import 'tui-chart/dist/tui-chart.css'
    import { barChart, lineChart } from '@toast-ui/vue-chart'
    ```

* Using Commonjs module

    ```js
    require('tui-chart/dist/tui-chart.css');
    var toastui = require('@toast-ui/vue-chart');
    var barChart = toastui.barChart;
    var lineChart = toastui.lineChart;
    ```

* Using namespace

    ```js
    var barChart = toastui.barChart;
    var lineChart = toastui.lineChart;
    ```

### Components

You can use [all kinds of charts in tui.chart](https://github.com/nhnent/tui.chart#-features). Vue Components for each chart types are:

* `barChart`
* `columnChart`
* `lineChart`
* `areaChart`
* `bubbleChart`
* `scatterChart`
* `pieChart`
* `comboChart`
* `mapChart`
* `heatmapChart`
* `treemapChart`
* `radialChart`
* `boxplotChart`
* `bulletChart`

### Implement

1. If you want to use `barChart`, insert `<bar-chart>` in the template or html. `data` prop is required.

    ```html
    <bar-chart :data="chartData"/>
    ```

2. Load chart component and then add it to the `components` in your component or Vue instance.

    ```js
    import 'tui-chart/dist/tui-chart.css'
    import { barChart } from '@toast-ui/vue-chart'

    export default {
        components: {
            'bar-chart': barChart
        },
        data() {
            return {
                chartData: { // for 'data' prop of 'bar-chart'
                    categories: ['July', 'Aug', 'Sep', 'Oct', 'Nov'],
                    series: [
                        {
                            name: 'Budget',
                            data: [3000, 5000, 7000, 6000, 4000]
                        },
                        {
                            name: 'Income',
                            data: [1000, 7000, 2000, 5000, 3000]
                        }
                    ]
                }
            }
        }
    }
    ```
    or
    ```js
    import 'tui-chart/dist/tui-chart.css'
    import { barChart } from '@toast-ui/vue-chart'

    new Vue({
        el: '#app',
        components: {
            'bar-chart': barChart
        },
        data() {
            return {
                chartData: { // for 'data' prop of 'bar-chart'
                    categories: ['July', 'Aug', 'Sep', 'Oct', 'Nov'],
                    series: [
                        {
                            name: 'Budget',
                            data: [3000, 5000, 7000, 6000, 4000]
                        },
                        {
                            name: 'Income',
                            data: [1000, 7000, 2000, 5000, 3000]
                        }
                    ]
                }
            }
        }
    });
    ```

### Props

You can use `data`, `options`, `theme` props for initailize tui.chart.

If you use map chart, you should use `map` prop.

#### data

| Type | Required |
| --- | --- |
| Object | O |

This prop is for data of the chart. When you change data, chart is rendering for changing data.

For more information, see `rawData` of each types chart in [tui.chart document](https://nhnent.github.io/tui.chart/latest/tui.chart.html).

* Example:

    ``` html
    <template>
        <line-chart :data="chartData"/>
    </template>
    <script>
    import 'tui-chart/dist/tui-chart.css'
    import { lineChart } from '@toast-ui/vue-chart';

    export default {
        name: 'LineChart',
        components: {
            'line-chart': lineChart
        },
        data() {
            return {
                chartData: {
                    categories: ['2015', '2016', '2017', '2018'],
                    series: [
                        {
                            name: 'Seoul',
                            data: [-3.5, -1.1, 4.0, 11.3]
                        },
                        {
                            name: 'Seattle',
                            data: [3.8, 5.6, 7.0, 9.1]
                        },
                        {
                            name: 'Sydney',
                            data: [22.1, 22.0, 20.9, 18.3]
                        },
                        {
                            name: 'Moskva',
                            data: [-10.3, -9.1, -4.1, 4.4]
                        },
                        {
                            name: 'Jungfrau',
                            data: [-13.2, -13.7, -13.1, -10.3]
                        }
                    ]
                }
            }
        }
    };
    </script>
    ```

#### options

| Type | Required |
| --- | --- |
| Object | X |

This prop is for [options of tui.chart](http://nhnent.github.io/tui.chart/latest/tui.chart.html) and used for initailize tui.chart.

* Example:

    ``` html
    <template>
        <line-chart :data="chartData" :options="chartOptions"/>
    </template>
    <script>
    import 'tui-chart/dist/tui-chart.css'
    import { lineChart } from '@toast-ui/vue-chart';

    export default {
        name: 'LineChart',
        components: {
            'line-chart': lineChart
        },
        data() {
            return {
                chartData: {
                    // ... omit
                },
                chartOptions: {
                    chart: {
                        width: 500,
                        height: 540,
                        title: '24-hr Average Temperature'
                    },
                    yAxis: {
                        title: 'Temperature (Celsius)',
                        pointOnColumn: true
                    },
                    xAxis: {
                        title: 'Years'
                    },
                    series: {
                        showDot: false,
                        zoomable: true
                    },
                    tooltip: {
                        suffix: '°C'
                    }
                }
            }
        }
    };
    </script>
    ```

#### theme

| Type | Required |
| --- | --- |
| Object | X |

This prop can change theme of the chart.

For more information see [registerTheme of tui.chart](http://nhnent.github.io/tui.chart/latest/tui.chart.html#.registerTheme)

* Example:

    ``` html
    <template>
        <line-chart :data="chartData" :theme="chartTheme"/>
    </template>
    <script>
    import 'tui-chart/dist/tui-chart.css'
    import { lineChart } from '@toast-ui/vue-chart';

    export default {
        name: 'LineChart',
        components: {
            'line-chart': lineChart
        },
        data() {
            return {
                chartData: {
                    // ... omit
                },
                chartTheme: {
                    series: {
                        colors: [
                            '#83b14e', '#458a3f', '#295ba0', '#2a4175', '#289399',
                            '#289399', '#617178', '#8a9a9a', '#516f7d', '#dddddd'
                        ]
                    },
                    legend: {
                        label: {
                            fontSize: 20
                        }
                    }
                }
            }
        }
    };
    </script>
    ```

#### map

| Type | Required |
| --- | --- |
| String or Object | X |

You want to use map chart, you need to set map prop.

We suppoert maps of `world`, `south-korea`, `china`, `usa`, `japan`, `singapore`, `thailand`, `taiwan`. So in case you just set `String` of these kinds of map.

If you want to use other maps, you set `Object` that is required `name` and `value`. 

For more information see [registerMap of tui.chart](http://nhnent.github.io/tui.chart/latest/tui.chart.html#.registerMap)

* Example using `String`:

    ```html
    <template>
        <map-chart :data="chartData" map="south-korea"/>
    </template>
    <script>
    import 'tui-chart/dist/tui-chart.css'
    import { mapChart } from '@toast-ui/vue-chart';

    export default {
        name: 'MapChart',
        components: {
            'map-chart': mapChart
        },
        data() {
            return {
                chartData: {
                    series: [
                        {
                            code: 'KR-SU',
                            data: 12.5
                        },
                        {
                            code: 'KR-BS',
                            data: 14.7
                        },
                        {
                            code: 'KR-DG',
                            data: 14.1
                        },
                        // ... omit
                    ]
                }
            }
        }
    };
    </script>
    ```

* Example using `Object`:

    ```html
    <template>
        <map-chart :data="chartData" :map="mapData"/>
    </template>
    <script>
    import 'tui-chart/dist/tui-chart.css'
    import { mapChart } from '@toast-ui/vue-chart';

    export default {
        name: 'MapChart',
        components: {
            'map-chart': mapChart
        },
        mixins: [common],
        data() {
            return {
                chartData: {
                    // ... omit
                },
                mapData: {
                    name: 'germany',
                    value: [....]
                }
            }
        }
    };
    </script>
    ```

### Event

| Name | Description |
| --- | --- |
| load | This event occurs when the chart is loaded, except options has `showLabel: true` in the series. |
| selectLegend | This event occurs when the label of legend is clicked. |
| selectSeries | This event occurs when options has `allowSelect: true` in the series and then the series is selected. |
| unselectSeries | This event occurs when options has `allowSelect: true` in the series and then the series is unselected. |
| beforeShowTooltip | This event occurs before tooltip show. |
| afterShowTooltip | This event occurs after tooltip show. |
| beforeHideTooltip | This event occurs before tooltip hide. |
| zoom | This event occurs when change rate of zoom. |

* Example :

    ```html
    <template>
        <bar-chart
        :data="chartData"
        @load="onLoad"
        @selectLegend="onSelectLegend"
        @selectSeries="onSelectSeries"
        @unselectSeries="onUnselectSeries"
        @beforeShowTooltip="onBeforeShowTooltip"
        @afterShowTooltip="onAfterShowTooltip"
        @beforeHideTooltip="onBeforeHideTooltip"
        @zoom="onZoom"
        />
    </template>
    <script>
    import 'tui-chart/dist/tui-chart.css'
    import { barChart } from '@toast-ui/vue-chart'

    export default {
        name: 'BarChart',
        components: {
            'bar-chart': barChart
        },
        data() {
            return {
                chartData: {
                    // ... omit
                }
            }
        },
        methods: {
            onLoad() {
                // implement your code
            },
            onSelectLegend() {
                // implement your code
            },
            onSelectSeries() {
                // implement your code
            },
            onUnselectSeries() {
                // implement your code
            },
            onBeforeShowTooltip() {
                // implement your code
            },
            onAfterShowTooltip() {
                // implement your code
            },
            onBeforeHideTooltip() {
                // implement your code
            },
            onZoom() {
                // implement your code
            }
        }
    };
    </script>
    ```

### Method

For use method, first you need to assign ref attribute of element like this:

```html
<bar-chart ref="tuiChart" data="chartData"/>
```

After then you can use methods through `this.$refs`. We provide `invoke` method. You can use `invoke` method to call the method of tui.chart. First argument of invoke is name of the method and second argument is parameters of the method.

```js
this.$refs.tuiChart.invoke('resize', {
    width: 500,
    height: 500
});
this.$refs.tuiChart.invoke('animateChart');
```

For more information of method, see [method of tui.chart](http://nhnent.github.io/tui.chart/api/latest/).
