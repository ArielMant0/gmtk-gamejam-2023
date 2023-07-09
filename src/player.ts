import { Scene, Vector3, UniversalCamera } from "@babylonjs/core";
import ASSETS from './core/assets'
import { Logic } from "./core/logic";

export class Player {

    public scene: Scene;
    public camera;
    public sprite;

    constructor(scene: Scene) {
        this.scene = scene;
        this._setupPlayerCamera();
    }

    public reset() {
        if (this.sprite) {
            this.sprite.position = Logic.PLAYER_POSITION;
        }
    }

    public async load() {
        this.sprite = ASSETS.getSprite("icons", "troll.png", "player")
        this.sprite.height = 2;
        this.reset();
    }

    private _setupPlayerCamera() {
        this.camera = new UniversalCamera("cam", new Vector3(0, 0, -40), this.scene);
        this.camera.fov = 0.47350045992678597;
        this.camera.lockedTarget = new Vector3(0, 0, 0);

        this.scene.activeCamera = this.camera;
        return this.camera;
    }
}
