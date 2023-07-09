import NPC from "../npc";
import Quest from "../quest";
import QuestItem from "../quest-item";
import { QuestItemType, QuestItemTypeArray } from "./enums";
import { Events } from "./events";

class GameLogic {

    public quest: Quest;
    public npc: NPC | null = null;
    public inventory = new Map<QuestItemType, number>();

    constructor(money: number = 1000) {
        QuestItemTypeArray.forEach(nr => {
            this.inventory.set(QuestItemType[nr], 0);
        });
        this.inventory.set(QuestItemType.MONEY, money);
        this.quest = new Quest([], []);

        Events.on("npc:arrive", (npc: NPC) => this.npc = npc)
        Events.on("npc:leave", () => this.npc = null)
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
