import { MeshBuilder, Mesh, Scene, Vector3, StandardMaterial, Texture } from "@babylonjs/core";
import { NPCRole, NPCRoleArray, QuestStatus, npcRoleToString } from "./core/enums";
import { AdvancedDynamicTexture, TextBlock, Image } from "@babylonjs/gui";
import Chance from 'chance';
import { GameTime, IngameTime } from "./core/game-time";
import NPC from "./npc";
import { Events } from "./core/events";
import Quest from "./quest";
import { Logic } from "./core/logic";
import QuestLog from "./quest-log";

const chance = new Chance();
const NPC_MIN_GEN_TIME = 10;
const NPC_GEN_TIME_START = -5;

export default class NPCManager {

    private _npcInQueue: Array<NPC> = [];
    private _npcInProgress: Array<NPC> = [];
    private _npcMeshes: Array<Mesh> = [];

    private _maxQueueSize = 10;

    private _questLog;

    private _ui;
    private _scene;

    private _lastGen: number = NPC_GEN_TIME_START;

    constructor() {
        Events.on("quest:update", () => {
            if (this._npcInQueue.length > 0) {
                this.activeNPC.recalculate(Logic.quest)
                Logic.quest.calculateDuration(this.activeNPC)
                this.updateQuest()
            }
        });

        Events.on("quest:assign", () => {
            if (this._npcInQueue.length > 0) {
                const npc = this.activeNPC;
                if (this.assignQuest(Logic.quest)) {
                    this._addToQuestLog(npc.id);
                    Events.emit("npc:quest", true)
                } else {
                    Events.emit("npc:quest", false)
                }
                setTimeout(() => Events.emit("npc:leave", npc), 500);
            }
        });

        Events.on("quest:completed", (data: any) => this._onQuestFinish(data.id, data.result));

        Events.on("npc:arrive", () => {
            this._ui.getControlByName("NPCStats").isVisible = true;
        })
        Events.on("npc:leave", () => {
            if (this._npcInQueue.length === 0) {
                this._ui.getControlByName("NPCStats").isVisible = false;
            }
        })

    }

    private get activeNPC() {
        return this._npcInQueue[0]
    }

    public addGUI(gui: AdvancedDynamicTexture) {
        this._ui = gui;
        this._questLog = new QuestLog(gui, "Quest0", "QuestMainParent");
        this.updateAll();
    }

    public start(scene: Scene) {
        this._scene = scene;
        scene.registerBeforeRender(() => {
            if (IngameTime.getTime() - this._lastGen >= NPC_MIN_GEN_TIME) {
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
        const mat = new StandardMaterial("");
        mat.diffuseTexture = new Texture(npc.head);
        plane.billboardMode = Mesh.BILLBOARDMODE_ALL;
        plane.position.y += this._npcInQueue.length * 1.5;
        plane.material = mat;

        this._npcMeshes.push(plane)

        if (this._ui) {
            this.updateAll();
        }

        this._lastGen = IngameTime.getTime();
    }

    public assignQuest(quest: Quest) {

        let result = false;

        if (this._npcInQueue.length > 0) {
            const npc = this._npcInQueue[0];
            const q = quest.clone();
            if (npc.assignQuest(q)) {
                this._npcInQueue.shift();
                this._npcInProgress.push(npc);
                const mesh = this._npcMeshes.shift();
                mesh?.dispose();
                this.updateAll();
                q.start();
                Events.emit("inventory:remove", q.rewards[0]);
                result = true;
            } else {
                this._npcInQueue.shift();
                const mesh = this._npcMeshes.shift();
                mesh?.dispose();
                this.updateAll();
                result = false;
            }

            if (this._npcInQueue.length > 0) {
                const avatar = this._ui.getControlByName("NPCImage") as Image
                avatar.source = this.activeNPC.head;
            }
        }

        return result;
    }

    private _onQuestFinish(id: string, result: QuestStatus) {
        const index = this._npcInProgress.findIndex(d => d.id === id)
        if (index >= 0) {
            if (result === QuestStatus.SUCCESS) {
                console.log("quest SUCCESS")
            } else {
                console.log("quest FAILURE")
            }
            // remove this NPC
            this._npcInProgress.splice(index, 1);
        }
    }

    private _addToQuestLog(id: string) {
        const npc = this._npcInProgress.find(d => d.id === id)
        if (npc) {
            this._questLog.addQuest(npc)
        }
    }

    public moveNPCMeshes() {
        this._npcMeshes.forEach((mesh, index) => {
            if (Math.abs(mesh.position.y - index * 1.5) > 0.001) {
                const newpos = mesh.position.clone()
                newpos.y = index * 1.5
                mesh.position = Vector3.Lerp(mesh.position, newpos, 0.1);
            } else if (index === 0) {
                // TODO: only do this once
                if (!Logic.npc) {
                    Events.emit("npc:arrive", this.activeNPC);
                }
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

            if (this._npcInQueue.length === 1) {
                const avatar = this._ui.getControlByName("NPCImage") as Image
                avatar.source = this.activeNPC.head;
            }
        }
    }

    public updateQuest() {
        if (this._npcInQueue.length > 0) {

            const d = Logic.quest.duration;
            const dur = this._ui.getControlByName("QuestDuration") as TextBlock
            dur.text = `Duration: ${GameTime.durationInDays(d).toFixed(0)} d ${GameTime.durationInHours(d).toFixed(0)} h`;

            const acc = this._ui.getControlByName("QuestAcceptance") as TextBlock
            acc.text = `Rate of Acceptance: ${this.activeNPC.acceptProb.toFixed(0)}%`;

            const succ = this._ui.getControlByName("QuestSuccess") as TextBlock
            succ.text = `Rate of Success: ${this.activeNPC.successProb.toFixed(0)}%`;
        }
    }

    public updateAll() {
        this.updateNPC();
        this.updateQuest();
    }
}
