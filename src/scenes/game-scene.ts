import { Engine, SceneOptions, Color4, Vector3, HemisphericLight, Color3, PointLight, ShadowGenerator, Sound, ActionManager, ExecuteCodeAction } from "@babylonjs/core";
import { AdvancedDynamicTexture, Button, Control } from "@babylonjs/gui";
import BaseScene from "../core/base-scene";
import { Events } from "../core/events";
import { Player } from "../player";
import { Environment } from "../environment";
import { GameState } from "../core/enums";
import InputControls from "../input-controls";

export default class GameScene extends BaseScene {

    private _player;
    private _environment;

    private _input;

    constructor(id: GameState, engine: Engine, options: SceneOptions = {}) {
        super(id, engine, options, true)
    }

    public makeScene() {
        const created = super.makeScene();
        if (!this.scene) {
            throw new Error("missing scene object");
        }

        if (!this._input) {
            this.scene.actionManager = new ActionManager(this.scene);
            this._input = new InputControls(this.scene);

            this.scene.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnKeyDownTrigger, evt => {
                if (evt.sourceEvent.key === 'l') {
                    Events.emit("scene:switch", GameState.LOSE)
                } else if (evt.sourceEvent.key === 'o') {
                    Events.emit("scene:switch", GameState.WIN)
                } else if (evt.sourceEvent.key === 'Escape') {
                    Events.emit("scene:switch", GameState.PAUSE)
                }
            }));
        }
        return created;
    }

    public async init() {
        this.makeScene()
        if (!this.scene) {
            throw new Error("missing scene object")
        }

        this.scene.clearColor = new Color4(0.01568627450980392, 0.01568627450980392, 0.20392156862745098);

        //--GUI--
        const playerUI = AdvancedDynamicTexture.CreateFullscreenUI("UI");
        // dont detect any inputs from this ui while the game is loading
        this.scene.detachControl();

        //create a simple button
        const exitBtn = Button.CreateSimpleButton("exit", "MENU");
        exitBtn.width = "80px"
        exitBtn.height = "40px";
        exitBtn.color = "white";
        exitBtn.thickness = 0;
        exitBtn.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        exitBtn.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT
        playerUI.addControl(exitBtn);

        //this handles interactions with the start button attached to the scene
        exitBtn.onPointerDownObservable.add(() => {
            Events.emit("scene:switch", GameState.PAUSE);
            this.scene.detachControl(); //observables disabled
        });

        //primitive character and setting
        await this._initializeGameAsync();
    }

    public async load(force=false) {
        if (!force && this._environment && this._player) {
            console.debug("already loaded game scene assets")

            this._player.reset();
            return;
        }

        if (!this.scene) {
            this.makeScene();
        }

        // const assetsManager = new AssetsManager(this.scene);

        this._environment = new Environment(this.scene);
        const sound = new Sound("bump", "/bump.mp3", this.scene)
        this._player = new Player(this.scene, this._input);

        await Promise.all([
            this._environment.load(),
            this._player.load()
        ]);
    }

    private async _initializeGameAsync() {
        const light0 = new HemisphericLight("HemiLight", new Vector3(0, 1, 0), this.scene);

        const light = new PointLight("sparklight", new Vector3(0, 1, 0), this.scene);
        light.diffuse = new Color3(0.08627450980392157, 0.10980392156862745, 0.15294117647058825);
        light.intensity = 35;
        light.radius = 1;

        const shadowGenerator = new ShadowGenerator(1024, light);
        shadowGenerator.darkness = 0.4;

        // create the player
        this._player.addShadows(shadowGenerator)
    }
}
