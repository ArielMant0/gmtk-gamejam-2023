import { Chance } from "chance";
import { NPCRole } from "./enums";
import { Scene, SpriteManager, Sprite, Tools } from "@babylonjs/core";

const chance = new Chance();

function randomNPCHeadIcon() {
    return chance.pickone([
        "barbarian.png",
        "barbute.png",
        "cleopatra.png",
        "female-vampire.png",
        "golem-head.png",
        "ninja-head.png",
        "wizard-face.png",
        "woman-elf-face.png",
    ])
}

function roleToIcon(role: NPCRole) {
    switch(role) {
        case NPCRole.FIGHTER:
            return "swordwoman.png"
        case NPCRole.THIEF:
            return "hooded-assassin.png"
        case NPCRole.HUNTER:
            return "bowman.png"
        case NPCRole.GATHERER:
            return "farmer.png"
    }
}

class AssetManager {

    private _sheets = new Map<string, SpriteManager>();
    private _meta = new Map<string, Object>();

    constructor() {}

    public hasSheet(id: string) {
        return this._sheets.has(id);
    }

    public async loadSpritesheet(id: string, imageUrl: string, metaUrl: string, scene: Scene) {
        const meta: any = JSON.parse(await Tools.LoadFileAsync(metaUrl, false) as string);
        this._meta.set(id, meta);
        const sm = new SpriteManager(
            id, imageUrl,
            meta.frames.length,
            meta.frames[0].frame.w,
            scene
        );
        this._sheets.set(id, sm);
    }

    public getSprite(id: string, filename: string, name?: string) {
        const meta: any = this._meta.get(id);
        if (meta) {
            const index = meta.frames.findIndex((d: any) => d.filename === filename);
            if (index >= 0) {
                const sm = this._sheets.get(id);
                if (sm) {
                    const sprite = new Sprite(name !== undefined ? name : filename, sm);
                    sprite.cellIndex = index;
                    return sprite
                }
            }
        }
    }
}

const ASSETS = new AssetManager();

export { ASSETS as default, randomNPCHeadIcon, roleToIcon };
