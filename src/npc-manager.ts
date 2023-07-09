import { MeshBuilder, Sprite, Scene, Vector3, StandardMaterial, Texture, Path3D } from "@babylonjs/core";
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
import SM from './core/sound-manager'
import { Notifier } from "./notify";

const chance = new Chance();
const NPC_MIN_GEN_TIME = 10;
const NPC_MIN_GEN_TIME_DIALOG = 25;
const NPC_GEN_TIME_START = -8;

const NPC_SPEED = 0.003;

export default class NPCManager {

    private _npcInQueue: Array<NPC> = [];
    private _npcInProgress: Array<NPC> = [];

    private _npcMeshes: Array<Sprite> = [];

    private _npcLeaving: Array<NPC> = [];
    private _npcLeavingMeshes: Array<Sprite> = [];

    private _maxQueueSize = 6;

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
            if (this._npcInQueue.length >= 1) {
                const avatar = this._ui.getControlByName("NPCImage") as Image
                avatar.source = "assets/icons/" + this.activeNPC.head;
            }
        });

        Events.on("npc:dismiss", () => {
            this._startNPCLeave(0);
            this.updateAll();
            this._updateNPCTargetPositions();

            this._ui.getControlByName("NPCStats").isVisible = this._npcInQueue.length !== 0;
            if (this._npcInQueue.length > 0) {
                const avatar = this._ui.getControlByName("NPCImage") as Image
                avatar.source = "assets/icons/" + this.activeNPC.head;
            }
        });

        Events.on("npc:leave", () => {

            if (this._npcInQueue.length > 0) {
                const npc = this.activeNPC;

                if (npc.acceptedQuest) {
                    SM.playSound("quest:accept")
                    Notifier.success("Your quest was accepted")
                    this._assignQuest(Logic.quest)
                    this._addToQuestLog(npc.id);
                    this._startNPCLeave(1);
                } else {
                    SM.playSound("quest:reject")
                    Notifier.failure("Your quest was rejected")
                    this._startNPCLeave(0);
                    this.updateAll();
                }
                this._updateNPCTargetPositions();
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

            const time = this._npcInQueue.length >= 1 ? NPC_MIN_GEN_TIME_DIALOG : NPC_MIN_GEN_TIME;
            if (IngameTime.getTime() - this._lastGen >= time) {
                if (this._npcInQueue.length < this._maxQueueSize) {
                    this._makeNPC();
                } else {
                    this._lastGen = IngameTime.getTime();
                }
            }

            this._moveNPCs();
        })
    }

    private _makeNPC() {
        const npc = new NPC(
            chance.name(),
            NPCRole[chance.pickone(NPCRoleArray)],
            1
        );

        const sprite = ASSETS.getSprite("icons", npc.head) as Sprite
        const index = this._npcInQueue.length;
        npc.travelPath = Logic.pathToPlayer.slice(0, 1 - index * 0.1);

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
            const npc = this._npcInProgress[index]
            if (result === QuestStatus.SUCCESS) {
                Notifier.success(`${npc.name} was successful on their quest. Your received ${npc.quest?.items[0].toString()}`)
            } else {
                Notifier.failure(`${npc.name} failed their quest. It hurt a little...`)
            }
            // remove this NPC
            this._npcInProgress.splice(index, 1);
        }
    }

    private _startNPCLeave(mode: number) {
        const npc = mode === 0 ?
            this._npcInQueue.shift() :
            this._npcInProgress[this._npcInProgress.length-1];

        if (npc) {
            this._npcLeaving.push(npc);
            this._npcLeavingMeshes.push(this._npcMeshes.shift() as Sprite);

            npc.travelPath = new Path3D(Logic.pathFromPlayer.getPoints())
            npc.travelProgess = 0;
        }
    }

    private _addToQuestLog(id: string) {
        const npc = this._npcInProgress.find(d => d.id === id)
        if (npc) {
            this._questLog.addQuest(npc)
        }
    }

    private _moveNPCs() {
        this._npcMeshes.forEach((sprite, index) => {
            const npc = this._npcInQueue[index];
            if (npc.travelPath !== null) {
                // move to target position
                sprite.position = npc.travelPath.getPointAt(npc.travelProgess)
                npc.travelProgess += NPC_SPEED;

                // check difference to target position
                if (npc.travelProgess >= 1) {
                    // npc has arrvied at target position - reset
                    npc.travelPath = null;
                    if (index === 0 && !Logic.npc) {
                        Events.emit("npc:arrive", npc);
                        SM.playSound("npc:arrive")
                    }
                }
            }
        });

        const removeSprite: Array<number> = [];
        const removeNPC: Array<number> = [];

        this._npcLeavingMeshes.forEach((sprite, index) => {
            const npc = this._npcLeaving[index];

            if (npc.travelPath !== null && sprite.isVisible) {
                // move to target position
                sprite.position = npc.travelPath.getPointAt(npc.travelProgess)
                npc.travelProgess += NPC_SPEED;

                // check difference to target position
                if (npc.travelProgess >= 1) {
                    // npc has arrvied at target position - reset
                    npc.travelPath = null;
                    if (!npc.acceptedQuest && !npc.quest) {
                        removeSprite.push(index);
                        removeNPC.push(index);
                    } else {
                        sprite.isVisible = false;
                    }
                }
            } else if (!npc.acceptedQuest && !npc.quest) {
                removeSprite.push(index);
                removeNPC.push(index);
            }
        });

        removeSprite.forEach(index => this._npcLeavingMeshes[index].dispose());
        this._npcLeavingMeshes = this._npcLeavingMeshes.filter((_, i: number) => !removeSprite.includes(i));
        this._npcLeaving = this._npcLeaving.filter((_, i: number) => !removeNPC.includes(i));
    }

    private _updateNPCTargetPositions() {
        this._npcMeshes.forEach((sprite, index) => {

            const npc = this._npcInQueue[index];
            const tPos = Logic.pathToPlayer.getPointAt(1 - index * 0.1);

            if (sprite.position.subtract(tPos).length() > 0.001) {
                const start = Logic.pathToPlayer.getClosestPositionTo(sprite.position);
                npc.travelPath = Logic.pathToPlayer.slice(start, 1 - index * 0.1);
                npc.travelProgess = 0;
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
