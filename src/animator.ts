import Chart from './charts/chart';

type Anim = {
  chart: Chart;
  duration: number;
  requestor: any;
  onCompleted: Function;
  onFrame: (delta) => void;
  start: number | null;
  completed: boolean;
  current: number | null;
};

class Animator {
  anims: Anim[] = [];

  state = 'IDLE';

  requestId: number | null = null;

  add({
    chart,
    duration,
    requestor,
    onCompleted = () => {},
    onFrame = delta => {
      chart.update(delta);
    }
  }: {
    chart: Chart;
    duration: number;
    requestor: any;
    onCompleted: Function;
    onFrame?: (delta: number) => void;
  }) {
    const prevIndex = this.anims.findIndex(anim => anim.requestor === requestor);

    if (~prevIndex) {
      this.anims.splice(prevIndex, 1);
    }

    this.anims.push({
      chart,
      requestor,
      duration,
      onFrame,
      onCompleted,
      start: null,
      current: null,
      completed: false
    });

    if (this.state === 'IDLE') {
      this.start();
    }
  }

  start() {
    if (this.anims.length) {
      this.state = 'RUNNING';

      this.runFrame();
    }
  }

  runFrame() {
    this.requestId = window.requestAnimationFrame(timestamp => {
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
    this.anims.forEach(anim => {
      if (anim.start === null) {
        anim.start = timestamp;
      }

      Object.defineProperty(anim.chart, '___animId___', {
        value: timestamp,
        enumerable: false,
        writable: false,
        configurable: true
      });

      anim.current = Math.min((timestamp - anim.start) / anim.duration, 1);

      anim.onFrame(anim.current);

      if (anim.current >= 1) {
        anim.completed = true;
      }
    });

    this.anims.forEach(anim => {
      if (anim.chart.___animId___ === timestamp) {
        anim.chart.draw();
        delete anim.chart.___animId___;
      }

      if (anim.completed) {
        anim.onCompleted();
        anim.chart.eventBus.emit('animationCompleted', anim.requestor);
      }
    });

    this.anims = this.anims.filter(anim => !anim.completed);
  }
}

export default new Animator();
