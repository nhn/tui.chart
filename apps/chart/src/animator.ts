import Chart from './charts/chart';
import { Options } from '@t/store/store';
import { isNull } from '@src/helpers/utils';

type Anim = {
  chart: Chart<Options>;
  duration: number;
  requester: Chart<Options>;
  onCompleted: Function;
  onFrame: (delta) => void;
  start: number | null;
  completed: boolean;
  current: number | null;
};

export default class Animator {
  anims: Anim[] = [];

  state = 'IDLE';

  requestId: number | null = null;

  firstRendering = true;

  add({
    chart,
    duration,
    requester,
    onCompleted = () => {},
    onFrame = (delta) => {
      if (!this.firstRendering) {
        chart.update(delta);
      }

      if (this.firstRendering) {
        chart.initUpdate(delta);
        if (delta === 1) {
          this.firstRendering = false;
        }
      }
    },
  }: {
    chart: Chart<Options>;
    duration: number;
    requester: Chart<Options>;
    onCompleted: Function;
    onFrame?: (delta: number) => void;
  }) {
    if (this.anims.length) {
      this.reset();
    }

    if (this.state === 'IDLE') {
      this.anims.push({
        chart,
        requester,
        duration,
        onFrame,
        onCompleted,
        start: null,
        current: null,
        completed: false,
      });

      this.start();
    }
  }

  reset() {
    this.anims.forEach((anim) => {
      anim.current = 1;
      anim.onFrame(anim.current);
      anim.completed = true;
    });

    this.anims = [];

    this.cancelAnimFrame();

    this.state = 'IDLE';
    this.requestId = null;
  }

  start() {
    if (this.anims.length) {
      this.state = 'RUNNING';

      this.runFrame();
    }
  }

  runFrame() {
    this.requestId = window.requestAnimationFrame((timestamp) => {
      this.runAnims(timestamp);
    });
  }

  runAnims(timestamp: number) {
    this.next(timestamp);

    if (this.anims.length) {
      this.runFrame();
    } else {
      this.state = 'IDLE';
      this.requestId = null;
    }
  }

  next(timestamp: number) {
    this.anims.forEach((anim) => {
      if (isNull(anim.start)) {
        anim.start = timestamp;
      }

      Object.defineProperty(anim.chart, '___animId___', {
        value: timestamp,
        enumerable: false,
        writable: false,
        configurable: true,
      });
      anim.current = anim.duration ? Math.min((timestamp - anim.start) / anim.duration, 1) : 1;
      anim.onFrame(anim.current);
      anim.completed = anim.current === 1;
    });

    this.anims.forEach((anim) => {
      if (anim.chart.___animId___ === timestamp) {
        anim.chart.draw();
        delete anim.chart.___animId___;
      }

      if (anim.completed) {
        this.cancelAnimFrame();

        anim.onCompleted();
        anim.chart.eventBus.emit('animationCompleted', anim.requester);
      }
    });

    this.anims = this.anims.filter((anim) => !anim.completed);
  }

  cancelAnimFrame() {
    if (this.requestId) {
      window.cancelAnimationFrame(this.requestId);
    }
  }
}
