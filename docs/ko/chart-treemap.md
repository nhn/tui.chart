# Treemap 차트

> 차트별로 사용할 수 있는 API는 이 가이드에서 다루지 않는다. 사용 가능한 API가 궁금하다면 [API 가이드](./common-api.md)를 참고하자.

## 차트 생성하기

Treemap 차트의 생성 방법은 두 가지가 있다. 생성자 함수와 정적 함수를 통해 생성할 수 있다. 결과는 모두 차트의 인스턴스가 반환된다. 매개 변수는 차트가 그려지는 영역인 HTML 요소 `el`, 데이터값인 `data`, 옵션값 `options`가 객체로 들어간다. `el` 값은 차트의 컨테이너 영역이므로 차트 외에 다른 요소들이 포함되어 있으면 차트에 영향을 줄 수 있음으로 비어있는 HTML 요소를 사용하는 것을 권장한다.

```js
import { TreemapChart } from '@toast-ui/chart';

const chart = new TreemapChart({el, data, options});

// 혹은

import Chart from '@toast-ui/chart';

const chart = Chart.treemapChart({el, data, options});
```

## 기본 차트
### 데이터 타입

`series` 값을 입력 받으며 `label`-`data` 혹은 `label`-`children`의 쌍을 이룬다. `clildren`은 배열로 입력을 받으며 트리의 하위 데이터를 입력 받는다. `data` 값은 숫자값을 입력받는다.

```js
const data = {
  series: [
    {
      label: 'Documents',
      children: [
        {
          label: 'docs',
          children: [
            {
              label: 'pages',
              data: 1.3,
            },
            {
              label: 'keynote',
              data: 2.5,
            },
            {
              label: 'numbers',
              data: 1.2,
            },
          ],
        },
        {
          label: 'photos',
          data: 5.5,
        },
        {
          label: 'videos',
          data: 20.7,
        },
      ],
    },
    {
      label: 'Downloads',
      children: [
        {
          label: 'recent',
          data: 5.3,
        },
        {
          label: '2020',
          data: 10.1,
        },
        {
          label: '2019',
          data: 8.2,
        },
      ],
    },
    {
      label: 'Application',
      data: 16.4,
    },
    {
      label: 'Desktop',
      data: 4.5,
    },
  ],
}
```

