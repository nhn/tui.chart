## ![Toast UI Chart](https://user-images.githubusercontent.com/35218826/37320160-c4d6dec4-26b5-11e8-9a91-79bb2b882410.png)

> 🍞📈 Spread your data on TOAST UI Chart. TOAST UI Chart is Beautiful Statistical Data Visualization library

[![GitHub release](https://img.shields.io/github/release/nhnent/tui.chart.svg)](https://github.com/nhnent/tui.grid/releases/latest) [![npm](https://img.shields.io/npm/v/tui-chart.svg)](https://www.npmjs.com/package/tui-grid) [![bower](https://img.shields.io/bower/v/tui-chart.svg)](https://github.com/nhnent/tui.chart/releases/latest) [![GitHub license](https://img.shields.io/github/license/nhnent/tui.chart.svg)](https://github.com/nhnent/tui.chart/blob/production/LICENSE) [![PRs welcome](https://img.shields.io/badge/PRs-welcome-ff69b4.svg)](https://github.com/nhnent/tui.chart/pulls) [![code with hearth by NHN Entertainment](https://img.shields.io/badge/%3C%2F%3E%20with%20%E2%99%A5%20by-NHN%20Entertainment-ff1414.svg)](https://github.com/nhnent)

![chart_animation](https://user-images.githubusercontent.com/35218826/37018282-2a792584-2157-11e8-835f-fac1275d31e0.gif)
![all](https://user-images.githubusercontent.com/35218826/37026890-1e2bcfe0-2173-11e8-9b06-3db329d5f477.png)



## 🚩 Table of Contents
* [Browser Support](#-browser-support)
* [True Cross Browser Charts](#-true-cross-browser-charts)
* [Features](#-features)
    * [single-charts](#single-charts)
    * [Combo Charts](#combo-charts)
    * [Customize](#customize)
    * [And More From Examples](#and-more-from-examples)
* [Install](#-install)
  * [Via Package Manager](#via-package-manager)
  * [Download Source Files](#download-source-files)
* [Load](#load)
    * [namespace](#load)
    * [modules](#load)
* [Usage](#-usage)
  * [HTML](#html)
  * [JavaScript](#javascript)
* [Development](#develop)
  * [Setup](#setup)
  * [Develop](#develop)
* [Documents](#-documents)
* [Contributing](#-contributing)
* [TOAST UI Family](#-toast-ui-family)
* [License](#-license)


## 🌏 Browser Support
| <img src="https://user-images.githubusercontent.com/1215767/34348387-a2e64588-ea4d-11e7-8267-a43365103afe.png" alt="Chrome" width="16px" height="16px" /> Chrome | <img src="https://user-images.githubusercontent.com/1215767/34348383-9e7ed492-ea4d-11e7-910c-03b39d52f496.png" alt="Firefox" width="16px" height="16px" /> Firefox | <img src="https://user-images.githubusercontent.com/1215767/34348394-a981f892-ea4d-11e7-9156-d128d58386b9.png" alt="Safari" width="16px" height="16px" /> Safari | <img src="https://user-images.githubusercontent.com/1215767/34348380-93e77ae8-ea4d-11e7-8696-9a989ddbbbf5.png" alt="Edge" width="16px" height="16px" /> Edge | <img src="https://user-images.githubusercontent.com/1215767/34348590-250b3ca2-ea4f-11e7-9efb-da953359321f.png" alt="IE" width="16px" height="16px" /> Internet Explorer |
| :---------: | :---------: | :---------: | :---------: | :---------: |
| Yes | Yes | Yes | Yes | 8+ |

## 🌈 True Cross Browser Charts And It's Beautiful!

| IE8 | CHROME |
| --- | --- |
| ![IE8](https://user-images.githubusercontent.com/35218826/37317347-aa1beb1e-26a7-11e8-860c-19274fbc1570.png) | ![CHROME](https://user-images.githubusercontent.com/35218826/37317349-aba19d08-26a7-11e8-997b-3a960c968238.png) |


**No one like legacy. But sometimes it matters.**
That is why we started this project. As we couldn't find a project which supporting legacy browsers, maintained reliably, and free for commercial use.

**You can see the charts in IE8 exactly as it looks in Chrome.**
Of course, there are other projects that support legacy browser. However, They may function limited, look different or require polyfill that affect performance bad. The TOAST UI Chart gaurantees identical look on all browsers. And it draws using what browsers have natively(SVG + RVML). So, It requires no polyfill and draw faster.

**The TOAST UI Chart will continue to support legacy browsers as MIT license**
No wonder the other open source charts stop supporting legacy browsers. It's hard to find a reliably maintained open source charts. And some of decent charts ask commercial licences. The TOAST UI Chart has over 50 releases since Jun. 2015 under MIT License. The TOAST UI Chart is the answer if you have same requirements as us.

## 🎨 Features

TOAST UI Chart is a chart library for JavaScript that can be used in legacy browsers including IE8.
It is intuitive and easy to apply without any other learning.
If you like, you can change the chart in detail using many options and custom themes.


### Single Charts

The TOAST UI Chart provides many kind of charts to visualize various form of data.

| [Bar](https://nhnent.github.io/tui.chart/latest/tutorial-example01-01-bar-chart-basic.html)<br>[Column](https://nhnent.github.io/tui.chart/latest/tutorial-example02-01-column-chart-basic.html) | [Line](https://nhnent.github.io/tui.chart/latest/tutorial-example03-01-line-chart-basic.html)<br>[Area](https://nhnent.github.io/tui.chart/latest/tutorial-example04-01-area-chart-basic.html)<br>[Radial](https://nhnent.github.io/tui.chart/latest/tutorial-example13-01-radial-chart-basic.html) | [Bubble](https://nhnent.github.io/tui.chart/latest/tutorial-example05-01-bubble-chart-basic.html)<br>[Scatter](https://nhnent.github.io/tui.chart/latest/tutorial-example06-01-scatter-chart-basic.html) | [Pie](https://nhnent.github.io/tui.chart/latest/tutorial-example07-01-pie-chart-basic.html)(General)<br>[Pie](https://nhnent.github.io/tui.chart/latest/tutorial-example07-04-pie-chart-donut.html)(Donut) |
| --- | --- | --- | --- |
| ![2018-03-13 10 33 49](https://user-images.githubusercontent.com/35218826/37317756-151ad090-26aa-11e8-9fa0-74f9d1029bd9.png) | ![2018-03-13 10 44 51](https://user-images.githubusercontent.com/35218826/37318036-9770729c-26ab-11e8-9329-f30bb149e8e7.png) | ![2018-03-13 10 46 31](https://user-images.githubusercontent.com/35218826/37318092-d5c9737c-26ab-11e8-8975-dc6fb56fe99d.png) | ![2018-03-13 10 43 07](https://user-images.githubusercontent.com/35218826/37317996-60189a4a-26ab-11e8-9d5f-bcf5984ee971.png) |

| [Heatmap](https://nhnent.github.io/tui.chart/latest/tutorial-example10-01-heatmap-chart-basic.html)<br>[Treemap](https://nhnent.github.io/tui.chart/latest/tutorial-example11-01-treemap-chart-basic.html)  |  [Map](https://nhnent.github.io/tui.chart/latest/tutorial-example09-01-map-chart-world-map.html) | [Boxplot](https://nhnent.github.io/tui.chart/latest/tutorial-example14-01-boxplot-chart-basic.html) | [Bullet](https://nhnent.github.io/tui.chart/latest/tutorial-example15-01-bullet-chart-basic.html) |
| --- | --- | --- | --- |
| ![2018-03-13 10 47 56](https://user-images.githubusercontent.com/35218826/37318126-07ba5158-26ac-11e8-8a71-3737d2050412.png) | ![2018-03-13 10 51 01](https://user-images.githubusercontent.com/35218826/37318186-76c13c56-26ac-11e8-9e41-5c4ba1bce610.png) | ![2018-03-13 10 59 27](https://user-images.githubusercontent.com/35218826/37318409-a5b03426-26ad-11e8-958f-b497fad5492b.png) | ![2018-03-13 11 01 46](https://user-images.githubusercontent.com/35218826/37318459-f4c7b35e-26ad-11e8-942b-6de4f7f2bb4c.png) |



### Combo Charts

The TOAST UI Chart covers even more complex data visualization.

| [Column-Line](https://nhnent.github.io/tui.chart/latest/tutorial-example08-01-combo-chart-column-and-line.html) | [Pie-Donut](https://nhnent.github.io/tui.chart/latest/tutorial-example08-02-combo-chart-pie-and-donut.html) | [Line-Area](https://nhnent.github.io/tui.chart/latest/tutorial-example08-03-combo-chart-line-and-area.html) | [Line-Scatter](https://nhnent.github.io/tui.chart/latest/tutorial-example08-04-combo-chart-line-and-scatter.html) |
| --- | --- | --- | --- |
| ![2018-03-13 11 04 48](https://user-images.githubusercontent.com/35218826/37318532-63adea7c-26ae-11e8-9033-d24f7379a0be.png) | ![2018-03-13 11 06 16](https://user-images.githubusercontent.com/35218826/37318577-980a1a3e-26ae-11e8-87d4-ff6d015839b7.png) | ![2018-03-13 11 07 44](https://user-images.githubusercontent.com/35218826/37318606-cbbf59d4-26ae-11e8-8ec8-9766279346cc.png) | ![2018-03-13 11 19 42](https://user-images.githubusercontent.com/35218826/37318993-80728378-26b0-11e8-929e-389995fd9694.png) |


### Customize

Sometimes you may want more options to cover how to visualize data. Then try to customize the detail of the charts. You can change almost everything you see.

| Various expressions | Custom theme | Stack option  | Diverging option | Group tooltip |
| --- | --- | --- | --- | --- |
| ![2018-03-13 11 43 13](https://user-images.githubusercontent.com/35218826/37319762-bfb4932a-26b3-11e8-90d3-4c87fa62b580.png) | ![2018-03-13 11 40 43](https://user-images.githubusercontent.com/35218826/37319713-9770d11c-26b3-11e8-9199-7590a8beae05.png)  | ![2018-03-13 11 44 15](https://user-images.githubusercontent.com/35218826/37319792-e9af280c-26b3-11e8-9eaf-86bccb260df5.png) |![2018-03-13 11 45 15](https://user-images.githubusercontent.com/35218826/37319832-0f181e6e-26b4-11e8-8970-87bb7c7b5928.png) | ![2018-03-13 11 46 39](https://user-images.githubusercontent.com/35218826/37319863-3a208d62-26b4-11e8-9b0c-1a9f565ba413.png) |
  
### And More From Examples

* [Load Data from a table](https://github.com/nhnent/tui.chart/blob/production/docs/wiki/import-chart-data-from-existing-table-element.md)
* [Add data dynamically](https://github.com/nhnent/tui.chart/blob/production/docs/wiki/theme.md)
* [Apply themes](https://nhnent.github.io/tui.chart/latest/tutorial-example12-01-dynamic-chart-append-and-shift-data-dynamically.html)
* [Map Data Attribution](https://www.amcharts.com/svg-maps/)

Check out [Example](https://nhnent.github.io/tui.chart/latest/tutorial-example01-01-bar-chart-basic.html) and [wiki](https://github.com/nhnent/tui.chart/tree/production/docs/wiki#tutorial) to discover more.

## 💾 Install

TOAST UI products can be used by using the package manager or downloading the source directly.
However, we highly recommend using the package manager.

### Via Package Manager

TOAST UI products are registered in two package managers, [npm](https://www.npmjs.com/) and [bower](https://bower.io/).
You can conveniently install it using the commands provided by each package manager.
When using npm, be sure to use it in the environment [Node.js](https://nodejs.org) is installed.

#### npm

```sh
$ npm install --save [[package name]] # Latest version
$ npm install --save [[package name]]@<version> # Specific version
```

#### bower

```sh
$ bower install [[package name]] # Latest version
$ bower install [[package name]]#<tag> # Specific version
```

### Download Source Files
* [Download bundle files](https://github.com/nhnent/tui.chart/tree/production/dist)
* [Download all sources for each version](https://github.com/nhnent/tui.chart/releases)

## 🔨 Usage

### HTML

Add the container element where TOAST UI Chart will be created.

``` html
<div id="chart"></div>
```

### JavaScript
#### Load
TOAST UI Chart can be used by creating an instance with the constructor function. To get the constructor function, you should import the module using one of the following three ways depending on your environment.

```javascript
var chart = tui.chart; /* namespace */
```
```javascript
var chart = require('tui-chart'); /* CommonJS in Node.js */
```
```javascript
import {chart} from 'tui-chart'; /* ES6 in Node.js */
```

Factory function needs three paramters: container, data, options

* Container: Wrapper HTMLElements that will contain charts as a child
* data: numeric data need to make charts
* options: functional options like legend aligment or tooltip visiblities

``` javascript
var container = document.getElementById('chart-area');
var data = {
    category: [...], series: [...]
};
var options = {
    chart: {width: 700, height: 400}
};

chart.barChart(container, data, options);
```

See [details](https://nhnent.github.io/tui.chart/latest) for additional informations.

## 🔧 Development

TOAST UI products are open source, so you can create a pull request(PR) after you fix issues.
Run npm scripts and develop yourself with the following process.

### Setup

Fork `develop` branch into your personal repository.
Clone it to local computer. Install node modules.
Before starting development, you should check to haveany errors.

```sh
$ git clone https://github.com/{username}/tui.chart.git
$ cd tui.chart
$ npm install
$ npm run test
```

### Develop

Let's start development!
You can see your code is reflected as soon as you saving the codes by running a server.
Don't miss adding test cases and then make green rights.

#### Run webpack-dev-server

```sh
$ npm run serve
$ npm run serve:ie8 # Run on Internet Explorer 8
```

#### Run karma test

```sh
$ npm run test
```

### Pull Request

Before PR, check to test lastly and then check any errors.
If it has no error, commit and then push it!

For more information on PR's step, please see links of Contributing section.


### Pull requests
Before PR, check build lastly and then check any errors.
If it has no error, commit and then push it!
```sh
$ npm run deploy
$ npm run test
```

## 📙 Documents
* [Getting Started](https://github.com/nhnent/tui.chart/blob/production/docs/wiki/getting-started.md)
* [Tutorials](https://github.com/nhnent/tui.chart/blob/production/docs/wiki/README.md)
* [APIs](https://nhnent.github.io/tui.chart/latest/)

You can also see the older versions of API page on the [releases page](https://github.com/nhnent/tui.chart/releases).

## 💬 Contributing
* [Code of Conduct](CODE_OF_CONDUCT.md)
* [Contributing guideline](CONTRIBUTING.md)
* [Issue guideline](ISSUE_TEMPLATE.md)
* [Commit convention](https://github.com/nhnent/tui.editor/blob/production/docs/COMMIT_MESSAGE_CONVENTION.md)

## 🍞 TOAST UI Family
* [TOAST UI Editor](https://github.com/nhnent/tui.editor)
* [TOAST UI Grid](https://github.com/nhnent/tui.grid)
* [TOAST UI Components](https://github.com/nhnent)

## 📜 License
This software is licensed under the [MIT](https://github.com/nhnent/tui.chart/blob/production/LICENSE) © [NHN Entertainment](https://github.com/nhnent).


