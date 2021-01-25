# `chart` 옵션

`chart` 옵션에서는 차트의 제목과 크기, 애니메이션의 사용 여부와 재생 시간 등을 설정할 수 있다.

## 옵션
`chart` 옵션에서 사용할 수 있는 옵션은 다음과 같다.

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

`title` 옵션은 차트의 제목을 설정할 수 있다. 문자열로 직접 입력하는 방법과 `title.text`, `title.offsetX`, `title.offsetY`, `title.align` 과 같이 객체 형태로 입력할 수도 있는데, 제목과 위치를 설정할 수 있다.

| 이름 | 타입 | 설명 |
| --- | --- | --- |
| `text` | string | 차트 제목 |
| `offsetX` | number | x 오프셋 값 (내부 여백 : `10`) ) |
| `offsetY` | number | y 오프셋 값 (내부 여백 : `15`) |
| `align` | 'left' \| 'right' \| 'center' | 제목 정렬 (기본값: `'left'`) |

```js
const options = {
  chart: {
    title: 'Chart Title'
  }
};

// 혹은

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

기본적으로 차트가 렌더링 될 때 애니메이션 효과가 나타난다. 기본 재생 시간은 `500ms`이다.

만약 애니메이션 효과를 원하지 않는 경우 `animation`을 `false`로 설정하면 애니메이션 효과가 비활성화된다.

```js
const options = {
  chart: {
    animation: false
  }
};
```

`animation.duration` 옵션에 숫자를 입력하여 애니메이션 재생 시간을 제어할 수 있다.

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

`width`와 `height` 옵션을 사용하여 차트의 크기를 설정할 수 있다.
숫자를 입력하여 절댓값으로 크기를 지정해줄 수 있다.

```js
const options = {
  chart: {
    width: 1000,
    height: 500
  }
};
```

`'auto'`를 설정하여 캔버스가 부모 컨테이너의 크기에 영향을 받도록 설정할 수 있다. `width` 혹은 `height`가 `'auto'`로 설정되어 있으면 컨테이너의 크기가 변경되는 것을 감지하여, 사이즈 변경 시 차트를 사이즈에 맞춰 자동으로 다시 렌더링한다. 만약 `width`, `height`를 입력하지 않을 경우 차트는 컨테이너 사이즈에 맞춰 최초 한번 렌더링 되고 컨테이너의 사이즈에 따라 자동으로 크기가 조절되지 않는다.

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

`'auto'`설정은 [`responsive` 옵션](./common-responsive-options.md)과 함께 사용하면, 차트의 크기가 변경될 때마다 반응형 규칙이 적용되어 유용하게 사용할 수 있다.
