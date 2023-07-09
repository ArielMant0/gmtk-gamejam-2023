import { Engine, SceneOptions, Color4, FreeCamera, Vector3 } from "@babylonjs/core";
import { AdvancedDynamicTexture, TextBlock } from "@babylonjs/gui";
import BaseScene from "../core/base-scene";
import { GameState } from "../core/enums";

export default class WinScene extends BaseScene {

    constructor(id: GameState, engine: Engine, options: SceneOptions = {}) {
        super(id, engine, options)
    }

    public async init() {
        if (!this.scene) return;

        this.scene.clearColor = new Color4(0, 0, 0, 1);
        let camera = new FreeCamera("camera1", new Vector3(0, 0, 0), this.scene);
        camera.setTarget(Vector3.Zero());

        //--GUI--
        const guiMenu = AdvancedDynamicTexture.CreateFullscreenUI("UI");

        const yay = new TextBlock();
        yay.text = "YAY"
        yay.color = "green";
        yay.fontSize = "200px";
        yay.top = "-200px";
        guiMenu.addControl(yay);

        const youWon = new TextBlock();
        youWon.text = "you won"
        youWon.color = "green";
        youWon.fontSize = "64px";
        guiMenu.addControl(youWon);
    }
}
