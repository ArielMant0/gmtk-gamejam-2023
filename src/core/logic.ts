import { QuestItemType, QuestItemTypeArray } from "./enums";

class GameLogic {

    public inventory = new Map<QuestItemType, number>();

    constructor(money: number = 1000) {
        QuestItemTypeArray.forEach(nr => {
            this.inventory.set(QuestItemType[nr], 0);
        });
        this.inventory.set(QuestItemType.MONEY, money)
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
}

export const Logic = new GameLogic();
