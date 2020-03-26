import getPixels from "get-pixels";
import _ from "lodash";
import colorsys from "colorsys";

export default class FontMatrix {
    c = new Date().getTime();
    pixel = null;
    frame = [];
    fps = 12;

    charIndex = 0;
    charWidth = 8;
    charHeight = 8;

    displayMessages = [
        "waiting"
    ];
    messageIndex = 0;
    messagePadding = 4;

    fontMatrix = {
        pixels: [],
        width: 0,
        height: 0
    };
    keyCodes = [
        {
            character: " ",
            keyCode: 32,
            characterMatrix: []
        },
        {
            character: "0",
            keyCode: 48,
            characterMatrix: []
        },
        {
            character: "1",
            keyCode: 49,
            characterMatrix: []
        },
        {
            character: "2",
            keyCode: 50,
            characterMatrix: []
        },
        {
            character: "3",
            keyCode: 51,
            characterMatrix: []
        },
        {
            character: "4",
            keyCode: 52,
            characterMatrix: []
        },
        {
            character: "5",
            keyCode: 53,
            characterMatrix: []
        },
        {
            character: "6",
            keyCode: 54,
            characterMatrix: []
        },
        {
            character: "7",
            keyCode: 55,
            characterMatrix: []
        },
        {
            character: "8",
            keyCode: 56,
            characterMatrix: []
        },
        {
            character: "9",
            keyCode: 57,
            characterMatrix: []
        },
        {
            character: "a",
            keyCode: 65,
            characterMatrix: []
        },
        {
            character: "b",
            keyCode: 66,
            characterMatrix: []
        },
        {
            character: "c",
            keyCode: 67,
            characterMatrix: []
        },
        {
            character: "d",
            keyCode: 68,
            characterMatrix: []
        },
        {
            character: "e",
            keyCode: 69,
            characterMatrix: []
        },
        {
            character: "f",
            keyCode: 70,
            characterMatrix: []
        },
        {
            character: "g",
            keyCode: 71,
            characterMatrix: []
        },
        {
            character: "h",
            keyCode: 72,
            characterMatrix: []
        },
        {
            character: "i",
            keyCode: 73,
            characterMatrix: []
        },
        {
            character: "j",
            keyCode: 74,
            characterMatrix: []
        },
        {
            character: "k",
            keyCode: 75,
            characterMatrix: []
        },
        {
            character: "l",
            keyCode: 76,
            characterMatrix: []
        },
        {
            character: "m",
            keyCode: 77,
            characterMatrix: []
        },
        {
            character: "n",
            keyCode: 78,
            characterMatrix: []
        },
        {
            character: "o",
            keyCode: 79,
            characterMatrix: []
        },
        {
            character: "p",
            keyCode: 80,
            characterMatrix: []
        },
        {
            character: "q",
            keyCode: 81,
            characterMatrix: []
        },
        {
            character: "r",
            keyCode: 82,
            characterMatrix: []
        },
        {
            character: "s",
            keyCode: 83,
            characterMatrix: []
        },
        {
            character: "t",
            keyCode: 84,
            characterMatrix: []
        },
        {
            character: "u",
            keyCode: 85,
            characterMatrix: []
        },
        {
            character: "v",
            keyCode: 86,
            characterMatrix: []
        },
        {
            character: "w",
            keyCode: 87,
            characterMatrix: []
        },
        {
            character: "x",
            keyCode: 88,
            characterMatrix: []
        },
        {
            character: "y",
            keyCode: 89,
            characterMatrix: []
        },
        {
            character: "z",
            keyCode: 90,
            characterMatrix: []
        }
    ];

    constructor(pixel) {
        this.pixel = pixel;
        this.init();
    }

    async init() {
        this.fontMatrix = await this.loadBitmap();
        this.populateCharacterMatrices();
        this.render();
        this.addListeners();
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

    nextMessage() {
        this.charIndex = 0;
        this.messageIndex++;
        if (this.messageIndex === this.displayMessages.length) {
            this.messageIndex = 0;
        }
    }

    prevMessage() {
        this.charIndex = 0;
        this.messageIndex--;
        if (this.messageIndex < 0) {
            this.messageIndex = this.displayMessages.length - 1;
        }
    }

    addString(n) {
        // clean out "waiting" message
        if (this.displayMessages[0] === "waiting") {
            this.displayMessages = [];
        }

        const regex = /[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]/g;

        this.charIndex = 0;
        this.displayMessages.push(n.replace(regex, ""));

        console.log("Added message:", n);
    }

    get_frames(n) {
        return 1000 / n;
    }

    async render() {
        try {
            await this.stream_to_pixel();

            setTimeout(async () => {
                this.render();
            }, this.get_frames(this.fps));
        } catch (err) {
            console.log(err);
        }

        this.c++;
        this.charIndex++;

        if (this.charIndex === (this.charWidth * this.displayMessages[this.messageIndex].length + (this.messagePadding * this.charWidth))) {
            this.nextMessage();
        }
    }

    async stream_to_pixel() {
        this.frame = [];
        let matrix = [];
        let tmpFrame = [];

        let charArray = this.displayMessages[this.messageIndex].toLowerCase()
            .split("");

        for (let y = 0; y < this.charHeight; y++) {
            for (let x = 0; x < charArray.length; x++) {
                let char = _.find(this.keyCodes, {
                    character: charArray[x]
                });
                tmpFrame = tmpFrame.concat(char.characterMatrix[y]);
            }
        }

        tmpFrame = tmpFrame.chunk(this.charWidth * charArray.length);

        tmpFrame.forEach((f) => {
            let n = [...f];
            // Add padding to front and back of the array
            for (let p = 0; p < (this.messagePadding * this.charWidth); p++) {
                n.unshift(0);
            }

            // Move elements from the end of the array to the front
            for (let i = 0; i < this.charIndex; i++) {
                n.push(n.shift());
            }

            matrix = matrix.concat(n.slice(0, 16));
        });

        for (let i in matrix) {
            let m = parseInt(i) + parseInt(this.c);

            let h = m / (matrix.length) * 360 / 4;
            let s = Math.random() * 40 + 60;
            let v = 100;
            let color = matrix[i] === 0 ? "#000000" : colorsys.hsvToHex(h, s, v);
            this.frame.push(color);
        }

        try {
            this.pixel.streamFrame(this.frame);
        } catch (err) {
            console.log(err);
        }
    }

    loadBitmap() {
        return new Promise((resolve, reject) => {
            getPixels("./assets/bitmap-font-1.png", (err, pixels) => {
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
                        return p[0] === 255 ? 0 : 1;
                    })
                });
            });
        });
    }

    populateCharacterMatrices() {
        let pixelArray = this.fontMatrix.pixels.chunk(this.charWidth);

        this.keyCodes.forEach((keycode, charIndex) => {
            for (let y = 0; y < this.charHeight; y++) {
                let n = charIndex + (y * this.keyCodes.length);
                keycode.characterMatrix.push(pixelArray[n]);
            }
        });
    }
}
