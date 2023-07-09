import { Engine, SceneOptions, Color4, FreeCamera, Vector3, ActionManager, ExecuteCodeAction } from "@babylonjs/core";
import { AdvancedDynamicTexture, Button, Control } from "@babylonjs/gui";
import BaseScene from "../core/base-scene";
import { Events } from "../core/events";
import { GameState } from "../core/enums";

export default class PauseScene extends BaseScene {

    constructor(id: GameState, engine: Engine, options: SceneOptions = {}) {
        super(id, engine, options)
    }

    public async makeScene() {
        if (await super.makeScene()) {
            this.scene.actionManager = new ActionManager(this.scene);
            this.scene.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnKeyDownTrigger, evt => {
                if (evt.sourceEvent.key === 'Escape') {
                    Events.emit("scene:switch", GameState.GAME)
                }
            }));
            return true;
        }
        return false;
    }

    public async init() {
        if (!this.scene) return;

        this.scene.clearColor = new Color4(0, 0, 0, 1);
        let camera = new FreeCamera("camera1", new Vector3(0, 0, 0), this.scene);
        camera.setTarget(Vector3.Zero());

        // create a fullscreen ui for all of our GUI elements
        const guiMenu = AdvancedDynamicTexture.CreateFullscreenUI("UI");
        guiMenu.idealHeight = 720;

        // create a simple button
        const startBtn = Button.CreateSimpleButton("continue", "CONTINUE");
        startBtn.width = 0.2
        startBtn.top = "-40px"
        startBtn.height = "40px";
        startBtn.color = "white";
        startBtn.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        guiMenu.addControl(startBtn);

        // create a simple button
        const resetBtn = Button.CreateSimpleButton("reset", "RESET");
        resetBtn.width = 0.2
        resetBtn.height = "40px";
        resetBtn.color = "white";
        resetBtn.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        guiMenu.addControl(resetBtn);

        const settingsBtn = Button.CreateSimpleButton("settings", "SETTINGS");
        settingsBtn.width = 0.2
        settingsBtn.top = "40px"
        settingsBtn.height = "40px";
        settingsBtn.color = "white";
        settingsBtn.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        guiMenu.addControl(settingsBtn);

        // this handles interactions with the start button attached to the scene
        startBtn.onPointerDownObservable.add(() => {
            if (this.scene) {
                Events.emit("scene:switch", GameState.GAME);
                this.scene.detachControl(); //observables disabled
            }
        });
        resetBtn.onPointerDownObservable.add(() => {
            if (this.scene) {
                Events.emit("scene:switch", GameState.LOAD);
                this.scene.detachControl(); //observables disabled
            }
        });
    }
}
