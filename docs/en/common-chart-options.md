# `chart` Option

The `chart` option can be used to determine the chart's title, size, whether to use animation, and the animation's duration.

## Option
The options compatible with the `chart` option are as follows.

```ts
type ChartOptions = {
  title?: string | {
    text: string;
    offsetX?: number;
    offsetY?: number;
    align?: 'left' | 'right' | 'center';
  };
  animation?: boolean | { duration: number };
  width?: number | 'auto';
  height?: number | 'auto';
};
```

### title

The `title` option can be used to configure the chart's title. Users can either use a string directly or use the object form including `title.text`, `title.offsetX`, `title.offsetY`, and `title.align`. The object method allows users to configure the title as well as the position.

| Name | Type | Details |
| --- | --- | --- |
| `text` | string | Chart tile |
| `offsetX` | number | X offset value (Internal padding : `15`) |
| `offsetY` | number | Y offset value (Internal padding : `15`) |
| `align` | 'left' \| 'right' \| 'center' | Title align (default: `'left'`) |

```js
const options = {
  chart: {
    title: 'Chart Title'
  }
};

// or

const options = {
  chart: {
    title: {
      text: 'Chart Title',
      offsetX: 0,
      offsetY: 0,
      align: 'center'
    }
  }
};
```

![image](https://user-images.githubusercontent.com/43128697/102858963-7a11a480-446e-11eb-94ac-0008113fe5f5.png)

### animation

As default, when a chart is rendered, an animation is used. The default duration is `500ms`.

The `animation` can be set to `false` to deactivate the animation.

```js
const options = {
  chart: {
    animation: false
  }
};
```

The `animation.duration` option can be given a numeric value to control the animation duration.

```js
const options = {
  chart: {
    animation: {
      duration: 300
    }
  }
};
```

### width & height

`width` and `height` options can be used to configure the chart's size.
A numeric value can be entered to define the size absolutely.

```js
const options = {
  chart: {
    width: 1000,
    height: 500
  }
};
```

Both can be set to `'auto'` to enable each to be affected by the parent container. If either the `width` or `height` is set to be `'auto'`, the chart will detect the change in the container size, and when the size changes the chart will be rerendered according to the changed size. If `width` or `height` are not provided, the chart is rendered according to the container initially, and will not be affected by the changing container size.

```html
<div id="chart" style="width: 90vw; height: 90vh; min-width: 500px; min-height: 300px;">
```

```js
const options = {
  chart: {
    width: 'auto',
    height: 'auto'
  }
}

const el = document.getElementById('chart');
const chart = toastui.Chart.areaChart({ el, data, options });
```

`'auto'` configuration can be used with [`responsive` option](./common-responsive-options.md) to apply responsive rules whenever the chart's size changes.
