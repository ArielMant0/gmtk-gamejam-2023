import { Scene } from "@babylonjs/core";

class GameTime {

    // number of milliseconds that define 1 ingame hour
    private _hInMS: number;
    private _duration: number = 0;

    public day: number = 0;
    public hour: number = 0;

    constructor(hInMS=1000) {
        this._hInMS = hInMS;
    }

    public start(scene: Scene) {
        scene.onBeforeRenderObservable.add(this.update.bind(this))
    }

    public getTime() {
        return this.day * 24 + this.hour;
    }

    public update(scene: Scene) {
        // TODO: random
        this._duration += scene.deltaTime * 0.33;
        if (this._duration >= this._hInMS) {
            if (this.hour === 23) {
                this.hour = 0;
                this.day++;
            } else {
                this.hour++;
            }
            this._duration = 0;
        }
    }
}

export const IngameTime = new GameTime();
