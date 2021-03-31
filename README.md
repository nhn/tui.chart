# ![Toast UI Chart](https://user-images.githubusercontent.com/35218826/37320160-c4d6dec4-26b5-11e8-9a91-79bb2b882410.png)

> 🍞📈 Spread your data on TOAST UI Chart. TOAST UI Chart is Beautiful Statistical Data Visualization library.

[![GitHub release](https://img.shields.io/github/release/nhn/tui.chart.svg)](https://github.com/nhn/tui.chart/releases/latest) [![npm](https://img.shields.io/npm/v/@toast-ui/chart.svg)](https://www.npmjs.com/package/@toast-ui/chart) [![GitHub license](https://img.shields.io/github/license/nhn/tui.chart.svg)](https://github.com/nhn/tui.chart/blob/main/LICENSE) [![PRs welcome](https://img.shields.io/badge/PRs-welcome-ff69b4.svg)](https://github.com/nhn/tui.chart/pulls) [![code with hearth by NHN](https://img.shields.io/badge/%3C%2F%3E%20with%20%E2%99%A5%20by-NHN-ff1414.svg)](https://github.com/nhn)
[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lerna.js.org/)

## 📦 Packages

The functionality of TOAST UI Chart is available when using the Plain JavaScript, React, Vue Component.

- [toast-ui.chart](https://github.com/nhn/tui.chart/tree/main/apps/chart) - Plain JavaScript component implemented by NHN.
- [toast-ui.vue-chart](https://github.com/nhn/tui.chart/tree/main/apps/vue-chart) - **Vue** wrapper component implemented by NHN.
- [toast-ui.react-chart](https://github.com/nhn/tui.chart/tree/main/apps/react-chart) - **React** wrapper component implemented by NHN.

## 📙 Documents

- [Getting Started](https://github.com/nhn/tui.chart/blob/main/docs/en/getting-started.md)
- Tutorials
  - [English](https://github.com/nhn/tui.chart/blob/main/docs/README.md)
  - [한국어](https://github.com/nhn/tui.chart/blob/main/docs/ko/README.md)
- [APIs](https://nhn.github.io/tui.chart/latest/)
- v4.0 Migration Guide
  - [English](https://github.com/nhn/tui.chart/blob/main/docs/v4.0-migration-guide-en.md)
  - [한국어](https://github.com/nhn/tui.chart/blob/main/docs/v4.0-migration-guide-ko.md)

## 😍 Why TOAST UI Chart?

### Simple, Easy to Use, And It's Beautiful!

TOAST UI Chart makes your data pop and presents it in a manner that is easy to understand. Furthermore, it provides a wide range of theme options for customizing the charts to be suitable for all of your services. Chart components like the title, axes, legends, tooltips, plots, series, and more can be customized through the options.

![image](https://user-images.githubusercontent.com/35371660/105487165-01af3500-5cf3-11eb-9243-c66de968798c.png)

### Variety of powerful features!

#### Responsive

Add different options and animations according to the charts' sizes by using the responsive option.

![responsive](https://user-images.githubusercontent.com/35371660/105812424-77681900-5ff1-11eb-9b3c-402798703bc5.gif)

#### Zoomable

Make the data presented in the Line, Area, and Treemap Charts zoomable with the **zoomable** option.

![zoomable](https://user-images.githubusercontent.com/35371660/105669323-68666580-5f22-11eb-8344-be57d7468b93.gif)

#### Live Update

View and manage new data as they are added realtime with the `addData` API and the `options.series.shift` option.

| Area | Line | Heatmap |
|--- | --- | --- |
| ![area](https://user-images.githubusercontent.com/35371660/102159207-6ee6d380-3ec6-11eb-8ca8-07c82095556f.gif)  | ![live update line](https://user-images.githubusercontent.com/35371660/102157257-815f0e00-3ec2-11eb-8b87-a177664a43b2.gif) | ![heatmap](https://user-images.githubusercontent.com/35371660/102159193-68f0f280-3ec6-11eb-9b1f-4fa14c97c879.gif) |

| LineArea | Column | ColumnLine |
|--- | --- | --- |
| ![lineArea](https://user-images.githubusercontent.com/35371660/102160638-2aa90280-3ec9-11eb-98ae-5113cd3f75eb.gif)  | ![column](https://user-images.githubusercontent.com/35371660/102159210-70b09700-3ec6-11eb-9f78-9d9790cd0357.gif) | ![columnline](https://user-images.githubusercontent.com/35371660/102159292-976ecd80-3ec6-11eb-84b9-4e487e411245.gif) |

#### Synchronize Tooltip

Use and synchronize the tooltip features at the moment the cursor hovers over the chart with the `showTooltip` API and the `on` custom event.

![synctooltip](https://user-images.githubusercontent.com/35371660/105493953-65d6f680-5cfd-11eb-9b51-204dbfd589c9.gif)

## 🎨 Features

### Charts

The TOAST UI Chart provides many types of charts to visualize the various forms of data.

| [Area](https://github.com/nhn/tui.chart/blob/main/docs/en/chart-area.md)                                                                         | [Line](https://github.com/nhn/tui.chart/blob/main/docs/en/chart-line.md)                                                                        | [Bar](https://github.com/nhn/tui.chart/blob/main/docs/en/chart-bar.md)                                                                         | [Column](https://github.com/nhn/tui.chart/blob/main/docs/en/chart-column.md)                                                                       |
| ------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| <img src="https://user-images.githubusercontent.com/35371660/104139606-15ec5b80-53f0-11eb-96f6-c5bc593d9603.png"  width="300" alt='area chart'/> | <img src="https://user-images.githubusercontent.com/35371660/104139669-65328c00-53f0-11eb-9612-c457a0cdaf9f.png" width="300" alt='line chart'/> | <img src="https://user-images.githubusercontent.com/35371660/104140066-d2dfb780-53f2-11eb-8bba-355cb22bc35c.png" width="300" alt='bar chart'/> | <img src="https://user-images.githubusercontent.com/35371660/104139953-1259d400-53f2-11eb-8d48-2a48d4cfe6b2.png"  width="300" alt='column chart'/> |

| [Bullet](https://github.com/nhn/tui.chart/blob/main/docs/en/chart-bullet.md)                                                                      | [BoxPlot](https://github.com/nhn/tui.chart/blob/main/docs/en/chart-boxplot.md)                                                                     | [Treemap](https://github.com/nhn/tui.chart/blob/main/docs/en/chart-treemap.md)                                                                     | [Heatmap](https://github.com/nhn/tui.chart/blob/main/docs/en/chart-heatmap.md)                                                                     |
| ------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| <img src="https://user-images.githubusercontent.com/35371660/104140183-76c96300-53f3-11eb-88c7-49c212d9e31b.png" width="300" alt='bullet chart'/> | <img src="https://user-images.githubusercontent.com/35371660/104140209-a6786b00-53f3-11eb-8ff0-ade619a89ff4.png" width="300" alt='boxplot chart'/> | <img src="https://user-images.githubusercontent.com/35371660/104140267-fd7e4000-53f3-11eb-878a-4eb24b4b83de.png" width="300" alt='treemap chart'/> | <img src="https://user-images.githubusercontent.com/35371660/104140300-243c7680-53f4-11eb-9c92-465355e34211.png" width="300" alt='heatmap chart'/> |

| [Scatter](https://github.com/nhn/tui.chart/blob/main/docs/en/chart-scatter.md)                                                                     | [Bubble](https://github.com/nhn/tui.chart/blob/main/docs/en/chart-bubble.md)                                                                      | [Radar](https://github.com/nhn/tui.chart/blob/main/docs/en/chart-radar.md)                                                                       | [Pie](https://github.com/nhn/tui.chart/blob/main/docs/en/chart-pie.md)                                                                         |
| -------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| <img src="https://user-images.githubusercontent.com/35371660/104156462-6c778b00-542c-11eb-9101-a9df4e48d8db.png" width="300" alt='scatter chart'/> | <img src="https://user-images.githubusercontent.com/35371660/104156347-3508de80-542c-11eb-805e-fca276bc6c5f.png" width="300" alt='bubble chart'/> | <img src="https://user-images.githubusercontent.com/35371660/104140534-176c5280-53f5-11eb-830e-574b05fbf4db.png" width="300" alt='radar chart'/> | <img src="https://user-images.githubusercontent.com/35371660/104140544-2eab4000-53f5-11eb-87c3-d2bc9790fa5b.png" width="300" alt='pie chart'/> |

| [LineArea](https://github.com/nhn/tui.chart/blob/main/docs/en/chart-lineArea.md)                                                                    | [LineScatter](https://github.com/nhn/tui.chart/blob/main/docs/en/chart-lineScatter.md)                                                                 | [ColumnLine](https://github.com/nhn/tui.chart/blob/main/docs/en/chart-columnLine.md)                                                                  | [NestedPie](https://github.com/nhn/tui.chart/blob/main/docs/en/chart-nestedPie.md)                                                                   |
| --------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| <img src="https://user-images.githubusercontent.com/35371660/104140692-fc4e1280-53f5-11eb-8ae7-05568ed6f333.png" width="300" alt='lineArea chart'/>| <img src="https://user-images.githubusercontent.com/35371660/104156268-160a4c80-542c-11eb-9893-9adb052727da.png" width="300" alt='lineScatter chart'/> | <img src="https://user-images.githubusercontent.com/35371660/104140778-72527980-53f6-11eb-83ab-ad0883d8593b.png" width="300" alt='columnLine chart'/> | <img src="https://user-images.githubusercontent.com/35371660/104140795-8eeeb180-53f6-11eb-833e-ae1cdb9d8879.png" width="300" alt='nestedPie chart'/> |

| [RadialBar](https://github.com/nhn/tui.chart/blob/main/docs/en/chart-radialBar.md)                                                                    | [Gauge](https://github.com/nhn/tui.chart/blob/main/docs/en/chart-gauge.md)                                                                     |                                                                      |                                                                      |
| --------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| <img width="300" src="https://user-images.githubusercontent.com/43128697/108300194-3ffd1e80-71e3-11eb-988c-f0a56933a4f5.png" alt="radialBar chart"> | <img width="300" alt="gauge chart" src="https://user-images.githubusercontent.com/43128697/110775762-a33e1600-82a2-11eb-82cc-594bf41e9638.png"> | <img width="300" src="https://user-images.githubusercontent.com/43128697/108300188-3ecbf180-71e3-11eb-902c-3814079380cc.png" alt="coming soon"> | <img width="300" src="https://user-images.githubusercontent.com/43128697/108300188-3ecbf180-71e3-11eb-902c-3814079380cc.png" alt="next"> |

- Stack Options(Explained in [each chart guide](https://github.com/nhn/tui.chart/tree/main/docs))
- Diverging Options(Explained in [each chart guide](https://github.com/nhn/tui.chart/tree/main/docs))
- Change Event Detect Type(Explained in [each chart guide](https://github.com/nhn/tui.chart/tree/main/docs))
- [Custom Theme](https://github.com/nhn/tui.chart/tree/main/docs/en/common-theme.md)
- [Custom Tooltip](https://github.com/nhn/tui.chart/blob/main/docs/en/common-tooltip.md)
- [Export `xls`, `csv`, `png`, `jpeg` file](https://github.com/nhn/tui.chart/blob/main/docs/en/common-exportMenu.md)
- [Live Update](https://github.com/nhn/tui.chart/blob/main/docs/en/common-liveUpdate-options.md)
- [Responsive Layout](https://github.com/nhn/tui.chart/blob/main/docs/en/common-responsive-options.md)

In addition, a variety of powerful features can be found on the demo page below. 👇👇👇

## 🐾 Examples

- [Line Chart](http://nhn.github.io/tui.chart/latest/tutorial-example08-01-line-chart-basic)
- [Area Chart](http://nhn.github.io/tui.chart/latest/tutorial-example01-01-area-chart-basic)
- [LineArea Chart](http://nhn.github.io/tui.chart/latest/tutorial-example14-01-LineArea-chart-basic)
- [Bar Chart](http://nhn.github.io/tui.chart/latest/tutorial-example02-01-bar-chart-basic)
- [Column Chart](http://nhn.github.io/tui.chart/latest/tutorial-example06-01-column-chart-basic)
- [ColumnLine Chart](http://nhn.github.io/tui.chart/latest/tutorial-example13-01-columnLine-chart-basic)
- [Bullet Chart](http://nhn.github.io/tui.chart/latest/tutorial-example05-01-bullet-chart-baic)
- [BoxPlot Chart](http://nhn.github.io/tui.chart/latest/tutorial-example03-01-boxPlot-chart-basic)
- [Treemap Chart](http://nhn.github.io/tui.chart/latest/tutorial-example12-01-treemap-chart-basic)
- [Heatmap Chart](http://nhn.github.io/tui.chart/latest/tutorial-example07-01-heatmap-chart-basic)
- [Scatter Chart](http://nhn.github.io/tui.chart/latest/tutorial-example11-01-scatter-chart-basic)
- [LineScatter Chart](http://nhn.github.io/tui.chart/latest/tutorial-example15-01-LineScatter-chart-basic)
- [Bubble Chart](http://nhn.github.io/tui.chart/latest/tutorial-example04-01-bubble-chart-basic)
- [Pie Chart](http://nhn.github.io/tui.chart/latest/tutorial-example09-01-pie-chart-basic)
- [NestedPie Chart](http://nhn.github.io/tui.chart/latest/tutorial-example16-01-NestedPie-chart-basic)
- [Radar Chart](http://nhn.github.io/tui.chart/latest/tutorial-example10-01-radar-chart-basic)
- [RadialBar Chart](http://nhn.github.io/tui.chart/latest/tutorial-example18-01-radialBar-chart-basic)
- [Gauge Chart](http://nhn.github.io/tui.chart/latest/tutorial-example20-01-gauge-chart-basic)

Here are more [examples](http://nhn.github.io/tui.chart/latest/tutorial-example01-01-area-chart-basic) and play with TOAST UI Chart!

## 🔧 Pull Request Steps

TOAST UI products are open source, so you can create a pull request(PR) after you fix issues.
Run npm scripts and develop yourself with the following process.

### Setup

Fork `main` branch into your personal repository.
Clone it to local computer. Install node modules.
Before starting development, you should check to have any errors.

```sh
$ git clone https://github.com/{your-personal-repo}/tui.chart.git
$ npm install
$ cd apps/chart
$ npm install
$ npm run test
```

### Develop

Let's start development!
You can develop UI through webpack-dev-server or storybook, and you can write tests through Jest.
Don't miss adding test cases and then make green rights.

#### Run webpack-dev-server

```sh
$ npm run serve
```

#### Run storybook

```sh
$ npm run storybook
```

#### Run test

```sh
$ npm run test
```

### Pull Request

Before PR, check to test lastly and then check any errors.
If it has no error, commit and then push it!

For more information on PR's step, please see links of Contributing section.

## 💬 Contributing

- [Code of Conduct](https://github.com/nhn/tui.chart/blob/main/CODE_OF_CONDUCT.md)
- [Contributing guideline](https://github.com/nhn/tui.chart/blob/main/CONTRIBUTING.md)
- [Issue guideline](https://github.com/nhn/tui.chart/tree/main/.github/ISSUE_TEMPLATE)
- [Commit convention](https://github.com/nhn/tui.chart/blob/main/docs/COMMIT_MESSAGE_CONVENTION.md)

## 🌏 Browser Support

| <img src="https://user-images.githubusercontent.com/1215767/34348387-a2e64588-ea4d-11e7-8267-a43365103afe.png" alt="Chrome" width="16px" height="16px" /> Chrome | <img src="https://user-images.githubusercontent.com/1215767/34348590-250b3ca2-ea4f-11e7-9efb-da953359321f.png" alt="IE" width="16px" height="16px" /> Internet Explorer | <img src="https://user-images.githubusercontent.com/1215767/34348380-93e77ae8-ea4d-11e7-8696-9a989ddbbbf5.png" alt="Edge" width="16px" height="16px" /> Edge | <img src="https://user-images.githubusercontent.com/1215767/34348394-a981f892-ea4d-11e7-9156-d128d58386b9.png" alt="Safari" width="16px" height="16px" /> Safari | <img src="https://user-images.githubusercontent.com/1215767/34348383-9e7ed492-ea4d-11e7-910c-03b39d52f496.png" alt="Firefox" width="16px" height="16px" /> Firefox |
| :--------------------------------------------------------------------------------------------------------------------------------------------------------------: | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------: | :----------------------------------------------------------------------------------------------------------------------------------------------------------: | :--------------------------------------------------------------------------------------------------------------------------------------------------------------: | :----------------------------------------------------------------------------------------------------------------------------------------------------------------: |
|                                                                               Yes                                                                                |                                                                                   10+                                                                                   |                                                                             Yes                                                                              |                                                                               Yes                                                                                |                                                                                Yes                                                                                 |

## 🍞 TOAST UI Family

- [TOAST UI Editor](https://github.com/nhn/tui.editor)
- [TOAST UI Grid](https://github.com/nhn/tui.grid)
- [TOAST UI Calendar](https://github.com/nhn/tui.calendar)
- [TOAST UI Image-Editor](https://github.com/nhn/tui.image-editor)
- [TOAST UI Components](https://github.com/nhn)

## 🚀 Used By

- [TOAST Cloud - Total Cloud Service](https://www.toast.com/service/)
- [NHN - ToastCam](https://cam.toast.com/ko/#/)
- [TOAST Dooray! - Collaboration Service (Project, Messenger, Mail, Calendar, Drive, Wiki, Contacts)](https://dooray.com)
- [NHN - Smart Downloader](https://docs.toast.com/ko/Game/Smart%20Downloader/ko/console-guide/)
- [NHN - Gamebase](https://docs.toast.com/ko/Game/Gamebase/ko/oper-analytics/)
- [NHN Edu - iamTeacher](https://teacher.iamservice.net)
- [HANGAME](https://www.hangame.com/)
- [Payco](https://www.payco.com/)

## 📜 License

This software is licensed under the [MIT](https://github.com/nhn/tui.chart/blob/main/LICENSE) © [NHN](https://github.com/nhn).
