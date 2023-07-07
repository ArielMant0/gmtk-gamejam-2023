import { Scene, Vector3, CreateBox } from "@babylonjs/core";

export class Environment {
    private _scene: Scene;

    constructor(scene: Scene) {
        this._scene = scene;
    }

    public async load() {
        const ground = CreateBox("ground", { size: 24 }, this._scene);
        ground.scaling = new Vector3(1,.02,1);
    }
}
