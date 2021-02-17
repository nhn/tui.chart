# Bubble 차트

> 차트별로 사용할 수 있는 API는 이 가이드에서 다루지 않는다. 사용 가능한 API가 궁금하다면 [API 가이드](./common-api.md)를 참고하자.

## 차트 생성하기

Bubble 차트의 생성 방법은 두 가지가 있다. 생성자 함수와 정적 함수를 통해 생성할 수 있다. 결과는 모두 차트의 인스턴스가 반환된다. 매개 변수는 차트가 그려지는 영역인 HTML 요소 `el`, 데이터값인 `data`, 옵션값 `options`가 객체로 들어간다. `el` 값은 차트의 컨테이너 영역이므로 차트 외에 다른 요소들이 포함되어 있으면 차트에 영향을 줄 수 있음으로 비어있는 HTML 요소를 사용하는 것을 권장한다.

```js
import { BubbleChart } from '@toast-ui/chart';

const chart = new BubbleChart({el, data, options});

// 혹은

import Chart from '@toast-ui/chart';

const chart = Chart.bubbleChart({el, data, options});
```

## 기본 차트

### 데이터 타입

데이터는 `series` 를 통해 입력받는다. 각 시리즈는 `name`과 `data` 쌍으로 입력받으며 data는 좌표값 `x`, `y`와 반지름 값 `r`, 해당 데이터의 이름인 `label`을 입력받는다.

```js
const data = {
  series: [
    {
      name: 'Africa',
      data: [
        { x: 30, y: 100, r: 10, label: 'Morocco' },
        { x: 40, y: 200, r: 30, label: 'Egypt' },
      ],
    },
    {
      name: 'America',
      data: [
        { x: 60, y: 40, r: 50, label: 'Canada' },
        { x: 50, y: 300, r: 10, label: 'United States' },
      ],
    },
    {
      name: 'Asia',
      data: [
        { x: 10, y: 150, r: 20, label: 'Korea, South' },
        { x: 20, y: 200, r: 30, label: 'Singapore' },
      ],
    },
  ],
}
```

![image](https://user-images.githubusercontent.com/35371660/102034986-abe99200-3e02-11eb-85d7-5128b90e2999.png)

## visible 옵션

각각의 `series`는 `visible` 옵션을 가질 수 있다. `visible` 옵션은 처음 차트가 그려졌을 때 시리즈를 나타낼지에 대한 여부를 결정한다. 기본값은 `true`이다.

```js
const data = {
  series: [
    {
      name: 'Africa',
      data: [
        { x: 30, y: 100, r: 10, label: 'Morocco' },
        { x: 40, y: 200, r: 30, label: 'Egypt' },
      ],
      visible: false,
    },
    {
      name: 'America',
      data: [
        { x: 60, y: 40, r: 50, label: 'Canada' },
        { x: 50, y: 300, r: 10, label: 'United States' },
      ],
    },
    {
      name: 'Asia',
      data: [
        { x: 10, y: 150, r: 20, label: 'Korea, South' },
        { x: 20, y: 200, r: 30, label: 'Singapore' },
      ],
    },
  ],
}
```

위 옵션을 적용해 차트를 생성해보면 체크박스가 해제되어 생성되는 것을 확인할 수 있습니다.

![image](https://user-images.githubusercontent.com/35371660/108008117-e8c04800-7042-11eb-8feb-6dd18593b00c.png)


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
  theme?: {
    // 아래 테마 챕터에서 설명
  }
  circleLegend?: {
    visible?: boolean;
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

![image](https://user-images.githubusercontent.com/35371660/102035488-d425c080-3e03-11eb-9ebc-f974e4c7bb97.png)

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

### circleLegend

![image](https://user-images.githubusercontent.com/35371660/102035570-ff101480-3e03-11eb-9e73-bbb43e4b1353.png)

버블 차트는 위 이미지 형태의 circle legend를 갖는다. legend를 사라지게 하고 싶을 경우 `circleLegend.visible` 옵션을 사용한다.

```js
const options = {
  circleLegend: {
    visible: false,
  },
}
```

![image](https://user-images.githubusercontent.com/35371660/102035692-6332d880-3e04-11eb-80fa-c4f2df8be421.png)


## 시리즈 theme

Bubble 차트에서 수정할 수 있는 시리즈 테마이다.

```ts
interface BubbleChartSeriesTheme {
  borderWidth?: number;
  borderColor?: string;
  colors?: string[];
  select?: {
    color?: string;
    borderColor?: string;
    borderWidth?: number;
  };
  hover?: {
    color?: string;
    borderColor?: string;
    borderWidth?: number;
  }
}
```

| 이름 | 타입 | 설명 |
| --- | --- | --- |
| borderWidth | number | 시리즈의 테두리 선 너비 |
| borderColor | string | 시리즈의 테두리 선 색 |
| colors | string[] | 시리즈의 색상 |
| select | object | 옵션 `series.selectable: true`로 설정 되어 있을 때 시리즈가 선택 되면 적용되는 스타일 |
| hover | object | 데이터에 마우스를 올렸을 때 스타일 |

테마는 options의 `theme`값으로 추가 해준다. 간단한 예시로 시리즈의 테두리 선 색상과 두께를 바꿔보자.

```js
const options = {
  theme: {
    series: {
      borderWidth: 4,
      borderColor: '#aabbcc'
    }
  }
}
```

옵션에 대한 결과는 다음과 같다.

![image](https://user-images.githubusercontent.com/35371660/102056271-773fff80-3e2f-11eb-8aec-157d1e172324.png)
