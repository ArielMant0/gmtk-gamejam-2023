import { Engine, SceneOptions, Color4, FreeCamera, Vector3 } from "@babylonjs/core";
import { AdvancedDynamicTexture, Button } from "@babylonjs/gui";
import BaseScene from "../core/base-scene";
import { GameState } from "../core/enums";
import { Events } from "../core/events";

export default class LoadScene extends BaseScene {

    constructor(id: GameState, engine: Engine, options: SceneOptions = {}) {
        super(id, engine, options)
    }

    public async init() {
        if (!this.scene) return;

        let camera = new FreeCamera("camera1", new Vector3(0, 0, 0), this.scene);
        camera.setTarget(Vector3.Zero());
        this.scene.clearColor = new Color4(0, 0, 0, 1);

        const ui = AdvancedDynamicTexture.CreateFullscreenUI("load");

        const button = Button.CreateSimpleButton("start", "GO")
        button.fontSize = "60px";
        button.color = "white";
        button.width = "200px"
        button.height = "200px"
        button.onPointerClickObservable.add(() => Events.emit("scene:switch", GameState.GAME))

        ui.addControl(button);
    }
}
