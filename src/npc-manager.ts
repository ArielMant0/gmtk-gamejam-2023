import { MeshBuilder, Sprite, Scene, Vector3, StandardMaterial, Texture } from "@babylonjs/core";
import { NPCRole, NPCRoleArray, QuestStatus, npcRoleToString } from "./core/enums";
import { AdvancedDynamicTexture, TextBlock, Image } from "@babylonjs/gui";
import Chance from 'chance';
import { GameTime, IngameTime } from "./core/game-time";
import NPC from "./npc";
import { Events } from "./core/events";
import Quest from "./quest";
import { Logic } from "./core/logic";
import QuestLog from "./quest-log";
import ASSETS from './core/assets'

const chance = new Chance();
const NPC_MIN_GEN_TIME = 5;
const NPC_GEN_TIME_START = -5;

export default class NPCManager {

    private _npcInQueue: Array<NPC> = [];
    private _npcInProgress: Array<NPC> = [];
    private _npcMeshes: Array<Sprite> = [];

    private _maxQueueSize = 10;

    private _questLog;

    private _ui;

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
                if (this._tryAssignQuest(Logic.quest)) {
                    Events.emit("npc:quest", true)
                } else {
                    Events.emit("npc:quest", false)
                }
                this._ui.getControlByName("NPCStats").isVisible = false;
            }
        });

        Events.on("quest:completed", (data: any) => this._onQuestFinish(data.id, data.result));

        Events.on("npc:arrive", () => {
            this._ui.getControlByName("NPCStats").isVisible = true;
            if (this._npcInQueue.length === 1) {
                const avatar = this._ui.getControlByName("NPCImage") as Image
                avatar.source = "assets/icons/" + this.activeNPC.head;
            }
        })
        Events.on("npc:leave", () => {
            if (this._npcInQueue.length > 0) {
                const npc = this.activeNPC;

                if (npc.acceptedQuest) {
                    this._assignQuest(Logic.quest)
                    this._addToQuestLog(npc.id);
                } else {
                    this._npcInQueue.shift();
                    const mesh = this._npcMeshes.shift();
                    mesh?.dispose();
                    this.updateAll();
                }
            }

            this._ui.getControlByName("NPCStats").isVisible = this._npcInQueue.length !== 0;
            if (this._npcInQueue.length > 0) {
                const avatar = this._ui.getControlByName("NPCImage") as Image
                avatar.source = "assets/icons/" + this.activeNPC.head;
            }
        })
    }

    public reset() {
        this._npcInQueue = [];
        this._npcInProgress = [];
        this._npcMeshes.forEach(m => m.dispose());
        this._npcMeshes = [];
        this._lastGen = NPC_GEN_TIME_START;
        this._questLog.reset();

        if (this._ui) {
            this._ui.getControlByName("NPCStats").isVisible = false;
        }
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

        const sprite = ASSETS.getSprite("icons", npc.head) as Sprite
        const distance = (this._npcInQueue.length + 1) * 1.5
        npc.targetPos = Logic.PLAYER_POSITION.add(new Vector3(distance, 0, 0))

        this._npcInQueue.push(npc);
        this._npcMeshes.push(sprite)

        if (this._ui) {
            this.updateAll();
        }

        this._lastGen = IngameTime.getTime();
    }

    private _tryAssignQuest(quest: Quest) {

        if (this._npcInQueue.length > 0) {
            const npc = this._npcInQueue[0];
            return npc.wouldAcceptQuest(quest);
        }

        return false;
    }

    private _assignQuest(quest: Quest) {

        if (this._npcInQueue.length > 0) {
            const npc = this._npcInQueue[0];
            const q = quest.clone();
            npc.assignQuest(q)
            this._npcInQueue.shift();
            this._npcInProgress.push(npc);
            const mesh = this._npcMeshes.shift();
            mesh?.dispose();
            this.updateAll();
            q.start();
            Events.emit("inventory:remove", q.rewards[0]);
            return true
        }

        return false;
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
        this._npcMeshes.forEach((sprite, index) => {
            const npc = this._npcInQueue[index];
            if (npc.targetPos !== null) {
                // move to target position
                sprite.position = Vector3.Lerp(sprite.position, npc.targetPos, 0.05);
                const diff = sprite.position.subtract(npc.targetPos).length();

                // check difference to target position
                if (diff < 0.001) {
                    // npc has arrvied at target position - reset
                    npc.targetPos = null;
                    if (index === 0 && !Logic.npc) {
                        Events.emit("npc:arrive", npc);
                    }
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
