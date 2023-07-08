import { Scene } from "@babylonjs/core";
import { NPCRole, NPCRoleArray, npcRoleToString } from "./core/enums";
import { AdvancedDynamicTexture, TextBlock } from "@babylonjs/gui";
import Chance from 'chance';

const chance = new Chance();

export default class NPCFactory {

    private _npcName: string = "Max Mustermann";
    private _npcRole: NPCRole = NPCRole.GATHERER;
    private _npcLevel: number = 1;

    private _ui;

    private _timeSinceGen: number = 0;

    constructor() {
        this._npcName = chance.name();
        this._npcRole = NPCRole[chance.pickone(NPCRoleArray)]
    }

    public addGUI(gui: AdvancedDynamicTexture) {
        this._ui = gui;
        this.updateAll();
    }

    public updateNPC() {
        const name = this._ui.getControlByName("NPCName") as TextBlock
        name.text = this._npcName;

        const lvl = this._ui.getControlByName("NPCLevel") as TextBlock
        lvl.text = "Level: " + this._npcLevel;

        const role = this._ui.getControlByName("NPCRole") as TextBlock
        role.text = "Class: " + npcRoleToString(this._npcRole);
    }

    public updateQuest() {
        const dur = this._ui.getControlByName("QuestDuration") as TextBlock
        dur.text = `Expected Duration: ${1} Day`;

        const rate = this._ui.getControlByName("QuestSuccess") as TextBlock
        rate.text = `Expected Rate of Success: ${90}%`;
    }

    public updateAll() {
        this.updateNPC();
        this.updateQuest();
    }
}
