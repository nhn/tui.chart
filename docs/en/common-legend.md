# Legend

![image](https://user-images.githubusercontent.com/35371660/102162975-8d9c9880-3ecd-11eb-9250-60249d4383ce.png)

The Legend displays information regarding the chart drawn. TOAST UI Chart comes with three different types of legends, and they can be applied appropriately to different types of charts.

## Types and Composition

### Basic Legend

The basic Legend consists of a checkbox, icon that displays the color, and the name of the series. Clicking on the checkbox and the name can trigger different functionalities. Let's use them and apply them in order.

First, clicking on the check box can hide the selected series, and another click can make it visible again.

![image](https://user-images.githubusercontent.com/35371660/102163730-6befe100-3ece-11eb-9cdd-99ee688bc78e.png)

Clicking on the series name focuses the chart with respect to the selected series.

![image](https://user-images.githubusercontent.com/35371660/102164732-b2ddd680-3ece-11eb-8e87-7757e8edbbdb.png)

The basic legend can be used for all TOAST UI Charts except for Heatmap charts and Treemap charts.

### Spectrum Legend

Charts that use a colorValue like the Heatmap charts and the Treemap charts use the Spectrum legend instead of the Basic legend. It displays an index for the relative level within the entire chart.

![image](https://user-images.githubusercontent.com/35371660/102166614-d48b8d80-3ecf-11eb-954c-d994c5370759.png)

### Circle Legend

For the Bubble chart, the Circle legend can provide an index for the size of the circle. The value of the outer-most circle represents the largest value in the given data. Furthermore, the circle legend also displays the `0.5x` and `0.25x` radius values with respect to the largest circle.

![image](https://user-images.githubusercontent.com/35371660/102166826-62677880-3ed0-11eb-9a47-6273c32f8a1b.png)

## Options

The following options can modify the legends. This guide explains all options except the `width` options, and these options are explained in the [layout options](./common-layout-options.md) guide.

```ts
interface LegendOptions {
  align?: 'top' | 'bottom' | 'right' | 'left';
  showCheckbox?: boolean;
  visible?: boolean;
  maxWidth?: number;
  width?: number;
  item?: {
    width?: number;
    overflow?: 'ellipsis';
  };
}

interface CircleLegendOptions {
  visible?: boolean;
}
```

### align

- default: `right`

The legend can be aligned using the `legend.align` option, and it can take `top`, `bottom`, `right`, or `left` as its value. When the `legend.align` option is used for the circleLegend, the `left` and `right` values result in no visible change, and `top` and `bottom` options lead make the legend to be displayed to the right.

```js
const options = {
  legend: {
    align: 'bottom',
  },
};
```

As you can see in the image, the location of the legend has been changed.

![image](https://user-images.githubusercontent.com/35371660/102162447-8cb73700-3ecc-11eb-978b-b7deaa56c7e8.png)

### showCheckbox

- default: `true`

The hide/show feature of the checkbox can be controlled through the `legend.showCheckbox` option. If the `showCheckbox` is set to `false`, the legend is displayed without the checkbox.

```js
const options = {
  legend: {
    showCheckbox: false,
  },
};
```

![image](https://user-images.githubusercontent.com/35371660/102171892-f3435180-3eda-11eb-9acd-0c2b2eb914bb.png)

## visible

- default: `true`

If the legend is not necessary, the `legend.visible` option can be used to display the chart without the legend.

```js
const options = {
  legend: {
    visible: false,
  },
};
```

![image](https://user-images.githubusercontent.com/35371660/102172256-cb082280-3edb-11eb-9b54-d1368b59f662.png)

## item

* Compatible with: `Line`, `Area`, `Bar`, `BoxPlot`, `Bullet`, `Column`, `ColumnLine`, `LineArea`, `LineScatter`, `Pie`, `Heatmap`, `Bubble`, `Scatter`, `Radar`, `NestedPie`, `LineScatter`, `ColumnLine`, `Radial`, `Scatter`

Controls the `width` and `overflow` options of the legend item. If a value is given to `item.width` and the overflow setting is not specified, `overflow:'ellipsis'` is applied.

```js
const options = {
  legend: {
    item: {
      width: 70,
      overflow: 'ellipsis',
    }
  }
}
```

![image](https://user-images.githubusercontent.com/35371660/110557485-04bb9300-8184-11eb-925f-89e44f39a7ce.png)

## theme

The following theme options can be used to style the legend.

```ts
interface Legend {
  label?: {
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: string | number;
    color?: string;
  };
}
```

Let's write a simple example to change the label's font style using the `legend.label`.

```js
const options = {
  theme: {
    legend: {
      label: {
        fontFamily: 'cursive',
        fontSize: 15,
        fontWeight: 700,
        color: '#ff416d',
      },
    },
  },
};
```

![image](https://user-images.githubusercontent.com/35371660/102173097-a319be80-3edd-11eb-8e94-1ba97e3182d9.png)
