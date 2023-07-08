import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import { Engine, Tools } from "@babylonjs/core";
import { GameState } from "./core/enums";
import BaseScene from "./core/base-scene";
import { Events } from "./core/events";

export default class App {

    // General Entire Application
    public engine: Engine;
    private canvas: HTMLCanvasElement;
    private _scenes: Map<GameState, BaseScene> = new Map();

    // Scene - related
    private _state: GameState = GameState.START;

    constructor() {
        this.canvas = this._createCanvas();

        // initialize babylon scene and engine
        this.engine = new Engine(this.canvas, true, undefined, true);

        // hide/show the Inspector
        window.addEventListener("keydown", (ev) => {
            // Ctrl + I
            if (ev.ctrlKey && ev.key === "i") {
                if (this.scene?.scene?.debugLayer.isVisible()) {
                    this.scene?.scene?.debugLayer.hide();
                } else {
                    this.scene?.scene?.debugLayer.show();
                }
            }
        });

        Events.on("scene:switch", (state: GameState) => {
            this.goToScene(state);
        });
    }

    get scene() {
        return this._scenes.get(this._state);
    }

    private _createCanvas(): HTMLCanvasElement {

        // create the canvas html element and attach it to the webpage
        this.canvas = document.createElement("canvas");
        this.canvas.style.width = "100%";
        this.canvas.style.height = "100vh";
        this.canvas.id = "gameCanvas";
        document.body.appendChild(this.canvas);

        return this.canvas;
    }

    public async start(): Promise<void> {
        // Register a render loop to repeatedly render the scene
        this.goToScene(GameState.START);

        // TODO: ugly
        this.engine.runRenderLoop(() => {
            switch (this._state) {
                default:
                    this.scene?.scene?.render();
            }
        });

        //resize if the screen is resized/rotated
        window.addEventListener('resize', () => this.engine.resize());
    }

    public registerScene(id: GameState, scene: BaseScene) {
        this._scenes.set(id, scene);
    }

    public async goToScene(state: GameState) {
        this.engine.displayLoadingUI();

        const prevScene = this._scenes.get(this._state)
        const newScene = this._scenes.get(state)
        const isNew = this._state !== state;

        if (isNew) {
            prevScene?.beforeDisable();
        }

        switch (state) {
            case GameState.LOAD:
                const gameScene = this._scenes.get(GameState.GAME);
                let load: any = null;
                if (gameScene) {
                    load = async () => await gameScene.load()
                }
                await newScene?.enable(load);
                this.goToScene(GameState.GAME);
                break;
            case GameState.GAME:
                // await Tools.DelayAsync(1000)
                await newScene?.enable();
                break;
            default:
                await newScene?.enable();
        }

        newScene?.scene?.attachControl()

        if (isNew) {
            prevScene?.disable();
        }

        this.engine.hideLoadingUI();
        this._state = state;
    }
}
