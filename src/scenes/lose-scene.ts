import { Engine, SceneOptions, Color4, FreeCamera, Vector3 } from "@babylonjs/core";
import { AdvancedDynamicTexture, Button, TextBlock } from "@babylonjs/gui";
import BaseScene from "../core/base-scene";
import { Events } from "../core/events";
import { GameState } from "../core/enums";

export default class LoseScene extends BaseScene {

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

        const gameOver = new TextBlock();
        gameOver.text = "GAME OVER"
        gameOver.color = "red";
        gameOver.fontSize = "200px";
        gameOver.top = "-200px";
        guiMenu.addControl(gameOver);

        const youLost = new TextBlock();
        youLost.text = "you lost"
        youLost.color = "red";
        youLost.fontSize = "64px";
        guiMenu.addControl(youLost);
    }
}
