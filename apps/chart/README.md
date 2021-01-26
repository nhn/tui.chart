# ![Toast UI Chart](https://user-images.githubusercontent.com/35218826/37320160-c4d6dec4-26b5-11e8-9a91-79bb2b882410.png)

> 🍞📈 Spread your data on TOAST UI Chart. TOAST UI Chart is Beautiful Statistical Data Visualization library

[![npm](https://img.shields.io/npm/v/@toast-ui/chart.svg)](https://www.npmjs.com/package/@toast-ui/chart)

## 🚩 Table of Contents

- [Toast UI Chart](#)
  - [🚩 Table of Contents](#-table-of-contents)
  - [Collect statistics on the use of open source](#collect-statistics-on-the-use-of-open-source)
  - [💾 Install](#-install)
    - [Via Package Manager](#via-package-manager)
      - [npm](#npm)
    - [Via Contents Delivery Network (CDN)](#via-contents-delivery-network-cdn)
    - [Download Source Files](#download-source-files)
  - [🔨 Usage](#-usage)
    - [HTML](#html)
    - [JavaScript](#javascript)
      - [Load](#load)

## Collect statistics on the use of open source

TOAST UI Chart applies Google Analytics (GA) to collect statistics on the use of open source, in order to identify how widely TOAST UI Chart is used throughout the world. It also serves as important index to determine the future course of projects. location.hostname (e.g. > “ui.toast.com") is to be collected and the sole purpose is nothing but to measure statistics on the usage. To disable GA, use the following `usageStatistics` option when creating charts.

```js
const options = {
  // ...
  usageStatistics: false,
};

toastui.Chart.barChart({ el, data, options });
```

## 💾 Install

The TOAST UI products can be installed by using the package manager or downloading the source directly.
However, we highly recommend using the package manager.

### Via Package Manager

The TOAST UI products are registered in [npm](https://www.npmjs.com/) package manager.
Install by using the commands provided by a package manager.
When using npm, be sure [Node.js](https://nodejs.org) is installed in the environment.

#### npm

```sh
$ npm install --save @toast-ui/chart # Latest version
$ npm install --save @toast-ui/chart@<version> # Specific version
```

### Via Contents Delivery Network (CDN)

The TOAST UI Chart is available over a CDN.

- You can use cdn as below.

```html
<link rel="stylesheet" href="https://uicdn.toast.com/chart/latest/toastui-chart.min.css" />
<script src="https://uicdn.toast.com/chart/latest/toastui-chart.min.js"></script>
```

- Within the download you'll find the following directories

```
- uicdn.toast.com/
  ├─ chart/
  │  ├─ latest
  │  │  ├─ toastui-chart.js
  │  │  ├─ toastui-chart.min.js
  │  │  ├─ toastui-chart.css
  │  │  ├─ toastui-chart.min.css
  │  ├─ v4.0.0/
```

### Download Source Files

- [Download all sources for each version](https://github.com/nhn/tui.chart/releases)

## 🔨 Usage

### HTML

Add the container element where TOAST UI Chart will be created.

```html
<div id="chart"></div>
```

### JavaScript

#### Load

The TOAST UI Chart can be used by creating an instance with the constructor function. To access the constructor function, import the module using one of the three following methods depending on your environment.

```js
/* namespace */
const chart = toastui.Chart;

/* CommonJS in Node.js */
const chart = require('@toast-ui/chart');

/* ES6 in Node.js */
import Chart from '@toast-ui/chart';
import { LineChart } from '@toast-ui/chart';
```

[In Webpack 4, when importing package modules, the parts that are defined in the module field have higher priority than the parts defined in the main field](https://webpack.js.org/configuration/resolve/#resolvemainfields). To use the Webpack 4 with the `require` syntax to import `@toast-ui/chart`, the ESM file defined in the `module` field will be loaded, and the file will be transpiled to be compatible with the `require` syntax. In order to use the **bundle file for UMD**, the user must personally load and use the `@toast-ui/chart/dist/toastui-chart.js` or `@toast-ui/chart/dist/toastui-chart.min.js`.

```js
const Chart = require('@toast-ui/chart/dist/toastui-chart.min.js'); // loading the bundle file for UMD
```

Webpack 5 supports the `exports` field. The entry point can be determined by the `exports` field defined in the package. Furthermore, the necessary chart can be loaded through a sub-path, as presented below.

```js
const Chart = require('@toast-ui/chart');  // ./dist/toastui-chart.js

import { BarChart } from '@toast-ui/chart';  // ./dist/esm/index.js

import BarChart from '@toast-ui/chart/bar';
import ColumnChart from '@toast-ui/chart/column';
import LineChart from '@toast-ui/chart/line';
import AreaChart from '@toast-ui/chart/area';
import LineAreaChart from '@toast-ui/chart/lineArea';
import ColumnLineChart from '@toast-ui/chart/columnLine';
import BulletChart from '@toast-ui/chart/bullet';
import BoxPlotChart from '@toast-ui/chart/boxPlot';
import TreemapChart from '@toast-ui/chart/treemap';
import HeatmapChart from '@toast-ui/chart/heatmap';
import ScatterChart from '@toast-ui/chart/scatter';
import LineScatterChart from '@toast-ui/chart/lineScatter';
import BubbleChart from '@toast-ui/chart/bubble';
import PieChart from '@toast-ui/chart/pie';
import NestedPieChart from '@toast-ui/chart/nestedPie';
import RadarChart from '@toast-ui/chart/radar';
```

Constructor function needs three parameters: el, data, options

- el: Wrapper HTML element that will contain the chart as a child.
- data: Numerical data the chart will be based on.
- options: Functional options including legend, alignment, and tooltip formatter.

```js
const el = document.getElementById('chart');
const data = {
  categories: [
    //...
  ],
  series: [
    // ...
  ],
};
const options = {
  chart: { width: 700, height: 400 },
};

chart.barChart({ el, data, options });
// or
new BarChart({ el, data, options });
```

Refer to [details](https://nhn.github.io/tui.chart/latest) for additional information.
