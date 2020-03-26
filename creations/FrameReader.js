import getPixels from "get-pixels";
import fs        from "fs";
import colorsys  from "colorsys";

export default class FontMatrix {
  pixel = null;
  frame = [];
  fps = 12;
  f = 0;
  frames = [];
  frameDirectory = "./assets/resized";


  constructor(pixel) {
    this.pixel = pixel;
    this.init();
  }

  async init() {
    this.frames = await this.readDirectory();
    this.render();
//    this.addListeners();
  }

  addListeners() {
    this.pixel.on("button-up", (buttonId) => {
      console.log(`Button ${buttonId} released`);

      switch (buttonId) {
        case "btn-A" :
          this.nextMessage();
          break;
        case "btn-B" :
          this.prevMessage();
          break;
      }
    });
  }

  get_frames(n) {
    return 1000 / n;
  }

  async render() {
    try {
      await this.stream_to_pixel();

      if (this.f < this.frames.length - 1) {
        this.f++;
      } else {
        this.f = 0;
      }


      setTimeout(async () => {
        this.render();
      }, this.get_frames(this.fps));
    }
    catch (err) {
      console.log(err);
    }
  }

  async stream_to_pixel() {
    this.frame = [];

    try {
      let d = await this.loadBitmap(this.frames[this.f]);
      console.log(d.pixels.length);
      if (d.pixels.length === 128) {
        this.pixel.streamFrame(d.pixels);
      }
      return;
    }
    catch (err) {
      console.log(err);
    }
  }

  async readDirectory() {
    const data = [];
    const files = await fs.readdirSync(this.frameDirectory);

    for (let i = 0; i < files.length; i++) {
      if (typeof files[i] !== "undefined") {
        data.push(`${this.frameDirectory}/${files[i]}`);
      }
    }
    return data.sort();
  }

  loadBitmap(f) {
    if (typeof f !== "undefined") {
      return new Promise((resolve, reject) => {
        getPixels(f, (err, pixels) => {
          if (err) {
            reject(err);
          }

          let eArr = pixels.data.entries();
          let pixelArray = [];
          for (let n of eArr) {
            pixelArray.push(n[1]);
          }
          pixelArray = pixelArray.chunk(pixels.shape[2]);

          resolve({
            height: pixels.shape[1],
            width: pixels.shape[0],
            channels: pixels.shape[2],
            pixels: pixelArray.map((p) => {
              return colorsys.rgbToHex(p[0], p[1], p[2]);
            })
          });
        });
      });
    }
  }
}