# Vue wrapper for TOAST UI Chart

> This is Vue component wrapping [TOAST UI Chart](https://github.nhnent.com/fe/tui.chart).

[![vue2](https://img.shields.io/badge/vue-2.x-brightgreen.svg)](https://vuejs.org/)
[![github version](https://img.shields.io/github/release/nhnent/toast-ui.vue-chart.svg)](https://github.com/nhnent/toast-ui.vue-chart/releases/latest)
[![npm version](https://img.shields.io/npm/v/@toast-ui/vue-chart.svg)](https://www.npmjs.com/package/@toast-ui/vue-chart)
[![license](https://img.shields.io/github/license/nhnent/toast-ui.vue-chart.svg)](https://github.com/nhnent/toast-ui.vue-chart/blob/master/LICENSE)
[![PRs welcome](https://img.shields.io/badge/PRs-welcome-ff69b4.svg)](https://github.com/nhnent/toast-ui.vue-chart/issues?q=is%3Aissue+is%3Aopen+label%3A%22help+wanted%22)
[![code with hearth by NHN ent.](https://img.shields.io/badge/%3C%2F%3E%20with%20%E2%99%A5%20by-NHN%20Ent.-brightgreen.svg)](https://github.com/nhnent)

## 🚩 Table of Contents
* [Collect statistics on the use of open source](#collect-statistics-on-the-use-of-open-source)
* [Install](#-install)
    * [Using npm](#using-npm)
    * [Via Contents Delivery Network (CDN)](#via-contents-delivery-network-cdn)
* [Usage](#-usage)
    * [Load](#load)
    * [Components](#components)
    * [Implement](#implement)
    * [Props](#props)
    * [Event](#event)
    * [Method](#method)
* [Pull Request Steps](#-pull-request-steps)
    * [Setup](#setup)
    * [Develop](#develop)
    * [Pull Request Steps](#pull-request)
* [Documents](#-documents)
* [Contributing](#-contributing)
* [License](#-license)

## Collect statistics on the use of open source

Vue Wrapper of TOAST UI Chart applies Google Analytics (GA) to collect statistics on the use of open source, in order to identify how widely TOAST UI Chart is used throughout the world. It also serves as important index to determine the future course of projects. location.hostname (e.g. > “ui.toast.com") is to be collected and the sole purpose is nothing but to measure statistics on the usage. To disable GA, include tui-code-snippet.js and then immediately write the options as follows:
```js
tui.usageStatistics = false;
```

## 💾 Install

### Using npm

```sh
npm install --save @toast-ui/vue-chart
```

### Via Contents Delivery Network (CDN)

TOAST UI products are available over the CDN powered by [TOAST Cloud](https://www.toast.com).

You can use the CDN as below.

```html
<script src="https://uicdn.toast.com/toast-ui.vue-chart/latest/vue-chart.js"></script>
```

## 📊 Usage

### Load

* Using namespace

    ```js
    var barChart = toastui.barChart;
    ```

* Using module

    ```js
    // es modules
    import { barChart, lineChart } from '@toast-ui/vue-chart'
    // commonjs require
    var ToustUI = require('@toast-ui/vue-chart'); // you can use ToustUI.barChart
    ```

* Using `<script>`
  
    If you just add javascript file to your html, you use CDN or `vue-chart.js` downloaded. Insert `vue-chart.js` with `vue` in your html like this:

    ```html
    <script src="https://cdn.jsdelivr.net/npm/vue"></script>
    <script src="path/to/vue-chart.js"></script>
    ```

* Using only Vue wrapper component

    `vue-chart.js` has all of the tui.chart. If you only need vue wrapper component, you can use `@toast-ui/vue-chart/src/index.js` like this:

    ```js
    import { barChart, lineChart } from '@toast-ui/vue-chart/src/index'
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

    If you want to use `barChart`, implement like this:

    ```js
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

**For more detail with example, see [Getting-Started](https://github.com/nhnent/toast-ui.vue-chart/blob/master/docs/getting-started.md#props)**

| Name | Type | Required | Description |
| --- | --- | --- | --- | 
| data | Object | O | This prop is for data of the chart. When you change data, chart is rendering for changing data. |
| options | Object | X | This prop is for options of tui.chart. You can configuration about chart. |
| theme | Object | X | This prop can change theme of the chart. |
| map | String or Object | X | You want to use map chart, you need to set map prop. We suppoert maps of `world`, `south-korea`, `china`, `usa`, `japan`, `singapore`, `thailand`, `taiwan`. So in case you just set `String` of these kinds of map. If you want to use other maps, you set Object that is required `name` and `value`. |

### Event

**For more detail with example, see [Getting-Started](https://github.com/nhnent/toast-ui.vue-chart/blob/master/docs/getting-started.md#event)**

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

## 🔧 Pull Request Steps

TOAST UI products are open source, so you can create a pull request(PR) after you fix issues.
Run npm scripts and develop yourself with the following process.

### Setup

Fork `develop` branch into your personal repository.
Clone it to local computer. Install node modules.
Before starting development, you should check to haveany errors.

``` sh
$ git clone https://github.com/{your-personal-repo}/[[repo name]].git
$ cd [[repo name]]
$ npm install
```

### Develop

Let's start development!

### Pull Request

Before PR, check to test lastly and then check any errors.
If it has no error, commit and then push it!

For more information on PR's step, please see links of Contributing section.

## 📙 Documents
* [Getting Started](https://github.com/nhnent/toast-ui.vue-chart/blob/master/docs/getting-started.md)

## 💬 Contributing
* [Code of Conduct](https://github.com/nhnent/toast-ui.vue-chart/blob/master/CODE_OF_CONDUCT.md)
* [Contributing guideline](https://github.com/nhnent/toast-ui.vue-chart/blob/master/CONTRIBUTING.md)
* [Commit convention](https://github.com/nhnent/toast-ui.vue-chart/blob/master/docs/COMMIT_MESSAGE_CONVENTION.md)

## 📜 License
This software is licensed under the [MIT](./LICENSE) © [NHN Ent.](https://github.com/nhnent)
