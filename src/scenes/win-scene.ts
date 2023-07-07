import { Engine, SceneOptions, Color4, FreeCamera, Vector3 } from "@babylonjs/core";
import { AdvancedDynamicTexture, Button, TextBlock } from "@babylonjs/gui";
import BaseScene from "../core/base-scene";
import { Events } from "../core/events";
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

        const mainBtn = Button.CreateSimpleButton("mainmenu", "GO TO MAIN MENU");
        mainBtn.width = 0.2;
        mainBtn.height = "40px";
        mainBtn.color = "white";
        mainBtn.top = "100px";
        guiMenu.addControl(mainBtn);
        // this handles interactions with the start button attached to the scene
        mainBtn.onPointerUpObservable.add(() => {
            Events.emit("scene:switch", GameState.START)
            this.scene?.detachControl(); //observables disabled
        });
    }
}
