import { Engine, SceneOptions, Vector3, HemisphericLight, Color3, PointLight, ShadowGenerator, Sound, ActionManager, ExecuteCodeAction } from "@babylonjs/core";
import { AdvancedDynamicTexture, Button } from "@babylonjs/gui";
import BaseScene from "../core/base-scene";
import { Events } from "../core/events";
import { Player } from "../player";
import { GameState } from "../core/enums";
import InputControls from "../input-controls";
import QuestBuilder from "../quest-builder";
import Inventory from "../inventory";
import NPCManager from "../npc-manager";
import { IngameTime } from "../core/game-time";
import GoalManager from "../goal-manager";
import { Logic } from "../core/logic";
import ASSETS from '../core/assets'

export default class GameScene extends BaseScene {

    private _player;

    private _questBuiler;
    private _inventory;
    private _npcFactory;
    private _goalManager;

    private _input;
    private _ui;

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

        IngameTime.start(this.scene);

        this._npcFactory.start(this.scene);

        //primitive character and setting
        await this._initializeGameAsync();
    }

    public async load(force=false) {
        this.reset();

        if (!force && this.loaded) {
            console.debug("already loaded game scene assets")
            return;
        }

        if (!this.scene) {
            this.makeScene();
        }

        this._ui = AdvancedDynamicTexture.CreateFullscreenUI("UI");
        // dont detect any inputs from this ui while the game is loading
        this.scene.detachControl();

        // TODO: keep scale to size ??
        await this._ui.parseFromURLAsync("gui/gui_game.json", false)

        ASSETS.loadSpritesheet(
            "icons",
            "icons/spritesheet.png",
            "icons/spritesheet.json",
            this.scene
        );

        // menu button
        const exitBtn = this._ui.getControlByName("MenuButton") as Button
        exitBtn.onPointerDownObservable.add(() => {
            Events.emit("scene:switch", GameState.PAUSE);
            this.scene.detachControl();
        });

        this._questBuiler = new QuestBuilder();
        this._questBuiler.addGUI(this._ui);

        this._inventory = new Inventory();
        this._inventory.addGUI(this._ui);

        this._goalManager = new GoalManager();
        this._goalManager.addGUI(this._ui);

        this._npcFactory = new NPCManager();
        this._npcFactory.addGUI(this._ui);

        const sound = new Sound("bump", "/bump.mp3", this.scene)
        this._player = new Player(this.scene, this._input);

        await this._player.load();
    }

    public reset() {
        Logic.reset();
        IngameTime.reset();

        if (this._player) this._player.reset();
        if (this._questBuiler) this._questBuiler.reset();
        if (this._inventory) this._inventory.reset();
        if (this._goalManager) this._goalManager.reset();
        if (this._npcFactory) this._npcFactory.reset();
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
