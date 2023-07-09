import { Scene, Sound, SoundTrack } from "@babylonjs/core";

class SoundManager {

    private _bgTrack;
    private _bgVolume = 0.2;
    private _mainTrack;
    private _mainVolume = 0.4;

    private _scene;

    constructor() {}

    public get size() {
        return (this._bgTrack ? this._bgTrack.soundCollection.length : 0) +
            (this._mainTrack ? this._mainTrack.soundCollection.length : 0);
    }

    public get ready() {
        return this._scene !== undefined;
    }

    public init(scene: Scene) {
        this._scene = scene;
    }

    public hasMusic(id: string) {
        return this._bgTrack && this._bgTrack.soundCollection.find((d: Sound) => d.name === id) !== undefined
    }

    public async loadMusic(id: string, url: string, play: boolean = false) {
        if (!this._scene) return;

        if (!this._bgTrack) {
            this._bgTrack = new SoundTrack(this._scene, { volume: 0.2 });
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
            this._bgTrack.addSound(music);
        });
    }

    public setMusicVolume(volume: number, slow: boolean = false) {
        if (!this._scene || !this._bgTrack) return;

        if (slow) {
            this._setMusicVolumeTransition(this._bgVolume, volume, Math.abs(this._bgVolume-volume) * 0.1)
        } else {
            this._bgTrack.setVolume(volume);
            this._bgVolume = volume;
        }
    }

    private _setMusicVolumeTransition(volume: number, goal: number, increment: number) {
        if (volume >= goal) {
            return
        }

        this._bgTrack.setVolume(volume);
        this._bgVolume = volume;

        setTimeout(() => this._setMusicVolumeTransition(volume + increment, goal, increment), 10)
    }

    public hasSound(id: string) {
        return this._mainTrack && this._mainTrack.soundCollection.find((d: Sound) => d.name === id) !== undefined
    }

    public async loadSound(id: string, url: string) {
        if (!this._scene) return;

        if (!this._mainTrack) {
            this._mainTrack = new SoundTrack(this._scene, { volume: 0.4 });
        }
        const sound = new Sound(id, url, this._scene);
        this._mainTrack.addSound(sound);

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
            this._mainTrack.addSound(sound);
        })
    }

    public setSoundVolume(volume: number) {
        if (!this._scene || !this._mainTrack) return;
        this._mainTrack.setVolume(volume);
    }

    public play(id: string, which?: string) {
        if (which === "music") {
            this.playMusic(id)
        } else {
            this.playSound(id);
        }
    }

    public playMusic(id: string) {
        const music = this._bgTrack.soundCollection.find((d: Sound) => d.name === id);
        if (music) {
            const current = this._bgTrack.soundCollection.find((d: Sound) => d.isPlaying);
            if (current) {
                if (current.name === id) return;
                current.stop();
            }
            music.play();
        }
    }

    public playSound(id: string) {
        const sound = this._mainTrack.soundCollection.find((d: Sound) => d.name === id);
        if (sound) {
            sound.play();
        }
    }
}

const SM = new SoundManager();

export { SM as default, SoundManager };