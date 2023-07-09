import { Path3D, Vector3 } from "@babylonjs/core";
import NPC from "../npc";
import Quest from "../quest";
import QuestItem from "../quest-item";
import { QuestItemType, QuestItemTypeArray } from "./enums";
import { Events } from "./events";

const PLAYER_POS = [4,-3]
const PATH_POINTS_TO = [[-6, 2], [-3.5, -1], [-1, -2], [2, -2], [3, -3]];
const PATH_POINTS_FROM = [[3, -3], [2, -2], [-1, -2], [-3.5, -2], [-5, -5], [-6, -8]];

class GameLogic {

    public quest: Quest;
    public npc: NPC | null = null;
    public inventory = new Map<QuestItemType, number>();

    public PLAYER_POSITION = new Vector3(PLAYER_POS[0], PLAYER_POS[1], 0);
    public pathToPlayer: Path3D;
    public pathFromPlayer: Path3D;

    constructor(money: number = 1000) {
        QuestItemTypeArray.forEach(nr => {
            this.inventory.set(QuestItemType[nr], 0);
        });
        this.inventory.set(QuestItemType.MONEY, money);
        this.quest = new Quest([], []);

        Events.on("npc:arrive", (npc: NPC) => this.npc = npc)
        Events.on("npc:leave", () => this.npc = null)

        // create path towards player
        this.pathToPlayer = new Path3D(PATH_POINTS_TO.map(d => new Vector3(d[0], d[1], 0)))

        // create path away from player
        this.pathFromPlayer = new Path3D(PATH_POINTS_FROM.map(d => new Vector3(d[0], d[1], 0)))
    }

    public reset() {
        this.npc = null;
        QuestItemTypeArray.forEach(nr => {
            this.inventory.set(QuestItemType[nr], 0);
        });
        this.inventory.set(QuestItemType.MONEY, 1000);
        this.quest = new Quest([], []);
    }

    public get money() {
        return this.inventory.get(QuestItemType.MONEY) || 0
    }

    public set money(value: number) {
        this.inventory.set(QuestItemType.MONEY, value)
    }

    public checkMoney(value: number) {
        return this.money - value >= 0;
    }

    public addMoney(value: number) {
        this.money = this.money + value;
        return this.money;
    }

    public getItemAmount(item: QuestItemType) {
        if (this.inventory.has(item)) {
            return this.inventory.get(item) || 0
        }
        this.inventory.set(item, 0)
        return 0;
    }

    public addToItemAmount(item: QuestItemType, amount: number) {
        if (this.inventory.has(item)) {
            amount += this.inventory.get(item) || 0
        }
        this.setItemAmount(item, amount)
    }

    public setItemAmount(item: QuestItemType, amount: number) {
        this.inventory.set(item, amount)
    }

    public setQuest(item: QuestItem, reward: QuestItem) {
        this.quest.items = [item.clone()];
        this.quest.rewards = [reward.clone()]
        Events.emit("quest:update", this.quest)
    }
}

export const Logic = new GameLogic();
