# TOAST UI Chart for Vue

> This is Vue component wrapping [TOAST UI Chart](https://github.com/nhn/tui.chart).

[![npm version](https://img.shields.io/npm/v/@toast-ui/vue-chart.svg)](https://www.npmjs.com/package/@toast-ui/vue-chart)

## 🚩 Table of Contents

- [Collect statistics on the use of open source](#collect-statistics-on-the-use-of-open-source)
- [Install](#-install)
  - [Using npm](#using-npm)
- [Usage](#-usage)
  - [Load](#load)
  - [Components](#components)
  - [Implement](#implement)
  - [Props](#props)
  - [Event](#event)
  - [Method](#method)
- [Pull Request Steps](#-pull-request-steps)
- [Contributing](#-contributing)
- [License](#-license)

## Collect statistics on the use of open source

Vue Wrapper of TOAST UI Chart applies Google Analytics (GA) to collect statistics on the use of open source, in order to identify how widely TOAST UI Chart is used throughout the world. It also serves as important index to determine the future course of projects. location.hostname (e.g. > “ui.toast.com") is to be collected, and the sole purpose is nothing but to measure statistics on the usage. To disable GA, use the following `usageStatistics` options when declare Vue Wrapper component.

```js
var options = {
  //...
  usageStatistics: false,
};
```

## 💾 Install

### Using npm

```sh
npm install --save @toast-ui/vue-chart
```

## 📊 Usage

### Load

You can use TOAST UI Chart for Vue as module format or namespace. When using module format, you should load `toastui-chart.min.css` in the script.

- Using ECMAScript module

```js
import '@toast-ui/chart/dist/toastui-chart.min.css';
import { barChart, lineChart } from '@toast-ui/vue-chart';
```

- Using Commonjs module

```js
require('@toast-ui/chart/dist/toastui-chart.min.css');
const toastui = require('@toast-ui/vue-chart');
const barChart = toastui.barChart;
const lineChart = toastui.lineChart;
```

- Using namespace

```js
const barChart = toastui.barChart;
const lineChart = toastui.lineChart;
```

### Components

You can use [all kinds of charts in TOAST UI chart](https://github.com/nhn/tui.chart#-features). Vue Components for each chart types are:

- `areaChart`
- `lineChart`
- `barChart`
- `boxPlotChart`
- `bubbleChart`
- `bulletChart`
- `columnChart`
- `columnLineChart`
- `heatmapChart`
- `lineAreaChart`
- `lineScatterChart`
- `nestedPieChart`
- `pieChart`
- `radarChart`
- `scatterChart`
- `treemapChart`

### Implement

1. If you want to use `barChart`, insert `<bar-chart>` in the template or html. `data` prop is required.

```html
<bar-chart :data="chartData" />
```

2. Load chart component and then add it to the `components` in your component or Vue instance.

```js
import '@toast-ui/chart/dist/toastui-chart.min.css';
import { barChart } from '@toast-ui/vue-chart';

export default {
  components: {
    'bar-chart': barChart,
  },
  data() {
    return {
      chartData: {
        // for 'data' prop of 'bar-chart'
        categories: ['July', 'Aug', 'Sep', 'Oct', 'Nov'],
        series: [
          {
            name: 'Budget',
            data: [3000, 5000, 7000, 6000, 4000],
          },
          {
            name: 'Income',
            data: [1000, 7000, 2000, 5000, 3000],
          },
        ],
      },
    };
  },
};
```

### Props

You can use `data`, `options`, `style` props for initialize TOAST UI chart.

#### data

| Type   | Required |
| ------ | -------- |
| Object | O        |

This prop is for data of the chart. When you change data, chart is rendering for changing data.

For more information, see data of each type chart in [TOAST UI chart document](https://github.com/nhn/tui.chart/tree/main/docs).

> TOAST UI Chart has its own reactivity system, and does not use the reactivity system of Vue. So, instead of adding props in the `data`, declare `props` in the `created` lifecycle method.

```html
<template>
  <line-chart :data="chartProps.data" />
</template>
<script>
  import '@toast-ui/chart/dist/toastui-chart.min.css';
  import { lineChart } from '@toast-ui/vue-chart';

  export default {
    name: 'LineChart',
    components: {
      'line-chart': lineChart,
    },
    created() {
      this.chartProps = {
        data: {
          categories: ['2020', '2021', '2022', '2023'],
          series: [
            {
              name: 'Seoul',
              data: [-3.5, -1.1, 4.0, 11.3],
            },
            {
              name: 'Seattle',
              data: [3.8, 5.6, 7.0, 9.1],
            },
            {
              name: 'Sydney',
              data: [22.1, 22.0, 20.9, 18.3],
            },
            {
              name: 'Moskva',
              data: [-10.3, -9.1, -4.1, 4.4],
            },
            {
              name: 'Jungfrau',
              data: [-13.2, -13.7, -13.1, -10.3],
            },
          ],
        },
      };
    },
  };
</script>
```

#### options

| Type   | Required |
| ------ | -------- |
| Object | X        |

This prop is for [options of TOAST UI chart](https://nhn.github.io/tui.chart/latest/) and used for initialize TOAST UI chart.

> TOAST UI Chart has its own reactivity system, and does not use the reactivity system of Vue. So, instead of adding props in the `data`, declare `props` in the `created` lifecycle method.

```html
<template>
  <line-chart :data="chartProps.data" :options="chartProps.options" />
</template>
<script>
  import '@toast-ui/chart/dist/toastui-chart.min.css';
  import { lineChart } from '@toast-ui/vue-chart';

  export default {
    name: 'LineChart',
    components: {
      'line-chart': lineChart,
    },
    created() {
      this.chartProps = {
        data: {
          // ...
        },
        options: {
          chart: {
            width: 500,
            height: 540,
            title: '24-hr Average Temperature',
          },
          yAxis: {
            title: 'Temperature (Celsius)',
            pointOnColumn: true,
          },
          xAxis: {
            title: 'Years',
          },
          series: {
            showDot: false,
            zoomable: true,
          },
        },
      };
    },
  };
</script>
```

#### style

| Type   | Required |
| ------ | -------- |
| Object | X        |

This prop is for chart container style and used for initialize TOAST UI chart. To use [responsive layout](https://github.com/nhn/tui.chart/blob/main/docs/en/common-responsive-options.md), the width or height of the container must be specified as a value such as "%" or "vh", "vw".

```html
<template>
  <line-chart
    :data="chartProps.data"
    :options="chartProps.options"
    :style="chartProps.containerStyle"
  />
</template>
<script>
  import '@toast-ui/chart/dist/toastui-chart.min.css';
  import { lineChart } from '@toast-ui/vue-chart';

  export default {
    name: 'LineChart',
    components: {
      'line-chart': lineChart,
    },
    created() {
      this.chartProps = {
        data: {
          // ...
        },
        options: {
          // ...
        },
        containerStyle: {
          width: '60vw',
          height: '70vh',
        },
      };
    },
  };
</script>
```

### Event

| eventName             | Details                                                                              |
| --------------------- | ------------------------------------------------------------------------------------ |
| `clickLegendLabel`    | Triggered when the legend's label area is clicked.                                   |
| `clickLegendCheckbox` | Triggered when the legend's checkbox area is clicked.                                |
| `selectSeries`        | Triggered when the series is selected. Requires `options.series.selectable: true`.   |
| `unselectSeries`      | Triggered when the series is unselected. Requires `options.series.selectable: true`. |
| `hoverSeries`         | Triggered when the mouse hovers over a series.                                       |
| `unhoverSeries`       | Triggered when the mouse leaves the series after the `hoverSeries` event.            |
| `zoom`                | Triggered when zoomed. Requires `options.series.zoomable: true`.                     |
| `resetZoom`           | Triggered when zoom is reset. Requires `options.series.zoomable:true`.               |

- Example :

```html
<template>
  <bar-chart
    :data="chartData"
    @clickLegendLabel="onClickLegendLabel"
    @clickLegendCheckbox="onClickLegendCheckbox"
    @selectSeries="onSelectSeries"
    @unselectSeries="onUnselectSeries"
    @hoverSeries="onHoverSeries"
    @unhoverSeries="onUnhoverSeries"
    @zoom="onZoom"
    @resetZoom="onResetZoom"
  />
</template>
<script>
  import '@toast-ui/chart/dist/toastui-chart.min.css';
  import { barChart } from '@toast-ui/vue-chart';

  export default {
    name: 'BarChart',
    components: {
      'bar-chart': barChart,
    },
    data() {
      return {
        chartData: {
          // ... omit
        },
      };
    },
    methods: {
      onClickLegendLabel() {
        // implement your code
      },
      onClickLegendCheckbox() {
        // implement your code
      },
      onSelectSeries() {
        // implement your code
      },
      onUnselectSeries() {
        // implement your code
      },
      onHoverSeries() {
        // implement your code
      },
      onUnhoverSeries() {
        // implement your code
      },
      onZoom() {
        // implement your code
      },
      onResetZoom() {
        // implement your code
      },
    },
  };
</script>
```

### Method

For use method, first you need to assign ref attribute of element like this:

```html
<bar-chart ref="tuiChart" :data="chartData" />
```

After then, you can use methods through `this.$refs`. We provide `invoke` method. You can use `invoke` method to call the method of tui.chart. First argument of invoke is name of the method and second argument is parameters of the method.

```js
this.$refs.tuiChart.invoke('resize', {
  width: 500,
  height: 500,
});
```

For more information of method, see [method of TOAST UI chart](https://github.com/nhn/tui.chart/tree/main/docs/en/common-api.md).

## 🔧 Pull Request Steps

TOAST UI products are open source, so you can create a pull request(PR) after you fix issues.
Run npm scripts and develop yourself with the following process.

### Setup

Fork `develop` branch into your personal repository.
Clone it to local computer. Install node modules.
Before starting development, you should check to have any errors.

```sh
$ git clone https://github.com/{your-personal-repo}/[[repo name]].git
$ cd [[repo name]]
$ npm install
```

### Pull Request

Before PR, check to test lastly and then check any errors.
If it has no error, commit and then push it!

For more information on PR's step, please see links of Contributing section.

## 💬 Contributing

- [Code of Conduct](https://github.com/nhn/tui.chart/blob/main/CODE_OF_CONDUCT.md)
- [Contributing guideline](https://github.com/nhn/tui.chart/blob/main/CONTRIBUTING.md)
- [Commit convention](https://github.com/nhn/tui.chart/blob/main/docs/COMMIT_MESSAGE_CONVENTION.md)

## 📜 License

This software is licensed under the [MIT](https://github.com/nhn/tui.chart/blob/main/LICENSE) © [NHN.](https://github.com/nhn)
