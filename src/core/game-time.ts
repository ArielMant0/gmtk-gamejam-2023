import { Scene } from "@babylonjs/core";
import { Events } from "./events";

class GameTime {

    // number of milliseconds that define 1 ingame hour
    private _hInMS: number;
    private _duration: number = 0;
    private _scene;

    public day: number = 0;
    public hour: number = 0;

    constructor(hInMS=750) {
        this._hInMS = hInMS;
    }

    public reset() {
        this.day = 0;
        this.hour = 0;
        this._duration = 0;
    }

    public start(scene: Scene) {
        this._scene = scene;
        scene.registerAfterRender(this.update.bind(this))
    }

    public getTime() {
        return this.day * 24 + this.hour;
    }

    public update() {
        // TODO: why is this 0.33
        this._duration += this._scene.deltaTime;
        if (this._duration >= this._hInMS) {
            if (this.hour === 23) {
                this.hour = 0;
                this.day++;
            } else {
                this.hour++;
            }
            Events.emit("gametime:update", this.getTime())
            this._duration = 0;
        }
    }

    static durationInDays(duration: number) {
        return Math.floor(duration / 24)
    }

    static durationInHours(duration: number) {
        return Math.floor(duration % 24)
    }
}

const IngameTime = new GameTime();

export { IngameTime, GameTime }
