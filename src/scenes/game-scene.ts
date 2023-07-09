import { Engine, SceneOptions, Vector3, HemisphericLight, Color3, PointLight, ShadowGenerator, Sound, ActionManager, ExecuteCodeAction, Layer } from "@babylonjs/core";
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
import SM from '../core/sound-manager'
import { Notifier } from "../notify";

export default class GameScene extends BaseScene {

    private _player;

    private _questBuiler;
    private _inventory;
    private _npcFactory;
    private _goalManager;

    private _input;
    private _ui;
    private _bg;

    constructor(id: GameState, engine: Engine, options: SceneOptions = {}) {
        super(id, engine, options, true)
    }

    public async makeScene() {
        const created = await super.makeScene();

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

        if (!ASSETS.hasSheet("icons")) {
            await ASSETS.loadSpritesheet(
                "icons",
                "assets/icons/spritesheet.png",
                "assets/icons/spritesheet.json",
                this.scene
            );
        }

        if (!SM.ready || SM.size === 0) {
            if (!SM.ready) {
                SM.init(this.scene)
            }

            SM.loadSound("click", "assets/sounds/bump.mp3")
            SM.loadSound("notify:success", "assets/sounds/bump.mp3")
            SM.loadSound("notify:failure", "assets/sounds/bump.mp3")
            SM.loadSound("npc:arrive", "assets/sounds/bump.mp3")
            SM.loadSound("quest:accept", "assets/sounds/bump.mp3")
            SM.loadSound("quest:reject", "assets/sounds/bump.mp3")
            SM.loadSound("goal:dismiss", "assets/sounds/bump.mp3")
            SM.loadSound("goal:collect", "assets/sounds/bump.mp3")
            await SM.loadMusic("soundtrack", "assets/sounds/woodland-fantasy.mp3")
        }

        return created;
    }

    public async init() {
        await this.makeScene()

        if (!this.scene) {
            throw new Error("missing scene object")
        }

        SM.playMusic("soundtrack");

        IngameTime.start(this.scene);
        this._npcFactory.start(this.scene);
    }

    public async load(force=false) {
        this.reset();

        if (!force && this.loaded) {
            console.debug("already loaded game scene assets")
            return;
        }

        if (!this.scene) {
            await this.makeScene();
        }

        this._ui = AdvancedDynamicTexture.CreateFullscreenUI("UI");

        // dont detect any inputs from this ui while the game is loading
        this.scene.detachControl();

        // TODO: keep scale to size ??
        await this._ui.parseFromURLAsync("assets/gui/gui_game.json", false)

        if (!Notifier.ready) {
            Notifier.init(this.scene, this._ui);
        }

        this._bg = new Layer("bg", "assets/art/bg.jpg", this.scene, true);

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

        this._player = new Player(this.scene);

        await this._player.load();
    }

    public reset() {
        Logic.reset();
        IngameTime.reset();
        Notifier.reset();

        if (this._player) this._player.reset();
        if (this._questBuiler) this._questBuiler.reset();
        if (this._inventory) this._inventory.reset();
        if (this._goalManager) this._goalManager.reset();
        if (this._npcFactory) this._npcFactory.reset();
    }
}
