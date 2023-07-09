import { Scene, Sound, SoundTrack } from "@babylonjs/core";

class SoundManager {

    private _bgTack;
    private _mainTack;

    private _scene;

    constructor() {}

    public get size() {
        return (this._bgTack ? this._bgTack.soundCollection.length : 0) +
            (this._mainTack ? this._mainTack.soundCollection.length : 0);
    }

    public get ready() {
        return this._scene !== undefined;
    }

    public init(scene: Scene) {
        this._scene = scene;
    }

    public hasMusic(id: string) {
        return this._bgTack && this._bgTack.soundCollection.find((d: Sound) => d.name === id) !== undefined
    }

    public async loadMusic(id: string, url: string, play: boolean = false) {
        if (!this._scene) return;

        if (!this._bgTack) {
            this._bgTack = new SoundTrack(this._scene, { volume: 0.2 });
        }

        return new Promise((resolve, reject) => {
            const music = new Sound(
                id, url, this._scene,
                () => {
                    if (music !== undefined) {
                        resolve(music)
                    } else {
                        reject();
                    }
                },
                { loop: true, autoplay: play }
            )
            this._bgTack.addSound(music);
        });
    }

    public hasSound(id: string) {
        return this._mainTack && this._mainTack.soundCollection.find((d: Sound) => d.name === id) !== undefined
    }

    public async loadSound(id: string, url: string) {
        if (!this._scene) return;

        if (!this._mainTack) {
            this._mainTack = new SoundTrack(this._scene, { volume: 0.4 });
        }
        const sound = new Sound(id, url, this._scene);
        this._mainTack.addSound(sound);

        return new Promise((resolve, reject) => {
            const sound = new Sound(
                id, url, this._scene,
                () => {
                    if (sound !== undefined) {
                        resolve(sound)
                    } else {
                        reject();
                    }
                }
            )
            this._mainTack.addSound(sound);
        })
    }

    public play(id: string, which?: string) {
        if (which === "music") {
            this.playMusic(id)
        } else {
            this.playSound(id);
        }
    }

    public playMusic(id: string) {
        const music = this._bgTack.soundCollection.find((d: Sound) => d.name === id);
        if (music) {
            const current = this._bgTack.soundCollection.find((d: Sound) => d.isPlaying);
            if (current) {
                if (current.name === id) return;
                current.stop();
            }
            music.play();
        }
    }

    public playSound(id: string) {
        const sound = this._mainTack.soundCollection.find((d: Sound) => d.name === id);
        if (sound) {
            sound.play();
        }
    }
}

const SM = new SoundManager();

export { SM as default, SoundManager };