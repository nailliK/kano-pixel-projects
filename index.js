import dotEnv from "dotenv";
import Pixel from "./lib/Pixel.js";
import Server from "./lib/Server.js";
import FontMatrix from "./creations/FontMatrix.js";

// import FrameReader from "./creations/FrameReader.js";
// import GameOfLife from "./creations/GameOfLife.js";

Object.defineProperty(Array.prototype, "chunk", {
    value: function (chunkSize) {
        const temp = [];

        for (let i = 0; i < this.length; i += chunkSize) {
            temp.push(this.slice(i, i + chunkSize));
        }

        return temp;
    }
});

class App {
    pixel = {};

    constructor() {
        dotEnv.config();
    }

    async init() {
        this.pixel = await new Pixel().getDevice("physical", "192.168.86.212");
        this.creation = new FontMatrix(this.pixel);
        const server = new Server(this.pixel, this.creation);

        // this.pixel.connectToWifi("THE RADNESS", "killian6")
        //   .then((data) => {
        //     console.log("Connected to wifi network", data);
        //   })
        //   .catch((err) => {
        //     console.log(`Couldn't connect to wifi network`, err);
        //   });

        // this.creation = new GameOfLife(this.pixel);
        // this.creation = new FrameReader(this.pixel);
        // this.creation = new FontMatrix(this.pixel);

    }
}

const app = new App();
app.init();
