import { Engine, Scene, SceneOptions } from "@babylonjs/core";
import { GameState } from "./enums";

export default class BaseScene {

    public engine: Engine;
    public scene;
    public options: SceneOptions = {};

    public id: GameState;
    public loaded: Boolean = false;

    private _cacheScene: Boolean = false;

    constructor(id: GameState, engine: Engine, options: SceneOptions = {}, cacheScene: Boolean = false) {
        this.id = id;
        this.engine = engine;
        this.options = options;
        this._cacheScene = cacheScene;
    }

    public makeScene() {
        if (!this.scene || !this._cacheScene) {
            this.scene = new Scene(this.engine, this.options);
            return true;
        }
        return false;
    }

    public async load() {}

    public async init() {
        throw new Error("abstract method - should not be called")
    }

    public async beforeDisable() {
        this.scene?.detachControl();
    }

    public async disable(force=false) {
        if (!this._cacheScene || force) {
            this.scene?.dispose();
        }
    }

    public async enable(loadNext: Function | null = null) {
        this.makeScene();
        if (!this._cacheScene || !this.loaded) {
            await this.init()
            this.loaded = true;
        }

        if (!loadNext) {
            return this.scene?.whenReadyAsync()
        }

        return Promise.all([this.scene?.whenReadyAsync(), loadNext()]);
    }

}
