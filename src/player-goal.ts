import { QuestItemType, QuestItemTypeArray, QuestStatus } from "./core/enums";
import { GameTime, IngameTime } from "./core/game-time";
import { Logic } from "./core/logic";
import QuestItem from "./quest-item";
import { Chance } from "chance";

const chance = new Chance();

export default class PlayerGoal {

    public items: Array<QuestItem> = [];
    public rewards: Array<QuestItem> = [];

    public deadline: number | null;

    constructor(items: Array<QuestItem>, rewards: Array<QuestItem>, deadline: number | null = null) {
        this.items = items;
        this.rewards = rewards;
        this.deadline = deadline;
    }

    public get timeLeft() {
        return this.deadline === null ? Infinity : this.deadline - IngameTime.getTime();
    }

    public get timeLeftInDays() {
        return this.deadline === null ? Infinity : GameTime.durationInDays(this.timeLeft)
    }

    public get timeLeftInHours() {
        return this.deadline === null ? Infinity : GameTime.durationInHours(this.timeLeft)
    }

    public get status() {
        const onTime = (this.deadline === null || this.timeLeft >= 0);
        const hasItems = Logic.getItemAmount(this.items[0].item as QuestItemType) === this.items[0].amount
        return onTime && hasItems ? QuestStatus.SUCCESS : (onTime ? QuestStatus.PENDING : QuestStatus.FAILURE);
    }

    static createRandom() {
        const numItems = 1;// chance.integer({ min: 1, max: QuestItemTypeArray.length-1 });

        const items = chance.pickset(QuestItemTypeArray.filter(d => d !== "MONEY"), numItems)
            .map(d => new QuestItem(QuestItemType[d], chance.integer({ min: 1, max: 5 })))
        const rewards = [new QuestItem(QuestItemType.MONEY, chance.integer({ min: items.length*25, max: items.length*100 }))]

        let deadline: number | null = null;
        if (chance.bool() || true) {
            deadline = IngameTime.getTime() + chance.integer({ min: 1*24, max: 3*24 });
        }

        return new PlayerGoal(items, rewards, deadline)
    }
}
