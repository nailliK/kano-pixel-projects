import _        from "underscore";
import colorsys from "colorsys";

export default class GameOfLife {
  pixel = {};
  frame = [];
  matrix = [];
  snapshot = [];
  same = 0;
  cols = 16;
  rows = 8;
  fps = 12;
  c = new Date().getTime();
  pioneers = 0;
  autoRestart = 1;

  constructor(pixel) {
    this.pixel = pixel;
    this.pixel.on("button-up", (btn) => {
      this.reset_life();
    });

    this.reset_life();
    this.render();
  }

  get_frames(n) {
    return 1000 / n;
  }

  // get matrix at specific location
  get_matrix_at(x, y) {
    return _.findWhere(this.matrix, {
      x: x,
      y: y
    });
  }

  set_neighbors() {
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        let _x = x - 1;
        if (_x < 0) {
          _x = this.cols - 1;
        }

        let _y = y - 1;
        if (_y < 0) {
          _y = this.rows - 1;
        }

        let x_ = x + 1;
        if (x_ > this.cols - 1) {
          x_ = 0;
        }

        let y_ = y + 1;
        if (y_ > this.rows - 1) {
          y_ = 0;
        }

        let n = this.get_matrix_at(x, y);
        n.neighbors = {
          tl: this.get_matrix_at(_x, _y),
          t: this.get_matrix_at(x, _y),
          tr: this.get_matrix_at(x_, _y),
          r: this.get_matrix_at(x_, y),
          br: this.get_matrix_at(x_, y_),
          b: this.get_matrix_at(x, y_),
          bl: this.get_matrix_at(_x, y_),
          l: this.get_matrix_at(_x, y)
        };
      }
    }
  }

  set_snapshot() {
    const original = this.snapshot.slice(0);
    this.snapshot = [];

    for (let i in this.matrix) {
      let m = this.matrix[i],
          a = 0,
          s = 0;
      for (let n in m.neighbors) {
        a += m.neighbors[n].alive;
      }

      // if current node is alive
      if (m.alive === 1) {
        // if alive neighbors are 2 or 3, keep alive
        if (a >= 2 && a <= 3) {
          s = 1;
          // if alive neighbors are less than 2 or more than 3, make not alive
        } else {
          s = 0;
        }
      } else if (m.alive === 0) {
        // if current node is dead
        if (a === 3) {
          // if neighbors are 3 bring back to life
          s = 1;
        }
      }

      // If pioneers is 1 and 1 out of n is 1, make alive
      const survival = Math.round(Math.random() * (this.rows * this.cols)) === 1;
      if (this.pioneers && !m.alive && survival) {
        m.alive = 1;
        a = 3;
        s = 1;
      }

      m.density = a;
      this.snapshot[i] = s;
    }

    this.same = 0;
    for (let i = 0; i < original.length; i++) {
      this.same += original[i] === this.snapshot[i] ? 1 : 0;
    }
  }

  set_matrix() {
    for (let i in this.matrix) {
      this.matrix[i].alive = this.snapshot[i];
    }
  }

  async stream_to_pixel() {
    if (this.autoRestart === 1 && this.same === this.snapshot.length) {
      this.reset_life();
    }

    this.frame = [];
    for (let i in this.matrix) {
      let m = parseInt(i) + parseInt(this.c);

      let h = m / (this.matrix.length) * 360 / 4;
      let s = 100;
      let v = this.matrix[i].density === 3 ? 100 : 10;
      let color = !this.matrix[i].alive ? "#000000" : colorsys.hsvToHex(h, s, v);
      this.frame.push(color);
    }

    try {
      await this.pixel.streamFrame(this.frame);
    }
    catch (err) {
      console.log(err);
    }
  }

  async render() {
    this.c++;
    this.set_snapshot();
    this.set_matrix();
    this.stream_to_pixel();

    setTimeout(async () => {
      this.render();
    }, this.get_frames(this.fps));
  }

  reset_life() {
    this.matrix = [];
    this.snapshot = [];

    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        const n = {
          alive: Math.round(Math.random()),
          x: x,
          y: y,
          neighbors: []
        };
        this.snapshot.push(n.alive);
        this.matrix.push(n);
      }
    }

    this.set_neighbors();
  }
}