# component-chart

## Spec

* native javascript 지향
  
  --> 외부 library 사용 배제

  --> code-snippet 사용
* 확장 가능하도록 개발

  --> chart Factory에 추가하는 방식으로 개발
* IE8 이상 지원

  --> raphael lib 사용 (플러그인 방식으로 개발하여 향후 교체 가능하도록)
* 애니메이션
  * 최신브라우저 : 적당한 애니메이션 필요
  * 구형브라우저(IE8) : 최소화
  
  --> 애니메이션 타입을 몇가지로 제한하여 사용자가 선택할 수 있도록 함

  --> 애니메이션의 상세 커스터마이징은 배제
  
  --> 외부 차트 라이브러리 애니메이션 검토 필요
  
  --> 기본 차트 개발 시 애니메이션 배제
* 디자인 적용

  --> 다음의 항목으로 디자인 변경 제한
  
  * 차트 title 폰트, 폰트크기, 폰트색상
  * axis title 폰트, 폰트크기, 폰트색상
  * axis label 폰트, 폰트크기, 폰트색상
  * axis tick mark 색상
  * series 배경색, 테두리색
  * legend 폰트, 폰트크기, 폰트색상, 테두리색, 배경색
  * plot 라인색, 배경색
* Data 입력

  --> 초기에는 구글방식으로 진행

  --> 진행하면서 결정
* 공개 API 설계

  --> 기존 fe프로젝트를 따라가되 진행하면서 결정

  --> 외부 차트 api 추가 검토 필요
* 글로벌화 고려

  --> 주석 및 커밋메시지 영문화
* 오픈소스 고려

  --> 읽기 쉬운 코드 개발;;
* 지원 차트
  * 기본 차트
    * bar
    * line
    * pie
  * 추가 차트

## ~~Concept~~

* ~~익숙한 사용방법 제공~~
  * ~~기존 ne component와 사용방법 유사~~
```html
<!--
  <script type="text/javascript" src="./js/raphael-min.js"></script>
  <script type="text/javascript" src="./js/component-chart.js"></script>
  <script>
    var chart = ne.chart(container, {
        chartType : 'Raphael', //default
        type : 'BAR',
        data : [...],
        styles: {}
    });
    chart.render();
  </script>
-->
```
* ~~입력 data가 간단하다.~~
  * ~~google방식의 data입력 차용~~
    * ~~https://developers.google.com/chart/interactive/docs/reference#arraytodatatable~~
    * ~~https://developers.google.com/chart/interactive/docs/gallery/barchart~~
    * ~~https://developers.google.com/chart/interactive/docs/datatables_dataviews#arraytodatatable~~
```javascript
/*
  ...
  chart.setData([
     ['Element', 'Density', { role: 'style' }],
     ['Copper', 8.94, '#b87333'],
     ['Silver', 10.49, 'silver'],
     ['Gold', 19.30, 'gold'],
     ['Platinum', 21.45, 'color: #e5e4e2' ]
  ]);
*/
```
* ~~디자인 적용이 쉽고 유연하다.~~
  * ~~Color, Font, Grid line, Number format, Background Color~~
```javascript
/*
  ...
  chart.setStyles({
    font:'애플고딕',
    gridLine: '1px solid #000',
    numberFormat: true,
    gridGackground: 'gray'
  });
  
  chart.setData([
     ['Element', 'Density', { role: 'style' }],
     ['Copper', 8.94, '#b87333'], // Series의 색상 표현
     ...
  ]);
  ...
*/
```

* ~~도형은 외부라리브러리를 사용하고 그 외 부분은 직접 개발 (기존 프로젝트 동일)~~
* ~~도형 라이브러리 교체가 쉽다.~~
  * ~~추후 D3라이브러리로 교체하거나 자체 개발 플러그인으로 변경 용이~~
```html
<!--
  <script type="text/javascript" src="./js/d3-min.js"></script>
  <script type="text/javascript" src="./js/component-chart.js"></script>
  <script type="text/javascript" src="./js/ne-chart-plugin-d3.js"></script>
  <script>
    ...
    chart.changeChart('D3');
    ...
  </script>
-->
```

## Plan

* 2015.06.17 ~ 2015.06.26 : 기존 프로젝트 분석 및 차트 스터디
  * https://github.nhnent.com/fe/Application-Chart
  * http://wiki.nhnent.com/display/org/Chart
  * https://msdn.microsoft.com/en-us/library/vstudio/dd456696(v=vs.100).aspx
  * https://developers.google.com/chart/interactive/docs/
  * http://www.highcharts.com/
  * http://echarts.baidu.com/
  * http://raphaeljs.com/
  * http://d3js.org/
* 2015.06.29 ~ 2015.07.03 : 설계 및 base 코딩
* 2015.07.06 ~ 2015.07.17 : raphealjs를 이용하여 bar chart 구현
  * 플러그인 구성 방법 결정
* 2015.07.20 ~ 2015.07.31 : line, pie chart 구현 (기본 차트 1차 완료)