![image](https://user-images.githubusercontent.com/35371660/101874502-5461e100-3bcc-11eb-8ce5-a44bdb8eee59.png)

## Color Value 차트

`data`값을 기준으로 각 시리즈의 색상을 넣는 것 대신 색상 값을 별도로 줘 값을 기준으로 전체 차트의 시리즈 색상을 정해줄 수 있다. `useColorValue` 옵션값과 데이터에 `colorValue`값을 추가해주면 적용된다.

### 옵션

* 기본값: `true`

```js
const options = {
  series: {
    useColorValue: true
  }
};
```
### 데이터 타입

데이터의 구조는 기본 차트와 동일하며 대신 `colorValue` 값을 추가로 받는다. 값은 숫자 타입이다.

```js
const options = {
  series: [
    {
      label: 'Asia',
      children: [
        {
          label: 'South Korea',
          data: 99909,
          colorValue: 499.81,
        },
        {
          label: 'Japan',
          data: 364485,
          colorValue: 335.61,
        },
        {
          label: 'Jordan',
          data: 88802,
          colorValue: 86.07,
        },
        {
          label: 'Iraq',
          data: 437367,
          colorValue: 81.6,
        },
      ],
    },
    {
      label: 'Europe',
      children: [
        {
          label: 'UK',
          data: 241930,
          colorValue: 262.84,
        },
        {
          label: 'France',
          data: 640427,
          colorValue: 117.83,
        },
        {
          label: 'Hungary',
          data: 89608,
          colorValue: 106.54,
        },
        {
          label: 'Portugal',
          data: 91470,
          colorValue: 115.35,
        },
      ],
    },
    {
      label: 'America',
      children: [
        {
          label: 'Panama',
          data: 74340,
          colorValue: 52.81,
        },
        {
          label: 'Honduras',
          data: 111890,
          colorValue: 75.15,
        },
        {
          label: 'Uruguay',
          data: 175015,
          colorValue: 19.6,
        },
        {
          label: 'Cuba',
          data: 109820,
          colorValue: 101.47,
        },
      ],
    },
    {
      label: 'Africa',
      children: [
        {
          label: 'Malawi',
          data: 94080,
          colorValue: 146.09,
        },
        {
          label: 'Ghana',
          data: 227533,
          colorValue: 113.13,
        },
        {
          label: 'Togo',
          data: 54385,
          colorValue: 126.28,
        },
        {
          label: 'Benin',
          data: 114305,
          colorValue: 96.61,
        },
      ],
    },
  ],
};
```

![image](https://user-images.githubusercontent.com/35371660/101875569-30070400-3bce-11eb-848a-968f5eb3a73d.png)

## 옵션

`options`는 객체로 작성한다.

```ts
type options = {
  chart?: {
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
    useColorValue?: boolean;
    zoomable?: boolean;
    selectable?: boolean;
    dataLabels?: {
      useTreemapLeaf?: boolean;
      visible?: boolean;
      offsetX?: number;
      offsetY?: number;
      formatter?: (value) => string;
    }
  }
}
```

> 이 차트에서 사용할 수 있는 공통 옵션에 대해서는 이 가이드에서 다루지 않는다. 필요하다면 해당 옵션의 가이드를 참고하자.
> (링크:
> [`chart` 옵션](./common-chart-options.md),
> [범례](./common-legend.md),
> [툴팁](./common-tooltip.md),
> [내보내기](./common-exportMenu.md),
> [`responsive` 옵션](./common-responsive-options.md)
> )

### selectable

![image](https://user-images.githubusercontent.com/35371660/101877030-bb819480-3bd0-11eb-814d-eb2302e79245.png)

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
### zoomable

![zoomable_treemap](https://user-images.githubusercontent.com/35371660/101877249-0dc2b580-3bd1-11eb-85bb-4272711c6b5f.gif)

* 기본값: `false`

zoomable을 통해 차트를 확대 할 수 있다.

```js
const options = {
  series: {
    zoomable: true
  }
}
```
### dataLabels

데이터 라벨은 차트에서 시리즈에 대한 값을 표시한다.
`dataLabels` 옵션은 다음과 같다.

```ts
type options = {
  ...
  series?: {
    dataLabels?: {
      visible?: boolean;
      offsetX?: number;
      offsetY?: number;
      formatter?: (value) => string;
      useTreemapLeaf?: boolean;
    }
  }
};
```

| 이름 | 타입 | 설명 |
| --- | --- | --- |
| `visible` | boolean | 데이터 라벨 표시 여부 |
| `offsetX` | number | 데이터 라벨 위치 x 오프셋 |
| `offsetY` | number | 데이터 라벨 위치 y 오프셋 |
| `formatter` | function | 데이터 값을 매개변수로 넘겨받아 출력 형식 지정 |
| `useTreemapLeaf` | boolean | 자식 데이터 라벨 표시 여부 |


데이터 라벨을 노출할 때 현재 보고 있는 트리 계층의 노드 라벨만을 노출한다.

```js
// 기본
const options = {
  series: {
    dataLabels: { visible: true }
  }
};
```

![image](https://user-images.githubusercontent.com/43128697/103475194-7b3bbd80-4dee-11eb-8489-12695595bf6e.png)

하위 노드들의 라벨을 노출하고 싶을 경우 `useTreemapLeaf` 옵션을 켜주면 된다.

```js
// 자식 데이터 라벨 표시
const options = {
  series: {
    dataLabels: {
      visible: true,
      useTreemapLeaf: true
    }
  }
};
```
## 시리즈 theme

Treemap 차트에서 수정할 수 있는 시리즈 테마이다. 데이터 라벨 테마는 화살표가 없는 말풍선 스타일을 사용할 수 있다.

```ts
interface TreemapChartSeriesTheme {
  colors?: string[];
  startColor?: string;
  endColor?: string;
  borderColor?: string;
  borderWidth?: number;
  select?: {
    color?: string;
    borderColor?: string;
    borderWidth?: number;
  };
  hover?: {
    color?: string;
    borderColor?: string;
    borderWidth?: number;
  };
  dataLabels?: {
    useSeriesColor?: boolean;
    lineWidth?: number;
    textStrokeColor?: string;
    shadowColor?: string;
    shadowBlur?: number;
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: string | number;
    color?: string;
    textBubble?: {
      visible?: boolean;
      paddingX?: number;
      paddingY?: number;
      backgroundColor?: string;
      borderRadius?: number;
      borderColor?: string;
      borderWidth?: number;
      shadowColor?: string;
      shadowOffsetX?: number;
      shadowOffsetY?: number;
      shadowBlur?: number;
    };
  };
}
```

| 이름 | 타입 | 설명 |
| --- | --- | --- |
| `colors` | string[] | 시리즈의 색상 |
| `startColor` | string | `useColorValue: true`일 때 colorValue 값의 색상 기준이 되는 시작값 |
| `endColor` | string | `useColorValue: true`일 때 colorValue 값의 색상 기준이 되는 끝값 |
| `borderColor` | string | 시리즈의 테두리 색상 |
| `borderWidth` | number | 시리즈의 테두리 너비 |
| `select` | object | `selectable: true`이며 시리즈가 선택 되었을 때 적용되는 스타일 |
| `hover` | object | 데이터에 마우스를 올렸을 때 스타일 |
| `dataLabels` | object | 데이터 라벨 스타일 |
| `dataLabels.useSeriesColor` | boolean | 글자 색상을 시리즈 색상으로 사용할지 여부 |
| `dataLabels.lineWidth` | number | 텍스트 선 두께 |
| `dataLabels.textStrokeColor` | string | 텍스트 선 색상 |
| `dataLabels.shadowColor` | string | 텍스트 그림자 색상 |
| `dataLabels.shadowBlur` | number | 텍스트 그림자 Blur |
| `dataLabels.fontSize` | number | 글자 크기 |
| `dataLabels.fontFamily` | string | 폰트명 |
| `dataLabels.fontWeight` | string | 글자 굵기 |
| `dataLabels.color` | string | 글자 색상, `useSeriesColor: true`로 설정한경우 이 옵션은 동작되지 않음 |
| `dataLabels.textBubble` | object | 말풍선 디자인 설정 |
| `dataLabels.textBubble.visible` | boolean | 말풍선 디자인 사용 여부 |
| `dataLabels.textBubble.paddingX` | number | 수평 여백 |
| `dataLabels.textBubble.paddingY`| number | 수직 여백 |
| `dataLabels.textBubble.backgroundColor` | string | 말풍선 배경색 |
| `dataLabels.textBubble.borderRadius` | number | 말풍선 테두리의 둥근 모서리 값 |
| `dataLabels.textBubble.borderColor` | string | 말풍선 테두리 색상 |
| `dataLabels.textBubble.borderWidth` | number | 말풍선 테두리 두께 |
| `dataLabels.textBubble.shadowColor` | string | 말풍선 그림자 색상 |
| `dataLabels.textBubble.shadowOffsetX` | number | 말풍선 그림자 Offset X |
| `dataLabels.textBubble.shadowOffsetY` | number | 말풍선 그림자 Offset Y |
| `dataLabels.textBubble.shadowBlur` | number | 말풍선 그림자 Blur |

### startColor와 endColor

`series.useColorValue`옵션 값이 true일 때 기준이 되는 색상 값이다. `startColor`와 `endColor` 색상 값을 기준으로 입력받은 `colorValue`의 색상을 결정한다.

간단한 예시로 startColor를 `#4A76B2`,

![image](https://user-images.githubusercontent.com/35371660/101878940-d0135c00-3bd3-11eb-8070-9429df31d9c3.png)

endColor를 `#221271`로 지정하면 colorValue가 높을 수록 endColor에 가까운 색깔을 가질 것이다.

![image](https://user-images.githubusercontent.com/35371660/101878968-dacdf100-3bd3-11eb-9e5a-587630ae3e02.png)

```js
const options = {
  series: {
    theme: {
      startColor: '#4A76B2',
      endColor: '#221271'
    }
  }
}
```

![image](https://user-images.githubusercontent.com/35371660/101879101-22547d00-3bd4-11eb-9196-a308d24cd69c.png)

아래 코드는 데이터 라벨의 테마를 적용하여 글자 스타일을 변경한 옵션이다.

```js
const options = {
  series: {
    dataLabels: { visible: true }
  },
  theme: {
    series: {
      dataLabels: {
        fontFamily: 'monaco',
        fontSize: 16,
        fontWeight: '800',
        useSeriesColor: true,
        lineWidth: 3,
        textStrokeColor: '#ffffff',
        shadowColor: '#ffffff',
        shadowBlur: 10
      }
    }
  }
};
```

![image](https://user-images.githubusercontent.com/43128697/103475200-7ecf4480-4dee-11eb-969f-f809d0ba59be.png)
