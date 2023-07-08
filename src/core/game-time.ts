import { Scene } from "@babylonjs/core";
import { Events } from "./events";

class GameTime {

    // number of milliseconds that define 1 ingame hour
    private _hInMS: number;
    private _duration: number = 0;
    private _scene;

    public day: number = 0;
    public hour: number = 0;

    constructor(hInMS=1000) {
        this._hInMS = hInMS;
    }

    public start(scene: Scene) {
        this._scene = scene;
        scene.registerBeforeRender(this.update.bind(this))
    }

    public getTime() {
        return this.day * 24 + this.hour;
    }

    public update() {
        // TODO: random
        this._duration += this._scene.deltaTime * 0.33;
        if (this._duration >= this._hInMS) {
            if (this.hour === 23) {
                this.hour = 0;
                this.day++;
            } else {
                this.hour++;
            }
            Events.emit("gametime:change", this.getTime())
            this._duration = 0;
        }
    }
}

export const IngameTime = new GameTime();
