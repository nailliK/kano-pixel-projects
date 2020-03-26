import DeviceManager  from "../vendor/kano-computing/DeviceManager.js";
import RetailPixelKit from "../vendor/kano-computing/RetailPixelKit.js";

export default class Pixel {
  constructor() {
    this.deviceManager = DeviceManager;
    this.deviceList = [];
    this.kits = [];
    this.device = false;
  }

  async getDevice(connectionType = "physical", IP) {
    switch (connectionType) {
      case "physical" :
        // Connect to pixel device physically
        this.deviceList = await this.deviceManager.listConnectedDevices();

        this.kits = this.deviceList.filter((device) => {
          return device instanceof RetailPixelKit;
        });
        this.device = this.kits[0];
        break;

      case "wireless" :
        // Connect to device via IP address
        const rpk = new RetailPixelKit({ip: IP});
        this.device = await rpk.connect();
        break;
    }

    return this.device;
  }
}