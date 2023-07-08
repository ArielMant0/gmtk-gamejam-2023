import { QuestItem, QuestItemArray } from "./enums";

class GameLogic {

    public money: number;
    public inventory = new Map<QuestItem, number>();

    constructor(money: number = 1000) {
        this.money = money;
        QuestItemArray.forEach(nr => {
            this.inventory.set(QuestItem[nr], 0);
        });
    }

    public checkMoney(value: number) {
        return this.money - value >= 0;
    }

    public addMoney(value: number) {
        this.money += value;
        return this.money;
    }

    public getItemAmount(item: QuestItem) {
        if (this.inventory.has(item)) {
            return this.inventory.get(item) || 0
        }
        this.inventory.set(item, 0)
        return 0;
    }

    public addToItemAmount(item: QuestItem, amount: number) {
        if (this.inventory.has(item)) {
            amount += this.inventory.get(item) || 0
        }
        this.setItemAmount(item, amount)
    }

    public setItemAmount(item: QuestItem, amount: number) {
        this.inventory.set(item, amount)
    }
}

export const Logic = new GameLogic();
