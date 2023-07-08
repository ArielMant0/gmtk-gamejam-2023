import { MeshBuilder, Mesh, Scene, Vector3 } from "@babylonjs/core";
import { NPCRole, NPCRoleArray, npcRoleToString } from "./core/enums";
import { AdvancedDynamicTexture, TextBlock } from "@babylonjs/gui";
import Chance from 'chance';
import { GameTime, IngameTime } from "./core/game-time";
import NPC from "./npc";
import { Events } from "./core/events";
import QuestItem from "./quest-item";
import Quest from "./quest";
import { Logic } from "./core/logic";
import { NPCB } from "./core/npc-balancing";

const chance = new Chance();

export default class NPCFactory {

    private _npcInQueue: Array<NPC> = [];
    private _npcInProgress: Array<NPC> = [];
    private _npcMeshes: Array<Mesh> = [];

    private _maxQueueSize = 10;

    private _ui;
    private _scene;

    private _lastGen: number = 0;

    constructor() {
        this._makeNPC();

        Events.on("quest:update", () => {
            if (this._npcInQueue.length > 0) {
                this.activeNPC.recalculate(Logic.quest)
                this.updateQuest()
            }
        });

        Events.on("quest:assign", () => {
            if (this._npcInQueue.length > 0) {
                const npc = this.activeNPC;
                if (this.assignQuest(Logic.quest.items, Logic.quest.rewards)) {
                    this.checkQuest(npc.id);
                }
            }
        });

        // Events.on("quest:complete", this.finishQuest.bind(this));
    }

    private get activeNPC() {
        return this._npcInQueue[0]
    }

    public addGUI(gui: AdvancedDynamicTexture) {
        this._ui = gui;
        this.updateAll();
    }

    public start(scene: Scene) {
        this._scene = scene;
        scene.registerBeforeRender(() => {
            if (IngameTime.getTime() - this._lastGen >= 3) {
                if (this._npcInQueue.length < this._maxQueueSize) {
                    this._makeNPC();
                } else {
                    this._lastGen = IngameTime.getTime();
                }
            }

            this.moveNPCMeshes();
        })
    }

    private _makeNPC() {
        const npc = new NPC(
            chance.name(),
            NPCRole[chance.pickone(NPCRoleArray)],
            1
        );
        this._npcInQueue.push(npc);
        const plane = MeshBuilder.CreatePlane(
            npc.id,
            { width: 1, height: 1 },
            this._scene
        );
        plane.billboardMode = Mesh.BILLBOARDMODE_ALL;
        plane.position.y += this._npcInQueue.length * 1.5;
        this._npcMeshes.push(plane)

        if (this._ui) {
            this.updateAll();
        }

        this._lastGen = IngameTime.getTime();
    }

    public assignQuest(questItems: Array<QuestItem>, rewardItems: Array<QuestItem>) {
        if (this._npcInQueue.length > 0) {
            const npc = this._npcInQueue[0];
            if (npc.assignQuest(new Quest(questItems, rewardItems))) {
                this._npcInQueue.shift();
                this._npcInProgress.push(npc);
                const mesh = this._npcMeshes.shift();
                mesh?.dispose();
                this.updateAll();
                return true;
            } else {
                this._npcInQueue.shift();
                const mesh = this._npcMeshes.shift();
                mesh?.dispose();
                this.updateAll();
                return false;
            }
        }
        return false;
    }

    public checkQuest(id: String) {
        const npc = this._npcInProgress.find(d => d.id === id)
        if (npc) {
            if (npc.tryCompleteQuest()) {
                // add quest resources
                Events.emit("inventory:add", {
                    questItem: npc.quest?.items[0],
                    rewardItem: npc.quest?.rewards[0],
                });
                console.log("quest SUCCESS")
            } else {
                console.log("quest FAILURE")
            }
        }
    }

    public moveNPCMeshes() {
        this._npcMeshes.forEach((mesh, index) => {
            if (mesh.position.y !== index * 1.5) {
                const newpos = mesh.position.clone()
                newpos.y = index * 1.5
                mesh.position = Vector3.Lerp(mesh.position, newpos, 0.4);
            }
        });
    }

    public updateNPC() {
        if (this._npcInQueue.length > 0) {
            const name = this._ui.getControlByName("NPCName") as TextBlock
            name.text = this._npcInQueue[0].name;

            const lvl = this._ui.getControlByName("NPCLevel") as TextBlock
            lvl.text = "Level: " + this._npcInQueue[0].level;

            const role = this._ui.getControlByName("NPCRole") as TextBlock
            role.text = "Class: " + npcRoleToString(this._npcInQueue[0].role);
        }
    }

    public updateQuest() {
        if (this._npcInQueue.length > 0) {
            const npc = this._npcInQueue[0];

            const d = NPCB.getQuestDuration(npc, Logic.quest);
            const dur = this._ui.getControlByName("QuestDuration") as TextBlock
            dur.text = `Duration: ${GameTime.durationInDays(d).toFixed(0)} d ${GameTime.durationInHours(d).toFixed(0)} h`;

            const rate = this._ui.getControlByName("QuestSuccess") as TextBlock
            rate.text = `Rate of Success: ${npc.successProb.toFixed(0)}%`;
        }
    }

    public updateAll() {
        this.updateNPC();
        this.updateQuest();
    }
}
