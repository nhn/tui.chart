# 레이아웃 설정

차트 크기를 변경하는 것 외에도 각 컴포넌트의 크기를 지정할 수 있다. X축, Y축, 플롯 영역의 크기 및 범례의 너비를 정할 수 있으며, 여러 차트를 사용하는 경우 차트의 너비를 고정하고 싶을 때 유용하게 사용할 수 있다.
## X축
X축을 사용하는 차트에서는 X축 영역의 크기를 지정할 수 있다. `xAxis` 옵션으로 `width`, `height`를 제공한다. `width`, `height` 값을 지정하면 실제 X축이 그려지는 영역의 크기를 설정할 수 있다.

```ts
type xAxisOption = {
  ...
  width?: number;
  height?: number;
};
```

```js
const options = {
  xAxis: {
    title: 'Amount',
    width: 700,
    height: 100
  }
};
```

![image](https://user-images.githubusercontent.com/43128697/103404407-c0fe4900-4b96-11eb-8911-61654ca6312d.png)

## Y축
Y축을 사용하는 차트에서는 Y축 영역의 크기를 지정할 수 있다. `yAxis` 옵션으로 `width`, `height`를 제공한다. `width`, `height` 값을 지정하면 실제 Y축이 그려지는 영역의 크기를 설정할 수 있다.

```ts
type yAxisOption = {
  ...
  width?: number;
  height?: number;
};
```

```js
const options = {
  yAxis: {
    width: 100,
    height: 350,
    title: 'Month'
  }
};
```

![image](https://user-images.githubusercontent.com/43128697/103404404-bf348580-4b96-11eb-98e5-6b44648be3d2.png)

`sereis.diverging` 옵션을 사용할 수 있는 Bar 차트에서 가운데 Y축 영역의 크기도 변경할 수 있다.

```js
const options = {
  yAxis: {
    title: 'Age Group',
    align: 'center',
    width: 100,
    height: 300
  },
  xAxis: {
    label: {
      interval: 2
    },
    title: 'People'
  },
  series: {
    diverging: true
  }
};
```

![image](https://user-images.githubusercontent.com/43128697/103404702-f192b280-4b97-11eb-8a11-74945e1e85e1.png)

## 플롯
기본적으로 모든 차트에서 사용하는 `plot` 옵션으로 `width`, `height`를 제공한다. `width`, `height` 값을 지정하면 실제 차트 시리즈가 그려지는 영역의 크기를 설정할 수 있다.

```ts
type PlotOption = {
  width?: number;
  height?: number;
  ...
};
```

```js
const options = {
  plot: {
    width: 800,
    height: 400
  }
};
```

![image](https://user-images.githubusercontent.com/43128697/103405040-0de31f00-4b99-11eb-8645-4d58a9563e85.png)


* X축의 너비(`xAxis.width`)와 플롯의 너비(`plot.width`)를 모두 입력하면 둘 중에 최댓값으로 설정된다.
* Y축의 높이(`yAxis.height`)와 플롯의 높이(`plot.height`)를 모두 입력하면 둘 중에 최댓값으로 설정된다.

## 범례
기본적으로 모든 차트에서 사용하는 `legend` 옵션은 범례의 너비를 지정하기 위해 `width` 옵션을 제공한다. `width`를 지정하면 범례의 너비가 고정된다.

```ts
type LegendOptions = {
  ...
  width?: number;
};
```

```js
const options = {
  legned: {
    width: 200
  }
};
```

![image](https://user-images.githubusercontent.com/43128697/103473501-addcba80-4ddc-11eb-9315-a0a2d392dc11.png)
