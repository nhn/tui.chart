# Scatter 차트

> 차트별로 사용할 수 있는 API는 이 가이드에서 다루지 않는다. 사용 가능한 API가 궁금하다면 [API 가이드](./common-api.md)를 참고하자.

## 차트 생성하기

Scatter 차트의 생성 방법은 두 가지가 있다. 생성자 함수와 정적 함수를 통해 생성할 수 있다. 결과는 모두 차트의 인스턴스가 반환된다. 매개 변수는 차트가 그려지는 영역인 HTML 요소 `el`, 데이터값인 `data`, 옵션값 `options`가 객체로 들어간다. `el` 값은 차트의 컨테이너 영역이므로 차트 외에 다른 요소들이 포함되어 있으면 차트에 영향을 줄 수 있음으로 비어있는 HTML 요소를 사용하는 것을 권장한다.

```js
import { ScatterChart } from '@toast-ui/chart';

const chart = new ScatterChart({el, data, options});

// 혹은

import Chart from '@toast-ui/chart';

const chart = Chart.scatterChart({el, data, options});
```

## 기본 차트

### 데이터 타입

데이터는 `series` 를 통해 입력받는다. 각 시리즈는 `name`과 `data` 쌍으로 입력받으며 data는 좌표값 `x`, `y`를 입력받는다.

```js
const data = {
  series: [
    {
      name: 'male',
      data: [
        { x: 174, y: 65.6 },
        { x: 175.3, y: 71.8 },
        { x: 193.5, y: 80.7 },
        { x: 186.5, y: 72.6 },
        { x: 187.2, y: 78.8 },
      ],
    },
    {
      name: 'female',
      data: [
        { x: 161.2, y: 51.6 },
        { x: 167.5, y: 59 },
        { x: 159.5, y: 49.2 },
        { x: 157, y: 63 },
        { x: 155.8, y: 53.6 },
      ],
    },
  ],
}
```

![image](https://user-images.githubusercontent.com/35371660/102057191-e4a06000-3e30-11eb-8396-378ae2a8f7ec.png)

## visible 옵션

각각의 `series`는 `visible` 옵션을 가질 수 있다. `visible` 옵션은 처음 차트가 그려졌을 때 시리즈를 나타낼지에 대한 여부를 결정한다. 기본값은 `true`이다.

```js
const data = {
  series: [
    {
      name: 'male',
      data: [
        { x: 174, y: 65.6 },
        { x: 175.3, y: 71.8 },
        { x: 193.5, y: 80.7 },
        { x: 186.5, y: 72.6 },
        { x: 187.2, y: 78.8 },
      ],
      visible: false,
    },
    {
      name: 'female',
      data: [
        { x: 161.2, y: 51.6 },
        { x: 167.5, y: 59 },
        { x: 159.5, y: 49.2 },
        { x: 157, y: 63 },
        { x: 155.8, y: 53.6 },
      ],
    },
  ],
}
```

위 옵션을 적용해 차트를 생성해보면 체크박스가 해제되어 생성되는 것을 확인할 수 있습니다.

![image](https://user-images.githubusercontent.com/35371660/108012165-07770c80-704c-11eb-9efd-e3042647afea.png)

## 옵션

`options`는 객체로 작성한다.

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
  plot?: {
    //...
  }
  theme?: {
    // 아래 테마 챕터에서 설명
  }
  series?: {
    selectable?: boolean;
  }
}
```

> 이 차트에서 사용할 수 있는 공통 옵션에 대해서는 이 가이드에서 다루지 않는다. 필요하다면 해당 옵션의 가이드를 참고하자.
> (링크:
> [`chart` 옵션](./common-chart-options.md),
> [축](./common-axes.md),
> [범례](./common-legend.md),
> [내보내기](./common-exportMenu.md),
> [툴팁](./common-tooltip.md),
> [`responsive` 옵션](./common-responsive-options.md),
> [실시간 업데이트](./common-liveUpdate-options.md)
> )

### selectable

![image](https://user-images.githubusercontent.com/35371660/102058051-457c6800-3e32-11eb-9399-3252f9d4ada5.png)

* 기본값: `false`

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

Scatter 차트에서 수정할 수 있는 시리즈 테마이다.

```ts
interface BubbleChartSeriesTheme {
  iconTypes?: (
    | 'circle'
    | 'rect'
    | 'triangle'
    | 'pentagon'
    | 'star'
    | 'diamond'
    | 'cross'
    | 'hexagon'
  )[];
  borderWidth?: number;
  fillColor?: string;
  size?: number;
  colors?: string[];
  select?: {
    size?: number;
    fillColor?: string;
    borderColor?: string;
    borderWidth?: number;
  };
  hover?: {
    size?: number;
    fillColor?: string;
    borderColor?: string;
    borderWidth?: number;
  };
}
```

| 이름 | 타입 | 설명 |
| --- | --- | --- |
| iconTypes | array | 시리즈의 아이콘 타입을 지정할 수 있다. 기본 값은 'circle'이며 배열로 입력한다. 'circle',  'rect', 'triangle', 'pentagon', 'star','diamond','cross','hexagon' 중 하나로 지정할 수 있다. |
| borderWidth | number | 시리즈의 테두리 선 너비 |
| fillColor | string | 시리즈의 채우기 색상 |
| size | number | 시리즈의 크기 |
| colors | string[] | 시리즈의 색상 |
| select | object | 옵션 `series.selectable: true`로 설정 되어 있을 때 시리즈가 선택 되면 적용되는 스타일 |
| hover | object | 데이터에 마우스를 올렸을 때 스타일 |

테마는 options의 `theme`값으로 추가 해준다. 간단한 예시로 시리즈의 아이콘을 변경해보자.

```js
const options = {
  theme: {
    series: {
      iconTypes: ['star', 'diamond'],
    },
  },
}
```

옵션에 대한 결과는 다음과 같다.

![image](https://user-images.githubusercontent.com/35371660/102059371-2bdc2000-3e34-11eb-9b3a-dea995fc8d73.png)
