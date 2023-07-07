import { Engine, SceneOptions, Color4, FreeCamera, Vector3, Tools } from "@babylonjs/core";
import { AdvancedDynamicTexture, TextBlock } from "@babylonjs/gui";
import BaseScene from "../core/base-scene";
import { GameState } from "../core/enums";

export default class LoadScene extends BaseScene {

    constructor(id: GameState, engine: Engine, options: SceneOptions = {}) {
        super(id, engine, options)
    }

    public async init() {
        if (!this.scene) return;

        let camera = new FreeCamera("camera1", new Vector3(0, 0, 0), this.scene);
        camera.setTarget(Vector3.Zero());
        this.scene.clearColor = new Color4(0, 0, 0, 1);

        //--GUI--
        const cutScene = AdvancedDynamicTexture.CreateFullscreenUI("load");

        //--PROGRESS DIALOGUE--
        const loading = new TextBlock();
        loading.color = "white";
        loading.fontSize = "32px";
        loading.text = "loading";
        cutScene.addControl(loading)
    }
}
