# Legend

![image](https://user-images.githubusercontent.com/35371660/102162975-8d9c9880-3ecd-11eb-9250-60249d4383ce.png)

Legend는 그려지고 있는 데이터의 정보를 나타낸다. TOAST UI Chart에서는 총 3가지 종류의 Legend가 존재하며 차트 타입에 맞춰 적절하게 변경된다.

## 종류 및 구성

### 기본 Legend

기본 Legend는 체크박스와 색상을 나타내는 아이콘 영역, 시리즈의 이름이 나타나도록 구성되어 있다. 체크박스와 이름을 클릭할 경우 동작이 존재하는데 차례대로 살펴보고 응용하며 사용해보도록 하자.

먼저, 체크박스를 클릭할 경우 해당 시리즈를 제거할 수 있으며 다시 클릭 시 나타나게 할 수 있다.
![image](https://user-images.githubusercontent.com/35371660/102163730-6befe100-3ece-11eb-9cdd-99ee688bc78e.png)

시리즈의 이름을 클릭할 경우 해당 시리즈를 중심으로 차트를 볼 수 있다.
![image](https://user-images.githubusercontent.com/35371660/102164732-b2ddd680-3ece-11eb-8e87-7757e8edbbdb.png)

기본 Legend는 Heatmap 차트, Treemap 차트를 제외한 모든 차트에서 사용된다.

### Spectrum Legend

Heatmap 차트와 colorValue를 사용하는 Treemap 차트의 경우 기본 Legend 대신 Spectrum Legend를 사용한다. 해당 값이 전체 값에서 어느 위치인지 비교할 수 있는 지표를 제공한다.

![image](https://user-images.githubusercontent.com/35371660/102166614-d48b8d80-3ecf-11eb-954c-d994c5370759.png)

### Circle Legend

Bubble 차트의 경우 시리즈의 원 크기에 대한 지표가 되는 Circle Legend가 존재한다. 가장 바깥쪽에 위치한 원의 값은 제일 큰 반지름을 갖는 데이터 중 가장 큰 값을 의미한다. 또한, 제일 큰 원을 기준으로 `0.5x`, `0.25x` 길이의 반지름을 갖는 원의 지표 또한 함께 나타난다.

![image](https://user-images.githubusercontent.com/35371660/102166826-62677880-3ed0-11eb-9a47-6273c32f8a1b.png)

## 옵션

legend를 변경하기 위한 옵션은 다음과 같다. 이 가이드에서는 `width`를 제외한 옵션을 설명하며 해당 옵션은 [레이아웃 설정](./common-layout-options.md) 가이드를 참고하길 바란다.

```ts
interface LegendOptions {
  align?: 'top' | 'bottom' | 'right' | 'left';
  showCheckbox?: boolean;
  visible?: boolean;
  width?: number;
  item?: {
    width?: number;
    overflow: 'ellipsis';
  };
}

interface CircleLegendOptions {
  visible?: boolean;
}
```

### align

- 기본값: `right`

legend의 정렬은 `legend.align`을 통해 변경 가능하며 `top`, `bottom`, `right`, `left` 총 네 개의 옵션이 존재한다. circleLegend의 정렬은 `legend.align`이 `left`, `right`인 경우에 같은 위치에 존재하며 align이 `top`이나 `bottom`인 경우 우측에 위치한다.

```js
const options = {
  legend: {
    align: 'bottom',
  },
};
```

옵션을 통해 그림처럼 legend의 위치가 변경된 것을 확인할 수 있다.

![image](https://user-images.githubusercontent.com/35371660/102162447-8cb73700-3ecc-11eb-978b-b7deaa56c7e8.png)

### showCheckbox

- 기본값: `true`

시리즈를 사라지게 하거나 나타나게 할 수 있는 체크박스를 `legend.showCheckbox` 옵션을 통해 제어할 수 있다. `showCheckbox`의 값을 `false`로 지정할 경우 체크박스가 없는 레전드를 사용할 수 있다.

```js
const options = {
  legend: {
    showCheckbox: false,
  },
};
```

![image](https://user-images.githubusercontent.com/35371660/102171892-f3435180-3eda-11eb-9acd-0c2b2eb914bb.png)

## visible

- 기본값: `true`

Legend를 사용하지 않을 경우 `legend.visible` 옵션을 통해 제거할 수 있다.

```js
const options = {
  legend: {
    visible: false,
  },
};
```

![image](https://user-images.githubusercontent.com/35371660/102172256-cb082280-3edb-11eb-9b54-d1368b59f662.png)

## item

* 사용 가능 차트 타입: `Line`, `Area`, `Bar`, `BoxPlot`, `Bullet`, `Column`, `ColumnLine`, `LineArea`, `LineScatter`, `Pie`, `Heatmap`, `Bubble`, `Scatter`, `Radar`, `NestedPie`, `LineScatter`, `ColumnLine`, `Radial`, `Scatter`

각각의 Legend 아이템의 `width`, `overflow` 옵션을 제어할 수 있다. `item.width`에 값을 주고 overflow 설정을 지정하지 않으면 `overflow: 'ellipsis'`가 적용된다. 

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

Legend를 스타일링 할 수 있는 테마 옵션은 다음과 같다.

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

`legend.label`의 테마 옵션을 통해 라벨의 폰트 스타일을 변경하는 예제를 작성해보자.

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
