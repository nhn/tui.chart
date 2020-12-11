# Heatmap 차트

> 차트별로 사용할 수 있는 [API](./common-api.md)에 대한 정보는 이 가이드에서 다루지 않는다. API 가이드를 참고하도록 하자.

## 차트 생성하기

Heatmap 차트의 생성 방법은 두 가지가 있다. 생성자 함수와 정적 함수를 통해 생성할 수 있다. 결과는 모두 차트의 인스턴스를 반환한다. 매개 변수는 차트가 그려지는 영역인 HTML 요소 `el`, 데이터값인 `data`, 옵션값 `options`가 객체 형태로 들어간다. `el` 값은 차트의 컨테이너 영역이므로 차트 외에 다른 요소들이 포함되어 있으면 차트에 영향을 줄 수 있음으로 비어있는 HTML 요소를 사용하는 것을 권장한다.

```js
import { HeatmmapChart } from '@toast-ui/chart';

const chart = new HeatmmapChart({el, data, options});

// 혹은 

import Chart from '@toast-ui/chart';

const chart = Chart.heatmapChart({el, data, options});
```

## 기본 차트
### 데이터 타입

데이터는 `series` 값과 `categories` 값을 받는다. categories는 x축과 y축에 들어갈 라벨 정보를 입력 받으며 series는 각 x, y 축에 맞는 데이터를 숫자 값이 들어간 배열 형태로 입력한다.

```js
const data = {
  categories: {
    x: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    y: ['Seoul', 'Seattle', 'Sydney', 'Moskva', 'Jungfrau'],
  },
  series: [
    [-3.5, -1.1, 4.0, 11.3, 17.5, 21.5, 24.9, 25.2, 20.4, 13.9, 6.6, -0.6],
    [3.8, 5.6, 7.0, 9.1, 12.4, 15.3, 17.5, 17.8, 15.0, 10.6, 6.4, 3.7],
    [22.1, 22.0, 20.9, 18.3, 15.2, 12.8, 11.8, 13.0, 15.2, 17.6, 19.4, 21.2],
    [-10.3, -9.1, -4.1, 4.4, 12.2, 16.3, 18.5, 16.7, 10.9, 4.2, -2.0, -7.5],
    [-13.2, -13.7, -13.1, -10.3, -6.1, -3.2, 0.0, -0.1, -1.8, -4.5, -9.0, -10.9],
  ],
}
```

![image](https://user-images.githubusercontent.com/35371660/101881018-2b931900-3bd7-11eb-8485-00f8f628625e.png)


## 옵션 

`options`는 객체 형태로 작성한다.

```ts
type options = {
  chart?: {
    //...
  }
  xAxis?: {
    //...
  }
  yAxis?: {
    //...
  }
  legend?: {
    //...
  }
  exportMenu?: {
    //...
  }
  tooltip?: {
    //...
  }
  responsive?: {
    //...
  }
  theme?: {
    // 아래 테마 챕터에서 설명
  }
  series?: {
    selectable?: boolean;
    shift?: boolean;

    dataLabels?: {
      visible?: boolean;
      anchor?: DataLabelAnchor;
      offsetX?: number;
      offsetY?: number;
      formatter?: Formatter;
    }
  }
}
```

> 이 차트에서 사용할 수 있는 공통 옵션에 대해서는 이 가이드에서 다루지 않는다. 필요하다면 해당 옵션의 가이드를 참고하자.
> (링크: 
> [chart](./common-chart-options.md),
> [axes](./common-axes.md), 
> [legend](./common-legend.md), 
> [export menu](./common-exportMenu.md),
> [tooltip](./common-tooltip.md),
> [responsive](./common-responsive-options.md), 
> [live update](./common-liveUpdate-options.md)
> [dataLabels](./common-dataLables.md)
> )


### selectable

![image](https://user-images.githubusercontent.com/35371660/101881776-3dc18700-3bd8-11eb-8cde-50d13252a885.png)

* default: `false`

해당 시리즈를 선택할 수 있다.

```js
const options = {
  series: {
    selectable: true
  }
};
```

`selectable` 옵션과 `on` API의 `selectSeries`, `unselectSeries`를 함께 사용할 경우 해당 시리즈에 대한 제어를 추가로 할 수 있다.



## 시리즈 theme

Heatmap 차트에서 수정할 수 있는 시리즈 테마이다.

```ts
interface HeatmapChartSeriesTheme {


}
```